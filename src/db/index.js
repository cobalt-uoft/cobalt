import https from 'https'
import winston from 'winston'
import fs from 'fs'
import schedule from 'node-schedule'
import childProcess from 'child_process'
import mongoose from 'mongoose'

let db = {}
//I'm not sure why you guys use let 
let lastCommit	=	'';

db.update = (collection) => {
  let url = `https://raw.githubusercontent.com/cobalt-uoft/datasets/master/${collection}.json`
  https.get(url, res => {
    let filePath = `.cobalt_data/${collection}.json`
    let stream = fs.createWriteStream(filePath, {'flags': 'w'})

    res.on('data', chunk => {
      stream.write(chunk)
    })

    res.on('end', () => {
      stream.end()

      mongoose.connection.db.collection(collection).remove(function(e, count) {
        if (e) {
          return winston.warn(`Could not import ${collection} to MongoDB.`, e)
        }

        let shell = childProcess.spawn('mongoimport', [
          '-d', 'cobalt',
          '-c', collection,
          '--file', filePath
        ])

        shell.on('close', code => {
          if (code == 0) {
            winston.info(`Synced ${collection}.`)
          } else {
            winston.warn(`Could not import ${collection} to MongoDB. \
              The 'mongoexport' command left us with exit code ${code}.`)
          }
        })
      })
    })

  }).on('error', e => {
    winston.warn('Could not update database, online datasets are currently inaccessible.', e)
  })
}

db.sync = () => {
  db.update('buildings')
  db.update('courses')
}

db.check = (callback) => {
	
	let options	=	{
		host: `api.github.com`,
		port: 443,
		path:`/repos/cobalt-uoft/datasets/git/refs/heads/master`,
		headers: {'user-agent': 'cobalt-selfhost-user'}
	}
	
	https.get(options, res	=> {
		let data	=	""

		res.on('data', chunk => {
			data+=chunk
		})

		res.on('end', () => {
			data	=	JSON.parse(data)
			
			//Compare the last commit hash to the current one
			if(data.object.sha==lastCommit)
				 return;

			db.lastCommit = data.object.sha;
			
			//Execute the callback
			callback&&callback();
		})
	})

}


db.syncCron = () => {
  // Make data directory if it doesn't exist
  try {
    fs.statSync('.cobalt_data')
  } catch(e) {
    fs.mkdirSync('.cobalt_data')
  }

  db.sync()
	//Cool we can make this more accurate
  schedule.scheduleJob('30 1 * * *', () => {
		db.check(()=>db.sync())
  })
}

export default db

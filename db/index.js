import https from 'https'
import winston from 'winston'
import fs from 'fs'
import schedule from 'node-schedule'
import childProcess from 'child_process'
import mongoose from 'mongoose'

let db = {}

db.update = (collection) => {
  let url = `https://raw.githubusercontent.com/cobalt-uoft/datasets/master/${collection}.json`
  https.get(url, res => {
    let filePath = `.data/${collection}.json`
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

db.syncCron = () => {
  db.sync()
  schedule.scheduleJob('30 4 * * *', () => {
    db.sync()
  })
}

export default db

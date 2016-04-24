import childProcess from 'child_process'
import fs from 'fs'
import https from 'https'
import mongoose from 'mongoose'
import schedule from 'node-schedule'
import winston from 'winston'
import { version } from '../../package.json'

// Holds the last commit that was synchronized
let lastCommit  =  ''

let db = {}

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

            // TODO clean this up
            if (['athletics', 'exams'].indexOf(collection) !== -1) {
              let cmd = undefined

              switch (collection) {
                case 'athletics':
                  cmd = 'db.athletics.find().forEach(doc=>{doc.date=new Date(doc.date);doc.events.forEach((_,i)=>{doc.events[i].start_time=new Date(doc.events[i].start_time);doc.events[i].end_time=new Date(doc.events[i].end_time)});db.athletics.save(doc)});'
                  break
                case 'exams':
                  cmd = 'db.exams.find().forEach(doc=>{doc.date=new Date(doc.date);doc.start_time=new Date(doc.start_time);doc.end_time=new Date(doc.end_time);db.exams.save(doc)});'
                  break
                default:
                  cmd = undefined
              }

              childProcess.exec(`mongo cobalt --eval "${cmd}"`, error => {
                if (!error) {
                  winston.info(`Updated dates for ${collection}.`)
                } else {
                  winston.warn(`Could not update date values for ${collection}.`)
                }
              })
            }
          } else {
            winston.warn(`Could not import ${collection} to MongoDB. \
              The 'mongoexport' command left us with exit code ${code}.`)
          }
        })
      })
    })

  }).on('error', e => {
    winston.warn('Could not update database, online datasets are \
      currently inaccessible.', e)
  })
}

db.sync = () => {
  db.update('buildings')
  db.update('food')
  db.update('textbooks')
  db.update('courses')
  db.update('athletics')
  db.update('exams')
}

db.check = (callback) => {
  let options  =  {
    host: 'api.github.com',
    port: 443,
    path: '/repos/cobalt-uoft/datasets/git/refs/heads/master',
    headers: {'user-agent': `cobalt-uoft/${version}`}
  }

  https.get(options, res  => {
    let data = ''

    res.on('data', chunk => {
      data += chunk
    })

    res.on('end', () => {
      data = JSON.parse(data)

      // Compare the last commit hash to the current one
      if (data.object.sha == lastCommit) return

      lastCommit = data.object.sha

      // Execute the callback
      if (callback) callback()
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

  // Perform sync on startup
  db.sync()

  // Schedule checking for sync every hour
  schedule.scheduleJob('0 * * * *', () => {
    db.check(() => { db.sync() })
  })
}

export default db

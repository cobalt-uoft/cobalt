import assert from 'assert'
import childProcess from 'child_process'
import co from 'co'
import cron from 'cron'
import fs from 'fs'
import Building from '../api/buildings/model'
import Course from '../api/courses/model'

let scrape = (type, Model) => {
  console.log(`Starting automated ${type} scrape.`)
  var child = childProcess.exec(`python3 ./scraper/uoft-scrapers/main.py ${type}`, (err, stdin, stdout) => {
    if(err) {
      console.log(`Failed automated ${type} scrape.`)
    } else {
      console.log(`Completed automated ${type} scrape.`)
    }

    // Find scraped JSON files
    fs.readdir(`./scraper/uoft-scrapers/scrapers/${type}/json/`, (e, files) => {
      assert.ifError(e)
      files.forEach(file => {
        // Read JSON file to object
        fs.readFile(`./scraper/uoft-scrapers/scrapers/${type}/json/${file}`, 'utf8', (e, data) => {
          assert.ifError(e)
          co(function*() {
            var data = JSON.parse(data)
            var doc
            try {
              doc = yield Model.findOne({ id: data.id }).exec()
            } catch(e) {
              assert.ifError(e)
            }
            if (doc) {
              // Update record if exists
              try {
                yield doc.update(data).exec()
              } catch(e) {
                assert.ifError(e)
              }
            } else {
              // Create new record otherwise
              doc = new Model(data)
              try {
                yield doc.save()
              } catch(e) {
                assert.ifError(e)
              }
            }
          })
        })
      })
    })
  })
  child.stderr.pipe(process.stderr)
}

let perform = () => {
  // Buildings scrape automation
  scrape('map', Building)
  // Courses scrape automation
  scrape('coursefinder', Course)
}

export default () => {
  perform()
  // Crontab for every morning at 3:00 am
  cron.CronJob('0 3 * * *', () => {
    perform()
  }, null, true)
}

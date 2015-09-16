import assert from 'assert'
import childProcess from 'child_process'
import co from 'co'
import cron from 'cron'
import fs from 'fs'
import Building from '../api/buildings/model'

let perform = () => {
  // Buildings scrape automation
  console.log('Performing automated building scrape.')
  // Run python scraper
  var child = childProcess.exec('python3 ./scraper/uoft-scrapers/main.py map', (err, stdin, stdout) => {
    if(err) {
      console.log('Failed automated building scrape.')
    } else {
      console.log('Completed automated building scrape.')
    }

    // Find scraped JSON files
    fs.readdir('./scraper/uoft-scrapers/scrapers/map/json/', (e, files) => {
      assert.ifError(e)
      files.forEach(file => {
        // Read JSON file to object
        fs.readFile(`./scraper/uoft-scrapers/scrapers/map/json/${file}`, 'utf8', (e, data) => {
          assert.ifError(e)
          co(function*() {
            var buildingData = JSON.parse(data)

            var building
            try {
              building = yield Building.findOne({ id: buildingData.id }).exec()
            } catch(e) {
              assert.ifError(e)
            }

            if (building) {
              // Update record if exists
              try {
                yield building.update(buildingData).exec()
              } catch(e) {
                assert.ifError(e)
              }
            } else {
              // Create new record otherwise
              building = new Building(buildingData)
              try {
                yield building.save()
              } catch(e) {
                assert.ifError(e)
              }
            }
          })
        })
      })
    })
  })
  child.stdout.pipe(process.stdout)
  child.stderr.pipe(process.stderr)

  // TODO: Courses scrape automation
}

export default () => {
  perform()
  // Crontab for every day at 3:00 am
  cron.CronJob('0 3 * * *', () => {
    perform()
  }, null, true)
}

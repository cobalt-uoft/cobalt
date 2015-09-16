import mongoose from 'mongoose'
import child_process from 'child_process'
import fs from 'fs'
import co from 'co'
import Building from '../api/buildings/model'

let perform = () => {
  // Buildings scrape automation
  console.log('Performing automated building scrape.')
  var child = child_process.exec('python3 ./scraper/uoft-scrapers/main.py map', (err, stdin, stdout) => {
    if(err) {
      console.log('Failed automated building scrape.')
    } else {
      console.log('Completed automated building scrape.')
    }

    fs.readdir('./scraper/uoft-scrapers/scrapers/map/json/', (err, files) => {
      if (!err) {
        files.forEach(file => {
          fs.readFile(`./scraper/uoft-scrapers/scrapers/map/json/${file}`, 'utf8', (err, data) => {
            if (!err) {
              co(function*() {
                var buildingData = JSON.parse(data)
                var building
                try {
                  building = yield Building.findOne({ id: buildingData.id }).exec()
                } catch(e) {
                  assert.ifError(e)
                }

                if (building) {
                  try {
                    yield building.update(buildingData).exec()
                  } catch(e) {
                    assert.ifError(e)
                  }
                } else {
                  building = new Building(buildingData)
                  try {
                    yield building.save()
                  } catch(e) {
                    assert.ifError(e)
                  }
                }
              })
            }
          })
        })
      }
    })
  })
  child.stdout.pipe(process.stdout)
  child.stderr.pipe(process.stderr)

  // TODO: Courses scrape automation
}

export default () => {
  perform()
  let interval = setInterval(() => {
    perform()
  }, 86400000)
}

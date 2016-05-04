import mongoose from 'mongoose'
var Schema = mongoose.Schema

var shuttlesSchema = new Schema({
  date: String,
  routes: [{
    id: String,
    name: String,
    stops: [{
      location: String,
      building_id: String,
      times: [{
        time: Number,
        rush_hour: Boolean,
        no_overload: Boolean
      }]
    }]
  }]
})

export default mongoose.model('shuttles', shuttlesSchema)

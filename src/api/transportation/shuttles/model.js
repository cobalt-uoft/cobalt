import mongoose from 'mongoose'
var Schema = mongoose.Schema

var shuttlesSchema = new Schema({
  date: Date,
  routes: [{
    id: String,
    name: String,
    stops: [{
      location: String,
      building_id: String,
      times: [{
        time: Date,
        rush_hour: Boolean,
        no_overload: Boolean
      }]
    }]
  }]
})

shuttlesSchema.index({
  'routes.id': 'text',
  'routes.stops.location': 'text'
})

export default mongoose.model('shuttles', shuttlesSchema)

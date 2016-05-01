import mongoose from 'mongoose'
var Schema = mongoose.Schema

var athleticsSchema = new Schema({
  date: String,
  date_num: Number,
  events: [{
    title: String,
    campus: String,
    location: String,
    building_id: String,
    start_time: Number,
    end_time: Number,
    duration: Number
  }]
})

athleticsSchema.index({
  'events.title': 'text',
  'events.campus': 'text',
  'events.location': 'text'
})

export default mongoose.model('athletics', athleticsSchema)

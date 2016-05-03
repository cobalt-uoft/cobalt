import mongoose from 'mongoose'
var Schema = mongoose.Schema

var athleticsSchema = new Schema({
  date: String,
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

export default mongoose.model('athletics', athleticsSchema)

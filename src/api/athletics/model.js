import mongoose from 'mongoose'
var Schema = mongoose.Schema

var athleticsSchema = new Schema({
  date: Date,
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

athleticsSchema.index({ id: 'text', campus: 'text', 'events.title': 'text', 'events.location': 'text'})

export default mongoose.model('athletics', athleticsSchema)

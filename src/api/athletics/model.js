import mongoose from 'mongoose'
var Schema = mongoose.Schema

var athleticsSchema = new Schema({
  id: String,
  date: Date,
  campus: String,
  events: [{
    title: String,
    location: String,
    building_id: String,
    start_time: Date,
    end_time: Date
  }]
})

athleticsSchema.index({ id: 'text', campus: 'text', 'events.title': 'text', 'events.location': 'text'})

export default mongoose.model('athletics', athleticsSchema)

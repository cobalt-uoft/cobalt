import mongoose from 'mongoose'
var Schema = mongoose.Schema

var athleticsSchema = new Schema({
  id: String,
  date: Date,
  events: [{
    title: String,
    location: String,
    building_id: String,
    start_time: Date,
    end_time: Date
  }]
})

athleticsSchema.index({ id: 'text', date: 'text', campus: 'text', 'events.location': 'text', 'events.title': 'text' })

export default mongoose.model('athletics', athleticsSchema)

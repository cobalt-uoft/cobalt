import mongoose from 'mongoose'
var Schema = mongoose.Schema

var parkingSchema = new Schema({
  id: String,
  title: String,
  building_id: String,
  campus: String,
  type: String,
  description: String,
  lat: Number,
  lng: Number,
  address: String
}, { collection: 'parking' })

parkingSchema.index({
  title: 'text',
  description: 'text',
  address: 'text'
})

export default mongoose.model('parking', parkingSchema)

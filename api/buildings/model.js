import mongoose from 'mongoose'
var Schema = mongoose.Schema

var buildingSchema = new Schema({
  id: String,
  code: String,
  name: String,
  short_name: String,
  campus: String,
  lat: Number,
  lng: Number,
  address: {
    street: String,
    city: String,
    province: String,
    country: String,
    postal: String
  }
})

buildingSchema.index({ code: 'text', name: 'text', short_name: 'text' })

export default mongoose.model('buildings', buildingSchema)

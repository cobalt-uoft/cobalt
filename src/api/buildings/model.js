import mongoose from 'mongoose'
var Schema = mongoose.Schema

var buildingSchema = new Schema({
  id: String,
  code: String,
  name: String,
  short_name: String,
  campus: String,
  address: {
    street: String,
    city: String,
    province: String,
    country: String,
    postal: String
  },
  lat: Number,
  lng: Number,
  polygon: { type: Schema.Types.Mixed, default: [] }
})

buildingSchema.index({ code: 'text', name: 'text', short_name: 'text' })

export default mongoose.model('buildings', buildingSchema)

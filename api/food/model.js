import mongoose from 'mongoose'
import { Schema } from 'mongoose'

var foodSchema = new Schema({
  id: String,
  building_id: String,
  name: String,
  description: String,
  tags: String,
  image: String,
  campus: String,
  lat: Number,
  lng: Number,
  address: String,
  hours: {
    sunday: {
      open: Number,
      close: Number
    },
    monday: {
      open: Number,
      close: Number
    },
    tuesday: {
      open: Number,
      close: Number
    },
    wednesday: {
      open: Number,
      close: Number
    },
    thursday: {
      open: Number,
      close: Number
    },
    friday: {
      open: Number,
      close: Number
    },
    saturday: {
      open: Number,
      close: Number
    }
  }
})

export default mongoose.model('food', foodSchema)

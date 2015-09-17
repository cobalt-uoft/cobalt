import mongoose from 'mongoose'
import { Schema } from 'mongoose'

var courseSchema = new Schema({
  id: String,
  code: String,
  name: String,
  description: String,
  division: String,
  department: String,
  prerequisites: String,
  exclusions: String,
  level: Number,
  campus: String,
  term: String,
  breadths: [Number],
  meeting_sections: [new Schema({
    code: String,
    instructors: [String],
    times: [new Schema({
      day: String,
      start: Number,
      end: Number,
      duration: Number,
      location: String
    })],
    size: Number,
    enrolment: Number
  })]
})

module.exports = mongoose.model('courses', courseSchema)

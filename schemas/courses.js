var mongoose = require('mongoose')

var courseSchema = new mongoose.Schema({
  course_id: String,
  code: String,
  name: String,
  description: String,
  division: String,
  prerequisites: String,
  exlusions: String,
  course_level: Number,
  campus: String,
  term: String,
  breadths: [Number],
  apsc_elec: String,
  meeting_sections: [new mongoose.Schema({
    code: String,
    instructors: [String],
    times: [new mongoose.Schema({
      day: String,
      start: Number,
      end: Number,
      duration: Number,
      location: String
    })],
    class_size: Number
    //class_enrolment: Number
  })]
})

module.exports = mongoose.model("courses", courseSchema)

import mongoose from 'mongoose'
var Schema = mongoose.Schema

var textbookSchema = new Schema({
  id: String,
  isbn: String,
  title: String,
  edition: Number,
  author: String,
  image: String,
  price: Number,
  url: String,
  courses:[{
    id: String,
    code: String,
    requirement: String,
    meeting_sections:[{
      code: String,
      instructors: [String]
    }]
  }]
})

textbookSchema.index({ title: 'text' })

export default mongoose.model('textbooks', textbookSchema)

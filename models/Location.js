import mongoose from 'mongoose'

const locationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  image: String,
  count: String,
  link: String
}, { timestamps: true, collection: 'locations' })

export default mongoose.model('Location', locationSchema)

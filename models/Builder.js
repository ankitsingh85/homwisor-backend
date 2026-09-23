import mongoose from 'mongoose'

const builderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  logo: String,
  subtext: String,
  projects: String,
  count: Number
}, { timestamps: true, collection: 'builders' })

export default mongoose.model('Builder', builderSchema)

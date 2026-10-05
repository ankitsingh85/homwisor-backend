import mongoose from 'mongoose'

// Cards in the homepage "Recommended" section (managed separately from properties)
const recommendedSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true, trim: true },
  image: { type: String, required: true },
  price: { type: String, trim: true },
  location: { type: String, trim: true },
  link: { type: String, trim: true },
  badge: { type: String, trim: true, default: 'Founder Choice' },
  order: { type: Number, default: 0 },
}, { timestamps: true, collection: 'recommended' })

export default mongoose.model('Recommended', recommendedSchema)

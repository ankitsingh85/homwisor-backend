import mongoose from 'mongoose'

const testimonialSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  initials: String,
  color: String,
  textColor: String,
  platform: String,
  verified: Boolean,
  rating: Number,
  text: String
}, { timestamps: true, collection: 'testimonials' })

export default mongoose.model('Testimonial', testimonialSchema)

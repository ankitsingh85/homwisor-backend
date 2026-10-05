import mongoose from 'mongoose'

const testimonialSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: String,
  initials: String,
  photo: String,          // optional customer photo (shown instead of the initials)
  role: String,           // e.g. "Bought a 3 BHK at DLF Privana"
  color: String,          // avatar / quote-mark background
  textColor: String,
  platform: String,       // Google | Facebook | Justdial | Website | Other
  verified: Boolean,
  rating: Number,         // 1–5
  text: String,
  active: { type: Boolean, default: true },   // false = hidden from the website
  order: Number,                               // lower comes first
}, { timestamps: true, collection: 'testimonials' })

export default mongoose.model('Testimonial', testimonialSchema)

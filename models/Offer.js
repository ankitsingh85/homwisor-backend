import mongoose from 'mongoose'

const offerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: String,
  price: String,
  location: String,
  image: String,
  badge: String,
  link: String      // where the card goes: /property/<slug>, another page, or a full URL
}, { timestamps: true, collection: 'offers' })

export default mongoose.model('Offer', offerSchema)

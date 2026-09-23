import mongoose from 'mongoose'

const offerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: String,
  price: String,
  location: String,
  image: String,
  badge: String
}, { timestamps: true, collection: 'offers' })

export default mongoose.model('Offer', offerSchema)

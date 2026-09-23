import mongoose from 'mongoose'

const snapSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: String,
  developer: String,
  location: String,
  microMarket: String,
  price: String,
  description: String,
  videoUrl: String,
  thumbnail: String,
  image: String,
  phone: String,
  demandText: String,
  activeBuyers: Number,
  monthlyRental: String,
  roi: String,
  badge: String,
  verified: Boolean
}, { timestamps: true, collection: 'snaps' })

export default mongoose.model('Snap', snapSchema)

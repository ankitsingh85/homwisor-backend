import mongoose from 'mongoose'

const bannerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  image: { type: String, required: true },
  title: String,
  link: String,
  developer: String,
  type: { type: String, enum: ['hero','small'], required: true }
}, { timestamps: true, collection: 'banners' })

export default mongoose.model('Banner', bannerSchema)

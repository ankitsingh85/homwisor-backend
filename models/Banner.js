import mongoose from 'mongoose'

const bannerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  image: { type: String, required: true },
  title: String,
  link: String,
  developer: String,
  // hero = big top banner, slider = wide strip below the search box, small = tall side ads
  type: { type: String, enum: ['hero', 'slider', 'small'], required: true }
}, { timestamps: true, collection: 'banners' })

export default mongoose.model('Banner', bannerSchema)

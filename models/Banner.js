import mongoose from 'mongoose'

const bannerSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  image: { type: String, required: true },
  mobileImage: String, // hero + slider: 2:1 image shown on phones instead of the wide one (Admin → Banners)
  title: String,
  link: String,
  developer: String,
  // hero = big top banner, slider = wide strip below the search box, small = tall side ads
  type: { type: String, enum: ['hero', 'slider', 'small'], required: true }
}, { timestamps: true, collection: 'banners' })

export default mongoose.model('Banner', bannerSchema)

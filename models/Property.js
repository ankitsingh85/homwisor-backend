import mongoose from 'mongoose'

const propertySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  price: String,
  priceRange: String,
  location: String,
  image: String,
  logo: String,
  logoRequired: String,
  imageRequired: String,
  brandColor: { type: String, default: '#1e3a5f' },
  developer: String,
  highlights: [String],
  gallery: [String],
  category: { type: String, enum: ['recommended','trending','upcoming','newlaunch','commercial','sco'], default: 'recommended' },
  tag: String,
  rera: { type: Boolean, default: true },
  bhk: String,
  type: { type: String, enum: ['Apartment','Villa','Builder Floor','Plots','Commercial','Farmhouse','Retail','SCO'], default: 'Apartment' },
  status: String
}, { timestamps: true, collection: 'properties' })

export default mongoose.model('Property', propertySchema)

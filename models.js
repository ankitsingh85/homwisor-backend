// HomWisor — Mongoose models (one collection per entity)
// Used only when MONGODB_URI is set. All schemas match current file DB shape so frontend needs zero changes.
import mongoose from 'mongoose'

const propertySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: String, price: String, priceRange: String, location: String,
  image: String, logo: String, logoRequired: String, imageRequired: String,
  brandColor: String, developer: String,
  highlights: [String], gallery: [String],
  category: String, tag: String, rera: Boolean, bhk: String, type: String, status: String
}, { _id: false, timestamps: false })

const snapSchema = new mongoose.Schema({
  id: String, title: String, developer: String, location: String, microMarket: String, price: String,
  description: String, videoUrl: String, thumbnail: String, image: String, phone: String, demandText: String, activeBuyers: Number, monthlyRental: String, roi: String, badge: String, verified: Boolean
}, { _id: false })

const bannerSchema = new mongoose.Schema({
  id: String, image: String, title: String, link: String, developer: String
}, { _id: false })

const locationSchema = new mongoose.Schema({ id: String, name: String, image: String, count: String, link: String }, { _id: false })
const offerSchema = new mongoose.Schema({ id: String, title: String, price: String, location: String, image: String, badge: String }, { _id: false })
const builderSchema = new mongoose.Schema({ id: String, name: String, logo: String, subtext: String, projects: String, count: Number }, { _id: false })
const testimonialSchema = new mongoose.Schema({ id: String, name: String, initials: String, color: String, textColor: String, platform: String, verified: Boolean, rating: Number, text: String }, { _id: false })
const enquirySchema = new mongoose.Schema({ id: String, name: String, phone: String, email: String, property: String, message: String, date: String }, { _id: false })

// Single config document to hold banners/locations/offers/builders/testimonials/settings — easier than many collections
const appDataSchema = new mongoose.Schema({
  key: { type: String, unique: true, default: 'main' },
  banners: { hero: [bannerSchema], small: [bannerSchema] },
  locations: [locationSchema],
  offers: [offerSchema],
  builders: [builderSchema],
  testimonials: [testimonialSchema],
  settings: { siteName: String, contactPhone: String, contactEmail: String, address: String }
}, { collection: 'appdata' })

export const Property = mongoose.model('Property', new mongoose.Schema({ id: String, title: String, price: String, priceRange: String, location: String, image: String, logo: String, logoRequired: String, imageRequired: String, brandColor: String, developer: String, highlights: [String], gallery: [String], category: String, tag: String, rera: Boolean, bhk: String, type: String, status: String }, { collection: 'properties' }))
export const Snap = mongoose.model('Snap', snapSchema, 'snaps')
export const Enquiry = mongoose.model('Enquiry', enquirySchema, 'enquiries')
export const AppData = mongoose.model('AppData', appDataSchema)

import mongoose from 'mongoose'

const propertySchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true, index: true },
  title: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true },   // web address: /property/<slug>
  oldSlugs: { type: [String], default: [], index: true }, // previous slugs — old links still work
  price: String,
  priceRange: String,
  location: String,
  // Structured location (location above is the full display text)
  city: String,
  locality: String,
  image: String,
  logo: String,
  logoRequired: String,
  imageRequired: String,
  brandColor: { type: String, default: '#1e3a5f' },
  developer: String,
  highlights: [String],
  gallery: [String],
  category: { type: String, enum: ['recommended','trending','upcoming','newlaunch','branded','luxury','commercial','sco'], default: 'trending' },
  tag: String,
  rera: { type: Boolean, default: true },
  bhk: String,
  type: { type: String, enum: ['Apartment','Villa','Builder Floor','Plots','Commercial','Farmhouse','Retail','SCO'], default: 'Apartment' },
  status: String,
  // Project facts shown on the property detail page
  possession: String,
  landArea: String,
  towers: String,
  propertyTypeDetail: String,

  // ---- Detail page content (all optional; the page falls back to sensible defaults) ----
  overview: String,                 // long description in the Overview section
  brochure: String,                 // PDF link (/api/files/:id) for the Brochure button
  tagline: String,                  // big overlay text on the image slider, e.g. "A New Icon Rises"
  taglineSub: String,               // small line under it, e.g. "Luxury living beyond compare"
  videoUrl: String,                 // "Watch video" (YouTube or .mp4 link)
  pricing: [{ _id: false, type: { type: String }, size: String, price: String }],     // Space & Pricing rows
  amenities: [String],
  galleryCaptions: [String],        // caption for gallery[i]
  about: {                          // About the developer
    heading: String,
    subheading: String,
    description: String,
    image: String,
    stats: [{ _id: false, value: String, label: String }],
  },
  faqs: [{ _id: false, question: String, answer: String }],
}, { timestamps: true, collection: 'properties' })

export default mongoose.model('Property', propertySchema)

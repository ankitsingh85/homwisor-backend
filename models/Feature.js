import mongoose from 'mongoose'

// Editable homepage feature banners (one document per banner, e.g. key "branded").
// Empty fields fall back to the website's built-in text.
const cardSchema = new mongoose.Schema({
  image: String,
  label: String,     // small text above the title (main card) / top line (side card)
  title: String,
  link: String,      // /property/<slug>, another page, or a full URL
}, { _id: false })

const featureSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  eyebrow: String,
  heading: String,          // full headline
  highlight: String,        // part of the headline shown in gold
  description: String,
  points: { type: [String], default: undefined },
  primaryLabel: String,
  primaryLink: String,
  secondaryLabel: String,
  secondaryLink: String,
  main: cardSchema,
  side: {
    image: String,
    brand: String,          // big word, e.g. BRABUS
    sub: String,            // e.g. RESIDENCES
    tagline: String,        // e.g. POWER. PRESTIGE. PERFECTION.
    note: String,           // small label, e.g. COMING TO
    location: String,       // e.g. SECTOR 58, GURGAON
    footer: String,         // bottom strip, e.g. 4 & 5 BHK • STARTING FROM ₹20 CR*
    link: String,
  },
}, { timestamps: true, collection: 'features' })

export default mongoose.model('Feature', featureSchema)

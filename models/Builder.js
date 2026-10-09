import mongoose from 'mongoose'

// Developers (homepage "Top Property Developers" + /developer/<slug> pages).
// A property belongs to a developer when its "developer" text matches the
// name or one of the aliases (case/spacing ignored).
const builderSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  slug: { type: String, unique: true, sparse: true },   // web address: /developer/<slug>
  logo: String,
  subtext: String,                                      // tagline
  description: String,                                  // "About" text on the developer page
  aliases: { type: [String], default: [] },             // other spellings used on properties, e.g. "M3M", "M3M Group"
  projects: String,                                     // legacy label, e.g. "17 Projects"
  count: Number,                                        // total projects (shown on the tile)
  established: String,                                  // e.g. "1946"
  website: String,
  active: { type: Boolean, default: true },             // false = hidden from the website
  order: Number,                                        // lower comes first
}, { timestamps: true, collection: 'builders' })

export default mongoose.model('Builder', builderSchema)

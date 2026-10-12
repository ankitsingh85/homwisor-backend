import mongoose from 'mongoose'

// SEO landing pages: homwisor.com/<slug> shows the search page with saved filters,
// its own meta title / description, heading and intro text. Admin → SEO Pages.
const seoPageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true }, // address, e.g. "projects-on-southern-peripheral-road"
  // saved search filters (same values as the search page URL: /search?city=…&locality=…)
  q: String,
  city: String,
  locality: String,
  type: String,
  budget: String,
  bhk: String,
  status: String,
  category: String,
  metaTitle: String,
  metaDescription: String,
  heading: String,          // H1 on the page
  intro: String,            // rich text above the results (cleaned HTML)
  faqs: [{ _id: false, question: String, answer: String }], // shown under the results + FAQ schema for Google
  active: { type: Boolean, default: true }, // false = page not shown (address falls back to normal handling)
}, { timestamps: true, collection: 'seopages' })

export default mongoose.model('SeoPage', seoPageSchema)

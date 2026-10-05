import mongoose from 'mongoose'

// Blog article. The body is a list of sections (heading + text + optional image);
// blank lines inside a section's text become separate paragraphs on the website.
const sectionSchema = new mongoose.Schema({
  heading: String,
  text: String,
  image: String,
}, { _id: false })

const blogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  slug: { type: String, required: true, unique: true },   // URL: /blog/<slug>
  title: { type: String, required: true },
  category: { type: String, default: 'Real Estate News' },
  excerpt: String,                                          // short intro shown on cards + top of the article
  image: String,                                            // cover photo
  content: { type: [sectionSchema], default: [] },
  author: { type: String, default: 'HomWisor Insights' },
  tags: { type: [String], default: [] },
  status: { type: String, enum: ['published', 'draft'], default: 'published' },
  featured: { type: Boolean, default: false },              // shown as the big "Featured insight" card
  publishedAt: { type: Date, default: Date.now },
  seoTitle: String,
  seoDescription: String,
}, { timestamps: true, collection: 'blogs' })

blogSchema.index({ status: 1, publishedAt: -1 })

export default mongoose.model('Blog', blogSchema)

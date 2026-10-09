import express from 'express'
import Blog from '../models/Blog.js'
import { protect } from '../middleware/auth.js'
import { uniqueSlug, nextOldSlugs } from '../utils/slug.js'
import { cleanBlogHtml } from '../utils/blogHtml.js'

const router = express.Router()

// "my-title" → "my-title-2" if taken by another article (or one of its old addresses)
// Articles live at homwisor.com/<slug>, so they can't take the name of a site page
const RESERVED = ['about', 'search', 'blog', 'contact', 'admin', 'property', 'property-snaps', 'snaps', 'location', 'budget',
  'property-type', 'commercial', 'status', 'residential-projects', 'commercial-projects', 'privacy-policy', 'sell', 'developer', 'dubai',
  'terms-and-conditions', 'api', 'assets', 'images', 'uploads', 'index', 'index-html']
const uniqueBlogSlug = (wanted, exceptId) => uniqueSlug(Blog, wanted, exceptId, 'article', RESERVED)

const str = (v, max) => (v == null ? undefined : String(v).trim().slice(0, max))

// Only known fields, trimmed — never trust the body as-is
const pick = (b = {}) => {
  const out = {}
  if (b.title !== undefined) out.title = str(b.title, 200)
  if (b.category !== undefined) out.category = str(b.category, 60) || 'Real Estate News'
  if (b.excerpt !== undefined) out.excerpt = str(b.excerpt, 600)
  if (b.image !== undefined) out.image = str(b.image, 1000)
  if (b.author !== undefined) out.author = str(b.author, 80) || 'HomWisor Insights'
  if (b.seoTitle !== undefined) out.seoTitle = str(b.seoTitle, 200)
  if (b.seoDescription !== undefined) out.seoDescription = str(b.seoDescription, 400)
  if (b.status !== undefined) out.status = b.status === 'draft' ? 'draft' : 'published'
  if (b.featured !== undefined) out.featured = !!b.featured
  if (b.publishedAt !== undefined) {
    const d = new Date(b.publishedAt)
    if (!isNaN(d)) out.publishedAt = d
  }
  if (Array.isArray(b.tags)) out.tags = b.tags.map(t => str(t, 40)).filter(Boolean).slice(0, 15)
  if (b.body !== undefined) out.body = cleanBlogHtml(b.body) // rich text from the editor — always cleaned
  if (Array.isArray(b.content)) {
    out.content = b.content
      .map(s => ({ heading: str(s?.heading, 200) || '', text: str(s?.text, 20000) || '', image: str(s?.image, 1000) || '' }))
      .filter(s => s.heading || s.text || s.image)
      .slice(0, 60)
  }
  return out
}

const listSort = { publishedAt: -1, _id: -1 }

// Public: published articles, newest first (no article bodies — cards only)
router.get('/', async (req, res) => {
  const filter = { status: 'published', publishedAt: { $lte: new Date() } }
  if (req.query.category) filter.category = String(req.query.category)
  const limit = Math.min(Number(req.query.limit) || 100, 200)
  res.json(await Blog.find(filter).select('-content -body').sort(listSort).limit(limit).lean())
})

// Admin: everything, including drafts and scheduled posts
router.get('/admin/all', protect, async (req, res) => {
  res.json(await Blog.find({}).select('-content -body').sort(listSort).lean())
})
router.get('/admin/:id', protect, async (req, res) => {
  const doc = await Blog.findOne({ id: req.params.id }).lean()
  if (!doc) return res.status(404).json({ error: 'Article not found' })
  res.json(doc)
})

// Public: one published article by slug
router.get('/:slug', async (req, res) => {
  const live = { status: 'published', publishedAt: { $lte: new Date() } }
  const doc =
    (await Blog.findOne({ slug: req.params.slug, ...live }).lean()) ||
    (await Blog.findOne({ oldSlugs: req.params.slug, ...live }).lean()) // old address → page redirects to the new one
  if (!doc) return res.status(404).json({ error: 'Article not found' })
  res.json(doc)
})

router.post('/', protect, async (req, res) => {
  const body = pick(req.body)
  if (!body.title) return res.status(400).json({ error: 'Please enter a title' })
  const id = 'b' + Date.now()
  const slug = await uniqueBlogSlug(req.body.slug || body.title)
  if (body.featured) await Blog.updateMany({ featured: true }, { featured: false })
  const doc = await Blog.create({ ...body, id, slug })
  res.status(201).json(doc)
})

router.put('/:id', protect, async (req, res) => {
  const body = pick(req.body)
  if (body.title === '') return res.status(400).json({ error: 'Please enter a title' })
  if (req.body.slug !== undefined) {
    const prev = await Blog.findOne({ id: req.params.id }).lean()
    if (!prev) return res.status(404).json({ error: 'Article not found' })
    body.slug = await uniqueBlogSlug(req.body.slug || body.title || prev.title, req.params.id)
    body.oldSlugs = nextOldSlugs(prev, body.slug)
  }
  if (body.featured) await Blog.updateMany({ featured: true, id: { $ne: req.params.id } }, { featured: false })
  const doc = await Blog.findOneAndUpdate({ id: req.params.id }, body, { new: true, runValidators: true })
  if (!doc) return res.status(404).json({ error: 'Article not found' })
  res.json(doc)
})

router.delete('/:id', protect, async (req, res) => {
  const r = await Blog.deleteOne({ id: req.params.id })
  if (!r.deletedCount) return res.status(404).json({ error: 'Article not found' })
  res.json({ success: true })
})

export default router

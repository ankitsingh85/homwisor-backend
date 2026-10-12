import express from 'express'
import SeoPage from '../models/SeoPage.js'
import Blog from '../models/Blog.js'
import { protect } from '../middleware/auth.js'
import { slugify } from '../utils/slug.js'
import { cleanBlogHtml } from '../utils/blogHtml.js'
import { RESERVED } from './blogRoutes.js'

const router = express.Router()

export const FILTER_KEYS = ['q', 'city', 'locality', 'type', 'budget', 'bhk', 'status', 'category']

const str = (v, max) => (v == null ? undefined : String(v).trim().slice(0, max))

// Only known fields, trimmed — never trust the body as-is
const pick = (b = {}) => {
  const out = {}
  FILTER_KEYS.forEach(k => { if (b[k] !== undefined) out[k] = str(b[k], 120) })
  if (b.metaTitle !== undefined) out.metaTitle = str(b.metaTitle, 200)
  if (b.metaDescription !== undefined) out.metaDescription = str(b.metaDescription, 400)
  if (b.heading !== undefined) out.heading = str(b.heading, 200)
  if (b.intro !== undefined) out.intro = cleanBlogHtml(b.intro || '')
  if (b.active !== undefined) out.active = !!b.active
  if (Array.isArray(b.faqs)) {
    out.faqs = b.faqs
      .map((f) => ({ question: str(f?.question, 300) || '', answer: str(f?.answer, 3000) || '' }))
      .filter((f) => f.question && f.answer)
      .slice(0, 30)
  }
  return out
}

// The address must be free: not a site page, not a blog article (blogs share homwisor.com/<slug>),
// not another SEO page. Returns an error message, or '' when it's fine.
async function slugProblem(slug, exceptId) {
  if (!slug) return 'Please enter the page address'
  if (RESERVED.includes(slug)) return `“${slug}” is used by a website page — please choose another address`
  const blog = await Blog.findOne({ $or: [{ slug }, { oldSlugs: slug }] }).select('title').lean()
  if (blog) return `This address is already used by the blog article “${blog.title}”`
  const page = await SeoPage.findOne({ slug, ...(exceptId ? { id: { $ne: exceptId } } : {}) }).select('slug').lean()
  if (page) return 'Another SEO page already uses this address'
  return ''
}

const hasFilter = (doc) => FILTER_KEYS.some(k => doc[k])

// Public: active pages (small — the search page uses them to point duplicate URLs at the clean address)
router.get('/', async (req, res) => {
  res.json(await SeoPage.find({ active: { $ne: false } }).select('-intro -faqs -_id -__v').sort({ createdAt: -1 }).lean())
})

// Admin: all pages, including switched-off ones
router.get('/admin/all', protect, async (req, res) => {
  res.json(await SeoPage.find({}).sort({ createdAt: -1 }).lean())
})

// Public: one active page by address
router.get('/:slug', async (req, res) => {
  const doc = await SeoPage.findOne({ slug: String(req.params.slug).toLowerCase(), active: { $ne: false } }).lean()
  if (!doc) return res.status(404).json({ error: 'Page not found' })
  res.json(doc)
})

router.post('/', protect, async (req, res) => {
  const body = pick(req.body)
  const slug = slugify(req.body.slug || '')
  const problem = await slugProblem(slug)
  if (problem) return res.status(400).json({ error: problem })
  if (!hasFilter(body)) return res.status(400).json({ error: 'Please choose at least one filter (e.g. a locality)' })
  const doc = await SeoPage.create({ ...body, slug, id: 'sp' + Date.now() })
  res.status(201).json(doc)
})

router.put('/:id', protect, async (req, res) => {
  const prev = await SeoPage.findOne({ id: req.params.id }).lean()
  if (!prev) return res.status(404).json({ error: 'Page not found' })
  const body = pick(req.body)
  if (req.body.slug !== undefined) {
    const slug = slugify(req.body.slug)
    const problem = await slugProblem(slug, prev.id)
    if (problem) return res.status(400).json({ error: problem })
    body.slug = slug
  }
  if (!hasFilter({ ...prev, ...body })) return res.status(400).json({ error: 'Please choose at least one filter (e.g. a locality)' })
  res.json(await SeoPage.findOneAndUpdate({ id: prev.id }, body, { new: true }))
})

router.delete('/:id', protect, async (req, res) => {
  await SeoPage.deleteOne({ id: req.params.id })
  res.json({ ok: true })
})

export default router

import express from 'express'
import Testimonial from '../models/Testimonial.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

const PLATFORMS = ['Google', 'Facebook', 'Justdial', 'Website', 'Other']
const HEX = /^#[0-9a-f]{3,8}$/i

const str = (v, max) => (v == null ? undefined : String(v).trim().slice(0, max))
const initialsOf = (name = '') => name.split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()

// Only known fields, trimmed — never trust the body as-is
const pick = (b = {}) => {
  const out = {}
  if (b.name !== undefined) out.name = str(b.name, 80)
  if (b.text !== undefined) out.text = str(b.text, 1200)
  if (b.role !== undefined) out.role = str(b.role, 120)
  if (b.photo !== undefined) out.photo = str(b.photo, 1000)
  if (b.initials !== undefined) out.initials = str(b.initials, 3)?.toUpperCase()
  if (b.platform !== undefined) out.platform = PLATFORMS.includes(b.platform) ? b.platform : 'Google'
  if (b.rating !== undefined) out.rating = Math.min(5, Math.max(1, Math.round(Number(b.rating) || 5)))
  if (b.verified !== undefined) out.verified = !!b.verified
  if (b.active !== undefined) out.active = !!b.active
  if (b.order !== undefined && Number.isFinite(Number(b.order))) out.order = Number(b.order)
  if (b.color !== undefined) out.color = HEX.test(b.color) ? b.color : '#F3E7C2'
  if (b.textColor !== undefined) out.textColor = HEX.test(b.textColor) ? b.textColor : '#5b4a16'
  return out
}

// website order: admin order first, then oldest first (how they were seeded)
const sort = { order: 1, createdAt: 1, _id: 1 }

// Public: visible testimonials only
router.get('/', async (req, res) => {
  res.json(await Testimonial.find({ active: { $ne: false } }).sort(sort).lean())
})

// Admin: all, including hidden ones
router.get('/admin/all', protect, async (req, res) => {
  res.json(await Testimonial.find({}).sort(sort).lean())
})

router.post('/', protect, async (req, res) => {
  const body = pick(req.body)
  if (!body.name) return res.status(400).json({ error: "Please enter the customer's name" })
  if (!body.text) return res.status(400).json({ error: 'Please enter the review' })
  if (!body.initials) body.initials = initialsOf(body.name)
  if (body.order === undefined) body.order = (await Testimonial.countDocuments()) // new ones go last
  const doc = await Testimonial.create({ rating: 5, platform: 'Google', verified: true, active: true, ...body, id: 't' + Date.now() })
  res.status(201).json(doc)
})

router.put('/:id', protect, async (req, res) => {
  const body = pick(req.body)
  if (body.name === '') return res.status(400).json({ error: "Please enter the customer's name" })
  if (body.text === '') return res.status(400).json({ error: 'Please enter the review' })
  if (body.name && !req.body.initials) body.initials = initialsOf(body.name)
  const doc = await Testimonial.findOneAndUpdate({ id: req.params.id }, body, { new: true })
  if (!doc) return res.status(404).json({ error: 'Not found' })
  res.json(doc)
})

router.delete('/:id', protect, async (req, res) => {
  const r = await Testimonial.deleteOne({ id: req.params.id })
  if (!r.deletedCount) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

export default router

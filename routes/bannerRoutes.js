import express from 'express'
import Banner from '../models/Banner.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

const TYPES = ['hero', 'slider', 'small']
// Only these fields can be set from the admin panel
const pick = (b = {}) => {
  const out = {}
  for (const k of ['image', 'title', 'link', 'developer']) if (b[k] !== undefined) out[k] = String(b[k] ?? '').trim()
  return out
}

// GET /api/banners -> { hero: [], slider: [], small: [] }
router.get('/', async (req, res) => {
  const all = await Banner.find({}).sort({ createdAt: 1 }).lean()
  res.json(Object.fromEntries(TYPES.map(t => [t, all.filter(b => b.type === t)])))
})

router.post('/:type', protect, async (req, res) => {
  const type = req.params.type
  if (!TYPES.includes(type)) return res.status(400).json({ error: 'Invalid banner type' })
  const data = pick(req.body)
  if (!data.image) return res.status(400).json({ error: 'Banner image is required' })
  const nb = { id: type.slice(0, 2) + Date.now(), type, ...data }
  const doc = await Banner.create(nb)
  res.json(doc)
})

router.put('/:type/:id', protect, async (req, res) => {
  const doc = await Banner.findOneAndUpdate({ id: req.params.id }, pick(req.body), { new: true })
  if (!doc) return res.status(404).json({ error: 'Not found' })
  res.json(doc)
})

router.delete('/:type/:id', protect, async (req, res) => {
  const r = await Banner.deleteOne({ id: req.params.id })
  if (!r.deletedCount) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

export default router

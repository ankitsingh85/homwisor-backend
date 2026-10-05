import express from 'express'
import Recommended from '../models/Recommended.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

const pick = (b = {}) => {
  const out = {}
  for (const k of ['title', 'image', 'price', 'location', 'link', 'badge']) if (b[k] !== undefined) out[k] = String(b[k] ?? '').trim()
  if (b.order !== undefined && Number.isFinite(Number(b.order))) out.order = Number(b.order)
  return out
}

// GET /api/recommended — in display order
router.get('/', async (req, res) => {
  res.json(await Recommended.find({}).sort({ order: 1, createdAt: 1 }).lean())
})

router.post('/', protect, async (req, res) => {
  const data = pick(req.body)
  if (!data.title) return res.status(400).json({ error: 'Name is required' })
  if (!data.image) return res.status(400).json({ error: 'Image is required' })
  if (data.order === undefined) {
    const last = await Recommended.findOne({}).sort({ order: -1 }).lean()
    data.order = (last?.order ?? -1) + 1
  }
  res.status(201).json(await Recommended.create({ id: 'rc' + Date.now(), ...data }))
})

router.put('/:id', protect, async (req, res) => {
  const data = pick(req.body)
  if ('title' in data && !data.title) return res.status(400).json({ error: 'Name is required' })
  if ('image' in data && !data.image) return res.status(400).json({ error: 'Image is required' })
  const doc = await Recommended.findOneAndUpdate({ id: req.params.id }, data, { new: true })
  if (!doc) return res.status(404).json({ error: 'Not found' })
  res.json(doc)
})

router.delete('/:id', protect, async (req, res) => {
  const r = await Recommended.deleteOne({ id: req.params.id })
  if (!r.deletedCount) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

export default router

import express from 'express'
import Banner from '../models/Banner.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// GET /api/banners -> {hero:[], small:[]}
router.get('/', async (req, res) => {
  const all = await Banner.find({}).lean()
  res.json({
    hero: all.filter(b => b.type === 'hero'),
    small: all.filter(b => b.type === 'small')
  })
})

router.post('/:type', protect, async (req, res) => {
  const type = req.params.type
  if (!['hero','small'].includes(type)) return res.status(400).json({ error: 'invalid type' })
  const nb = { id: type[0] + Date.now(), type, ...req.body }
  const doc = await Banner.create(nb)
  res.json(doc)
})

router.put('/:type/:id', protect, async (req, res) => {
  const doc = await Banner.findOneAndUpdate({ id: req.params.id }, req.body, { new: true })
  if (!doc) return res.status(404).json({ error: 'Not found' })
  res.json(doc)
})

router.delete('/:type/:id', protect, async (req, res) => {
  const r = await Banner.deleteOne({ id: req.params.id })
  if (!r.deletedCount) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

export default router

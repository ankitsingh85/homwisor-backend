import express from 'express'
import Snap from '../models/Snap.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/', async (req, res) => {
  const snaps = await Snap.find({}).sort({ createdAt: -1 }).lean()
  res.json(snaps)
})

router.get('/:id', async (req, res) => {
  const snap = await Snap.findOne({ id: req.params.id }).lean()
  if (!snap) return res.status(404).json({ error: 'Not found' })
  res.json(snap)
})

router.post('/', protect, async (req, res) => {
  const n = { id: 'snap' + Date.now(), ...req.body }
  const doc = await Snap.create(n)
  res.json(doc)
})

router.put('/:id', protect, async (req, res) => {
  const doc = await Snap.findOneAndUpdate({ id: req.params.id }, req.body, { new: true })
  if (!doc) return res.status(404).json({ error: 'Not found' })
  res.json(doc)
})

router.delete('/:id', protect, async (req, res) => {
  const r = await Snap.deleteOne({ id: req.params.id })
  if (!r.deletedCount) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

export default router

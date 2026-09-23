import express from 'express'
import Offer from '../models/Offer.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/', async (req, res) => {
  res.json(await Offer.find({}).lean())
})

router.post('/', protect, async (req, res) => {
  const n = { id: 'o' + Date.now(), ...req.body }
  const doc = await Offer.create(n)
  res.json(doc)
})

router.put('/:id', protect, async (req, res) => {
  const doc = await Offer.findOneAndUpdate({ id: req.params.id }, req.body, { new: true })
  if (!doc) return res.status(404).json({ error: 'Not found' })
  res.json(doc)
})

router.delete('/:id', protect, async (req, res) => {
  const r = await Offer.deleteOne({ id: req.params.id })
  if (!r.deletedCount) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

export default router

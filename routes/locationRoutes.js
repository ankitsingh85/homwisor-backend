import express from 'express'
import Location from '../models/Location.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/', async (req, res) => {
  res.json(await Location.find({}).lean())
})

router.post('/', protect, async (req, res) => {
  const n = { id: 'l' + Date.now(), ...req.body }
  const doc = await Location.create(n)
  res.json(doc)
})

router.put('/:id', protect, async (req, res) => {
  const doc = await Location.findOneAndUpdate({ id: req.params.id }, req.body, { new: true })
  if (!doc) return res.status(404).json({ error: 'Not found' })
  res.json(doc)
})

router.delete('/:id', protect, async (req, res) => {
  const r = await Location.deleteOne({ id: req.params.id })
  if (!r.deletedCount) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

export default router

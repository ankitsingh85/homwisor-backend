import express from 'express'
import Testimonial from '../models/Testimonial.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/', async (req, res) => {
  res.json(await Testimonial.find({}).lean())
})

router.post('/', protect, async (req, res) => {
  const n = { id: 't' + Date.now(), ...req.body }
  const doc = await Testimonial.create(n)
  res.json(doc)
})

router.delete('/:id', protect, async (req, res) => {
  const r = await Testimonial.deleteOne({ id: req.params.id })
  if (!r.deletedCount) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

export default router

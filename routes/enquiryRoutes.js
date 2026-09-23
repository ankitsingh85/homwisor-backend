import express from 'express'
import Enquiry from '../models/Enquiry.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/', protect, async (req, res) => {
  const list = await Enquiry.find({}).sort({ createdAt: -1 }).lean()
  res.json(list)
})

router.post('/', async (req, res) => {
  const n = { id: 'e' + Date.now(), date: new Date().toISOString().slice(0,10), ...req.body }
  const doc = await Enquiry.create(n)
  res.json(doc)
})

router.delete('/:id', protect, async (req, res) => {
  await Enquiry.deleteOne({ id: req.params.id })
  res.json({ success: true })
})

export default router

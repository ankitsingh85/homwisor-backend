import express from 'express'
import Builder from '../models/Builder.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/', async (req, res) => {
  res.json(await Builder.find({}).lean())
})

router.post('/', protect, async (req, res) => {
  const n = { id: 'b' + Date.now(), ...req.body }
  const doc = await Builder.create(n)
  res.json(doc)
})

router.delete('/:id', protect, async (req, res) => {
  const r = await Builder.deleteOne({ id: req.params.id })
  if (!r.deletedCount) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

export default router

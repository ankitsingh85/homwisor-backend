import express from 'express'
import Settings from '../models/Settings.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

router.get('/', async (req, res) => {
  let s = await Settings.findOne({ key: 'main' }).lean()
  if (!s) {
    s = await Settings.create({ key: 'main' })
  }
  res.json(s)
})

router.put('/', protect, async (req, res) => {
  const doc = await Settings.findOneAndUpdate({ key: 'main' }, req.body, { new: true, upsert: true })
  res.json(doc)
})

export default router

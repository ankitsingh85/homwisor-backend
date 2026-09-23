import express from 'express'
import Property from '../models/Property.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// GET /api/properties?category=&type=&location=&search=&status=&limit=
router.get('/', async (req, res) => {
  try {
    const { category, search, type, location, status, limit } = req.query
    let query = {}
    if (category) query.category = category
    if (status) query.status = status
    if (type) query.type = new RegExp(`^${type}$`, 'i')
    if (location) query.location = new RegExp(location, 'i')
    if (search) {
      const s = search
      query.$or = [{ title: new RegExp(s, 'i') }, { location: new RegExp(s, 'i') }]
    }
    let q = Property.find(query).sort({ createdAt: -1 })
    if (limit) q = q.limit(parseInt(limit))
    const props = await q.lean()
    res.json(props)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

router.get('/:id', async (req, res) => {
  const prop = await Property.findOne({ id: req.params.id }).lean()
  if (!prop) return res.status(404).json({ error: 'Not found' })
  res.json(prop)
})

router.post('/', protect, async (req, res) => {
  try {
    const newProp = { id: 'p' + Date.now(), ...req.body }
    const doc = await Property.create(newProp)
    res.json(doc)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.put('/:id', protect, async (req, res) => {
  const doc = await Property.findOneAndUpdate({ id: req.params.id }, req.body, { new: true })
  if (!doc) return res.status(404).json({ error: 'Not found' })
  res.json(doc)
})

router.delete('/:id', protect, async (req, res) => {
  const r = await Property.deleteOne({ id: req.params.id })
  if (!r.deletedCount) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

export default router

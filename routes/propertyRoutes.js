import express from 'express'
import Property from '../models/Property.js'
import { protect } from '../middleware/auth.js'
import { uniqueSlug, nextOldSlugs } from '../utils/slug.js'

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
    let q = Property.find(query).sort({ createdAt: -1, _id: -1 })
    if (limit) q = q.limit(parseInt(limit))
    const props = await q.lean()
    res.json(props)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// GET /api/properties/:key — key is the slug, an old slug, or the id
router.get('/:key', async (req, res) => {
  const key = String(req.params.key)
  const prop =
    (await Property.findOne({ slug: key }).lean()) ||
    (await Property.findOne({ id: key }).lean()) ||
    (await Property.findOne({ oldSlugs: key }).lean())
  if (!prop) return res.status(404).json({ error: 'Not found' })
  res.json(prop)
})

router.post('/', protect, async (req, res) => {
  try {
    const { oldSlugs, ...body } = req.body
    const id = 'p' + Date.now()
    const slug = await uniqueSlug(Property, body.slug || body.title, null, id)
    const doc = await Property.create({ ...body, id, slug })
    res.json(doc)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.put('/:id', protect, async (req, res) => {
  const { oldSlugs, id, ...body } = req.body
  const prev = await Property.findOne({ id: req.params.id }).lean()
  if (!prev) return res.status(404).json({ error: 'Not found' })
  if (body.slug !== undefined || !prev.slug) {
    body.slug = await uniqueSlug(Property, body.slug || body.title || prev.title, prev.id, prev.id)
    body.oldSlugs = nextOldSlugs(prev, body.slug)
  }
  const doc = await Property.findOneAndUpdate({ id: req.params.id }, body, { new: true })
  res.json(doc)
})

router.delete('/:id', protect, async (req, res) => {
  const r = await Property.deleteOne({ id: req.params.id })
  if (!r.deletedCount) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

export default router

import express from 'express'
import Builder from '../models/Builder.js'
import { protect } from '../middleware/auth.js'
import { uniqueSlug } from '../utils/slug.js'

const router = express.Router()
const str = (v, max) => (v == null ? undefined : String(v).trim().slice(0, max))

// Only known fields, trimmed
const pick = (b = {}) => {
  const out = {}
  for (const [k, max] of [['name', 100], ['logo', 1000], ['subtext', 120], ['description', 3000], ['established', 20], ['website', 300]]) {
    if (b[k] !== undefined) out[k] = str(b[k], max)
  }
  if (Array.isArray(b.aliases)) out.aliases = [...new Set(b.aliases.map((a) => str(a, 80)).filter(Boolean))].slice(0, 10)
  if (b.count !== undefined) { const n = parseInt(b.count, 10); out.count = Number.isFinite(n) && n >= 0 ? n : 0; out.projects = out.count ? `${out.count} Project${out.count === 1 ? '' : 's'}` : '' }
  if (b.active !== undefined) out.active = !!b.active
  if (b.order !== undefined && Number.isFinite(Number(b.order))) out.order = Number(b.order)
  return out
}

const sort = { order: 1, createdAt: 1, _id: 1 }

// Public: visible developers, in admin order
router.get('/', async (req, res) => {
  res.json(await Builder.find({ active: { $ne: false } }).sort(sort).lean())
})
router.get('/admin/all', protect, async (req, res) => {
  res.json(await Builder.find({}).sort(sort).lean())
})
// Public: one developer by web address (or id)
router.get('/:key', async (req, res) => {
  const k = String(req.params.key)
  const doc = (await Builder.findOne({ slug: k, active: { $ne: false } }).lean()) || (await Builder.findOne({ id: k, active: { $ne: false } }).lean())
  if (!doc) return res.status(404).json({ error: 'Developer not found' })
  res.json(doc)
})

router.post('/', protect, async (req, res) => {
  const body = pick(req.body)
  if (!body.name) return res.status(400).json({ error: "Please enter the developer's name" })
  const id = 'b' + Date.now()
  const slug = await uniqueSlug(Builder, req.body.slug || body.name, null, 'developer')
  if (body.order === undefined) body.order = await Builder.countDocuments()
  res.status(201).json(await Builder.create({ active: true, ...body, id, slug }))
})

router.put('/:id', protect, async (req, res) => {
  const body = pick(req.body)
  if (body.name === '') return res.status(400).json({ error: "Please enter the developer's name" })
  if (req.body.slug !== undefined) body.slug = await uniqueSlug(Builder, req.body.slug || body.name || req.params.id, req.params.id, 'developer')
  const doc = await Builder.findOneAndUpdate({ id: req.params.id }, body, { new: true })
  if (!doc) return res.status(404).json({ error: 'Not found' })
  res.json(doc)
})

router.delete('/:id', protect, async (req, res) => {
  const r = await Builder.deleteOne({ id: req.params.id })
  if (!r.deletedCount) return res.status(404).json({ error: 'Not found' })
  res.json({ success: true })
})

// Startup: give every developer a web address and an order
export async function migrateBuilders() {
  const list = await Builder.find({}).sort({ createdAt: 1, _id: 1 })
  let n = 0
  for (const [i, b] of list.entries()) {
    let changed = false
    if (!b.slug) { b.slug = await uniqueSlug(Builder, b.name, b.id, 'developer'); changed = true }
    if (b.order == null) { b.order = i; changed = true }
    if (b.count == null && b.projects) { b.count = parseInt(b.projects, 10) || 0; changed = true }
    if (changed) { await b.save(); n++ }
  }
  if (n) console.log(`🏗️  Developers: added web addresses / order to ${n}`)
}

export default router

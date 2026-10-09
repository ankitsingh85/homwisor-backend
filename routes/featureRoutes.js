import express from 'express'
import Feature from '../models/Feature.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()
const KEYS = ['branded', 'developers']
const str = (v, max) => (v == null ? '' : String(v).trim().slice(0, max))

// Only known fields, trimmed
const pick = (b = {}) => ({
  eyebrow: str(b.eyebrow, 60),
  heading: str(b.heading, 160),
  highlight: str(b.highlight, 80),
  description: str(b.description, 600),
  stats: Array.isArray(b.stats) ? b.stats.map((x) => ({ value: str(x?.value, 20), label: str(x?.label, 40) })).filter((x) => x.value && x.label).slice(0, 4) : [],
  points: Array.isArray(b.points) ? b.points.map((p) => str(p, 80)).filter(Boolean).slice(0, 4) : [],
  primaryLabel: str(b.primaryLabel, 40),
  primaryLink: str(b.primaryLink, 500),
  secondaryLabel: str(b.secondaryLabel, 40),
  secondaryLink: str(b.secondaryLink, 500),
  main: {
    image: str(b.main?.image, 1000), label: str(b.main?.label, 60),
    title: str(b.main?.title, 120), link: str(b.main?.link, 500),
  },
  side: {
    image: str(b.side?.image, 1000), brand: str(b.side?.brand, 40), sub: str(b.side?.sub, 40),
    tagline: str(b.side?.tagline, 80), note: str(b.side?.note, 40), location: str(b.side?.location, 60),
    footer: str(b.side?.footer, 80), link: str(b.side?.link, 500),
  },
})

// Public: the saved banner, or {} (the website then shows its built-in content)
router.get('/:key', async (req, res) => {
  if (!KEYS.includes(req.params.key)) return res.status(404).json({ error: 'Not found' })
  res.json((await Feature.findOne({ key: req.params.key }).lean()) || {})
})

router.put('/:key', protect, async (req, res) => {
  if (!KEYS.includes(req.params.key)) return res.status(404).json({ error: 'Not found' })
  const doc = await Feature.findOneAndUpdate({ key: req.params.key }, { ...pick(req.body), key: req.params.key }, { new: true, upsert: true })
  res.json(doc)
})

export default router

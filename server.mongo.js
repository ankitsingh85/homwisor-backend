// HomWisor backend — MongoDB version (drop-in replacement for server.js)
// If MONGODB_URI is set → uses MongoDB (Atlas/local). Else → falls back to file DB (data/db.json)
// Frontend needs zero changes — same /api/* endpoints.

import express from 'express'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'
import { Property, AppData, Snap, Enquiry } from './models.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const app = express()
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || 'HomWisor-secret-key-2026'
const MONGODB_URI = process.env.MONGODB_URI || ''

app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))
if (!fs.existsSync(path.join(__dirname, 'uploads'))) fs.mkdirSync(path.join(__dirname, 'uploads'))
if (!fs.existsSync(path.join(__dirname, 'data'))) fs.mkdirSync(path.join(__dirname, 'data'))

const DATA_FILE = path.join(__dirname, 'data', 'db.json')

// ---- defaultData shared with the MVC seed ----
import { defaultData } from './utils/seedData.js'

// ---- Mongo connection ----
let useMongo = !!MONGODB_URI
let mongoReady = false
if (useMongo) {
  console.log('MongoDB URI found — connecting...')
  mongoose.connect(MONGODB_URI).then(async () => {
    console.log('MongoDB connected')
    mongoReady = true
    // auto-seed if empty
    const count = await Property.countDocuments()
    if (count === 0) {
      console.log('Mongo empty — seeding from defaultData...')
      await Property.insertMany(defaultData.properties)
      await Snap.insertMany(defaultData.snaps)
      if (defaultData.enquiries?.length) await Enquiry.insertMany(defaultData.enquiries)
      await AppData.create({
        key: 'main',
        banners: defaultData.banners,
        locations: defaultData.locations,
        offers: defaultData.offers,
        builders: defaultData.builders,
        testimonials: defaultData.testimonials,
        settings: defaultData.settings
      })
      console.log('Seeded')
    }
  }).catch(err => {
    console.error('Mongo connect failed — falling back to file DB:', err.message)
    useMongo = false
  })
} else {
  console.log('No MONGODB_URI — using file DB (data/db.json)')
}

// ---- file DB fallback (same as original) ----
function loadFileData() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2))
    return JSON.parse(JSON.stringify(defaultData))
  }
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    if (!parsed.snaps) parsed.snaps = defaultData.snaps
    if (!parsed.banners) parsed.banners = defaultData.banners
    if (!parsed.builders) parsed.builders = defaultData.builders
    if (!parsed.testimonials) parsed.testimonials = defaultData.testimonials
    if (parsed.properties) {
      parsed.properties = parsed.properties.map(p => {
        const def = defaultData.properties.find(d => d.id === p.id) || {}
        return { ...def, ...p, highlights: p.highlights || def.highlights || [], gallery: p.gallery || def.gallery || [], logo: p.logo || def.logo || '', brandColor: p.brandColor || def.brandColor || '#1e3a5f' }
      })
      defaultData.properties.forEach(d => { if (!parsed.properties.find(p => p.id === d.id)) parsed.properties.push(d) })
    }
    return { ...defaultData, ...parsed, banners: parsed.banners || defaultData.banners, snaps: parsed.snaps || defaultData.snaps, builders: parsed.builders || defaultData.builders, testimonials: parsed.testimonials || defaultData.testimonials }
  } catch (e) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(defaultData, null, 2))
    return JSON.parse(JSON.stringify(defaultData))
  }
}
function saveFileData(data) { fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2)) }
let fileDb = loadFileData()

// ---- helpers to abstract storage ----
async function getAppData() {
  if (useMongo && mongoReady) {
    let doc = await AppData.findOne({ key: 'main' })
    if (!doc) {
      doc = await AppData.create({ key: 'main', banners: defaultData.banners, locations: defaultData.locations, offers: defaultData.offers, builders: defaultData.builders, testimonials: defaultData.testimonials, settings: defaultData.settings })
    }
    return doc
  }
  return fileDb
}
async function getProperties(filter = {}) {
  if (useMongo && mongoReady) {
    let q = {}
    if (filter.category) q.category = filter.category
    if (filter.status) q.status = filter.status
    if (filter.type) q.type = new RegExp(`^${filter.type}$`, 'i')
    if (filter.location) q.location = new RegExp(filter.location, 'i')
    if (filter.search) {
      const s = filter.search
      q.$or = [{ title: new RegExp(s, 'i') }, { location: new RegExp(s, 'i') }]
    }
    let docs = await Property.find(q).lean()
    if (filter.limit) docs = docs.slice(0, parseInt(filter.limit))
    return docs
  }
  let result = [...fileDb.properties]
  if (filter.category) result = result.filter(p => p.category === filter.category)
  if (filter.status) result = result.filter(p => p.status === filter.status)
  if (filter.type) result = result.filter(p => p.type.toLowerCase() === filter.type.toLowerCase())
  if (filter.location) result = result.filter(p => p.location.toLowerCase().includes(filter.location.toLowerCase()))
  if (filter.search) {
    const s = filter.search.toLowerCase()
    result = result.filter(p => p.title.toLowerCase().includes(s) || p.location.toLowerCase().includes(s))
  }
  if (filter.limit) result = result.slice(0, parseInt(filter.limit))
  return result
}

// ---- auth ----
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization
  if (!auth) return res.status(401).json({ error: 'No token' })
  const token = auth.split(' ')[1]
  try { req.user = jwt.verify(token, JWT_SECRET); next() } catch { return res.status(401).json({ error: 'Invalid token' }) }
}
app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body
  if (username === 'admin' && password === 'admin123') {
    const token = jwt.sign({ username: 'admin', role: 'admin' }, JWT_SECRET, { expiresIn: '24h' })
    return res.json({ token, user: { username: 'admin' } })
  }
  return res.status(401).json({ error: 'Invalid credentials. Use admin / admin123' })
})

// ---- routes (same as original, mongo-aware) ----
app.get('/api/banners', async (req, res) => res.json((await getAppData()).banners))
app.get('/api/locations', async (req, res) => res.json((await getAppData()).locations))
app.get('/api/offers', async (req, res) => res.json((await getAppData()).offers))
app.get('/api/snaps', async (req, res) => {
  if (useMongo && mongoReady) return res.json(await Snap.find({}).lean())
  res.json(fileDb.snaps)
})
app.get('/api/builders', async (req, res) => res.json((await getAppData()).builders || []))
app.get('/api/testimonials', async (req, res) => res.json((await getAppData()).testimonials || []))
app.get('/api/settings', async (req, res) => res.json((await getAppData()).settings))

app.get('/api/properties', async (req, res) => {
  const { category, search, type, location, status, limit } = req.query
  res.json(await getProperties({ category, search, type, location, status, limit }))
})
app.get('/api/properties/:id', async (req, res) => {
  if (useMongo && mongoReady) {
    const p = await Property.findOne({ id: req.params.id }).lean()
    if (!p) return res.status(404).json({ error: 'Not found' })
    return res.json(p)
  }
  const p = fileDb.properties.find(x => x.id === req.params.id)
  if (!p) return res.status(404).json({ error: 'Not found' })
  res.json(p)
})
app.get('/api/snaps/:id', async (req, res) => {
  if (useMongo && mongoReady) {
    const s = await Snap.findOne({ id: req.params.id }).lean()
    if (!s) return res.status(404).json({ error: 'Not found' })
    return res.json(s)
  }
  const s = fileDb.snaps.find(x => x.id === req.params.id)
  if (!s) return res.status(404).json({ error: 'Not found' })
  res.json(s)
})

// mutations
app.post('/api/properties', authMiddleware, async (req, res) => {
  const newProp = { id: 'p' + Date.now(), ...req.body }
  if (useMongo && mongoReady) {
    const doc = await Property.create(newProp)
    return res.json(doc)
  }
  fileDb.properties.unshift(newProp); saveFileData(fileDb); res.json(newProp)
})
app.put('/api/properties/:id', authMiddleware, async (req, res) => {
  if (useMongo && mongoReady) {
    const doc = await Property.findOneAndUpdate({ id: req.params.id }, req.body, { new: true })
    if (!doc) return res.status(404).json({ error: 'Not found' })
    return res.json(doc)
  }
  const idx = fileDb.properties.findIndex(p => p.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  fileDb.properties[idx] = { ...fileDb.properties[idx], ...req.body, id: req.params.id }; saveFileData(fileDb); res.json(fileDb.properties[idx])
})
app.delete('/api/properties/:id', authMiddleware, async (req, res) => {
  if (useMongo && mongoReady) {
    const r = await Property.deleteOne({ id: req.params.id })
    if (r.deletedCount === 0) return res.status(404).json({ error: 'Not found' })
    return res.json({ success: true })
  }
  const before = fileDb.properties.length
  fileDb.properties = fileDb.properties.filter(p => p.id !== req.params.id)
  if (before === fileDb.properties.length) return res.status(404).json({ error: 'Not found' })
  saveFileData(fileDb); res.json({ success: true })
})

app.post('/api/snaps', authMiddleware, async (req, res) => {
  const n = { id: 'snap' + Date.now(), ...req.body }
  if (useMongo && mongoReady) { const d = await Snap.create(n); return res.json(d) }
  fileDb.snaps.push(n); saveFileData(fileDb); res.json(n)
})
app.put('/api/snaps/:id', authMiddleware, async (req, res) => {
  if (useMongo && mongoReady) {
    const d = await Snap.findOneAndUpdate({ id: req.params.id }, req.body, { new: true })
    if (!d) return res.status(404).json({ error: 'Not found' })
    return res.json(d)
  }
  const idx = fileDb.snaps.findIndex(s => s.id === req.params.id)
  if (idx === -1) return res.status(404).json({ error: 'Not found' })
  fileDb.snaps[idx] = { ...fileDb.snaps[idx], ...req.body, id: req.params.id }; saveFileData(fileDb); res.json(fileDb.snaps[idx])
})
app.delete('/api/snaps/:id', authMiddleware, async (req, res) => {
  if (useMongo && mongoReady) { const r = await Snap.deleteOne({ id: req.params.id }); if (!r.deletedCount) return res.status(404).json({ error: 'Not found' }); return res.json({ success: true }) }
  const b = fileDb.snaps.length; fileDb.snaps = fileDb.snaps.filter(s => s.id !== req.params.id); if (b === fileDb.snaps.length) return res.status(404).json({ error: 'Not found' }); saveFileData(fileDb); res.json({ success: true })
})

// banners / locations / offers / builders / testimonials mutations via AppData
async function updateAppDataArray(key, action, payload) {
  if (useMongo && mongoReady) {
    const doc = await AppData.findOne({ key: 'main' })
    if (action === 'push') doc[key].push(payload)
    if (action === 'pull') doc[key] = doc[key].filter(x => x.id !== payload)
    if (action === 'put') {
      const idx = doc[key].findIndex(x => x.id === payload.id)
      if (idx !== -1) doc[key][idx] = { ...doc[key][idx].toObject(), ...payload }
    }
    await doc.save()
    return doc[key]
  }
  // file fallback
  if (action === 'push') fileDb[key].push(payload)
  if (action === 'pull') {
    if (key === 'banners') {} else fileDb[key] = fileDb[key].filter(x => x.id !== payload)
  }
  saveFileData(fileDb)
  return fileDb[key]
}

app.post('/api/banners/:type', authMiddleware, async (req, res) => {
  const type = req.params.type
  if (!['hero','small'].includes(type)) return res.status(400).json({ error: 'invalid type' })
  const nb = { id: type[0] + Date.now(), ...req.body }
  if (useMongo && mongoReady) {
    const doc = await AppData.findOne({ key: 'main' })
    doc.banners[type].push(nb); await doc.save(); return res.json(nb)
  }
  fileDb.banners[type].push(nb); saveFileData(fileDb); res.json(nb)
})
app.delete('/api/banners/:type/:id', authMiddleware, async (req, res) => {
  const { type, id } = req.params
  if (useMongo && mongoReady) {
    const doc = await AppData.findOne({ key: 'main' })
    doc.banners[type] = doc.banners[type].filter(b => b.id !== id); await doc.save(); return res.json({ success: true })
  }
  fileDb.banners[type] = fileDb.banners[type].filter(b => b.id !== id); saveFileData(fileDb); res.json({ success: true })
})
app.post('/api/locations', authMiddleware, async (req, res) => {
  const n = { id: 'l' + Date.now(), ...req.body }
  if (useMongo && mongoReady) { const d = await AppData.findOne({ key: 'main' }); d.locations.push(n); await d.save(); return res.json(n) }
  fileDb.locations.push(n); saveFileData(fileDb); res.json(n)
})
app.delete('/api/locations/:id', authMiddleware, async (req, res) => {
  if (useMongo && mongoReady) { const d = await AppData.findOne({ key: 'main' }); d.locations = d.locations.filter(x => x.id !== req.params.id); await d.save(); return res.json({ success: true }) }
  fileDb.locations = fileDb.locations.filter(x => x.id !== req.params.id); saveFileData(fileDb); res.json({ success: true })
})
app.post('/api/offers', authMiddleware, async (req, res) => {
  const n = { id: 'o' + Date.now(), ...req.body }
  if (useMongo && mongoReady) { const d = await AppData.findOne({ key: 'main' }); d.offers.push(n); await d.save(); return res.json(n) }
  fileDb.offers.push(n); saveFileData(fileDb); res.json(n)
})
app.delete('/api/offers/:id', authMiddleware, async (req, res) => {
  if (useMongo && mongoReady) { const d = await AppData.findOne({ key: 'main' }); d.offers = d.offers.filter(x => x.id !== req.params.id); await d.save(); return res.json({ success: true }) }
  fileDb.offers = fileDb.offers.filter(x => x.id !== req.params.id); saveFileData(fileDb); res.json({ success: true })
})
app.post('/api/builders', authMiddleware, async (req, res) => {
  const n = { id: 'b' + Date.now(), ...req.body }
  if (useMongo && mongoReady) { const d = await AppData.findOne({ key: 'main' }); d.builders.push(n); await d.save(); return res.json(n) }
  fileDb.builders.push(n); saveFileData(fileDb); res.json(n)
})
app.delete('/api/builders/:id', authMiddleware, async (req, res) => {
  if (useMongo && mongoReady) { const d = await AppData.findOne({ key: 'main' }); d.builders = d.builders.filter(x => x.id !== req.params.id); await d.save(); return res.json({ success: true }) }
  fileDb.builders = fileDb.builders.filter(x => x.id !== req.params.id); saveFileData(fileDb); res.json({ success: true })
})
app.post('/api/testimonials', authMiddleware, async (req, res) => {
  const n = { id: 't' + Date.now(), ...req.body }
  if (useMongo && mongoReady) { const d = await AppData.findOne({ key: 'main' }); d.testimonials.push(n); await d.save(); return res.json(n) }
  fileDb.testimonials.push(n); saveFileData(fileDb); res.json(n)
})
app.delete('/api/testimonials/:id', authMiddleware, async (req, res) => {
  if (useMongo && mongoReady) { const d = await AppData.findOne({ key: 'main' }); d.testimonials = d.testimonials.filter(x => x.id !== req.params.id); await d.save(); return res.json({ success: true }) }
  fileDb.testimonials = fileDb.testimonials.filter(x => x.id !== req.params.id); saveFileData(fileDb); res.json({ success: true })
})
app.get('/api/enquiries', authMiddleware, async (req, res) => {
  if (useMongo && mongoReady) return res.json(await Enquiry.find({}).sort({ _id: -1 }).lean())
  res.json(fileDb.enquiries)
})
app.post('/api/enquiries', async (req, res) => {
  const n = { id: 'e' + Date.now(), date: new Date().toISOString().slice(0,10), ...req.body }
  if (useMongo && mongoReady) { const d = await Enquiry.create(n); return res.json(d) }
  fileDb.enquiries.unshift(n); saveFileData(fileDb); res.json(n)
})
app.delete('/api/enquiries/:id', authMiddleware, async (req, res) => {
  if (useMongo && mongoReady) { await Enquiry.deleteOne({ id: req.params.id }); return res.json({ success: true }) }
  fileDb.enquiries = fileDb.enquiries.filter(x => x.id !== req.params.id); saveFileData(fileDb); res.json({ success: true })
})
app.put('/api/settings', authMiddleware, async (req, res) => {
  if (useMongo && mongoReady) { const d = await AppData.findOne({ key: 'main' }); d.settings = { ...d.settings, ...req.body }; await d.save(); return res.json(d.settings) }
  fileDb.settings = { ...fileDb.settings, ...req.body }; saveFileData(fileDb); res.json(fileDb.settings)
})
app.get('/api/admin/stats', authMiddleware, async (req, res) => {
  if (useMongo && mongoReady) {
    const [p, e, s] = await Promise.all([Property.countDocuments(), Enquiry.countDocuments(), Snap.countDocuments()])
    const appd = await AppData.findOne({ key: 'main' })
    return res.json({ totalProperties: p, totalEnquiries: e, totalSnaps: s, totalLocations: appd.locations.length, totalOffers: appd.offers.length, totalBuilders: appd.builders.length, totalTestimonials: appd.testimonials.length, recommended: await Property.countDocuments({ category: 'recommended' }), trending: await Property.countDocuments({ category: 'trending' }) })
  }
  res.json({ totalProperties: fileDb.properties.length, totalEnquiries: fileDb.enquiries.length, totalLocations: fileDb.locations.length, totalOffers: fileDb.offers.length, totalSnaps: fileDb.snaps.length, totalBuilders: fileDb.builders.length, totalTestimonials: fileDb.testimonials.length, recommended: fileDb.properties.filter(p=>p.category==='recommended').length, trending: fileDb.properties.filter(p=>p.category==='trending').length })
})
app.post('/api/admin/reset', authMiddleware, async (req, res) => {
  if (useMongo && mongoReady) {
    await Property.deleteMany({}); await AppData.deleteMany({}); await Snap.deleteMany({}); await Enquiry.deleteMany({})
    await Property.insertMany(defaultData.properties)
    await Snap.insertMany(defaultData.snaps)
    if (defaultData.enquiries?.length) await Enquiry.insertMany(defaultData.enquiries)
    await AppData.create({ key: 'main', banners: defaultData.banners, locations: defaultData.locations, offers: defaultData.offers, builders: defaultData.builders, testimonials: defaultData.testimonials, settings: defaultData.settings })
    return res.json({ success: true })
  }
  fileDb = JSON.parse(JSON.stringify(defaultData)); saveFileData(fileDb); res.json({ success: true })
})
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString(), storage: useMongo && mongoReady ? 'mongodb' : 'file' }))

app.listen(PORT, '0.0.0.0', () => console.log(`Backend running on http://0.0.0.0:${PORT} — storage: ${useMongo ? 'MongoDB' : 'file'}`))

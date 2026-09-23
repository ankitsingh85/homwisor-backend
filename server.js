// HomWisor backend — MVC entry (Express + MongoDB)
// Uses MONGODB_URI from .env. If it is missing or the connection fails,
// falls back to the file DB server (server.file.js → data/db.json).

import 'dotenv/config'
import express from 'express'
import 'express-async-errors'
import cors from 'cors'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import connectDB from './config/db.js'
import { seedIfEmpty } from './utils/seed.js'

import authRoutes from './routes/authRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import propertyRoutes from './routes/propertyRoutes.js'
import snapRoutes from './routes/snapRoutes.js'
import bannerRoutes from './routes/bannerRoutes.js'
import locationRoutes from './routes/locationRoutes.js'
import offerRoutes from './routes/offerRoutes.js'
import builderRoutes from './routes/builderRoutes.js'
import testimonialRoutes from './routes/testimonialRoutes.js'
import enquiryRoutes from './routes/enquiryRoutes.js'
import settingsRoutes from './routes/settingsRoutes.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PORT = process.env.PORT || 5000

const conn = await connectDB()

if (!conn && process.env.NODE_ENV === 'production') {
  // File DB is wiped on every redeploy/restart on hosts like Render — fail loudly instead
  console.error('❌ MongoDB unavailable in production — exiting')
  process.exit(1)
} else if (!conn) {
  console.log('↩️  Falling back to file DB (server.file.js)')
  await import('./server.file.js')
} else {
  await seedIfEmpty()

  const app = express()
  app.use(cors())
  app.use(express.json({ limit: '10mb' }))
  app.use(express.urlencoded({ extended: true }))

  const uploadsDir = path.join(__dirname, 'uploads')
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir)
  app.use('/uploads', express.static(uploadsDir))

  app.get('/api/health', (req, res) => res.json({ status: 'ok', db: 'mongo', time: new Date().toISOString() }))

  app.use('/api/admin', authRoutes)
  app.use('/api/admin', adminRoutes)
  app.use('/api/properties', propertyRoutes)
  app.use('/api/snaps', snapRoutes)
  app.use('/api/banners', bannerRoutes)
  app.use('/api/locations', locationRoutes)
  app.use('/api/offers', offerRoutes)
  app.use('/api/builders', builderRoutes)
  app.use('/api/testimonials', testimonialRoutes)
  app.use('/api/enquiries', enquiryRoutes)
  app.use('/api/settings', settingsRoutes)

  app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }))
  app.use((err, req, res, next) => {
    console.error(err)
    res.status(500).json({ error: err.message })
  })

  app.listen(PORT, '0.0.0.0', () => console.log(`🚀 Backend (MongoDB) running on http://localhost:${PORT}`))
}

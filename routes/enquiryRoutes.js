import express from 'express'
import rateLimit from 'express-rate-limit'
import Enquiry from '../models/Enquiry.js'
import { protect } from '../middleware/auth.js'
import { sendEnquiryEmail } from '../utils/mailer.js'

const router = express.Router()

// Each enquiry sends an email — stop one visitor from flooding the inboxes
const enquiryLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 8,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many requests — please try again in a few minutes, or call us directly.' },
})

const SOURCES = ['contact', 'property', 'blog', 'sell', 'popup', 'other']
const str = (v, max) => (v == null ? '' : String(v).trim().slice(0, max))

router.get('/', protect, async (req, res) => {
  const list = await Enquiry.find({}).sort({ createdAt: -1 }).lean()
  res.json(list)
})

router.post('/', enquiryLimiter, async (req, res) => {
  const b = req.body || {}
  // hidden "website" field: real visitors never fill it, form-spam bots do
  if (str(b.website, 200)) return res.json({ ok: true })

  const enquiry = {
    name: str(b.name, 80),
    phone: str(b.phone, 25),
    email: str(b.email, 120),
    subject: str(b.subject, 120),
    property: str(b.property, 200),
    message: str(b.message, 2000),
    page: str(b.page, 300),
    source: SOURCES.includes(b.source) ? b.source : 'other',
  }
  if (enquiry.name.length < 2) return res.status(400).json({ error: 'Please enter your name' })
  if (!/\d{7,}/.test(enquiry.phone.replace(/\D/g, '')) && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enquiry.email)) {
    return res.status(400).json({ error: 'Please enter a valid mobile number' })
  }

  const doc = await Enquiry.create({ ...enquiry, id: 'e' + Date.now(), date: new Date().toISOString().slice(0, 10) })
  res.json(doc)
  sendEnquiryEmail(doc.toObject()) // after replying — email problems never affect the visitor
})

router.delete('/:id', protect, async (req, res) => {
  await Enquiry.deleteOne({ id: req.params.id })
  res.json({ success: true })
})

export default router

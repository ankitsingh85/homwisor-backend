import express from 'express'
import mongoose from 'mongoose'
import Admin from '../models/Admin.js'
import { protect, requireRole } from '../middleware/auth.js'
import { EMAIL_RE, passwordProblem } from '../utils/validate.js'

const router = express.Router()

// Every route here: signed in + super admin
router.use(protect, requireRole('superadmin'))

// GET /api/admin/users
router.get('/', async (req, res) => {
  const admins = await Admin.find({}).sort({ createdAt: 1 })
  res.json(admins.map(a => a.toPublic()))
})

// POST /api/admin/users — { name, email, password, role }
router.post('/', async (req, res) => {
  const name = String(req.body?.name || '').trim()
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  const role = req.body?.role === 'superadmin' ? 'superadmin' : 'admin'

  if (name.length < 2) return res.status(400).json({ error: 'Name is required' })
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Enter a valid email address' })
  const problem = passwordProblem(password, email)
  if (problem) return res.status(400).json({ error: problem })

  if (await Admin.exists({ email })) return res.status(409).json({ error: 'An admin with this email already exists' })

  const admin = new Admin({ name, email, role, createdBy: req.admin.email })
  await admin.setPassword(password)
  await admin.save()
  res.status(201).json(admin.toPublic())
})

// PATCH /api/admin/users/:id — { active?, role? }
router.patch('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Admin not found' })
  const admin = await Admin.findById(req.params.id)
  if (!admin) return res.status(404).json({ error: 'Admin not found' })
  if (admin._id.equals(req.admin._id)) return res.status(400).json({ error: 'You cannot change your own role or status' })

  const demoting = admin.role === 'superadmin' && (req.body.role === 'admin' || req.body.active === false)
  if (demoting && (await Admin.countDocuments({ role: 'superadmin', active: true })) <= 1) {
    return res.status(400).json({ error: 'At least one active super admin is required' })
  }

  if (typeof req.body.active === 'boolean') admin.active = req.body.active
  if (['admin', 'superadmin'].includes(req.body.role)) admin.role = req.body.role
  await admin.save()
  res.json(admin.toPublic())
})

// DELETE /api/admin/users/:id
router.delete('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Admin not found' })
  const admin = await Admin.findById(req.params.id)
  if (!admin) return res.status(404).json({ error: 'Admin not found' })
  if (admin._id.equals(req.admin._id)) return res.status(400).json({ error: 'You cannot delete your own account' })
  if (admin.role === 'superadmin' && admin.active && (await Admin.countDocuments({ role: 'superadmin', active: true })) <= 1) {
    return res.status(400).json({ error: 'At least one active super admin is required' })
  }
  await admin.deleteOne()
  res.json({ success: true })
})

export default router

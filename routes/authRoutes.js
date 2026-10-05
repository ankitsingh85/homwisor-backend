import express from 'express'
import rateLimit from 'express-rate-limit'
import bcrypt from 'bcryptjs'
import Admin from '../models/Admin.js'
import { generateToken, authenticate } from '../middleware/auth.js'
import { passwordProblem, EMAIL_RE } from '../utils/validate.js'

const router = express.Router()

// 10 failed attempts per IP per 15 minutes; successful logins don't count
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  skipSuccessfulRequests: true,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' }
})

// Compared against when the email doesn't exist, so response time
// doesn't reveal which emails have accounts
const DUMMY_HASH = bcrypt.hashSync('homwisor-dummy-password', 12)

// POST /api/admin/login
router.post('/login', loginLimiter, async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase()
  const password = String(req.body?.password || '')
  if (!email || !password) return res.status(400).json({ error: 'Email and password are required' })
  if (!EMAIL_RE.test(email)) return res.status(400).json({ error: 'Enter a valid email address' })

  const admin = await Admin.findOne({ email }).select('+passwordHash')
  const ok = admin
    ? await admin.checkPassword(password)
    : (await bcrypt.compare(password, DUMMY_HASH), false)

  if (!admin || !ok || !admin.active) {
    return res.status(401).json({ error: 'Invalid email or password' })
  }

  admin.lastLoginAt = new Date()
  await admin.save()

  res.json({ token: generateToken(admin), expiresIn: '1d', admin: admin.toPublic() })
})

// GET /api/admin/me
router.get('/me', authenticate, (req, res) => {
  res.json({ admin: req.admin.toPublic() })
})

// PUT /api/admin/me/password — { currentPassword, newPassword }
router.put('/me/password', authenticate, async (req, res) => {
  const { currentPassword = '', newPassword = '' } = req.body || {}
  const admin = await Admin.findById(req.admin._id).select('+passwordHash')

  if (!(await admin.checkPassword(String(currentPassword)))) {
    return res.status(400).json({ error: 'Current password is incorrect' })
  }
  if (currentPassword === newPassword) {
    return res.status(400).json({ error: 'New password must be different from the current one' })
  }
  const problem = passwordProblem(newPassword, admin.email)
  if (problem) return res.status(400).json({ error: problem })

  await admin.setPassword(newPassword)
  admin.mustChangePassword = false
  await admin.save()

  // Old tokens are now invalid — hand back a fresh one
  res.json({ token: generateToken(admin), expiresIn: '1d', admin: admin.toPublic() })
})

export default router

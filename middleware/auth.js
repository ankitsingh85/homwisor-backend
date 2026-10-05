import jwt from 'jsonwebtoken'
import Admin from '../models/Admin.js'

const JWT_SECRET = process.env.JWT_SECRET || 'HomWisor-secret-key-2026'
const JWT_EXPIRES_IN = '1d'
const JWT_ISSUER = 'homwisor'

if (!process.env.JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    console.error('❌ JWT_SECRET is not set — refusing to start in production')
    process.exit(1)
  }
  console.warn('⚠️  JWT_SECRET not set — using an insecure development default')
} else if (process.env.JWT_SECRET.length < 32) {
  console.warn('⚠️  JWT_SECRET is shorter than 32 characters — use a long random value')
}

export const generateToken = (admin) =>
  jwt.sign(
    { sub: admin._id.toString(), email: admin.email, role: admin.role },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN, issuer: JWT_ISSUER, algorithm: 'HS256' }
  )

// Verifies the JWT and re-loads the admin, so deleted/disabled admins and
// tokens issued before a password change are rejected immediately.
// Allows admins who still have to change their password (used by /me routes).
export const authenticate = async (req, res, next) => {
  const auth = req.headers.authorization
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' })
  }
  let decoded
  try {
    decoded = jwt.verify(auth.slice(7), JWT_SECRET, { issuer: JWT_ISSUER, algorithms: ['HS256'] })
  } catch (err) {
    const expired = err.name === 'TokenExpiredError'
    return res.status(401).json({ error: expired ? 'Session expired, please sign in again' : 'Invalid token', code: expired ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID' })
  }

  const admin = await Admin.findById(decoded.sub).catch(() => null)
  if (!admin || !admin.active) {
    return res.status(401).json({ error: 'Account no longer has access', code: 'TOKEN_INVALID' })
  }
  if (admin.passwordChangedAt && decoded.iat * 1000 < admin.passwordChangedAt.getTime()) {
    return res.status(401).json({ error: 'Password was changed, please sign in again', code: 'TOKEN_INVALID' })
  }

  req.admin = admin
  req.user = { id: admin._id.toString(), email: admin.email, role: admin.role }
  next()
}

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.admin || !roles.includes(req.admin.role)) {
    return res.status(403).json({ error: 'You do not have permission to do this' })
  }
  next()
}

// Default guard for every admin-only route: authenticated AND not waiting
// on a forced password change.
export const protect = (req, res, next) =>
  authenticate(req, res, () => {
    if (req.admin.mustChangePassword) {
      return res.status(403).json({ error: 'Please change your password first', code: 'PASSWORD_CHANGE_REQUIRED' })
    }
    next()
  })

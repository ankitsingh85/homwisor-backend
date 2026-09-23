import express from 'express'
import { generateToken } from '../middleware/auth.js'

const router = express.Router()

router.post('/login', (req, res) => {
  const { username, password } = req.body
  if (username === 'admin' && password === 'admin123') {
    const token = generateToken({ username: 'admin', role: 'admin' })
    return res.json({ token, user: { username: 'admin' } })
  }
  return res.status(401).json({ error: 'Invalid credentials. Use admin / admin123' })
})

export default router

import express from 'express'
import multer from 'multer'
import mongoose from 'mongoose'
import { imageSize } from 'image-size'
import { protect } from '../middleware/auth.js'
import { IMAGE_RULES, imageProblem } from '../utils/imageRules.js'

// Images are stored in MongoDB (GridFS bucket "images") because Render's
// disk is wiped on every deploy/restart. The admin panel compresses images
// in the browser before upload, so each one is usually 100–400 KB.

const router = express.Router()

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
const MAX_BYTES = 8 * 1024 * 1024

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) cb(null, true)
    else cb(Object.assign(new Error('Only JPG, PNG, WebP, AVIF or GIF images are allowed'), { status: 400 }))
  },
})

const bucket = () => new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'images' })

// POST /api/images  (multipart: "purpose" + "file") → { id, url, width, height }
// purpose = hero | slider | sidead | property | logo | snap | location | offer
router.post('/', protect, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Image is too large (max 8 MB)' : err.message
      return res.status(err.status || 400).json({ error: msg })
    }
    if (!req.file) return res.status(400).json({ error: 'No image received' })

    // Check the real pixel size + shape for the place the image will be used
    let dims
    try { dims = imageSize(req.file.buffer) } catch { return res.status(400).json({ error: 'This file is not a valid image' }) }
    const purpose = String(req.body?.purpose || '')
    if (!IMAGE_RULES[purpose]) return res.status(400).json({ error: 'Image purpose is missing or unknown' })
    const problem = imageProblem(purpose, dims.width, dims.height)
    if (problem) return res.status(400).json({ error: problem, code: 'IMAGE_SIZE' })

    const name = (req.file.originalname || 'image').replace(/[^\w.-]+/g, '_').slice(0, 80)
    const stream = bucket().openUploadStream(name, {
      metadata: { contentType: req.file.mimetype, uploadedBy: req.admin.email, size: req.file.size, width: dims.width, height: dims.height, purpose },
    })
    stream.on('error', next)
    stream.on('finish', () => {
      const id = stream.id.toString()
      // Relative URL: served through the same /api path locally (Vite proxy)
      // and on Vercel (rewrite to the backend), so it works everywhere.
      res.status(201).json({ id, url: `/api/images/${id}`, width: dims.width, height: dims.height })
    })
    stream.end(req.file.buffer)
  })
})

// GET /api/images/:id → the image bytes (cached for a year; ids never change)
router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'Image not found' })
  const _id = new mongoose.Types.ObjectId(req.params.id)
  const file = await mongoose.connection.db.collection('images.files').findOne({ _id })
  if (!file) return res.status(404).json({ error: 'Image not found' })

  res.set({
    'Content-Type': file.metadata?.contentType || file.contentType || 'application/octet-stream',
    'Content-Length': file.length,
    'Cache-Control': 'public, max-age=31536000, immutable',
  })
  bucket().openDownloadStream(_id).on('error', () => res.end()).pipe(res)
})

export default router

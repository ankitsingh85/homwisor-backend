import express from 'express'
import multer from 'multer'
import mongoose from 'mongoose'
import { protect } from '../middleware/auth.js'

// PDF documents (property brochures), stored in MongoDB GridFS bucket "files"
// for the same reason as images: Render's disk is wiped on every deploy.

const router = express.Router()

const MAX_BYTES = 25 * 1024 * 1024

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true)
    else cb(Object.assign(new Error('Only PDF files are allowed'), { status: 400 }))
  },
})

const bucket = () => new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'files' })

// POST /api/files  (multipart: "file") → { id, url, name, size }
router.post('/', protect, (req, res, next) => {
  upload.single('file')(req, res, (err) => {
    if (err) {
      const msg = err.code === 'LIMIT_FILE_SIZE' ? 'File is too large (max 25 MB)' : err.message
      return res.status(err.status || 400).json({ error: msg })
    }
    if (!req.file) return res.status(400).json({ error: 'No file received' })
    // the browser-reported type can be faked — check the PDF signature too
    if (req.file.buffer.subarray(0, 5).toString('latin1') !== '%PDF-') {
      return res.status(400).json({ error: 'This file is not a valid PDF' })
    }

    const name = (req.file.originalname || 'brochure.pdf').replace(/[^\w.-]+/g, '_').slice(0, 80)
    const stream = bucket().openUploadStream(name, {
      metadata: { contentType: 'application/pdf', uploadedBy: req.admin.email, size: req.file.size },
    })
    stream.on('error', next)
    stream.on('finish', () => {
      const id = stream.id.toString()
      res.status(201).json({ id, url: `/api/files/${id}`, name, size: req.file.size })
    })
    stream.end(req.file.buffer)
  })
})

// GET /api/files/:id → the PDF (opens in the browser; ?download=1 saves it)
router.get('/:id', async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) return res.status(404).json({ error: 'File not found' })
  const _id = new mongoose.Types.ObjectId(req.params.id)
  const file = await mongoose.connection.db.collection('files.files').findOne({ _id })
  if (!file) return res.status(404).json({ error: 'File not found' })

  const disposition = req.query.download ? 'attachment' : 'inline'
  res.set({
    'Content-Type': 'application/pdf',
    'Content-Length': file.length,
    'Content-Disposition': `${disposition}; filename="${file.filename || 'brochure.pdf'}"`,
    'Cache-Control': 'public, max-age=31536000, immutable',
  })
  bucket().openDownloadStream(_id).on('error', () => res.end()).pipe(res)
})

export default router

import express from 'express'
import Property from '../models/Property.js'
import Enquiry from '../models/Enquiry.js'
import Location from '../models/Location.js'
import Offer from '../models/Offer.js'
import Snap from '../models/Snap.js'
import Builder from '../models/Builder.js'
import Testimonial from '../models/Testimonial.js'
import Banner from '../models/Banner.js'
import Settings from '../models/Settings.js'
import { protect } from '../middleware/auth.js'
import { seedIfEmpty, seedForce } from '../utils/seed.js'

const router = express.Router()

router.get('/stats', protect, async (req, res) => {
  const [totalProperties, totalEnquiries, totalSnaps] = await Promise.all([
    Property.countDocuments(),
    Enquiry.countDocuments(),
    Snap.countDocuments()
  ])
  const [totalLocations, totalOffers, totalBuilders, totalTestimonials] = await Promise.all([
    Location.countDocuments(),
    Offer.countDocuments(),
    Builder.countDocuments(),
    Testimonial.countDocuments()
  ])
  const recommended = await Property.countDocuments({ category: 'recommended' })
  const trending = await Property.countDocuments({ category: 'trending' })
  res.json({ totalProperties, totalEnquiries, totalLocations, totalOffers, totalSnaps, totalBuilders, totalTestimonials, recommended, trending })
})

router.post('/reset', protect, async (req, res) => {
  await seedForce()
  res.json({ success: true })
})

router.post('/seed', protect, async (req, res) => {
  await seedIfEmpty()
  res.json({ success: true })
})

export default router

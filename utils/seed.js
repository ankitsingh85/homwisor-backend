import Property from '../models/Property.js'
import Banner from '../models/Banner.js'
import Location from '../models/Location.js'
import Offer from '../models/Offer.js'
import Builder from '../models/Builder.js'
import Testimonial from '../models/Testimonial.js'
import Snap from '../models/Snap.js'
import Enquiry from '../models/Enquiry.js'
import Settings from '../models/Settings.js'
import { defaultData } from './seedData.js'

export const seedIfEmpty = async () => {
  const counts = await Promise.all([
    Property.countDocuments(),
    Banner.countDocuments(),
    Location.countDocuments(),
    Offer.countDocuments(),
    Builder.countDocuments(),
    Testimonial.countDocuments(),
    Snap.countDocuments(),
    Settings.countDocuments()
  ])
  if (counts.every(c => c === 0)) {
    console.log('🌱 MongoDB empty — seeding...')
    await seedForce()
  } else {
    console.log(`✅ DB already seeded (${counts.join('/')}) — skipping`)
  }
}

export const seedForce = async () => {
  await Promise.all([
    Property.deleteMany({}),
    Banner.deleteMany({}),
    Location.deleteMany({}),
    Offer.deleteMany({}),
    Builder.deleteMany({}),
    Testimonial.deleteMany({}),
    Snap.deleteMany({}),
    Enquiry.deleteMany({}),
    Settings.deleteMany({})
  ])

  await Property.insertMany(defaultData.properties)
  const heroBanners = defaultData.banners.hero.map(b => ({ ...b, type: 'hero' }))
  const smallBanners = defaultData.banners.small.map(b => ({ ...b, type: 'small' }))
  await Banner.insertMany([...heroBanners, ...smallBanners])
  await Location.insertMany(defaultData.locations)
  await Offer.insertMany(defaultData.offers)
  await Builder.insertMany(defaultData.builders)
  await Testimonial.insertMany(defaultData.testimonials)
  await Snap.insertMany(defaultData.snaps)
  if (defaultData.enquiries?.length) await Enquiry.insertMany(defaultData.enquiries)
  await Settings.create({ key: 'main', ...defaultData.settings })

  console.log(`✅ Seeded: ${defaultData.properties.length} properties, ${defaultData.banners.hero.length+defaultData.banners.small.length} banners, ${defaultData.locations.length} locations, ${defaultData.offers.length} offers, ${defaultData.builders.length} builders, ${defaultData.testimonials.length} testimonials, ${defaultData.snaps.length} snaps`)
}

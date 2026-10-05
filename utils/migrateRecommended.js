import Property from '../models/Property.js'
import Recommended from '../models/Recommended.js'

// "Recommended" used to be a property category. It is now its own list of
// cards. Any property still in that category becomes a Recommended card
// (linking to the property) and the property itself moves to "trending".
// rebuild=true (demo reset) replaces the existing cards.
export const migrateRecommended = async ({ rebuild = false } = {}) => {
  const old = await Property.find({ category: 'recommended' }).sort({ createdAt: -1 }).lean()
  if (!old.length && !rebuild) return

  if (rebuild) await Recommended.deleteMany({})
  if (rebuild || (await Recommended.countDocuments()) === 0) {
    await Recommended.insertMany(old.map((p, i) => ({
      id: `rc${Date.now()}${i}`,
      title: p.title,
      image: p.image,
      price: p.price || p.priceRange,
      location: p.location,
      link: `/property/${p.id}`,
      badge: 'Founder Choice',
      order: i,
    })))
  }
  if (old.length) {
    await Property.updateMany({ category: 'recommended' }, { $set: { category: 'trending' } })
    console.log(`⭐ Moved ${old.length} recommended properties into the Recommended section`)
  }
}

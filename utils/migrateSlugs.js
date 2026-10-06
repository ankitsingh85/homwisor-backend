// Give every property a URL slug made from its title (runs at startup; only
// touches properties that don't have one yet).
import Property from '../models/Property.js'
import { uniqueSlug } from './slug.js'

export async function migrateSlugs() {
  const missing = await Property.find({ $or: [{ slug: { $exists: false } }, { slug: null }, { slug: '' }] }).sort({ createdAt: 1, _id: 1 })
  for (const p of missing) {
    p.slug = await uniqueSlug(Property, p.title, p.id, p.id)
    await p.save()
  }
  if (missing.length) console.log(`🔗 Added web addresses (slugs) to ${missing.length} properties`)
}

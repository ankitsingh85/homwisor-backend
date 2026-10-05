import mongoose from 'mongoose'
import Property from '../models/Property.js'

// "Branded" and "Luxury" are property sections (categories), like Trending.
//
// migrateShowcase(): one-time move from the short-lived separate showcase
// lists — properties in the Branded list become category "branded", the rest
// of the Luxury list becomes "luxury" — then the old collection is removed.
export const migrateShowcase = async () => {
  const db = mongoose.connection.db
  if (!(await db.listCollections({ name: 'showcase' }).toArray()).length) return
  const entries = await db.collection('showcase').find({}).sort({ order: 1, createdAt: 1 }).toArray()
  const branded = entries.filter(e => e.section === 'branded').map(e => e.propertyId)
  const luxury = entries.filter(e => e.section === 'luxury').map(e => e.propertyId).filter(id => !branded.includes(id))
  if (branded.length) await Property.updateMany({ id: { $in: branded } }, { $set: { category: 'branded' } })
  if (luxury.length) await Property.updateMany({ id: { $in: luxury } }, { $set: { category: 'luxury' } })
  await db.collection('showcase').drop()
  console.log(`💎 Branded/Luxury lists moved into property sections (${branded.length} branded, ${luxury.length} luxury)`)
}

// Demo reset: put a few demo properties into Branded and Luxury so those
// homepage sections aren't empty.
const BRANDED_DEMO = ['oberoi three sixty', 'experion one 42', 'max estate 59', 'bptp downtown']
const maxCr = (p) => {
  const nums = String(p.priceRange || p.price || '').match(/\d+(\.\d+)?/g)
  return nums ? Math.max(...nums.map(Number)) : 0
}
export const seedBrandedLuxury = async () => {
  const homes = (await Property.find({ category: { $nin: ['commercial', 'sco'] } }).lean())
  const branded = BRANDED_DEMO.map(n => homes.find(p => p.title?.toLowerCase().includes(n))).filter(Boolean).slice(0, 4)
  const luxury = homes.filter(p => !branded.includes(p)).sort((a, b) => maxCr(b) - maxCr(a)).slice(0, 4)
  await Property.updateMany({ id: { $in: branded.map(p => p.id) } }, { $set: { category: 'branded' } })
  await Property.updateMany({ id: { $in: luxury.map(p => p.id) } }, { $set: { category: 'luxury' } })
}

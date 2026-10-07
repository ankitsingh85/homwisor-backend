// Offers used to have no link (cards pointed at /property/<offer id> → "not found").
// At startup, give each offer without a link the property with the same name, if any.
import Offer from '../models/Offer.js'
import Property from '../models/Property.js'

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9]/g, '')

export async function migrateOffers() {
  const offers = await Offer.find({ $or: [{ link: { $exists: false } }, { link: null }] })
  if (!offers.length) return
  const props = await Property.find({}, { id: 1, title: 1, slug: 1 }).lean()
  let linked = 0
  for (const o of offers) {
    const t = norm(o.title)
    const p = t && (props.find((x) => norm(x.title) === t) || props.find((x) => norm(x.title).includes(t) || t.includes(norm(x.title))))
    o.link = p ? `/property/${p.slug || p.id}` : '' // '' = no property yet → the card opens a search for the name
    if (p) linked++
    await o.save()
  }
  console.log(`🏷️  Offers: linked ${linked} of ${offers.length} to their properties`)
}

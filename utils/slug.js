// URL slugs ("M3M Elie Saab at SCDA" → "m3m-elie-saab-at-scda") shared by
// properties and blog articles.

export const slugify = (s = '') =>
  String(s).toLowerCase().normalize('NFKD').replace(/\p{M}/gu, '') // drop accents: é → e
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 90).replace(/-$/, '')

// A slug no other document uses — as its slug, as one of its old slugs, or
// (for properties) as its id — and not a reserved word. "my-title" → "my-title-2" if taken.
export async function uniqueSlug(Model, wanted, exceptId, fallback = 'item', reserved = []) {
  const base = slugify(wanted) || fallback
  const others = exceptId ? { id: { $ne: exceptId } } : {}
  const idField = Model.modelName === 'Property' // property pages also open by id
  let slug = base
  for (let n = 2; ; n++) {
    const taken = await Model.exists({ ...others, $or: [{ slug }, { oldSlugs: slug }, ...(idField ? [{ id: slug }] : [])] })
    if (!taken && !reserved.includes(slug)) return slug
    slug = `${base}-${n}`
  }
}

// When a document's slug changes, keep the previous one so old links still work
export const nextOldSlugs = (prev, newSlug) => {
  const list = (prev.oldSlugs || []).filter(s => s && s !== newSlug)
  if (prev.slug && prev.slug !== newSlug && !list.includes(prev.slug)) list.push(prev.slug)
  return list.slice(-20)
}

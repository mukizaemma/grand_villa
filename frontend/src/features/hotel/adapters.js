/**
 * ADAPTERS
 * ─────────────────────────────────────────────────────────────
 * Reshape raw Payload API responses into the exact shapes the existing
 * components already expect, so components stay untouched wherever
 * possible.
 * ─────────────────────────────────────────────────────────────
 */
import { CMS_URL } from '@lib/apiClient'
import { asPlain } from '@lib/richText'

/**
 * Resolve a Payload upload field (or a plain string path) into a full
 * image URL. Payload uploads come back as `{ url: '/api/media/file/x.jpg' }`
 * — relative to the CMS origin, not the frontend's.
 */
export function mediaUrl(field) {
  if (!field) return ''
  const url = typeof field === 'string' ? field : field.url
  if (!url) return ''
  return url.startsWith('http') ? url : `${CMS_URL}${url}`
}

/**
 * Reshapes a Payload `rooms` doc into the exact shape the existing room
 * components expect (see the old @data/rooms/rooms.js) — `id` maps to
 * the human-readable `slug` (used in routes like /rooms/:roomId), and
 * image/gallery upload objects collapse down to plain URL strings.
 */
export function adaptRoom(doc) {
  return {
    id: doc.slug,
    name: doc.name,
    pricePerNight: doc.pricePerNight,
    units: Math.max(1, Number(doc.units) || 1),
    description: asPlain(doc.description),
    descriptionHtml: doc.description,
    specs: doc.specs || {},
    features: doc.features || [],
    image: mediaUrl(doc.image),
    gallery: (doc.gallery || []).map((g) => mediaUrl(g.photo)),
  }
}

/**
 * Reshapes a Payload `experiences` doc the same way adaptRoom() does for
 * rooms — `id` maps to `slug`, upload fields collapse to plain URLs.
 * `price` is flat/one-time (see Experiences.js), unlike a room's
 * `pricePerNight`.
 */
export function adaptExperience(doc) {
  return {
    id: doc.slug,
    name: doc.name,
    price: doc.price,
    description: asPlain(doc.description),
    image: mediaUrl(doc.image),
  }
}

export function adaptMenuItem(doc) {
  return {
    id: doc.id || doc.slug,
    slug: doc.slug,
    name: doc.name,
    price: Number(doc.price) || 0,
    category: doc.category || 'Main',
    description: asPlain(doc.description),
    ingredients: doc.ingredients || '',
    allergens: doc.allergens || '',
    notes: doc.notes || '',
    dietary: doc.dietary || [],
    portion: doc.portion || '',
    image: mediaUrl(doc.image),
    available: doc.available !== false,
    sort: Number(doc.sort) || 0,
  }
}
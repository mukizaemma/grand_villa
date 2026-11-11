/**
 * Public /gallery lists every image stored on the server, in the order
 * set on Site Gallery, except photos the admin has removed.
 */
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@lib/apiClient'
import { mediaUrl } from '../adapters'
import { asPlain } from '@lib/richText'

function adaptMedia(doc, caption) {
  return {
    id: doc.id,
    category: doc.galleryCategory || 'rooms',
    caption: caption || doc.alt || doc.filename || '',
    aspect: 'square',
    image: mediaUrl(doc),
    createdAt: doc.createdAt,
  }
}

async function fetchGalleryPage() {
  const [pageRes, mediaRes] = await Promise.all([
    apiClient.get('/api/globals/gallery-page?depth=2'),
    apiClient.get('/api/media', {
      params: {
        limit: 300,
        sort: 'galleryOrder,-createdAt',
        'where[and][0][mimeType][contains]': 'image',
        'where[and][1][hiddenFromGallery][not_equals]': true,
      },
    }),
  ])

  const page = pageRes.data
  const images = (mediaRes.data.docs || [])
    .map((doc) => adaptMedia(doc))
    .filter((item) => item.image)

  return {
    hero: {
      eyebrow: page.eyebrow,
      headline: page.headline,
      intro: asPlain(page.intro),
      backgroundImage: mediaUrl(page.backgroundImage),
      cta: page.cta || {},
      secondaryCta: page.secondaryCta || {},
    },
    images,
  }
}

export function useGalleryPage() {
  return useQuery({
    queryKey: ['gallery-page'],
    queryFn: fetchGalleryPage,
    staleTime: 5 * 60 * 1000,
  })
}

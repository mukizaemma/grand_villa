import { pageHeroFields, previewUpload } from '../../../core/fields/pageHero.js'

export const GalleryPage = {
  slug: 'gallery-page',
  label: 'Gallery',
  admin: { group: false },
  access: {
    read: () => true,
  },
  hooks: {
    afterChange: [
      async ({ doc, req }) => {
        const ids = (doc.photos || [])
          .map((item) => (typeof item.image === 'object' ? item.image?.id : item.image))
          .filter(Boolean)
        for (const id of ids) {
          try {
            await req.payload.update({
              collection: 'media',
              id,
              data: { showOnGallery: true },
              overrideAccess: true,
            })
          } catch {
            /* skip a missing file */
          }
        }
      },
    ],
  },
  fields: [
    ...pageHeroFields,
    {
      name: 'photos',
      type: 'array',
      maxRows: 200,
      labels: { singular: 'Photo', plural: 'Gallery photos' },
      admin: {
        description: 'Upload several photos, or choose existing ones from the library. They all appear together on the gallery page.',
        components: {
          Field: './src/components/payload/MediaGridField/index.jsx#MediaGridField',
        },
      },
      fields: [previewUpload('image', { required: true })],
    },
  ],
}
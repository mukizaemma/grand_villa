import { rowActionsField } from '../../../core/fields/rowActions.js'

export const GalleryPhotos = {
  slug: 'gallery-photos',
  access: {
    read: () => true,
  },
  labels: {
    singular: 'Gallery photo',
    plural: 'Site Gallery',
  },
  admin: {
    group: false,
    useAsTitle: 'caption',
    defaultColumns: ['caption', 'photo', 'updatedAt', 'rowActions'],
    description: 'Every image stored on the server. Sort the ones that should appear on the public gallery, and remove duplicates or photos that do not belong there.',
    components: {
      views: {
        list: {
          Component: './src/components/payload/SiteGalleryList/index.jsx#SiteGalleryList',
        },
      },
    },
  },
  hooks: {
    beforeValidate: [
      ({ data, req }) => {
        if (!data) return data
        if (!data.category || data.category === 'none') data.category = 'rooms'
        if (!data.aspect) data.aspect = 'square'
        if (!data.caption) {
          const fileName = req?.file?.name || ''
          data.caption = fileName ? fileName.replace(/\.[^.]+$/, '') : 'Gallery photo'
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, req }) => {
        const id = typeof doc.photo === 'object' ? doc.photo?.id : doc.photo
        if (!id) return
        try {
          await req.payload.update({
            collection: 'media',
            id,
            data: { showOnGallery: true },
            overrideAccess: true,
          })
        } catch {
          /* the gallery row still stores the photo */
        }
      },
    ],
  },
  fields: [
    rowActionsField,
    {
      name: 'category',
      type: 'select',
      defaultValue: 'rooms',
      admin: { hidden: true },
      options: [
        { label: 'The apartment', value: 'rooms' },
        { label: 'Kitchen & bar', value: 'bar-restaurant' },
        { label: 'Property & views', value: 'lake-grounds' },
        { label: 'Amenities', value: 'amenities' },
      ],
    },
    {
      name: 'caption',
      type: 'text',
      admin: { width: '50%', description: 'Optional. The file name is used when this is left blank.' },
    },
    {
      name: 'aspect',
      type: 'select',
      defaultValue: 'square',
      admin: { hidden: true },
      options: [
        { label: 'Tall', value: 'tall' },
        { label: 'Square', value: 'square' },
        { label: 'Wide', value: 'wide' },
      ],
    },
    {
      name: 'photo',
      type: 'upload',
      relationTo: 'media',
      required: true,
      displayPreview: true,
      admin: { description: 'Upload a new photo or choose one from the library.' },
    },
  ],
}

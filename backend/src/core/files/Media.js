import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

export const Media = {
  slug: 'media',
  labels: {
    singular: 'File',
    plural: 'Media Gallery',
  },
  admin: {
    group: false,
    useAsTitle: 'filename',
    defaultColumns: ['filename', 'alt', 'showOnGallery', 'updatedAt'],
    description: 'All images and videos. On any page field, choose an existing file or upload a new one.',
  },
  access: {
    read: () => true,
    create: ({ req: { user } }) => Boolean(user),
    update: ({ req: { user } }) => Boolean(user),
    delete: ({ req: { user } }) => Boolean(user),
  },
  upload: {
    staticDir: path.resolve(dirname, '../../../../storage/media'),
    // 1. Allow both image types and video types
    mimeTypes: [
      'image/*', 
      'video/mp4', 
      'video/webm', 
      'video/quicktime' // supports .mov
    ],
    // 2. Point to a fallback icon for videos in the admin view
    adminThumbnail: ({ doc }) => {
      if (doc.mimeType?.startsWith('video/')) return doc.url || null
      return doc.sizes?.thumbnail?.url || doc.url
    },
    imageSizes: [
      { name: 'thumbnail', width: 400, height: undefined, position: 'centre' },
      { name: 'card', width: 900, height: undefined, position: 'centre' },
      { name: 'hero', width: 1600, height: undefined, position: 'centre' },
    ],
  },
  hooks: {
    beforeChange: [
      ({ data }) => {
        if (!data) return data
        if (data.galleryCategory != null) {
          data.showOnGallery = data.galleryCategory !== 'none'
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: false,
      admin: { width: '25%' },
    },
    {
      name: 'galleryCategory',
      type: 'select',
      defaultValue: 'none',
      admin: {
        width: '25%',
        description:
          'Choose None to keep this file in the library only. The apartment category appears on the homepage (latest 4 photos) and on the Gallery page.',
      },
      options: [
        { label: 'None — do not show on gallery', value: 'none' },
        { label: 'The apartment', value: 'rooms' },
        { label: 'Kitchen & bar', value: 'bar-restaurant' },
        { label: 'Property & views', value: 'lake-grounds' },
        { label: 'Amenities', value: 'amenities' },
      ],
    },
    {
      name: 'galleryOrder',
      type: 'number',
      defaultValue: 0,
      admin: { width: '25%', description: 'Lower numbers appear first on the Gallery page.' },
    },
    {
      name: 'showOnGallery',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        width: '25%',
        description: 'Turned on automatically when a gallery category is chosen. None keeps it off the public gallery.',
      },
    },
  ],
}

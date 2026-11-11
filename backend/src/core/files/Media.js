import { rowActionsField } from '../fields/rowActions.js'
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
    defaultColumns: ['filename', 'alt', 'showOnGallery', 'updatedAt', 'rowActions'],
    description: 'All images and videos. On any page field, choose an existing file or upload a new one.',
    components: {
      views: {
        list: {
          Component: './src/components/payload/MediaLibraryList/index.jsx#MediaLibraryList',
        },
      },
    },
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
  fields: [
    rowActionsField,
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
      admin: { hidden: true },
      options: [
        { label: 'None', value: 'none' },
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
      admin: { hidden: true },
    },
    {
      name: 'hiddenFromGallery',
      type: 'checkbox',
      defaultValue: false,
      admin: {
        hidden: true,
        description: 'Removed from the public gallery. The file stays in the media library.',
      },
    },
  ],
}

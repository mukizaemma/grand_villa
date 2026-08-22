import { applyAutoSlug } from '../../../core/fields/slug.js'
import { previewUpload } from '../../../core/fields/pageHero.js'

export const Rooms = {
  slug: 'rooms',
  labels: {
    singular: 'Room',
    plural: 'Rooms',
  },
  access: {
    read: () => true,
  },
  admin: {
    group: false,
    useAsTitle: 'name',
    defaultColumns: ['image', 'name', 'units', 'pricePerNight'],
    description: 'Prefer the staff desk for adding rooms. Slug is generated from the name.',
  },
  hooks: {
    beforeValidate: [applyAutoSlug],
    beforeChange: [
      ({ data }) => {
        if (data?.image && (!data.gallery || data.gallery.length === 0)) {
          const photo = typeof data.image === 'object' ? data.image.id : data.image
          if (photo) data.gallery = [{ photo }]
        }
        return data
      },
    ],
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
      admin: { width: '25%' },
    },
    {
      name: 'pricePerNight',
      type: 'number',
      required: true,
      admin: { width: '25%' },
    },
    {
      name: 'units',
      type: 'number',
      required: true,
      defaultValue: 1,
      min: 1,
      admin: {
        width: '25%',
        description: 'How many physical rooms of this type. The website keeps the last room back when you have more than one, so OTAs or walk-ins can still take it.',
      },
    },
    {
      name: 'slug',
      type: 'text',
      required: true,
      unique: true,
      admin: {
        hidden: true,
        readOnly: true,
      },
    },
    {
      name: 'description',
      type: 'richText',
      required: true,
      admin: { description: 'Room overview. Use the staff desk editor for a simpler writing toolbar.' },
    },
    {
      name: 'specs',
      type: 'group',
      fields: [
        { name: 'size', type: 'text', admin: { width: '25%' } },
        { name: 'bed', type: 'text', admin: { width: '25%' } },
        { name: 'occupancy', type: 'text', admin: { width: '25%' } },
        { name: 'view', type: 'text', admin: { width: '25%' } },
        { name: 'smoking', type: 'text', admin: { width: '25%' } },
        { name: 'breakfast', type: 'text', admin: { width: '25%' } },
      ],
    },
    {
      name: 'features',
      type: 'select',
      hasMany: true,
      admin: { width: '50%' },
      options: [
        { label: 'Flat-Screen TV', value: 'tv' },
        { label: 'Free Wi-Fi', value: 'wifi' },
        { label: 'Air Conditioning', value: 'ac' },
        { label: 'In-Room Safe', value: 'safe' },
        { label: 'Alarm Clock', value: 'alarm' },
        { label: 'Direct Phone Line', value: 'phone' },
        { label: 'Private Bathroom', value: 'bath' },
        { label: 'Sitting Area', value: 'sofa' },
        { label: 'Mini Fridge', value: 'fridge' },
      ],
    },
    previewUpload('image', { admin: { width: '25%' } }),
    {
      name: 'gallery',
      type: 'array',
      admin: {
        width: '100%',
        description: 'Room photos in a grid. Add several at once — files over 700KB are resized first.',
        components: {
          Field: './src/components/payload/MediaGridField/index.jsx#MediaGridField',
        },
      },
      fields: [
        previewUpload('photo', { required: true, admin: { width: '50%' } }),
      ],
    },
  ],
}

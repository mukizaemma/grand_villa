import { pageHeroFields } from '../../../core/fields/pageHero.js'

export const RoomsPage = {
  slug: 'rooms-page',
  label: 'Accommodation',
  admin: { group: false },
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'hero',
      type: 'group',
      fields: pageHeroFields,
    },
    {
      name: 'highlights',
      type: 'array',
      fields: [
        {
          name: 'icon',
          type: 'select',
          admin: { width: '25%' },
          options: ['wifi', 'parking', 'breakfast', 'front-desk'].map((v) => ({
            label: v,
            value: v,
          })),
        },
        { name: 'label', type: 'text', required: true, admin: { width: '75%' } },
      ],
    },
  ],
}

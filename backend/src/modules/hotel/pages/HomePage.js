import { buttonsBlock, headerImageBlock, previewUpload, textContentBlock } from '../../../core/fields/pageHero.js'

const FEATURE_ICONS = [
  { label: 'Breakfast / coffee', value: 'coffee' },
  { label: 'Wi-Fi', value: 'wifi' },
  { label: 'Location', value: 'map-pin' },
  { label: 'Rooms / bed', value: 'bed' },
  { label: 'Parking', value: 'parking' },
  { label: 'Restaurant', value: 'utensils' },
  { label: 'Lake / water', value: 'waves' },
  { label: 'Boat', value: 'ship' },
  { label: 'Hiking / hills', value: 'mountain' },
  { label: 'Nature', value: 'trees' },
  { label: 'Sunrise', value: 'sunrise' },
  { label: 'Concierge', value: 'bell' },
]

function unnamedGroup(name, fields, extra = {}) {
  return {
    name,
    type: 'group',
    label: false,
    ...extra,
    fields,
  }
}

export const HomePage = {
  slug: 'home-page',
  label: 'Home',
  admin: {
    group: false,
    description: 'Same sections as the public home page, in the same order.',
  },
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Hero',
          description: 'Top slider. The two buttons appear on every slide.',
          fields: [
            unnamedGroup('hero', [
              {
                name: 'slides',
                type: 'array',
                minRows: 1,
                labels: { singular: 'Slide', plural: 'Slides' },
                fields: [
                  textContentBlock([
                    { name: 'eyebrow', type: 'text', admin: { width: '25%' } },
                    {
                      name: 'headline',
                      type: 'text',
                      required: true,
                      admin: { width: '75%', className: 'hero-headline' },
                    },
                    { name: 'subline', type: 'richText' },
                  ]),
                  headerImageBlock(previewUpload('image')),
                ],
              },
              buttonsBlock([
                {
                  name: 'cta',
                  type: 'group',
                  label: 'Primary button',
                  admin: { width: '50%', className: 'hero-cta-card' },
                  fields: [
                    { name: 'label', type: 'text', defaultValue: 'Book your stay', admin: { width: '50%' } },
                    { name: 'link', type: 'text', defaultValue: '/book', admin: { width: '50%' } },
                  ],
                },
                {
                  name: 'secondaryCta',
                  type: 'group',
                  label: 'Secondary button',
                  admin: { width: '50%', className: 'hero-cta-card' },
                  fields: [
                    { name: 'label', type: 'text', defaultValue: 'Explore the lake', admin: { width: '50%' } },
                    { name: 'link', type: 'text', defaultValue: '/things-to-do', admin: { width: '50%' } },
                  ],
                },
              ]),
            ]),
          ],
        },
        {
          label: 'Features',
          description: 'Four short highlights directly under the destination story — lake, boat, trail, apartment.',
          fields: [
            {
              name: 'features',
              type: 'array',
              label: false,
              labels: { singular: 'Feature', plural: 'Features' },
              admin: { initCollapsed: false },
              fields: [
                {
                  name: 'icon',
                  type: 'select',
                  required: true,
                  defaultValue: 'wifi',
                  admin: { width: '25%' },
                  options: FEATURE_ICONS,
                },
                { name: 'title', type: 'text', required: true, admin: { width: '75%' } },
                { name: 'text', type: 'textarea', admin: { width: '100%' } },
              ],
            },
          ],
        },
        {
          label: 'Why Karongi',
          description: 'The story band under the hero: why this lake, this town, this apartment.',
          fields: [
            unnamedGroup('welcome', [
              { name: 'eyebrow', type: 'text', defaultValue: 'Karongi · Lake Kivu' },
              { name: 'headline', type: 'text', defaultValue: 'A serviced apartment on Rwanda’s favourite lake' },
              { name: 'body', type: 'richText' },
              {
                name: 'cta',
                type: 'group',
                fields: [
                  { name: 'label', type: 'text', defaultValue: 'See things to do' },
                  { name: 'path', type: 'text', defaultValue: '/things-to-do' },
                ],
              },
              previewUpload('primaryImage'),
              previewUpload('secondaryImage'),
              {
                name: 'reviewBadges',
                type: 'array',
                admin: { hidden: true },
                fields: [
                  { name: 'source', type: 'text' },
                  { name: 'score', type: 'number' },
                  { name: 'tier', type: 'text' },
                  { name: 'reviewCount', type: 'number' },
                ],
              },
            ]),
          ],
        },
        {
          label: 'Rooms',
          description: 'Heading only. Individual rooms are edited under Rooms.',
          fields: [
            unnamedGroup('roomsSection', [
              { name: 'eyebrow', type: 'text', defaultValue: 'Stay with us', admin: { width: '25%' } },
              {
                name: 'headline',
                type: 'text',
                defaultValue: 'An apartment base for lake days',
                admin: { width: '75%' },
              },
              {
                name: 'intro',
                type: 'textarea',
                defaultValue: 'Come back to a quiet, serviced apartment after the boat, the trail, or a slow afternoon in Karongi.',
                admin: { width: '100%' },
              },
            ]),
          ],
        },
        {
          label: 'Things to do',
          description: 'Heading for the three lake-day cards on Home. Individual activities are edited under Things to do.',
          fields: [
            unnamedGroup('experiencesSection', [
              { name: 'eyebrow', type: 'text', defaultValue: 'On the water & in the hills', admin: { width: '25%' } },
              {
                name: 'headline',
                type: 'text',
                defaultValue: 'What to do from the apartment',
                admin: { width: '75%' },
              },
              {
                name: 'intro',
                type: 'textarea',
                defaultValue:
                  'Karongi is a place you move through — boat, paddle, walk — not only a room with a view. We help you set the days up.',
                admin: { width: '100%' },
              },
            ]),
          ],
        },
        {
          label: 'Location',
          description:
            'Headlines and the optional photo live here. The live map is pasted in Site setting → Address & map (Google Maps → Share → Embed a map).',
          fields: [
            unnamedGroup('location', [
              textContentBlock([
                { name: 'eyebrow', type: 'text', defaultValue: 'Karongi', admin: { width: '25%' } },
                {
                  name: 'headline',
                  type: 'text',
                  defaultValue: 'On the western shore of Lake Kivu',
                  admin: { width: '75%' },
                },
                { name: 'body', type: 'richText' },
              ]),
              {
                name: 'highlights',
                type: 'array',
                labels: { singular: 'Highlight', plural: 'Highlights' },
                fields: [{ name: 'text', type: 'text', required: true }],
              },
              {
                name: 'cta',
                type: 'group',
                label: 'Link',
                admin: { width: '50%', className: 'hero-cta-card' },
                fields: [
                  { name: 'label', type: 'text', defaultValue: 'Get directions', admin: { width: '50%' } },
                  { name: 'path', type: 'text', defaultValue: '/contact', admin: { width: '50%' } },
                ],
              },
              previewUpload('image', {
                admin: {
                  width: '50%',
                  description:
                    'Shown on Home if no map embed is set in Site setting. The map embed always wins when both exist.',
                },
              }),
            ]),
          ],
        },
        {
          label: 'Closing banner',
          description: 'Last band on the home page. Address and directions on the card come from Site setting.',
          fields: [
            unnamedGroup('cta', [
              textContentBlock([
                { name: 'eyebrow', type: 'text', admin: { width: '25%' } },
                { name: 'headline', type: 'text', admin: { width: '75%' } },
                { name: 'body', type: 'richText' },
              ]),
              {
                name: 'cta',
                type: 'group',
                label: 'Primary button',
                admin: { width: '50%', className: 'hero-cta-card' },
                fields: [
                  { name: 'label', type: 'text', admin: { width: '50%' } },
                  { name: 'path', type: 'text', admin: { width: '50%' } },
                ],
              },
              previewUpload('backgroundImage'),
            ]),
          ],
        },
      ],
    },
    {
      name: 'barRestaurantSpotlight',
      type: 'group',
      admin: { hidden: true },
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'headline', type: 'text' },
        { name: 'body', type: 'richText' },
      ],
    },
    {
      name: 'stats',
      type: 'array',
      admin: { hidden: true },
      fields: [
        { name: 'value', type: 'text' },
        { name: 'label', type: 'text' },
        { name: 'image', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'amenities',
      type: 'array',
      admin: { hidden: true },
      fields: [
        { name: 'icon', type: 'text' },
        { name: 'title', type: 'text' },
        { name: 'description', type: 'richText' },
      ],
    },
    {
      name: 'videoShowcase',
      type: 'group',
      admin: { hidden: true },
      fields: [
        { name: 'eyebrow', type: 'text' },
        { name: 'headline', type: 'text' },
        { name: 'backgroundImage', type: 'upload', relationTo: 'media' },
        { name: 'videoUrl', type: 'text' },
      ],
    },
  ],
}

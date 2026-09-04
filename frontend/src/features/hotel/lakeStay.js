/** Copy and fallbacks for a whole-apartment group stay on Lake Kivu. */

export const APARTMENT = {
  bedrooms: 6,
  bathrooms: 6,
  priceSelfCatering: 150,
  priceWithBreakfast: 200,
  monthlyRate: 2500,
  facts: [
    { value: '6', label: 'Bedrooms' },
    { value: '6', label: 'Bathrooms' },
    { value: '1', label: 'Private kitchen' },
    { value: '1', label: 'In-house bar' },
  ],
  perks: [
    'Air conditioning',
    'Hot water',
    'Kitchen for the group',
    'Private bar for in-house guests',
    'Boat ride for guests staying here',
  ],
}

export const DESTINATION = {
  eyebrow: 'Karongi · Lake Kivu',
  headline: 'A private apartment on Lake Kivu',
  body:
    'Grand Villa is one building on the Karongi shore — not a hotel of single rooms. Take the villa together, cook and gather inside, then spend the day on the water: boat, kayak, or the Congo Nile Trail, about three hours from Kigali.',
  cta: { label: 'Book the apartment', path: '/book' },
  facts: [
    { value: '6', label: 'Beds' },
    { value: '6', label: 'Baths' },
    { value: 'Boat', label: 'For in-house guests' },
  ],
}

export const DEFAULT_HOME_FEATURES = [
  {
    icon: 'wine',
    title: 'Private bar',
    text: 'An in-house bar for the group staying in the villa.',
  },
  {
    icon: 'utensils',
    title: 'Kitchen inside',
    text: 'A full kitchen in the apartment, so the group can cook together.',
  },
  {
    icon: 'droplets',
    title: 'Hot water',
    text: 'Hot water throughout the apartment after a day on the lake.',
  },
  {
    icon: 'wind',
    title: 'Air conditioning',
    text: 'Cool rooms to come back to in the afternoon heat.',
  },
]

export const FALLBACK_EXPERIENCES = [
  {
    id: 'boat-riding',
    name: 'Boat riding',
    price: null,
    description:
      'For guests staying in the apartment: a boat ride on Lake Kivu — bays, islands, and the western shore.',
    image: '',
    accent: 'linear-gradient(160deg, #1a3a52 0%, #0e2436 100%)',
  },
  {
    id: 'kayaking',
    name: 'Kayaking',
    price: null,
    description: 'Paddle close to the shore in the morning calm, before the wind picks up on the lake.',
    image: '',
    accent: 'linear-gradient(160deg, #2c5c6e 0%, #1a3a4a 100%)',
  },
  {
    id: 'hiking',
    name: 'Hiking',
    price: null,
    description: 'Walk the Congo Nile Trail and the hills above Karongi — tea, coffee, and the lake below you.',
    image: '',
    accent: 'linear-gradient(160deg, #3d5344 0%, #24382c 100%)',
  },
]

export const LOCATION_HIGHLIGHTS = [
  'Karongi (Kibuye) on the western shore of Lake Kivu',
  'About a three-hour drive from Kigali',
  'Boat days and the Congo Nile Trail from the door',
]

export const ROOMS_SECTION = {
  eyebrow: 'Rates',
  headline: 'Book the villa',
  intro: '$150 a night without breakfast, $200 with breakfast, or $2,500 a month for the whole apartment.',
}

export const GALLERY_PREVIEW = {
  eyebrow: 'Gallery',
  headline: 'Inside the apartment',
  intro: 'The latest photos of the villa — bedrooms, kitchen, bar, and the grounds.',
  cta: { label: 'View more', path: '/gallery' },
}

export const HOME_CTA = {
  eyebrow: 'Karongi · Lake Kivu',
  headline: 'Bring the group. Take the villa.',
  body:
    'Grand Villa is one private apartment, not a hotel of single rooms. Book the whole building, add breakfast if you want it, and take the boat when you want the lake.',
  cta: { label: 'Book the apartment', path: '/book' },
}

export const EXPERIENCES_SECTION = {
  eyebrow: 'From the villa',
  headline: 'Lake days, then back to your place',
  intro:
    'Boat for guests staying here, kayaking, and the Congo Nile Trail. The apartment is the base — not a room with a view you leave in the morning.',
}

export const APARTMENT_DESCRIPTION =
  'Grand Villa is one private apartment — the whole building — for a group staying together by Lake Kivu in Karongi. Six bedrooms and six bathrooms, a kitchen to cook in, a private bar for people staying here, hot water, and air conditioning. Guests in the apartment can take a boat ride on the lake. The villa is $150 a night without breakfast, $200 with breakfast, or $2,500 for a month. We do not rent single rooms.'

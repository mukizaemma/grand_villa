/** Copy and fallbacks for a Lake Kivu / Karongi apartment stay. */

export const DESTINATION = {
  eyebrow: 'Karongi · Lake Kivu',
  headline: 'A serviced apartment on Rwanda’s favourite lake',
  body:
    'Grand Villa sits in Karongi, on the western shore of Lake Kivu — one of the most visited corners of Rwanda. Sleep in a real apartment, then spend the day on the water or in the hills: boat rides, kayaking, hiking the Congo Nile Trail, and more with people who know this shoreline.',
  cta: { label: 'See things to do', path: '/things-to-do' },
  facts: [
    { value: '3 hrs', label: 'from Kigali by road' },
    { value: 'Lakeside', label: 'Karongi / Kibuye shore' },
    { value: 'On the water', label: 'Boat, kayak, and trail days' },
  ],
}

export const DEFAULT_HOME_FEATURES = [
  {
    icon: 'waves',
    title: 'On Lake Kivu',
    text: 'Wake up on the Karongi shoreline — coffee, then the water in front of you.',
  },
  {
    icon: 'ship',
    title: 'Boat & kayak',
    text: 'Ride with local captains, paddle a quiet bay, or watch the sun drop into the lake.',
  },
  {
    icon: 'mountain',
    title: 'Hills & trails',
    text: 'Hike the Congo Nile Trail, coffee country, and lookouts above Karongi.',
  },
  {
    icon: 'map-pin',
    title: 'Apartment stay',
    text: 'A home base with space to cook, rest, and plan the next lake day.',
  },
]

export const FALLBACK_EXPERIENCES = [
  {
    id: 'boat-riding',
    name: 'Boat riding',
    price: null,
    description: 'Cross the bays of Lake Kivu with a local skipper — islands, fishing villages, and long views west.',
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
  'Boat rides, kayaking, and island trips from the lakeshore',
  'Congo Nile Trail, coffee hills, and lookouts above town',
  'About a three-hour drive from Kigali',
]

export const ROOMS_SECTION = {
  eyebrow: 'Stay with us',
  headline: 'An apartment base for lake days',
  intro: 'Come back to a quiet, serviced apartment after the boat, the trail, or a slow afternoon in Karongi.',
}

export const HOME_CTA = {
  eyebrow: 'Karongi · Lake Kivu',
  headline: 'Make this your base on the lake',
  body: 'Book the apartment, then add a boat ride, a kayak morning, or a hike — or just sit with the water in view.',
  cta: { label: 'Book your stay', path: '/book' },
}

export const EXPERIENCES_SECTION = {
  eyebrow: 'On the water & in the hills',
  headline: 'What to do from the apartment',
  intro:
    'Karongi is a place you move through — boat, paddle, walk — not only a room with a view. We help you set the days up.',
}

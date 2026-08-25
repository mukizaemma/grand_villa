import { getPayload } from 'payload'
import config from '../payload.config.js'

function lexical(text) {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: text
            ? [{ type: 'text', text, version: 1, detail: 0, format: 0, mode: 'normal', style: '' }]
            : [],
          direction: 'ltr',
          format: '',
          indent: 0,
          version: 1,
          textFormat: 0,
          textStyle: '',
        },
      ],
      direction: 'ltr',
      format: '',
      indent: 0,
      version: 1,
    },
  }
}

if (!process.env.MONGODB_URI && !process.env.DATABASE_URI) {
  console.error('Missing MONGODB_URI')
  process.exit(1)
}

const payload = await getPayload({ config })

await payload.updateGlobal({
  slug: 'company',
  overrideAccess: true,
  data: {
    name: 'Grand Villa Apartment',
    tagline: 'A serviced apartment on Lake Kivu in Karongi',
    distanceFromKigali: 'About 3 hours from Kigali',
    address: 'Karongi, Western Province, Rwanda — on the Lake Kivu shoreline',
    seoTitle: 'Grand Villa Apartment | Lake Kivu stay in Karongi',
    seoKeywords: 'Lake Kivu apartment, Karongi stay, Kibuye, boat riding, kayaking, hiking Rwanda',
    seoDescription:
      'Stay in a serviced apartment in Karongi, on Lake Kivu. Boat riding, kayaking, hiking, and a quiet place to come back to — about three hours from Kigali.',
  },
})
console.log('company updated')

const home = await payload.findGlobal({ slug: 'home-page', depth: 0, overrideAccess: true })
const slides = (home.hero?.slides || []).map((slide, index) => {
  const copy = [
    {
      eyebrow: 'Karongi · Lake Kivu',
      headline: 'Grand Villa Apartment',
      subline:
        'A serviced apartment on Rwanda’s favourite lakeshore — boat, kayak, hike, then come home.',
    },
    {
      eyebrow: 'Days on the water',
      headline: 'Boat riding, kayaking, and the trail',
      subline: 'Karongi is for moving: islands, quiet bays, and the hills above Kibuye.',
    },
  ][index] || {
    eyebrow: 'Karongi',
    headline: slide.headline,
    subline: 'Stay by Lake Kivu.',
  }
  return {
    id: slide.id,
    image: slide.image,
    eyebrow: copy.eyebrow,
    headline: copy.headline,
    subline: lexical(copy.subline),
  }
})

await payload.updateGlobal({
  slug: 'home-page',
  overrideAccess: true,
  data: {
    hero: {
      ...(home.hero || {}),
      slides: slides.length
        ? slides
        : [
            {
              eyebrow: 'Karongi · Lake Kivu',
              headline: 'Grand Villa Apartment',
              subline: lexical(
                'A serviced apartment on Rwanda’s favourite lakeshore — boat, kayak, hike, then come home.',
              ),
            },
          ],
      cta: { label: 'Book your stay', link: '/book' },
      secondaryCta: { label: 'Explore the lake', link: '/things-to-do' },
    },
    features: [
      { icon: 'waves', title: 'On Lake Kivu', text: 'Wake up on the Karongi shoreline — coffee, then the water in front of you.' },
      { icon: 'ship', title: 'Boat & kayak', text: 'Ride with local captains, paddle a quiet bay, or watch the sun drop into the lake.' },
      { icon: 'mountain', title: 'Hills & trails', text: 'Hike the Congo Nile Trail, coffee country, and lookouts above Karongi.' },
      { icon: 'map-pin', title: 'Apartment stay', text: 'A home base with space to cook, rest, and plan the next lake day.' },
    ],
    welcome: {
      ...(home.welcome || {}),
      eyebrow: 'Karongi · Lake Kivu',
      headline: 'A serviced apartment on Rwanda’s favourite lake',
      body: lexical(
        'Grand Villa sits in Karongi, on the western shore of Lake Kivu — one of the most visited corners of Rwanda. Sleep in a real apartment, then spend the day on the water or in the hills: boat rides, kayaking, hiking the Congo Nile Trail, and more with people who know this shoreline.',
      ),
      cta: { label: 'See things to do', path: '/things-to-do' },
    },
    roomsSection: {
      eyebrow: 'Stay with us',
      headline: 'An apartment base for lake days',
      intro: 'Come back to a quiet, serviced apartment after the boat, the trail, or a slow afternoon in Karongi.',
    },
    experiencesSection: {
      eyebrow: 'On the water & in the hills',
      headline: 'What to do from the apartment',
      intro:
        'Karongi is a place you move through — boat, paddle, walk — not only a room with a view. We help you set the days up.',
    },
    location: {
      ...(home.location || {}),
      eyebrow: 'Karongi',
      headline: 'On the western shore of Lake Kivu',
      body: lexical(
        'Karongi (Kibuye) is where many travellers first fall for the lake: islands, fishing boats, and the Congo Nile Trail in the hills behind town. We are an apartment stay — your base between those days.',
      ),
      highlights: [
        { text: 'Karongi (Kibuye) on the western shore of Lake Kivu' },
        { text: 'Boat rides, kayaking, and island trips from the lakeshore' },
        { text: 'Congo Nile Trail, coffee hills, and lookouts above town' },
        { text: 'About a three-hour drive from Kigali' },
      ],
    },
    cta: {
      ...(home.cta || {}),
      eyebrow: 'Karongi · Lake Kivu',
      headline: 'Make this your base on the lake',
      body: lexical(
        'Book the apartment, then add a boat ride, a kayak morning, or a hike — or just sit with the water in view.',
      ),
      cta: { label: 'Book your stay', path: '/book' },
    },
  },
})
console.log('home-page updated')

const activities = [
  {
    slug: 'evening-walk',
    name: 'Boat riding',
    price: 40,
    description: 'Cross the bays of Lake Kivu with a local skipper — islands, fishing villages, and long views west.',
  },
  {
    slug: 'morning-run',
    name: 'Kayaking',
    price: 25,
    description: 'Paddle close to the shore in the morning calm, before the wind picks up on the lake.',
  },
]

for (const item of activities) {
  const found = await payload.find({
    collection: 'experiences',
    where: { slug: { equals: item.slug } },
    limit: 1,
    overrideAccess: true,
  })
  const existing = found.docs[0]
  if (existing) {
    await payload.update({
      collection: 'experiences',
      id: existing.id,
      overrideAccess: true,
      data: {
        name: item.name,
        price: item.price,
        description: lexical(item.description),
      },
    })
    console.log('updated experience', item.name)
  }
}

const hiking = await payload.find({
  collection: 'experiences',
  where: { slug: { equals: 'hiking' } },
  limit: 1,
  overrideAccess: true,
})
if (!hiking.docs[0]) {
  await payload.create({
    collection: 'experiences',
    overrideAccess: true,
    data: {
      name: 'Hiking',
      price: 20,
      description: lexical(
        'Walk the Congo Nile Trail and the hills above Karongi — tea, coffee, and the lake below you.',
      ),
    },
  })
  console.log('created Hiking')
} else {
  console.log('hiking already exists')
}

const things = await payload.findGlobal({ slug: 'things-to-do-page', depth: 0, overrideAccess: true })
await payload.updateGlobal({
  slug: 'things-to-do-page',
  overrideAccess: true,
  data: {
    hero: {
      ...(things.hero || {}),
      eyebrow: 'Around Grand Villa',
      headline: 'Days on Lake Kivu',
      intro: lexical(
        'Boat riding, kayaking, hiking the Congo Nile Trail — then back to the apartment in Karongi. Add an experience to your stay, or ask the desk to set the day up.',
      ),
      cta: { label: 'Book your stay', path: '/book' },
      secondaryCta: { label: 'Ask the desk', path: '/contact' },
    },
  },
})
console.log('things-to-do-page updated')

process.exit(0)

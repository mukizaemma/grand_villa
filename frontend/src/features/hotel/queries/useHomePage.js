/**
 * HOME PAGE
 * One hook for the whole Home page. HomePage.jsx gates loading/error;
 * each section calls it again — same query key, so React Query serves
 * it from cache.
 */
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@lib/apiClient'
import { adaptRoom, mediaUrl } from '../adapters'
import { asPlain } from '@lib/richText'
import { DEFAULT_HOME_FEATURES } from '../homeFeatures'

async function fetchHomePage() {
  const [pageRes, roomsRes] = await Promise.all([
    apiClient.get('/api/globals/home-page?depth=2'),
    apiClient.get('/api/rooms?limit=100&depth=2'),
  ])

  const page = pageRes.data
  const rooms = roomsRes.data.docs.map(adaptRoom)
  const features = (page.features || [])
    .map((item) => ({
      id: item.id,
      icon: item.icon,
      title: item.title,
      text: item.text,
    }))
    .filter((item) => item.title)

  return {
    hero: {
      slides: (page.hero?.slides || []).map((slide) => ({
        id: slide.id,
        eyebrow: slide.eyebrow,
        headline: slide.headline,
        subline: asPlain(slide.subline),
        image: mediaUrl(slide.image),
      })),
      cta: {
        label: page.hero?.cta?.label || 'Book your stay',
        link: page.hero?.cta?.link || '/book',
      },
      secondaryCta: {
        label: page.hero?.secondaryCta?.label || 'Explore rooms',
        link: page.hero?.secondaryCta?.link || '/accommodation',
      },
    },

    features: features.length ? features : DEFAULT_HOME_FEATURES,

    welcome: {
      eyebrow: page.welcome?.eyebrow,
      headline: page.welcome?.headline,
      body: asPlain(page.welcome?.body),
      cta: page.welcome?.cta || {},
      images: {
        primary: mediaUrl(page.welcome?.primaryImage),
        secondary: mediaUrl(page.welcome?.secondaryImage),
      },
      reviewBadges: (page.welcome?.reviewBadges || []).map((badge) => ({
        id: badge.id,
        source: badge.source,
        score: badge.score,
        tier: badge.tier,
        reviewCount: badge.reviewCount,
      })),
    },

    roomsSection: {
      eyebrow: page.roomsSection?.eyebrow || 'Our rooms',
      headline: page.roomsSection?.headline || 'Find a room that feels like home',
      intro: page.roomsSection?.intro || 'Comfortable and affordable accommodation options.',
    },

    barRestaurant: {
      eyebrow: page.barRestaurantSpotlight?.eyebrow,
      headline: page.barRestaurantSpotlight?.headline,
      body: asPlain(page.barRestaurantSpotlight?.body),
      cta: page.barRestaurantSpotlight?.cta || {},
      highlights: (page.barRestaurantSpotlight?.highlights || []).map((item) => ({
        ...item,
        description: asPlain(item.description),
      })),
      images: {
        primary: mediaUrl(page.barRestaurantSpotlight?.images?.primary),
        secondary: mediaUrl(page.barRestaurantSpotlight?.images?.secondary),
      },
      captions: {
        primary: page.barRestaurantSpotlight?.captions?.primary,
        secondary: page.barRestaurantSpotlight?.captions?.secondary,
      },
    },

    location: {
      eyebrow: page.location?.eyebrow || 'Our location',
      headline: page.location?.headline || 'By the lake — and close to town',
      body: asPlain(page.location?.body),
      highlights: (page.location?.highlights || [])
        .map((item) => item.text)
        .filter(Boolean),
      cta: {
        label: page.location?.cta?.label || 'Get directions',
        path: page.location?.cta?.path || '/contact',
      },
      image: mediaUrl(page.location?.image),
    },

    cta: {
      eyebrow: page.cta?.eyebrow,
      headline: page.cta?.headline,
      body: asPlain(page.cta?.body),
      cta: page.cta?.cta || {},
      backgroundImage: mediaUrl(page.cta?.backgroundImage),
    },

    rooms,
  }
}

export function useHomePage() {
  return useQuery({
    queryKey: ['home-page'],
    queryFn: fetchHomePage,
    staleTime: 5 * 60 * 1000,
  })
}

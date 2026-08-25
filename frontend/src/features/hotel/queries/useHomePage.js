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
import {
  DESTINATION,
  EXPERIENCES_SECTION,
  HOME_CTA,
  LOCATION_HIGHLIGHTS,
  ROOMS_SECTION,
} from '../lakeStay'

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
        label: page.hero?.secondaryCta?.label || 'Explore the lake',
        link: page.hero?.secondaryCta?.link || '/things-to-do',
      },
    },

    features: features.length ? features : DEFAULT_HOME_FEATURES,

    destination: {
      eyebrow: page.welcome?.eyebrow || DESTINATION.eyebrow,
      headline: page.welcome?.headline || DESTINATION.headline,
      body: asPlain(page.welcome?.body) || DESTINATION.body,
      cta: {
        label: page.welcome?.cta?.label || DESTINATION.cta.label,
        path: page.welcome?.cta?.path || DESTINATION.cta.path,
      },
      images: {
        primary: mediaUrl(page.welcome?.primaryImage),
        secondary: mediaUrl(page.welcome?.secondaryImage),
      },
      facts: DESTINATION.facts,
    },

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
      eyebrow: page.roomsSection?.eyebrow || ROOMS_SECTION.eyebrow,
      headline: page.roomsSection?.headline || ROOMS_SECTION.headline,
      intro: page.roomsSection?.intro || ROOMS_SECTION.intro,
    },

    experiencesSection: {
      eyebrow: page.experiencesSection?.eyebrow || EXPERIENCES_SECTION.eyebrow,
      headline: page.experiencesSection?.headline || EXPERIENCES_SECTION.headline,
      intro: page.experiencesSection?.intro || EXPERIENCES_SECTION.intro,
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
      eyebrow: page.location?.eyebrow || 'Karongi',
      headline: page.location?.headline || 'On the western shore of Lake Kivu',
      body: asPlain(page.location?.body),
      highlights: (page.location?.highlights || [])
        .map((item) => item.text)
        .filter(Boolean),
      highlightFallback: LOCATION_HIGHLIGHTS,
      cta: {
        label: page.location?.cta?.label || 'Get directions',
        path: page.location?.cta?.path || '/contact',
      },
      image: mediaUrl(page.location?.image),
    },

    cta: {
      eyebrow: page.cta?.eyebrow || HOME_CTA.eyebrow,
      headline: page.cta?.headline || HOME_CTA.headline,
      body: asPlain(page.cta?.body) || HOME_CTA.body,
      cta: {
        label: page.cta?.cta?.label || HOME_CTA.cta.label,
        path: page.cta?.cta?.path || HOME_CTA.cta.path,
      },
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

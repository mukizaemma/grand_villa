import { mediaUrl } from './adapters'
import { BRAND } from './brand'

const FAVICON_TYPES = {
  svg: 'image/svg+xml',
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',
  ico: 'image/x-icon',
  gif: 'image/gif',
}

export function brandFromCompany(company) {
  const name = String(company?.name || '').trim() || BRAND.name
  const logo = mediaUrl(company?.logo) || ''
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
  const shortName = name.replace(/\s+Apartment$/i, '').trim() || BRAND.shortName
  return {
    name,
    shortName,
    logo,
    initials: initials || BRAND.mark || 'H',
    tagline: company?.tagline || BRAND.tagline,
  }
}

export function applyCompanyFavicon(url) {
  if (typeof document === 'undefined' || !url) return

  let link = document.querySelector('link[rel="icon"]')
  if (!link) {
    link = document.createElement('link')
    link.setAttribute('rel', 'icon')
    document.head.appendChild(link)
  }
  if (link.getAttribute('href') === url) return

  const ext = url.split('?')[0].split('.').pop()?.toLowerCase()
  const type = FAVICON_TYPES[ext]
  link.setAttribute('href', url)
  if (type) link.setAttribute('type', type)
  else link.removeAttribute('type')

  let apple = document.querySelector('link[rel="apple-touch-icon"]')
  if (!apple) {
    apple = document.createElement('link')
    apple.setAttribute('rel', 'apple-touch-icon')
    document.head.appendChild(apple)
  }
  apple.setAttribute('href', url)
}

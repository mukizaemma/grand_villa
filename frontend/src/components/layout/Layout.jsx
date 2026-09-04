import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { useSiteLayout } from '@lib/queries/useSiteLayout'
import { applyCompanyFavicon, brandFromCompany } from '@features/hotel/companyBrand'
import PageLoader from '@components/ui/PageLoader'
import FloatingCartBar from '@components/cart/FloatingCartBar'
import Navbar from './Navbar'
import Footer from './Footer'
import styles from './Layout.module.css'

const PAGE_TITLES = {
  '/': 'Grand Villa Apartment',
  '/accommodation': 'The apartment — Grand Villa',
  '/bar-restaurant': 'Kitchen & bar — Grand Villa Apartment',
  '/things-to-do': 'Things to do — Grand Villa Apartment',
  '/gallery': 'Gallery — Grand Villa Apartment',
  '/about': 'About — Grand Villa Apartment',
  '/contact': 'Contact — Grand Villa Apartment',
  '/book': 'Book a stay — Grand Villa Apartment',
  '/policy': 'Booking policy — Grand Villa Apartment',
}

export default function Layout({ hasHero = false }) {
  const { pathname } = useLocation()
  const { data, isLoading, isError } = useSiteLayout()
  const company = data?.company

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  useEffect(() => {
    const brand = company?.name || 'Grand Villa Apartment'
    const roomMatch = pathname.startsWith('/accommodation/') && pathname !== '/accommodation'
    document.title = pathname === '/' && company?.seoTitle
      ? company.seoTitle
      : roomMatch
        ? `Room — ${brand}`
        : PAGE_TITLES[pathname] || company?.seoTitle || brand

    const description = company?.seoDescription
    if (description) {
      let meta = document.querySelector('meta[name="description"]')
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', 'description')
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', description)
    }

    const keywords = company?.seoKeywords
    if (keywords) {
      let meta = document.querySelector('meta[name="keywords"]')
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', 'keywords')
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', keywords)
    }

    applyCompanyFavicon(brandFromCompany(company).logo)
  }, [pathname, company])

  if (isLoading) {
    return <PageLoader />
  }

  if (isError) {
    return (
      <div role="alert" style={{ padding: '3rem', textAlign: 'center' }}>
        Couldn't load site content. Please refresh, or try again shortly.
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Navbar hasHero={hasHero} />
      <main className={`${styles.main} ${!hasHero ? styles.withOffset : ''}`}>
        <Outlet />
      </main>
      <Footer />
      <FloatingCartBar />
    </div>
  )
}

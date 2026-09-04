import { useHomePage } from '@lib/queries/useHomePage'
import { useGalleryPage } from '@lib/queries/useGalleryPage'
import { useExperiences } from '@lib/queries/useExperiences'
import PageLoader from '@components/ui/PageLoader'
import HomeHero from '@sections/home/HomeHero'
import HomeDestination from '@sections/home/HomeDestination'
import HomeFeatures from '@sections/home/HomeFeatures'
import HomeExperiences from '@sections/home/HomeExperiences'
import HomeRooms from '@sections/home/HomeRooms'
import HomeGalleryPreview from '@sections/home/HomeGalleryPreview'
import HomeLocation from '@sections/home/HomeLocation'
import HomeCTA from '@sections/home/HomeCTA'

export default function HomePage() {
  const home = useHomePage()
  const gallery = useGalleryPage()
  const experiences = useExperiences()
  const isLoading = home.isLoading || gallery.isLoading || experiences.isLoading
  const isError = home.isError

  if (isLoading) return <PageLoader />
  if (isError) {
    return (
      <div role="alert" style={{ padding: '3rem', textAlign: 'center' }}>
        Couldn't load this page. Please refresh, or try again shortly.
      </div>
    )
  }

  return (
    <>
      <HomeHero />
      <HomeDestination />
      <HomeFeatures />
      <HomeExperiences />
      <HomeRooms />
      <HomeGalleryPreview />
      <HomeLocation />
      <HomeCTA />
    </>
  )
}

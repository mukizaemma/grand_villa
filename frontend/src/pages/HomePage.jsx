import { useHomePage } from '@lib/queries/useHomePage'
import { useBarRestaurantPage } from '@lib/queries/useBarRestaurantPage'
import { useExperiences } from '@lib/queries/useExperiences'
import PageLoader from '@components/ui/PageLoader'
import HomeHero from '@sections/home/HomeHero'
import HomeDestination from '@sections/home/HomeDestination'
import HomeFeatures from '@sections/home/HomeFeatures'
import HomeExperiences from '@sections/home/HomeExperiences'
import HomeRooms from '@sections/home/HomeRooms'
import HomeBarRestaurant from '@sections/home/HomeBarRestaurant'
import HomeLocation from '@sections/home/HomeLocation'
import HomeCTA from '@sections/home/HomeCTA'

export default function HomePage() {
  const home = useHomePage()
  const restaurant = useBarRestaurantPage()
  const experiences = useExperiences()
  const isLoading = home.isLoading || restaurant.isLoading || experiences.isLoading
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
      <HomeBarRestaurant />
      <HomeLocation />
      <HomeCTA />
    </>
  )
}

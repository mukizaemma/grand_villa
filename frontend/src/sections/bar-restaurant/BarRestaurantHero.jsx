import PageHero from '@components/ui/PageHero'
import { useBarRestaurantPage } from '@lib/queries/useBarRestaurantPage'

export default function BarRestaurantHero() {
  const { data } = useBarRestaurantPage()
  const { eyebrow, headline, intro, cta, backgroundImage } = data.hero

  return (
    <PageHero
      image={backgroundImage}
      eyebrow={eyebrow || 'Dining'}
      title={headline || 'Restaurant & bar'}
      text={intro || 'Unhurried plates and a glass after a day by the lake.'}
      primaryTo={cta?.path || '/contact'}
      primaryLabel={cta?.label || 'Reserve a table'}
      secondaryTo="/book"
      secondaryLabel="Book a stay"
    />
  )
}

import PageHero from '@components/ui/PageHero'
import { useAboutPage } from '@lib/queries/useAboutPage'

export default function AboutHero() {
  const { data } = useAboutPage()
  const { eyebrow, headline, intro, backgroundImage } = data.hero

  return (
    <PageHero
      image={backgroundImage}
      eyebrow={eyebrow || 'About us'}
      title={headline || 'A home by Lake Kivu'}
      text={intro || 'Grand Villa Apartment is a comfortable stay in Karongi — rooms, dining, and the lake just outside.'}
      primaryTo="/book"
      primaryLabel="Book now"
      secondaryTo="/accommodation"
      secondaryLabel="See rooms"
    />
  )
}

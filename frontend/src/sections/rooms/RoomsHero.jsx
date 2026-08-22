import PageHero from '@components/ui/PageHero'
import { useRoomsPage } from '@lib/queries/useRoomsPage'

export default function RoomsHero() {
  const { data } = useRoomsPage()
  const { hero } = data

  return (
    <PageHero
      image={hero.backgroundImage}
      eyebrow={hero.eyebrow || 'Stay with us'}
      title={hero.headline || 'Accommodation by Lake Kivu'}
      text={
        hero.intro ||
        'Rest after a day by the lake, then come back to rooms that still feel like home.'
      }
      primaryTo={hero.cta?.path || '/book'}
      primaryLabel={hero.cta?.label || 'Book your stay'}
      secondaryTo={hero.secondaryCta?.path || '/contact'}
      secondaryLabel={hero.secondaryCta?.label || 'Ask about a room'}
    />
  )
}

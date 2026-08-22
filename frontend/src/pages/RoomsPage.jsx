import { Link } from 'react-router-dom'
import { useRoomsPage } from '@lib/queries/useRoomsPage'
import PageLoader from '@components/ui/PageLoader'
import RoomsHero from '@sections/rooms/RoomsHero'
import RoomsHighlights from '@sections/rooms/RoomsHighlights'
import RoomsList from '@sections/rooms/RoomsList'

export default function RoomsPage() {
  const { isLoading, isError } = useRoomsPage()

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
      <RoomsHero />
      <RoomsHighlights />
      <RoomsList />
      <div style={{ textAlign: 'center', padding: '0 1.5rem 5rem' }}>
        <Link
          to="/book"
          style={{
            display: 'inline-flex',
            background: '#1a2b4b',
            color: '#fff',
            padding: '0.85rem 1.4rem',
            fontSize: '0.72rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Book now
        </Link>
      </div>
    </>
  )
}

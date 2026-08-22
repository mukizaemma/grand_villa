import { useParams, Navigate, Link } from 'react-router-dom'
import {
  Ruler,
  BedDouble,
  Users,
  Mountain,
  Tv,
  Wifi,
  Snowflake,
  Lock,
  AlarmClock,
  Phone,
  Bath,
  Sofa,
  Refrigerator,
  Cigarette,
  Coffee,
} from 'lucide-react'
import { useRoomsPage } from '@lib/queries/useRoomsPage'
import { FEATURE_LIBRARY } from '@features/hotel/rooms/featureLibrary'
import PageLoader from '@components/ui/PageLoader'
import RoomCard from '@components/hotel/RoomCard'
import RichText from '@components/ui/RichText'
import RoomGallery from '@sections/room-detail/RoomGallery'
import RoomStayForm from '@sections/room-detail/RoomStayForm'
import Reveal from '@components/ui/Reveal'
import styles from './RoomDetailPage.module.css'

const SPEC_META = [
  { key: 'size', Icon: Ruler },
  { key: 'bed', Icon: BedDouble },
  { key: 'occupancy', Icon: Users },
  { key: 'view', Icon: Mountain },
  { key: 'breakfast', Icon: Coffee },
  { key: 'smoking', Icon: Cigarette },
]

const FEATURE_ICONS = {
  tv: Tv,
  wifi: Wifi,
  ac: Snowflake,
  safe: Lock,
  alarm: AlarmClock,
  phone: Phone,
  bath: Bath,
  sofa: Sofa,
  fridge: Refrigerator,
}

function specLabel(key, value) {
  if (key === 'occupancy' && /^\d+$/.test(String(value).trim())) {
    const count = Number(value)
    return `${count} guest${count === 1 ? '' : 's'}`
  }
  return value
}

export default function RoomDetailPage() {
  const { roomId } = useParams()
  const { data, isLoading, isError } = useRoomsPage()

  if (isLoading) return <PageLoader />
  if (isError) {
    return (
      <div role="alert" style={{ padding: '3rem', textAlign: 'center' }}>
        Couldn't load this page. Please refresh, or try again shortly.
      </div>
    )
  }

  const room = data.rooms.find((item) => item.id === roomId)
  if (!room) return <Navigate to="/accommodation" replace />

  const others = data.rooms.filter((item) => item.id !== room.id)
  const specs = SPEC_META.map((item) => ({ ...item, value: room.specs?.[item.key] })).filter((item) => item.value)
  const features = room.features || []

  return (
    <div className={styles.page}>
      <div className={`container ${styles.top}`}>
        <nav className={styles.crumb} aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/accommodation">Accommodation</Link>
          <span>/</span>
          <span>{room.name}</span>
        </nav>

        <div className={styles.layout}>
          <Reveal className={styles.main}>
            <RoomGallery
              key={room.id}
              images={room.gallery?.length ? room.gallery : [room.image].filter(Boolean)}
              roomName={room.name}
            />

            <p className={styles.kicker}>Accommodation</p>
            <h1>{room.name}</h1>
            <p className={styles.price}>
              From <strong>${room.pricePerNight}</strong> / night
            </p>

            {specs.length > 0 && (
              <ul className={styles.specs}>
                {specs.map(({ key, Icon, value }) => (
                  <li key={key}>
                    <Icon size={16} />
                    <span>{specLabel(key, value)}</span>
                  </li>
                ))}
              </ul>
            )}

            <RichText className={styles.copy} value={room.descriptionHtml || room.description} />

            {features.length > 0 && (
              <>
                <h2>Amenities</h2>
                <ul className={styles.features}>
                  {features.map((id) => {
                    const Icon = FEATURE_ICONS[id]
                    return (
                      <li key={id}>
                        {Icon ? <Icon size={16} /> : null}
                        <span>{FEATURE_LIBRARY[id] || id}</span>
                      </li>
                    )
                  })}
                </ul>
              </>
            )}
          </Reveal>

          <Reveal className={styles.side} delay={100} as="aside">
            <RoomStayForm room={room} />
            <Link to="/accommodation" className={styles.back}>
              ← All rooms
            </Link>
          </Reveal>
        </div>
      </div>

      {others.length > 0 && (
        <section className={styles.related}>
          <div className="container">
            <Reveal className={styles.relatedHead}>
              <div>
                <p>Keep exploring</p>
                <h2>Other rooms</h2>
              </div>
              <Link to="/accommodation">View all</Link>
            </Reveal>
            <div className={styles.relatedGrid}>
              {others.slice(0, 3).map((item, index) => (
                <Reveal key={item.id} delay={index * 80}>
                  <RoomCard room={item} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

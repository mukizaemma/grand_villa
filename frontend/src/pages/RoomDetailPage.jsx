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
  UtensilsCrossed,
  Droplets,
  Wine,
  Ship,
} from 'lucide-react'
import { useRoomsPage } from '@lib/queries/useRoomsPage'
import { FEATURE_LIBRARY } from '@features/hotel/rooms/featureLibrary'
import { APARTMENT } from '@features/hotel/lakeStay'
import PageLoader from '@components/ui/PageLoader'
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
  kitchen: UtensilsCrossed,
  'hot-water': Droplets,
  'private-bar': Wine,
  boat: Ship,
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

  const room = data.rooms.find((item) => item.id === roomId) || data.rooms[0]
  if (!room) return <Navigate to="/accommodation" replace />

  const specs = SPEC_META.map((item) => ({ ...item, value: room.specs?.[item.key] })).filter((item) => item.value)
  const features = room.features || []
  const night = room.pricePerNight || APARTMENT.priceSelfCatering
  const breakfast = room.priceWithBreakfast || APARTMENT.priceWithBreakfast
  const monthly = room.monthlyRate || APARTMENT.monthlyRate

  return (
    <div className={styles.page}>
      <div className={`container ${styles.top}`}>
        <nav className={styles.crumb} aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <Link to="/accommodation">The apartment</Link>
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

            <p className={styles.kicker}>The whole building</p>
            <h1>{room.name}</h1>
            <p className={styles.price}>
              <strong>${night}</strong> / night without breakfast
            </p>
            <p className={styles.note}>
              ${breakfast} / night with breakfast · ${Number(monthly).toLocaleString('en-US')} / month
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
              ← The apartment
            </Link>
          </Reveal>
        </div>
      </div>
    </div>
  )
}

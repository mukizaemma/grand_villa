import { useHomePage } from '@lib/queries/useHomePage'
import CardGrid from '@components/ui/CardGrid'
import RoomCard from '@components/hotel/RoomCard'
import Reveal from '@components/ui/Reveal'
import styles from './HomeRooms.module.css'

export default function HomeRooms() {
  const { data } = useHomePage()
  const rooms = data.rooms
  if (!rooms.length) return null

  const section = data.roomsSection || {}

  return (
    <section className={styles.section}>
      <div className="container">
        <Reveal className={styles.header}>
          {section.eyebrow && <span className={styles.eyebrow}>{section.eyebrow}</span>}
          <h2>{section.headline || 'Our rooms'}</h2>
          {section.intro && <p className={styles.intro}>{section.intro}</p>}
        </Reveal>
        <CardGrid
          items={rooms}
          columns={2}
          initialCount={4}
          moreTo="/accommodation"
          moreLabel="View all rooms"
          renderCard={(room) => <RoomCard key={room.id} room={room} />}
        />
      </div>
    </section>
  )
}

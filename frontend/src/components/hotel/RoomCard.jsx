import { Link } from 'react-router-dom'
import styles from './RoomCard.module.css'

export default function RoomCard({ room }) {
  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        <div className={styles.image} style={{ backgroundImage: room.image ? `url("${room.image}")` : undefined }} />
      </div>
      <div className={styles.body}>
        <h3>{room.name}</h3>
        <p className={styles.price}>
          From <strong>${room.pricePerNight}</strong> / night
        </p>
        <p className={styles.note}>{room.specs?.breakfast || 'Breakfast available'}</p>
        <Link to={`/accommodation/${room.id}`} className={styles.btn}>
          View room
        </Link>
      </div>
    </article>
  )
}

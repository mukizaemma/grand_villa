import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCartActions } from '@lib/cart/CartContext'
import { useAvailability } from '@lib/queries/useAvailability'
import { findBlockingClosure, guestClosureMessage } from '@features/hotel/availability'
import StayDatePicker from '@components/hotel/StayDatePicker'
import styles from './RoomStayForm.module.css'

export default function RoomStayForm({ room }) {
  const navigate = useNavigate()
  const { addRoom } = useCartActions()
  const { data: closures = [] } = useAvailability()
  const [checkIn, setCheckIn] = useState('')
  const [checkOut, setCheckOut] = useState('')
  const [closed, setClosed] = useState('')

  function submit(event) {
    event.preventDefault()
    const blocked = findBlockingClosure(closures, {
      checkIn,
      checkOut,
      roomSlugs: [room.id],
    })
    if (blocked) {
      setClosed(guestClosureMessage(blocked))
      return
    }
    addRoom(room)
    try {
      const raw = sessionStorage.getItem('gv-booking-stay')
      const parsed = raw ? JSON.parse(raw) : {}
      sessionStorage.setItem(
        'gv-booking-stay',
        JSON.stringify({
          ...parsed,
          stay: {
            ...(parsed.stay || {}),
            checkIn,
            checkOut,
            adults: '',
            children: 0,
            guestsConfirmed: false,
          },
        }),
      )
    } catch {
      /* booking page still works with empty dates */
    }
    navigate('/book')
  }

  return (
    <form className={styles.form} onSubmit={submit}>
      <h3>Book the apartment</h3>
      <p>The whole villa for your group — not a single room.</p>
      <StayDatePicker
        checkIn={checkIn}
        checkOut={checkOut}
        closures={closures}
        roomSlugs={[room.id]}
        onChange={(next) => {
          setCheckIn(next.checkIn)
          setCheckOut(next.checkOut)
          setClosed('')
        }}
      />
      {closed && <p className={styles.notice}>{closed}</p>}
      <button type="submit" disabled={!checkIn || !checkOut}>
        Check availability
      </button>
    </form>
  )
}

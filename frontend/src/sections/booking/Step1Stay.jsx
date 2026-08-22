import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Plus, Sparkles } from 'lucide-react';
import { useCart, useCartActions } from '@lib/cart/CartContext';
import { useBooking } from '@lib/booking/BookingContext';
import { useAvailability } from '@lib/queries/useAvailability';
import { findBlockingClosure, guestClosureMessage } from '@features/hotel/availability';
import StayDatePicker from '@components/hotel/StayDatePicker';
import RoomPicker from './RoomPicker';
import ExperiencePicker from './ExperiencePicker';
import styles from './Step1Stay.module.css';

export default function Step1Stay() {
  const { rooms, roomCount, experiences } = useCart();
  const { removeRoom, removeExperience } = useCartActions();
  const { stay, nights, setStay } = useBooking();
  const { data: closures = [] } = useAvailability();
  const [roomPickerOpen, setRoomPickerOpen] = useState(false);
  const [experiencePickerOpen, setExperiencePickerOpen] = useState(false);
  const blocked = findBlockingClosure(closures, {
    checkIn: stay.checkIn,
    checkOut: stay.checkOut,
    roomSlugs: rooms.map((room) => room.roomId),
  });

  // Nobody should land on Step 1 with an empty cart — send them back to
  // browse rooms instead of showing a broken/empty booking form.
  if (roomCount === 0) {
    return (
      <div className={styles.card}>
        <div className={styles.empty}>
          <CalendarDays size={28} className={styles.emptyIcon} />
          <h2 className={styles.emptyTitle}>You haven't added any rooms yet</h2>
          <p className={styles.emptyText}>
            Browse our rooms and tap "Book Now" on the ones you'd like to stay in — they'll
            show up here.
          </p>
          <Link to="/accommodation" className={styles.emptyLink}>
            Browse rooms
          </Link>
        </div>
      </div>
    );
  }

  const handleAddExperience = () => setExperiencePickerOpen(true);

  return (
    <div className={styles.card}>
      <h2 className={styles.title}>Your stay</h2>
      <p className={styles.subtitle}>
        Set your dates and guests, then choose a room to continue.
      </p>
      {blocked && stay.checkIn && stay.checkOut && (
        <p className={styles.dateError}>{guestClosureMessage(blocked)}</p>
      )}

      <StayDatePicker
        checkIn={stay.checkIn}
        checkOut={stay.checkOut}
        closures={closures}
        roomSlugs={rooms.map((room) => room.roomId)}
        onChange={(next) => setStay({ checkIn: next.checkIn, checkOut: next.checkOut })}
      />

      <div className={styles.fields}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Adults *</span>
          <input
            type="number"
            min={1}
            value={stay.adults}
            onChange={(e) => setStay({ adults: Math.max(1, Number(e.target.value) || 1) })}
            required
          />
        </label>

        <label className={styles.field}>
          <span className={styles.fieldLabel}>Children</span>
          <input
            type="number"
            min={0}
            value={stay.children}
            onChange={(e) => setStay({ children: Math.max(0, Number(e.target.value) || 0) })}
          />
        </label>
      </div>

      {nights > 0 && (
        <span className={styles.nightsPill}>
          {nights} {nights === 1 ? 'night' : 'nights'}
        </span>
      )}
      {stay.checkIn && stay.checkOut && nights <= 0 && (
        <p className={styles.dateError}>Check-out must be after check-in.</p>
      )}

      <div className={styles.roomList}>
        {rooms.map((room) => (
          <div key={room.roomId} className={styles.roomCard}>
            <div>
              <p className={styles.roomName}>{room.name}</p>
              <p className={styles.roomDates}>
                {stay.checkIn && stay.checkOut
                  ? `${stay.checkIn} → ${stay.checkOut}`
                  : 'Set dates above'}
              </p>
            </div>
            <button
              type="button"
              className={styles.removeLink}
              onClick={() => removeRoom(room.roomId)}
            >
              Remove
            </button>
          </div>
        ))}

        {experiences.map((exp) => (
          <div key={exp.experienceId} className={styles.roomCard}>
            <div>
              <p className={styles.roomName}>{exp.name}</p>
              <p className={styles.roomDates}>${exp.price} · experience</p>
            </div>
            <button
              type="button"
              className={styles.removeLink}
              onClick={() => removeExperience(exp.experienceId)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.addRoomBtn} onClick={() => setRoomPickerOpen(true)}>
          <Plus size={15} />
          Add room
        </button>
        <button type="button" className={styles.addExperienceBtn} onClick={handleAddExperience}>
          <Sparkles size={15} />
          Add experience
        </button>
      </div>

      {roomPickerOpen && <RoomPicker onClose={() => setRoomPickerOpen(false)} />}
      {experiencePickerOpen && (
        <ExperiencePicker onClose={() => setExperiencePickerOpen(false)} />
      )}
    </div>
  );
}
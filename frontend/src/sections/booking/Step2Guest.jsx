import { useEffect, useState } from 'react';
import { ChevronRight, User } from 'lucide-react';
import { useCart, useCartActions } from '@lib/cart/CartContext';
import { useBooking } from '@lib/booking/BookingContext';
import { APARTMENT } from '@features/hotel/lakeStay';
import styles from './Step2Guest.module.css';

const GUESTS_PER_BED = 2;

export function bedsForGuests(guests) {
  const count = Number(guests) || 0;
  if (count < 1) return '';
  return Math.min(APARTMENT.bedrooms, Math.ceil(count / GUESTS_PER_BED));
}

export default function Step2Guest() {
  const { rooms } = useCart();
  const { setRoomGuests } = useCartActions();
  const { stay, setStay, guest, setGuest } = useBooking();
  const [requestsOpen, setRequestsOpen] = useState(Boolean(guest.specialRequests));

  useEffect(() => {
    if ((stay.beds === '' || stay.beds == null) && Number(stay.adults) >= 1) {
      setStay({ beds: bedsForGuests(stay.adults) });
    }
  }, [stay.adults, stay.beds, setStay]);

  function setGuestCount(raw) {
    const adults = Math.max(0, Number(raw) || 0);
    setStay({
      adults: raw === '' ? '' : adults,
      children: 0,
      beds: bedsForGuests(adults),
      guestsConfirmed: adults >= 1,
    });
    rooms.forEach((room) => setRoomGuests(room.roomId, adults, 0));
  }

  return (
    <div className={styles.card}>
      <div className={styles.heading}>
        <User size={18} className={styles.headingIcon} />
        <div>
          <h2 className={styles.title}>Primary guest</h2>
          <p className={styles.subtitle}>We will use these details to confirm your reservation.</p>
        </div>
      </div>

      <div className={styles.row}>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>First name</span>
          <input
            type="text"
            value={guest.firstName}
            onChange={(e) => setGuest({ firstName: e.target.value })}
            required
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Last name</span>
          <input
            type="text"
            value={guest.lastName}
            onChange={(e) => setGuest({ lastName: e.target.value })}
            required
          />
        </label>
      </div>

      <div className={styles.row}>
        <label className={styles.field}>
          <span className={`${styles.fieldLabel} ${styles.required}`}>Mobile (WhatsApp) *</span>
          <input
            type="tel"
            placeholder="+250 7XX XXX XXX"
            value={guest.mobile}
            onChange={(e) => setGuest({ mobile: e.target.value })}
            required
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Email</span>
          <input
            type="email"
            value={guest.email}
            onChange={(e) => setGuest({ email: e.target.value })}
          />
        </label>
      </div>

      <div className={`${styles.row} ${styles.rowThree}`}>
        <label className={styles.field}>
          <span className={`${styles.fieldLabel} ${styles.required}`}>Guests in the group *</span>
          <input
            type="number"
            min={1}
            inputMode="numeric"
            placeholder="How many people"
            value={stay.adults}
            onChange={(e) => setGuestCount(e.target.value)}
            required
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Country / region</span>
          <input
            type="text"
            value={guest.country}
            onChange={(e) => setGuest({ country: e.target.value })}
          />
        </label>
        <label className={styles.field}>
          <span className={styles.fieldLabel}>Beds</span>
          <input
            type="number"
            min={1}
            max={APARTMENT.bedrooms}
            inputMode="numeric"
            placeholder="Beds to prepare"
            value={stay.beds}
            onChange={(e) => {
              const raw = e.target.value
              const beds = Math.max(0, Number(raw) || 0)
              setStay({ beds: raw === '' ? '' : Math.min(APARTMENT.bedrooms, beds) })
            }}
          />
          <small className={styles.hint}>
            Each bed hosts up to {GUESTS_PER_BED} guests. The apartment has {APARTMENT.bedrooms} beds.
          </small>
        </label>
      </div>

      <button
        type="button"
        className={styles.accordionToggle}
        onClick={() => setRequestsOpen((open) => !open)}
        aria-expanded={requestsOpen}
      >
        <ChevronRight
          size={14}
          className={`${styles.accordionIcon} ${requestsOpen ? styles.accordionIconOpen : ''}`}
        />
        Special requests
      </button>

      {requestsOpen && (
        <textarea
          className={styles.requestsTextarea}
          rows={3}
          placeholder="Anything we should know ahead of your stay?"
          value={guest.specialRequests}
          onChange={(e) => setGuest({ specialRequests: e.target.value })}
        />
      )}
    </div>
  );
}
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { BedDouble, Sparkles, Users, ChevronUp, ArrowRight } from 'lucide-react';
import { useCart } from '@lib/cart/CartContext';
import { useBookingChrome } from '@features/hotel/booking/bookingChrome';
import StaySummaryModal from './StaySummaryModal';
import styles from './FloatingCartBar.module.css';

export default function FloatingCartBar() {
  const { rooms, experiences, roomCount, experienceCount, grandTotal } = useCart();
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const booking = useBookingChrome();
  const onBookingPage = pathname === '/book' && booking.active;

  // Nothing to show once the cart is empty — no empty bar taking up
  // screen space on every page for guests who haven't added anything yet.
  if (roomCount === 0 && experienceCount === 0) return null;

  const totalGuests = rooms.reduce(
    (sum, room) => sum + (room.guestsConfirmed ? room.adults + room.children : 0),
    0,
  );

  function handleContinue() {
    if (onBookingPage) {
      booking.continue();
      return;
    }
    navigate('/book');
  }

  return (
    <>
      <div className={styles.bar} role="region" aria-label="Stay cart summary">
        <button
          type="button"
          className={styles.summaryToggle}
          onClick={() => setModalOpen(true)}
        >
          <ChevronUp size={16} className={styles.toggleIcon} />
          <div className={styles.totals}>
            <span className={styles.grandTotal}>${grandTotal.toFixed(2)}</span>
            <span className={styles.grandTotalLabel}>Grand Total</span>
          </div>
        </button>

        <div className={styles.pills}>
          {roomCount > 0 && (
            <span className={styles.pill}>
              <BedDouble size={14} />
              {roomCount}
            </span>
          )}
          {experienceCount > 0 && (
            <span className={styles.pill}>
              <Sparkles size={14} />
              {experienceCount}
            </span>
          )}
          {totalGuests > 0 && (
            <span className={styles.pill}>
              <Users size={14} />
              {totalGuests}
            </span>
          )}
        </div>

        {(!onBookingPage || booking.step < 3) && (
          <button
            type="button"
            className={styles.continueBtn}
            onClick={handleContinue}
            disabled={onBookingPage && !booking.canContinue}
          >
            Continue
            <ArrowRight size={15} />
          </button>
        )}
      </div>

      {modalOpen && <StaySummaryModal onClose={() => setModalOpen(false)} />}
    </>
  );
}
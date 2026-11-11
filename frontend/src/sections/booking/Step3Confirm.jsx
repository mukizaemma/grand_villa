import { CheckCircle2, AlertCircle, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart, useCartActions } from '@lib/cart/CartContext';
import { useBooking } from '@lib/booking/BookingContext';
import { useBookingSubmit } from '@lib/booking/useBookingSubmit';
import { calcEstimatedTotal } from '@lib/booking/pricing';
import styles from './Step3Confirm.module.css';

export default function Step3Confirm() {
  const { rooms, experiences } = useCart();
  const { clearAll } = useCartActions();
  const { stay, nights, guest, details, setDetails, reset } = useBooking();
  const total = calcEstimatedTotal(rooms, nights, experiences, {
    includeBreakfast: stay.includeBreakfast,
  });
  const guestName = `${guest.firstName} ${guest.lastName}`.trim() || '—';
  const { status, submit } = useBookingSubmit();
  const whatsappSelected = details.confirmationMethod === 'whatsapp';
  const canSubmit = whatsappSelected && details.agreedToTerms && status !== 'submitting';

  async function handleConfirm() {
    if (!canSubmit) return;
    await submit({
      rooms,
      experiences,
      stay,
      nights,
      guest,
      total,
      details: {
        ...details,
        paymentMethod: 'pay-at-hotel',
        confirmationMethod: 'whatsapp',
      },
    });
  }

  if (status === 'success' || status === 'success-no-receipt') {
    return (
      <div className={styles.card}>
        <div className={styles.successState}>
          <CheckCircle2 size={32} className={styles.successIcon} />
          <h2 className={styles.successTitle}>Request sent</h2>
          <p className={styles.successText}>
            {status === 'success'
              ? 'Your stay is saved. WhatsApp is open with the details so Grand Villa can confirm it.'
              : 'Your stay is saved. WhatsApp did not open, and Grand Villa still has the request.'}
          </p>
          <button
            type="button"
            className={styles.doneBtn}
            onClick={() => {
              clearAll();
              reset();
            }}
          >
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <div className={styles.heading}>
        <CheckCircle2 size={18} className={styles.headingIcon} />
        <h2 className={styles.title}>Review &amp; confirm</h2>
      </div>

      <dl className={styles.reviewList}>
        <div className={styles.reviewRow}>
          <dt>Dates</dt>
          <dd>
            {stay.checkIn} → {stay.checkOut}
          </dd>
        </div>
        <div className={styles.reviewRow}>
          <dt>Guest</dt>
          <dd>{guestName}</dd>
        </div>
        {(Number(stay.adults) || Number(stay.beds)) && (
          <div className={styles.reviewRow}>
            <dt>Group</dt>
            <dd>
              {Number(stay.adults) ? `${stay.adults} guest${Number(stay.adults) === 1 ? '' : 's'}` : ''}
              {Number(stay.adults) && Number(stay.beds) ? ' · ' : ''}
              {Number(stay.beds) ? `${stay.beds} bed${Number(stay.beds) === 1 ? '' : 's'}` : ''}
            </dd>
          </div>
        )}
        <div className={styles.reviewRow}>
          <dt>Items</dt>
          <dd>
            The apartment{stay.includeBreakfast ? ' with breakfast' : ' without breakfast'}
            {experiences.length ? `, ${experiences.length} experience(s)` : ''}
          </dd>
        </div>
        <div className={styles.reviewRow}>
          <dt>Total</dt>
          <dd className={styles.reviewTotal}>${total.toFixed(2)}</dd>
        </div>
      </dl>

      <label className={`${styles.termsRow} ${styles.whatsappCheck}`}>
        <input
          type="checkbox"
          checked={whatsappSelected}
          onChange={(e) => setDetails({ confirmationMethod: e.target.checked ? 'whatsapp' : '' })}
        />
        <span>
          <MessageCircle size={15} /> Submit this request on WhatsApp
        </span>
      </label>

      <label className={styles.termsRow}>
        <input
          type="checkbox"
          checked={details.agreedToTerms}
          onChange={(e) => setDetails({ agreedToTerms: e.target.checked })}
        />
        <span>
          I have read and agree to the{' '}
          <Link to="/policy">Hotel Policy and Terms &amp; Conditions</Link>
        </span>
      </label>

      <button type="button" className={styles.confirmBtn} onClick={handleConfirm} disabled={!canSubmit}>
        {status === 'submitting' ? 'Sending…' : 'Submit via WhatsApp'}
      </button>

      {status === 'error' && (
        <p className={styles.statusError}>
          <AlertCircle size={16} />
          Something went wrong saving your booking. Please try again, or reach us directly.
        </p>
      )}

      {status === 'not-configured' && (
        <p className={styles.statusError}>
          <AlertCircle size={16} />
          Online booking submission isn't connected yet — please reach us directly to confirm
          this reservation in the meantime.
        </p>
      )}
    </div>
  );
}

import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { BookingProvider, useBooking } from '@lib/booking/BookingContext';
import { useCart } from '@lib/cart/CartContext';
import { useAvailability } from '@lib/queries/useAvailability';
import { findBlockingClosure } from '@features/hotel/availability';
import BookingStepper from '@sections/booking/BookingStepper';
import Step1Stay from '@sections/booking/Step1Stay';
import Step2Guest from '@sections/booking/Step2Guest';
import Step3Confirm from '@sections/booking/Step3Confirm';
import StaySummaryCard from '@sections/booking/StaySummaryCard';
import BookingFooterBar from '@sections/booking/BookingFooterBar';
import Reveal from '@components/ui/Reveal';
import styles from './BookingPage.module.css';


function BookingFlow() {
  const { step, stay, nights, guest, nextStep, prevStep } = useBooking();
  const { rooms, roomCount } = useCart();
  const { data: closures = [] } = useAvailability();
  const datesClosed = Boolean(
    findBlockingClosure(closures, {
      checkIn: stay.checkIn,
      checkOut: stay.checkOut,
      roomSlugs: rooms.map((room) => room.roomId),
    }),
  );

  const step1Valid = Boolean(stay.checkIn && stay.checkOut && nights > 0 && roomCount > 0 && !datesClosed);
  const step2Valid = Boolean(guest.firstName && guest.lastName && guest.mobile);

  return (
    <>
      <Link to="/" className={styles.backHome}>
        <ArrowLeft size={14} />
        Back to home
      </Link>

      <Reveal>
        <BookingStepper currentStep={step} />
      </Reveal>

      <div className={styles.layout}>
        <Reveal className={styles.main}>
          {step === 1 && <Step1Stay />}
          {step === 2 && <Step2Guest />}
          {step === 3 && <Step3Confirm />}
        </Reveal>

        <Reveal delay={100}>
          <StaySummaryCard />
        </Reveal>
      </div>

      <BookingFooterBar
        onBack={prevStep}
        onContinue={nextStep}
        continueLabel="Continue"
        continueDisabled={step === 1 ? !step1Valid : step === 2 ? !step2Valid : false}
        showContinue={step !== 3}
      />
    </>
  );
}

export default function BookingPage() {
  return (
    <section className={styles.section}>
      <div className="container">
        <BookingProvider>
          <BookingFlow />
        </BookingProvider>
      </div>
    </section>
  );
}
import { Link } from 'react-router-dom'
import Reveal from '@components/ui/Reveal'
import styles from './PolicyPage.module.css'

export default function PolicyPage() {
  return (
    <section className={styles.section}>
      <div className="container">
        <Reveal>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link to="/">Home</Link>
          <span>/</span>
          <span aria-current="page">Booking policy</span>
        </nav>
        <h1 className={styles.headline}>Booking policy</h1>
        <p className={styles.lede}>
          These terms apply when you request a stay at Grand Villa Apartment. Staff confirm every
          reservation before it is final.
        </p>
        <div className={styles.body}>
          <h2>Requests, not instant confirmation</h2>
          <p>
            Submitting a booking asks us to hold the dates you selected. Pay-on-arrival and Western
            Union requests stay pending until our team confirms availability and payment.
          </p>
          <h2>Payment</h2>
          <p>
            Card payments are processed by Stripe. Mobile Money is processed by MTN. Western Union
            transfers must include your booking reference. Rates shown on the website are in USD
            unless we tell you otherwise.
          </p>
          <h2>Your details</h2>
          <p>
            We use your name, phone, and email only to confirm the stay and contact you about it.
            We do not sell guest information.
          </p>
          <h2>Changes and cancellations</h2>
          <p>
            Contact us by phone, WhatsApp, or email as soon as you need to change dates. We will
            confirm what we can do based on occupancy.
          </p>
        </div>
        </Reveal>
      </div>
    </section>
  )
}

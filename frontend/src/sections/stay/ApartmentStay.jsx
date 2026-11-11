import { Link } from 'react-router-dom'
import { APARTMENT } from '@features/hotel/lakeStay'
import Reveal from '@components/ui/Reveal'
import styles from './ApartmentStay.module.css'

export default function ApartmentStay({ apartment, section, showHeader = true, compact = false }) {
  const priceNight = apartment?.pricePerNight || APARTMENT.priceSelfCatering
  const priceBreakfast = apartment?.priceWithBreakfast || APARTMENT.priceWithBreakfast
  const priceMonth = apartment?.monthlyRate || APARTMENT.monthlyRate
  const image = apartment?.image || apartment?.gallery?.[0]
  const stayPath = apartment?.id ? `/accommodation/${apartment.id}` : '/accommodation'

  return (
    <section className={styles.section}>
      <div className={`container ${styles.wide}`}>
        {showHeader && section ? (
          <Reveal className={styles.header}>
            {section.eyebrow && <span className={styles.eyebrow}>{section.eyebrow}</span>}
            <h2>{section.headline}</h2>
            {section.intro && <p className={styles.intro}>{section.intro}</p>}
          </Reveal>
        ) : null}

        <Reveal className={styles.panel}>
          <div className={styles.photo}>
            {image ? (
              <img src={image} alt={apartment?.name || 'Grand Villa Apartment'} />
            ) : null}
          </div>
          <div className={styles.copy}>
            {compact ? null : <p className={styles.kicker}>One building · your group</p>}
            <h3>{apartment?.name || 'Grand Villa Apartment'}</h3>
            <p className={styles.lead}>
              {compact
                ? 'The whole apartment for one group. Choose breakfast or not, or take the villa for a month.'
                : 'Take the whole villa. We do not rent single rooms — this stay is for a group that wants the building to themselves on Lake Kivu.'}
            </p>

            {compact ? null : (
              <>
                <ul className={styles.facts}>
                  {APARTMENT.facts.map((item) => (
                    <li key={item.label}>
                      <strong>{item.value}</strong>
                      <span>{item.label}</span>
                    </li>
                  ))}
                </ul>

                <ul className={styles.perks}>
                  {APARTMENT.perks.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </>
            )}

            <div className={styles.rates}>
              <article>
                <strong>${priceNight}</strong>
                <span>Night, no breakfast</span>
              </article>
              <article>
                <strong>${priceBreakfast}</strong>
                <span>Night, with breakfast</span>
              </article>
              <article>
                <strong>${Number(priceMonth).toLocaleString('en-US')}</strong>
                <span>Month for the villa</span>
              </article>
            </div>

            <div className={styles.actions}>
              <Link to="/book" className={styles.primary}>
                Book the apartment
              </Link>
              {showHeader ? (
                <Link to={stayPath} className={styles.secondary}>
                  See the space
                </Link>
              ) : (
                <Link to="/contact" className={styles.secondary}>
                  Ask about a month
                </Link>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}

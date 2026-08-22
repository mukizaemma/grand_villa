import { Link } from 'react-router-dom'
import { MapPin } from 'lucide-react'
import { useHomePage } from '@lib/queries/useHomePage'
import { useSiteLayout } from '@lib/queries/useSiteLayout'
import { LOCATION_HIGHLIGHTS } from '@features/hotel/brand'
import { safeMapEmbed } from '@lib/richText'
import Reveal from '@components/ui/Reveal'
import styles from './HomeLocation.module.css'

export default function HomeLocation() {
  const { data } = useHomePage()
  const { data: layout } = useSiteLayout()
  const company = layout.company
  const location = data.location || {}
  const map = safeMapEmbed(company.mapEmbed)
  const highlights = location.highlights?.length ? location.highlights : LOCATION_HIGHLIGHTS
  const body =
    location.body ||
    company.address ||
    'Grand Villa Apartment sits in Karongi, on the shores of Lake Kivu, about a three-hour drive from Kigali.'
  const directionsHref = company.mapUrl || location.cta?.path || '/contact'
  const directionsExternal = Boolean(company.mapUrl)
  const photo = location.image

  return (
    <section className={styles.section}>
      <div className={`container ${styles.grid}`}>
        <Reveal>
          <span className={styles.eyebrow}>{location.eyebrow || 'Our location'}</span>
          <h2>{location.headline || 'By the lake — and close to town'}</h2>
          <p className={styles.body}>{body}</p>
          <ul className={styles.points}>
            {highlights.map((item) => (
              <li key={item}>
                <MapPin size={15} />
                <span>{item}</span>
              </li>
            ))}
          </ul>
          {directionsExternal ? (
            <a href={directionsHref} className={styles.link} target="_blank" rel="noopener noreferrer">
              {location.cta?.label || 'Get directions'}
            </a>
          ) : (
            <Link to={directionsHref} className={styles.link}>
              {location.cta?.label || 'Get directions'}
            </Link>
          )}
        </Reveal>

        <Reveal className={styles.visual} delay={120}>
          {map ? (
            <div className={styles.map} dangerouslySetInnerHTML={{ __html: map }} />
          ) : photo ? (
            <div className={styles.photo} style={{ backgroundImage: `url("${photo}")` }} />
          ) : (
            <div className={styles.fallback}>
              <MapPin size={28} />
              <strong>{company.name || 'Grand Villa Apartment'}</strong>
              <p>{company.address || 'Karongi, Western Province, Rwanda'}</p>
            </div>
          )}
        </Reveal>
      </div>
    </section>
  )
}

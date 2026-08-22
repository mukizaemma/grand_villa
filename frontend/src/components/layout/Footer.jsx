import { NavLink } from 'react-router-dom';
import { MapPin, Clock, Phone, Mail, Navigation } from 'lucide-react';
import { useSiteLayout } from '@lib/queries/useSiteLayout';
import { BRAND, PUBLIC_NAV } from '@features/hotel/brand';
import { normalizeSocials, visibleSocials } from '@features/hotel/socials';
import { SOCIAL_ICONS } from '@features/hotel/socialIcons';
import styles from './Footer.module.css';

export default function Footer() {
  const { data } = useSiteLayout();
  const primaryNav = PUBLIC_NAV;
  const company = data.company;
  const socials = visibleSocials(normalizeSocials(company.socials));

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.grid}`}>
        <div className={styles.brandCol}>
          <NavLink to="/" className={styles.logo}>
            <img src={BRAND.logo} alt={BRAND.name} style={{ height: 52, width: 'auto' }} />
            <span>{BRAND.name}</span>
          </NavLink>
          <p className={styles.tagline}>{company.tagline || BRAND.tagline}</p>

          {socials.length > 0 && (
            <div className={styles.socials}>
              {socials.map(({ name, label, href }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.socialLink}
                  aria-label={label}
                >
                  {SOCIAL_ICONS[name]}
                </a>
              ))}
            </div>
          )}
        </div>

        <div className={styles.col}>
          <h4 className={styles.colTitle}>Explore</h4>
          <ul>
            {primaryNav.map((link) => (
              <li key={link.path}>
                <NavLink to={link.path} end={link.path === '/'}>
                  {link.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.col}>
          <h4 className={styles.colTitle}>Getting Here</h4>
          <ul className={styles.iconList}>
            <li>
              <MapPin size={16} />
              <span>{company.address}</span>
            </li>
            <li>
              <Clock size={16} />
              <span>{company.distanceFromKigali}</span>
            </li>
          </ul>
          <a
            href={company.mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.directionsLink}
          >
            <Navigation size={14} />
            Get Directions
          </a>
        </div>

        <div className={styles.col}>
          <h4 className={styles.colTitle}>Contact</h4>
          <ul className={styles.iconList}>
            <li>
              <Phone size={16} />
              <span>{company.phone}</span>
            </li>
            <li>
              <Mail size={16} />
              <span>{company.email}</span>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={`container ${styles.bottomInner}`}>
          <p>
            &copy; {new Date().getFullYear()} {company.name || BRAND.name}. All Rights Reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
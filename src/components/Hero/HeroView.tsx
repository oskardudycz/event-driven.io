import React, { type ReactNode } from 'react';
import { FaArrowDown } from 'react-icons/fa';
import * as styles from './Hero.module.css';

type HeroViewProps = {
  heading: ReactNode;
  lead: ReactNode;
  biography?: ReactNode;
  services: ReactNode;
  servicesLabel: string;
  portrait: ReactNode;
  articlesLabel: string;
  onArticlesClick: () => void;
};

export default function HeroView({
  heading,
  lead,
  biography,
  services,
  servicesLabel,
  portrait,
  articlesLabel,
  onArticlesClick,
}: HeroViewProps) {
  return (
    <section className={`hero ${styles.hero}`}>
      <div className={styles.composition}>
        <div className={styles.copy}>
          <div className={styles.introduction}>
            <h1 className={styles.heading}>{heading}</h1>
            <p className={styles.subheading}>{lead}</p>
          </div>
          {biography && <div className={styles.biography}>{biography}</div>}
          <nav className={styles.services} aria-label={servicesLabel}>
            {services}
          </nav>

          <button
            onClick={onArticlesClick}
            aria-label={articlesLabel}
            className={styles.elementButton}
          >
            <span className={styles.articlesLabel}>{articlesLabel}</span>
            <span className={styles.arrowCircle}>
              <FaArrowDown />
            </span>
          </button>
        </div>
        <div className={styles.artwork} aria-hidden="true">
          {portrait}
        </div>
      </div>
    </section>
  );
}

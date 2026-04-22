"use client";

import Image from "next/image";
import styles from "./SimpleProfileCard.module.css";

interface SimpleProfileCardProps {
  onContactClick?: () => void;
}

export default function SimpleProfileCard({ onContactClick }: SimpleProfileCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.imageWrap}>
        <Image
          src="/portfolio.png"
          alt="Bernard Mutambo"
          width={800}
          height={1000}
          className={styles.image}
          sizes="(max-width: 1023px) 90vw, 340px"
          priority
        />
      </div>
      <div className={styles.body}>
        <h3 className={styles.name}>Bernard Mutambo</h3>
        <p className={styles.role}>Software Developer</p>
        <p className={styles.meta}>Available for work</p>
        <button type="button" className={styles.cta} onClick={onContactClick}>
          <span className={styles.ctaLabel}>Contact me</span>
          <span className={styles.drips} aria-hidden>
            <span className={`${styles.drip} ${styles.drip1}`} />
            <span className={`${styles.drip} ${styles.drip2}`} />
            <span className={`${styles.drip} ${styles.drip3}`} />
            <span className={`${styles.drip} ${styles.drip4}`} />
          </span>
        </button>
      </div>
    </article>
  );
}

"use client";

import styles from "./Logo.module.css";

export default function Logo({ showText = true, className = "" }) {
  return (
    <div className={`${styles.logo} ${className}`} aria-label="SportSee">
      <span className={styles.bars} aria-hidden="true">
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
      </span>

      {showText ? <span className={styles.word}>SportSee</span> : null}
    </div>
  );
}
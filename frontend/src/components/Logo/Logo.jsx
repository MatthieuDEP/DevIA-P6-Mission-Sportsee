import styles from "./Logo.module.css";

export default function Logo() {
  return (
    <div className={styles.logo} aria-label="SportSee">
      <span className={styles.mark} aria-hidden="true">
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
        <span className={styles.bar} />
      </span>
      <span className={styles.word}>SPORTSEE</span>
    </div>
  );
}
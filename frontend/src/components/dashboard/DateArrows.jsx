import styles from "./DateArrows.module.css";

export default function DateArrows({ label, onPrev, onNext }) {
  return (
    <div className={styles.wrap} aria-label="Navigation dans le temps">
      <button type="button" className={styles.btn} onClick={onPrev} aria-label="Période précédente">
        ‹
      </button>
      <span className={styles.label}>{label}</span>
      <button type="button" className={styles.btn} onClick={onNext} aria-label="Période suivante">
        ›
      </button>
    </div>
  );
}
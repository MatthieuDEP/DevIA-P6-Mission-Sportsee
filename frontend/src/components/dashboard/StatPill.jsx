import styles from "./StatPill.module.css";

export default function StatPill({ label, value, unit }) {
  return (
    <div className={styles.pill}>
      <p className={styles.value}>
        {value}
        {unit ? <span className={styles.unit}>{unit}</span> : null}
      </p>
      <p className={styles.label}>{label}</p>
    </div>
  );
}
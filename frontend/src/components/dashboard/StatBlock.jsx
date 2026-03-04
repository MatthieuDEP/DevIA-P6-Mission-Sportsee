import styles from "./StatBlock.module.css";

export default function StatBlock({ title, value, unit, tone = "blue" }) {
  return (
    <div className={styles.card}>
      <p className={styles.title}>{title}</p>
      <p className={styles.value} data-tone={tone}>
        {value} <span className={styles.unit}>{unit}</span>
      </p>
    </div>
  );
}
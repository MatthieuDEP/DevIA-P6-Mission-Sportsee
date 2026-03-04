import styles from "./CoachPrompt.module.css";

export default function CoachPrompt() {
  return (
    <section className={styles.card}>
      <div className={styles.left}>
        <span className={styles.icon} aria-hidden="true">✦</span>
        <p className={styles.text}>
          Posez vos questions sur votre programme, vos performances ou vos objectifs.
        </p>
      </div>

      <a className={styles.btn} href="#">
        Lancer une conversation
      </a>
    </section>
  );
}
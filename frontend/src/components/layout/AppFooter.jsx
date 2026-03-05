import Logo from "@/components/Logo/Logo";
import styles from "./AppFooter.module.css";

export default function AppFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <p className={styles.left}>©Sportsee &nbsp; Tous droits réservés</p>

        <div className={styles.right}>
          <a className={styles.link} href="#">
            Conditions générales
          </a>

          <a className={styles.link} href="#">
            Contact
          </a>

          <div className={styles.logo}>
            <Logo showText={false} />
          </div>
        </div>
      </div>
    </footer>
  );
}
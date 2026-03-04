import Link from "next/link";
import { ROUTES } from "@/config/routes";
import Logo from "@/components/Logo/Logo";
import styles from "./PublicHeader.module.css";

export default function PublicHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Logo />
        <Link className={styles.link} href={ROUTES.LOGIN}>
          Connexion
        </Link>
      </div>
    </header>
  );
}
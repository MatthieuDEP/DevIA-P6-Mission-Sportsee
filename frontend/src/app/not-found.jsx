import Link from "next/link";
import styles from "./not-found.module.css";
import { ROUTES } from "@/config/routes";

export default function NotFound() {
  return (
    <div className={styles.page}>
      <h1 className={styles.code}>404</h1>
      <p className={styles.text}>Page introuvable</p>

      <Link href={ROUTES.LOGIN} className={styles.link}>
        Retour à la connexion
      </Link>
    </div>
  );
}
"use client";

import { useRouter } from "next/navigation";
import styles from "./LogoutButton.module.css";
import { ROUTES } from "@/config/routes";

export default function LogoutButton() {
  const router = useRouter();

  async function onLogout() {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
    } finally {
      router.push(ROUTES.LOGIN);
      router.refresh();
    }
  }

  return (
    <button type="button" className={styles.linkBtn} onClick={onLogout}>
      Se déconnecter
    </button>
  );
}
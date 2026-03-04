"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./AppHeader.module.css";
import { ROUTES } from "@/config/routes";
import LogoutButton from "@/components/LogoutButton/LogoutButton";
import Logo from "@/components/Logo/Logo";

function NavItem({ href, children }) {
  const pathname = usePathname();
  const active = pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <Link href={href} className={`${styles.navLink} ${active ? styles.active : ""}`}>
      {children}
    </Link>
  );
}

export default function AppHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Logo />

        <div className={styles.menuPill} role="navigation" aria-label="Navigation principale">
          <NavItem href={ROUTES.DASHBOARD}>Dashboard</NavItem>
          <NavItem href={ROUTES.COACH_AI}>Coach AI</NavItem>
          <NavItem href={ROUTES.PROFILE}>Mon profil</NavItem>

          <span className={styles.separator} aria-hidden="true" />

          <LogoutButton />
        </div>
      </div>
    </header>
  );
}
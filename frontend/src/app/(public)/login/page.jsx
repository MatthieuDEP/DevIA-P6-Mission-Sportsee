"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "@/config/routes";
import Logo from "@/components/Logo/Logo";
import styles from "./Login.module.css";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || ROUTES.DASHBOARD;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [formError, setFormError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setFormError("");

    const res = await fetch("/api/auth/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username: email, password }),
    });

    if (!res.ok) {
      setFormError("Identifiants invalides");
      return;
    }

    router.push(next);
    router.refresh();
  }

  return (
    <div className={styles.page}>
      <section className={styles.left}>
        <div className={styles.logoWrap}>
          <Logo />
        </div>

        <div className={styles.card}>
          <h1 className={styles.heroTitle}>
            Transformez
            <br />
            vos stats en résultats
          </h1>

          <h2 className={styles.formTitle}>Se connecter</h2>

          <form className={styles.form} onSubmit={onSubmit}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="email">
                Adresse email
              </label>
              <input
                id="email"
                className={styles.input}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor="password">
                Mot de passe
              </label>
              <input
                id="password"
                className={styles.input}
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            {formError ? <p className={styles.error}>{formError}</p> : null}

            <button className={styles.button} type="submit">
              Se connecter
            </button>

            <a className={styles.forgot} href="#">
              Mot de passe oublié ?
            </a>
          </form>
        </div>
      </section>

      <section className={styles.right} aria-label="Illustration">
        <div className={styles.bubble}>
          <p className={styles.bubbleText}>
            Analysez vos performances en un clin d’œil,
            <br />
            suivez vos progrès et atteignez vos objectifs.
          </p>
        </div>
      </section>
    </div>
  );
}
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "@/config/routes";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || ROUTES.DASHBOARD;

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  async function onSubmit(e) {
    e.preventDefault();

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      alert("Identifiants invalides");
      return;
    }

    router.push(next);
  }

  return (
    <main>
      <h1>Connexion</h1>

      <form onSubmit={onSubmit}>
        <div>
          <label htmlFor="username">Utilisateur</label>
          <input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
          />
        </div>

        <div>
          <label htmlFor="password">Mot de passe</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        <button type="submit">Se connecter</button>
      </form>
    </main>
  );
}

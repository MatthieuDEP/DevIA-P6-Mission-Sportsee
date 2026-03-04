"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function refreshUser() {
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/user", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) {
        setUser(null);
        return;
      }

      const data = await res.json();
      setUser(data?.user || null);
    } catch {
      setUser(null);
      setError("Impossible de récupérer l'utilisateur.");
    } finally {
      setLoading(false);
    }
  }

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    setUser(null);
  }

  useEffect(() => {
    refreshUser();
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      error,
      refreshUser,
      logout,
    }),
    [user, loading, error]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp doit être utilisé dans <AppProvider />");
  return ctx;
}
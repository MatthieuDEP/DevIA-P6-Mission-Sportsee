"use client";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes";

export default function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push(ROUTES.LOGIN);
  }

  return <button onClick={logout}>Se déconnecter</button>;
}
"use client";

import { useRouter } from "next/navigation";
import { ROUTES } from "@/config/routes";
import { useApp } from "@/context/AppContext";

export default function LogoutButton() {
  const router = useRouter();
  const { logout } = useApp();

  async function onLogout() {
    await logout();
    router.push(ROUTES.LOGIN);
  }

  return <button onClick={onLogout}>Se déconnecter</button>;
}
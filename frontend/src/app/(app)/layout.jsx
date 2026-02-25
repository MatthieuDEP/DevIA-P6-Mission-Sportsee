import Link from "next/link";
import { ROUTES } from "@/config/routes";
import LogoutButton from "./LogoutButton";
import { AppProvider } from "@/context/AppContext";

export default function AppLayout({ children }) {
  return (
    <AppProvider>
      <header>
        <nav>
          <Link href={ROUTES.DASHBOARD}>Dashboard</Link>
          <Link href={ROUTES.COACH_AI}>Coach AI</Link>
          <Link href={ROUTES.PROFILE}>Mon profil</Link>
          <LogoutButton />
        </nav>
      </header>

      <main>{children}</main>

      <footer>
        <p>SportSee</p>
      </footer>
    </AppProvider>
  );
}
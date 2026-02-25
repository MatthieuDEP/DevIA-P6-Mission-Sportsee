import Link from "next/link";
import { ROUTES } from "@/config/routes";

export default function NotFound() {
  return (
    <main>
      <h1>404 - Page introuvable</h1>
      <Link href={ROUTES.LOGIN}>Retour à la connexion</Link>
    </main>
  );
}
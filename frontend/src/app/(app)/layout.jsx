import { AppProvider } from "@/context/AppContext";
import AppHeader from "@/components/layout/AppHeader";
import AppFooter from "@/components/layout/AppFooter";
import styles from "@/components/layout/AppShell.module.css";

export default function AppLayout({ children }) {
  return (
    <AppProvider>
      <div className={styles.shell}>
        <AppHeader />
        <main className={styles.main}>
          <div className={styles.mainInner}>{children}</div>
        </main>
        <AppFooter />
      </div>
    </AppProvider>
  );
}
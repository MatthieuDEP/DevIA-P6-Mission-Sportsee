import "./globals.css";

export const metadata = {
  title: "SportSee",
  description: "Application SportSee",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        {children}
      </body>
    </html>
  );
}
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "latin-ext"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "Terminy - Zarządzanie Nieruchomościami",
  description: "Aplikacja do zarządzania terminami i rezerwacjami nieruchomości.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="pl" className={inter.variable}>
      <body>{children}</body>
    </html>
  );
}

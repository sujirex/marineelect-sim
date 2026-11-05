import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "../context/ThemeContext";

export const metadata: Metadata = {
  title: "MarineElect Simulation Engine",
  description: "Ship maneuvering, propulsion, and electrical simulation for marine engineers",
  authors: [{ name: "Suji Kumar C", url: "https://sujikumar.com" }],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeProvider>
          {children}
        <div style={{ display: "flex", justifyContent: "center", padding: "16px 12px 20px" }}>
          <a
            href="https://sujikumar.com/"
            rel="author"
            title="Built by Suji Kumar C — Digital Maritime Engineer"
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "5px 12px 5px 5px", borderRadius: 999, color: "inherit", opacity: 0.78, textDecoration: "none", border: "1px solid rgba(148,163,184,.35)", font: '500 12px/1.4 system-ui, -apple-system, "Segoe UI", Roboto, sans-serif' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/ss-emblem.svg" alt="" width={20} height={20} style={{ borderRadius: 5, display: "block" }} />
            <span>Built by <b>Suji Kumar C</b> · sujikumar.com</span>
          </a>
        </div>
        </ThemeProvider>
      </body>
    </html>
  );
}

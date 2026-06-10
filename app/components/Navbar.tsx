"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

const LINKS = [
  { href: "/maneuvering", label: "Maneuvering" },
  { href: "/propulsion",  label: "Propulsion" },
  { href: "/electrical",  label: "Electrical Load" },
]

export default function Navbar() {
  const path = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <nav style={{
      background: "rgba(10,22,40,0.95)",
      borderBottom: "1px solid rgba(0,191,255,0.12)",
      backdropFilter: "blur(16px)",
      position: "sticky", top: 0, zIndex: 50
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", height: 60, gap: 16 }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: "1.4rem" }}>⚓</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "#e8edf5", lineHeight: 1.2 }}>MarineElect</div>
            <div style={{ fontSize: "0.65rem", color: "#00bfff", letterSpacing: "0.08em", lineHeight: 1 }}>SIMULATION ENGINE</div>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="nav-links-desktop" style={{ display: "flex", gap: 4, flex: 1 }}>
          {LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={`nav-link${path === href ? " active" : ""}`}
              style={{ padding: "6px 14px", borderRadius: 6, background: path === href ? "rgba(0,191,255,0.1)" : "transparent" }}>
              {label}
            </Link>
          ))}
        </div>

        {/* Powered badge — hide on mobile */}
        <span className="powered-badge nav-powered-desktop">⚙️ Powered by ShipSIM</span>

        {/* Hamburger — mobile only */}
        <button
          className="nav-hamburger"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
          style={{
            display: "none",
            marginLeft: "auto",
            background: "none", border: "1px solid rgba(0,191,255,0.25)",
            borderRadius: 6, padding: "6px 10px", cursor: "pointer",
            color: "#e8edf5", fontSize: 18, lineHeight: 1,
          }}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {open && (
        <div className="nav-mobile-menu" style={{
          background: "rgba(10,22,40,0.98)",
          borderTop: "1px solid rgba(0,191,255,0.12)",
          padding: "8px 16px 12px",
        }}>
          {LINKS.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={`nav-link${path === href ? " active" : ""}`}
              style={{
                display: "block", padding: "10px 12px", borderRadius: 6,
                background: path === href ? "rgba(0,191,255,0.1)" : "transparent",
                marginBottom: 4,
              }}>
              {label}
            </Link>
          ))}
          <div style={{ paddingTop: 8, borderTop: "1px solid rgba(0,191,255,0.1)", marginTop: 4 }}>
            <span className="powered-badge">⚙️ Powered by ShipSIM</span>
          </div>
        </div>
      )}

      <style>{`
        @media (max-width: 640px) {
          .nav-links-desktop { display: none !important; }
          .nav-powered-desktop { display: none !important; }
          .nav-hamburger { display: block !important; }
        }
      `}</style>
    </nav>
  )
}

"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTheme } from "../../context/ThemeContext"

function SunIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/>
      <line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/>
      <line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/>
      <line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/>
    </svg>
  )
}
function MoonIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

const LINKS = [
  { href: "/maneuvering", label: "Maneuvering" },
  { href: "/propulsion",  label: "Propulsion" },
  { href: "/electrical",  label: "Electrical Load" },
]

export default function Navbar() {
  const path = usePathname()
  const [open, setOpen] = useState(false)
  const { theme, toggle } = useTheme()

  return (
    <nav style={{
      background: "color-mix(in srgb, var(--navy) 95%, transparent)",
      borderBottom: "1px solid var(--border)",
      backdropFilter: "blur(16px)",
      position: "sticky", top: 0, zIndex: 50
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", display: "flex", alignItems: "center", height: 60, gap: 16 }}>
        {/* Logo */}
        <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
          <span style={{ fontSize: "1.4rem" }}>⚓</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)", lineHeight: 1.2 }}>MarineElect</div>
            <div style={{ fontSize: "0.65rem", color: "var(--cyan)", letterSpacing: "0.08em", lineHeight: 1 }}>SIMULATION ENGINE</div>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="nav-links-desktop" style={{ display: "flex", gap: 4, flex: 1 }}>
          {LINKS.map(({ href, label }) => (
            <Link key={href} href={href} className={`nav-link${path === href ? " active" : ""}`}
              style={{ padding: "6px 14px", borderRadius: 6, background: path === href ? "rgba(10,150,150,0.15)" : "transparent" }}>
              {label}
            </Link>
          ))}
        </div>

        {/* Powered badge — hide on mobile */}
        <span className="powered-badge nav-powered-desktop">⚙️ Powered by ShipSIM</span>

        {/* Theme toggle */}
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          style={{
            background: "none", border: "none", cursor: "pointer",
            color: "var(--text-muted)", padding: "6px 8px", display: "flex", alignItems: "center",
          }}
        >
          {theme === "light" ? <MoonIcon /> : <SunIcon />}
        </button>

        {/* Hamburger — mobile only */}
        <button
          className="nav-hamburger"
          onClick={() => setOpen(o => !o)}
          aria-label="Toggle menu"
          style={{
            display: "none",
            marginLeft: "auto",
            background: "none", border: "1px solid var(--border)",
            borderRadius: 6, padding: "6px 10px", cursor: "pointer",
            color: "var(--text)", fontSize: 18, lineHeight: 1,
          }}
        >
          {open ? "✕" : "☰"}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {open && (
        <div className="nav-mobile-menu" style={{
          background: "color-mix(in srgb, var(--navy) 98%, transparent)",
          borderTop: "1px solid var(--border)",
          padding: "8px 16px 12px",
        }}>
          {LINKS.map(({ href, label }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)}
              className={`nav-link${path === href ? " active" : ""}`}
              style={{
                display: "block", padding: "10px 12px", borderRadius: 6,
                background: path === href ? "rgba(10,150,150,0.15)" : "transparent",
      
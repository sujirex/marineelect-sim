"use client"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Compass, Fan, Zap, Sun, Moon, Menu, X } from "lucide-react"
import { useTheme } from "../../context/ThemeContext"

const LINKS = [
  { href: "/maneuvering", label: "Maneuvering", icon: Compass },
  { href: "/propulsion",  label: "Propulsion", icon: Fan },
  { href: "/electrical",  label: "Electrical Load", icon: Zap },
]

export default function Navbar() {
  const raw = usePathname()
  const path = raw.length > 1 ? raw.replace(/\/$/, "") : raw
  const [open, setOpen] = useState(false)
  const { theme, toggle } = useTheme()

  return (
    <nav className="sim-nav">
      <div className="sim-nav-bar">
        <Link href="/" className="sim-brand" aria-label="MarineElect Simulation Engine home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/ss-emblem.svg" alt="" width={36} height={36} />
          <span>
            <b>MarineElect</b>
            <small>Simulation engine</small>
          </span>
        </Link>

        <div className="nav-links-desktop">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} className={`nav-link${path === href ? " active" : ""}`}>
              <Icon size={14} /> {label}
            </Link>
          ))}
        </div>

        <button onClick={toggle} className="icon-btn" style={{ marginLeft: "auto" }} aria-label={theme === "light" ? "Switch to dark mode" : "Switch to light mode"}>
          {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
        </button>
        <button className="icon-btn nav-hamburger" onClick={() => setOpen(o => !o)} aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open}>
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {open && (
        <div className="nav-mobile-menu">
          {LINKS.map(({ href, label, icon: Icon }) => (
            <Link key={href} href={href} onClick={() => setOpen(false)} className={`nav-link${path === href ? " active" : ""}`}>
              <Icon size={15} /> {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  )
}

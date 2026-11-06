"use client"
import Navbar from "./components/Navbar"
import Link from "next/link"
import { Compass, Fan, Zap, Play, ArrowRight } from "lucide-react"
import type { CSSProperties } from "react"

const modules = [
  {
    href: "/maneuvering",
    icon: Compass,
    title: "Maneuvering Simulation",
    desc: "Zig-zag maneuver, turning circle, crash-stop. Configure vessel parameters and simulate IMO standard sea trials.",
    color: "var(--g2)",
    tags: ["ZigZag 10/10", "Turning Circle", "Autopilot", "MMG Model"],
    stat: "6-DoF dynamics"
  },
  {
    href: "/propulsion",
    icon: Fan,
    title: "Propulsion Analysis",
    desc: "Wageningen B-series propeller performance curves. KT/KQ charts, efficiency maps, thrust and torque vs advance ratio.",
    color: "var(--g3)",
    tags: ["B-Series Propeller", "KT/KQ Curves", "Efficiency Map", "4-Quadrant"],
    stat: "14 propeller series"
  },
  {
    href: "/electrical",
    icon: Zap,
    title: "Electrical Load Analysis",
    desc: "Ship electrical plant simulation. Generator sizing, load balance, power factor, switchboard demand analysis.",
    color: "var(--spark)",
    tags: ["Generator Sizing", "Load Balance", "Power Factor", "Bus Analysis"],
    stat: "IMO compliant"
  },
]

export default function Home() {
  return (
    <div>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>

        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 64, paddingTop: 8 }}>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>
            <span className="gradient-text">MarineElect</span>
            <br />
            <span style={{ color: "var(--text-strong)" }}>Simulation Engine</span>
          </h1>
          <p style={{ color: "var(--text-dim)", fontSize: "1.1rem", maxWidth: 580, margin: "0 auto 32px" }}>
            Ship maneuvering, propulsion, and electrical simulation for marine engineers.
            Real physics, real engineering.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/maneuvering"><button className="btn-primary"><Play size={15} /> Run Simulation</button></Link>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 56 }}>
          {[
            { v: "6-DoF", l: "Ship Dynamics" },
            { v: "14", l: "Propeller Series" },
            { v: "MMG", l: "Maneuver Model" },
            { v: "FMI 2.0", l: "Export Format" },
            { v: "BSD-3", l: "Open Source" },
          ].map(({ v, l }) => (
            <div key={l} className="stat-card" style={{ textAlign: "center" }}>
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--ink)", letterSpacing: "-.03em" }}>{v}</div>
              <div style={{ fontSize: "0.8rem", color: "var(--text-dim)", marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Module cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          {modules.map(({ href, icon: Icon, title, desc, color, tags, stat }) => (
            <Link key={href} href={href} style={{ textDecoration: "none" }}>
              <div className="glass mod-card" style={{ padding: 28, height: "100%", cursor: "pointer", ["--mod-c" as string]: color } as CSSProperties}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 14 }}>
                  <span className="mod-icon"><Icon size={22} /></span>
                  <div>
                    <h3 style={{ fontWeight: 650, fontSize: "1rem", color: "var(--ink)" }}>{title}</h3>
                    <span style={{ fontSize: "0.72rem", color, fontWeight: 600, fontFamily: "var(--mono)", letterSpacing: ".04em" }}>{stat}</span>
                  </div>
                </div>
                <p style={{ color: "var(--muted)", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: 16 }}>{desc}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {tags.map(t => <span key={t} className="tag" style={{ ["--tag-c" as string]: color } as CSSProperties}>{t}</span>)}
                </div>
                <div style={{ marginTop: 20, color, fontWeight: 600, fontSize: "0.85rem", display: "inline-flex", alignItems: "center", gap: 6 }}>Launch <ArrowRight size={14} /></div>
              </div>
            </Link>
          ))}
        </div>

      </main>
    </div>
  )
}

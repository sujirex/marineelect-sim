"use client"
import Navbar from "./components/Navbar"
import Link from "next/link"

const modules = [
  {
    href: "/maneuvering",
    icon: "🧭",
    title: "Maneuvering Simulation",
    desc: "Zig-zag maneuver, turning circle, crash-stop. Configure vessel parameters and simulate IMO standard sea trials.",
    color: "#0066cc",
    tags: ["ZigZag 10/10", "Turning Circle", "Autopilot", "MMG Model"],
    stat: "6-DoF dynamics"
  },
  {
    href: "/propulsion",
    icon: "🔩",
    title: "Propulsion Analysis",
    desc: "Wageningen B-series propeller performance curves. KT/KQ charts, efficiency maps, thrust and torque vs advance ratio.",
    color: "#00d4aa",
    tags: ["B-Series Propeller", "KT/KQ Curves", "Efficiency Map", "4-Quadrant"],
    stat: "14 propeller series"
  },
  {
    href: "/electrical",
    icon: "⚡",
    title: "Electrical Load Analysis",
    desc: "Ship electrical plant simulation. Generator sizing, load balance, power factor, switchboard demand analysis.",
    color: "#f59e0b",
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
        <div style={{ textAlign: "center", marginBottom: 64 }}>
          <div className="powered-badge" style={{ marginBottom: 20, display: "inline-flex" }}>
            ⚙️ Physics Engine: ShipSIM v2.0.0 · BSD-3-Clause · BasilioPV/ShipSIM
          </div>
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.2rem)", fontWeight: 800, lineHeight: 1.15, marginBottom: 16 }}>
            <span className="gradient-text">MarineElect</span>
            <br />
            <span style={{ color: "#e8edf5" }}>Simulation Engine</span>
          </h1>
          <p style={{ color: "#8fa3be", fontSize: "1.1rem", maxWidth: 580, margin: "0 auto 32px" }}>
            Ship maneuvering, propulsion, and electrical simulation for marine engineers.
            Real physics — powered by the ShipSIM Modelica library.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/maneuvering"><button className="btn-primary">▶ Run Simulation</button></Link>
            <a href="https://github.com/BasilioPV/ShipSIM" target="_blank" rel="noopener noreferrer">
              <button className="btn-outline">ShipSIM Source →</button>
            </a>
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
              <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#00bfff" }}>{v}</div>
              <div style={{ fontSize: "0.8rem", color: "#8fa3be", marginTop: 4 }}>{l}</div>
            </div>
          ))}
        </div>

        {/* Module cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 24 }}>
          {modules.map(({ href, icon, title, desc, color, tags, stat }) => (
            <Link key={href} href={href} style={{ textDecoration: "none" }}>
              <div className="glass" style={{ padding: 28, height: "100%", transition: "transform 0.2s, border-color 0.2s", cursor: "pointer" }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(-4px)"; (e.currentTarget as HTMLDivElement).style.borderColor = color + "55"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,191,255,0.15)"; }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <span style={{ fontSize: "2rem", background: color + "22", padding: "8px 10px", borderRadius: 10 }}>{icon}</span>
                  <div>
                    <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "#e8edf5" }}>{title}</h3>
                    <span style={{ fontSize: "0.72rem", color, fontWeight: 600 }}>{stat}</span>
                  </div>
                </div>
                <p style={{ color: "#8fa3be", fontSize: "0.875rem", lineHeight: 1.6, marginBottom: 16 }}>{desc}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {tags.map(t => <span key={t} className="tag" style={{ borderColor: color + "40", color }}>{t}</span>)}
                </div>
                <div style={{ marginTop: 20, color, fontWeight: 600, fontSize: "0.85rem" }}>Launch →</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Attribution */}
        <div className="glass" style={{ marginTop: 56, padding: "20px 28px", display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <span style={{ fontSize: "1.5rem" }}>⚙️</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, color: "#e8edf5", fontSize: "0.9rem" }}>Physics Engine Attribution</div>
            <div style={{ color: "#8fa3be", fontSize: "0.82rem", marginTop: 3 }}>
              Simulation physics provided by{" "}
              <a href="https://github.com/BasilioPV/ShipSIM" target="_blank" rel="noopener noreferrer"
                style={{ color: "#00d4aa", textDecoration: "none" }}>ShipSIM</a>
              {" "}by Basilio Puente Varela & M. Dolores Fernandez Ballesteros · Licensed BSD-3-Clause ·
              MarineElect integration layer by{" "}
              <a href="https://sujikumar.com" target="_blank" rel="noopener noreferrer"
                style={{ color: "#00bfff", textDecoration: "none" }}>Suji C</a>
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}

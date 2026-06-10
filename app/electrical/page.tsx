"use client"
import { useState, useMemo } from "react"
import { useIsMobile } from "../hooks/useIsMobile"
import Navbar from "../components/Navbar"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface Load { name: string; kW: number; pf: number; qty: number; running: boolean }

const DEFAULT_LOADS: Load[] = [
  { name: "Main Propulsion Motor", kW: 8500, pf: 0.88, qty: 1, running: true },
  { name: "Bow Thruster",          kW: 1200, pf: 0.85, qty: 1, running: false },
  { name: "HVAC – Accommodation",  kW: 320,  pf: 0.82, qty: 2, running: true },
  { name: "Cargo Pumps",           kW: 450,  pf: 0.87, qty: 3, running: false },
  { name: "Fire & GS Pump",        kW: 75,   pf: 0.83, qty: 2, running: true },
  { name: "Navigation Instruments",kW: 12,   pf: 0.95, qty: 1, running: true },
  { name: "Lighting & Sockets",    kW: 85,   pf: 0.90, qty: 1, running: true },
  { name: "Galley Equipment",      kW: 45,   pf: 0.92, qty: 1, running: true },
  { name: "Compressors",           kW: 110,  pf: 0.84, qty: 2, running: true },
  { name: "Sewage Treatment",      kW: 18,   pf: 0.80, qty: 1, running: true },
]

const GEN_SIZES = [500, 750, 1000, 1250, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 8000, 10000]
const COLORS = ["#00bfff","#00d4aa","#f59e0b","#a78bfa","#ef4444","#10b981","#f97316","#6366f1","#14b8a6","#e879f9"]

const inputStyle: React.CSSProperties = {
  background: "rgba(0,191,255,0.07)",
  border: "1px solid rgba(0,191,255,0.2)",
  borderRadius: 5,
  color: "#e8edf5",
  fontSize: "0.82rem",
  padding: "3px 6px",
  width: "100%",
  outline: "none",
}

function calcLoads(loads: Load[]) {
  let totalKW = 0, totalKVA = 0
  loads.filter(l => l.running).forEach(l => {
    const kw = l.kW * l.qty
    totalKW += kw
    totalKVA += kw / l.pf
  })
  const avgPF = totalKVA > 0 ? totalKW / totalKVA : 0
  const demandKW = totalKW * 0.85
  const demandKVA = totalKVA * 0.85
  const genRequired = demandKVA / 0.75
  const recommended = GEN_SIZES.find(s => s >= genRequired) || GEN_SIZES[GEN_SIZES.length - 1]
  return {
    totalKW: Math.round(totalKW), totalKVA: Math.round(totalKVA),
    avgPF: Math.round(avgPF * 100) / 100,
    demandKW: Math.round(demandKW), demandKVA: Math.round(demandKVA),
    recommended,
  }
}

export default function ElectricalPage() {
  const isMobile = useIsMobile()
  const [loads, setLoads] = useState<Load[]>(DEFAULT_LOADS)
  const [voltage, setVoltage] = useState(440)
  const [ran, setRan] = useState(false)

  // rawInputs stores in-progress string values while user is typing
  // key: `${rowIndex}-${field}` — cleared on blur after validation
  const [rawInputs, setRawInputs] = useState<Record<string, string>>({})

  const result = useMemo(() => ran ? calcLoads(loads) : null, [ran, loads])

  const updateLoad = (i: number, field: keyof Load, raw: string) => {
    setRan(false)
    setLoads(ls => ls.map((l, idx) => {
      if (idx !== i) return l
      if (field === "name") return { ...l, name: raw }
      if (field === "pf") {
        const v = parseFloat(raw)
        return { ...l, pf: isNaN(v) ? l.pf : Math.min(1, Math.max(0.01, v)) }
      }
      if (field === "qty") {
        const v = parseInt(raw)
        return { ...l, qty: isNaN(v) ? l.qty : Math.max(1, v) }
      }
      if (field === "kW") {
        const v = parseFloat(raw)
        return { ...l, kW: isNaN(v) ? l.kW : Math.max(0, v) }
      }
      return l
    }))
  }

  // Get display value: raw string while editing, otherwise numeric value
  const getRaw = (i: number, field: string, numVal: number) =>
    rawInputs[`${i}-${field}`] ?? String(numVal)

  // Called on every keystroke — just stores the raw string, no validation
  const handleChange = (i: number, field: string, raw: string) => {
    setRawInputs(prev => ({ ...prev, [`${i}-${field}`]: raw }))
    setRan(false)
  }

  // Called when input loses focus — validates and commits to loads, clears raw
  const handleBlur = (i: number, field: keyof Load) => {
    const raw = rawInputs[`${i}-${field}`]
    if (raw !== undefined) {
      setRawInputs(prev => { const n = { ...prev }; delete n[`${i}-${field}`]; return n })
      updateLoad(i, field, raw)
    }
  }

  const toggleRunning = (i: number) => setLoads(ls => ls.map((l, idx) => idx === i ? { ...l, running: !l.running } : l))

  const addRow = () => {
    setRawInputs({})
    setRan(false)
    setLoads(ls => [...ls, { name: "New Consumer", kW: 100, pf: 0.85, qty: 1, running: true }])
  }

  const deleteRow = (i: number) => {
    setRan(false)
    setLoads(ls => ls.filter((_, idx) => idx !== i))
  }

  const resetDefaults = () => { setLoads(DEFAULT_LOADS); setRawInputs({}); setRan(false) }

  const barData = loads.filter(l => l.running).map(l => ({
    name: l.name.length > 20 ? l.name.slice(0, 18) + "…" : l.name,
    kW: l.kW * l.qty,
    kVAR: Math.round(l.kW * l.qty * Math.tan(Math.acos(l.pf)))
  }))

  const pieData = loads.filter(l => l.running).map(l => ({
    name: l.name.length > 22 ? l.name.slice(0, 20) + "…" : l.name,
    value: l.kW * l.qty
  }))

  return (
    <div>
      <Navbar />
      <main style={{ maxWidth: 1280, margin: "0 auto", padding: isMobile ? "24px 16px" : "40px 24px" }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: isMobile ? "1.4rem" : "1.8rem", fontWeight: 800, marginBottom: 6 }}>
            <span className="gradient-text">Electrical Load Analysis</span>
          </h1>
          <p style={{ color: "#8fa3be", fontSize: "0.9rem" }}>
            Ship electrical plant simulation · Generator sizing · Load balance · IMO compliant analysis
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 340px", gap: 20, alignItems: "start" }}>
          {/* Load table */}
          <div className="glass" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
              <h3 style={{ fontWeight: 700, fontSize: "0.95rem", color: "#f59e0b" }}>⚡ Electrical Consumers</h3>
              <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                <label style={{ fontSize: "0.8rem", color: "#8fa3be" }}>Bus Voltage:</label>
                <select value={voltage} onChange={e => setVoltage(+e.target.value)}
                  className="input-field" style={{ width: 90, padding: "5px 8px" }}>
                  {[220, 380, 440, 660, 6600, 11000].map(v => <option key={v} value={v}>{v}V</option>)}
                </select>
                <button onClick={resetDefaults}
                  style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, color: "#8fa3be", fontSize: "0.75rem", padding: "5px 12px", cursor: "pointer" }}>
                  Reset Defaults
                </button>
              </div>
            </div>

            <p style={{ fontSize: "0.75rem", color: "#4a6080", marginBottom: 12 }}>
              ✏️ Click any kW, PF, or Qty cell to edit · Toggle ON/OFF · Add or remove rows as needed
            </p>

            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.82rem" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(0,191,255,0.15)" }}>
                    {["Consumer", "kW", "PF", "Qty", "kVA", "Running", ""].map(h => (
                      <th key={h} style={{ padding: "8px 10px", textAlign: "left", color: "#8fa3be", fontWeight: 600, whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loads.map((l, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", background: l.running ? "rgba(0,191,255,0.03)" : "transparent" }}>
                      <td style={{ padding: "7px 10px", minWidth: 160 }}>
                        <input
                          value={l.name}
                          onChange={e => updateLoad(i, "name", e.target.value)}
                          style={{ ...inputStyle, width: "100%", minWidth: 150 }}
                        />
                      </td>
                      <td style={{ padding: "7px 10px", minWidth: 80 }}>
                        <input
                          type="text" inputMode="decimal"
                          value={getRaw(i, "kW", l.kW)}
                          onChange={e => handleChange(i, "kW", e.target.value)}
                          onBlur={() => handleBlur(i, "kW")}
                          style={{ ...inputStyle, color: l.running ? "#00bfff" : "#4a6080" }}
                        />
                      </td>
                      <td style={{ padding: "7px 10px", minWidth: 70 }}>
                        <input
                          type="text" inputMode="decimal"
                          value={getRaw(i, "pf", l.pf)}
                          onChange={e => handleChange(i, "pf", e.target.value)}
                          onBlur={() => handleBlur(i, "pf")}
                          style={inputStyle}
                        />
                      </td>
                      <td style={{ padding: "7px 10px", minWidth: 60 }}>
                        <input
                          type="text" inputMode="numeric"
                          value={getRaw(i, "qty", l.qty)}
                          onChange={e => handleChange(i, "qty", e.target.value)}
                          onBlur={() => handleBlur(i, "qty")}
                          style={inputStyle}
                        />
                      </td>
                      <td style={{ padding: "7px 10px", color: "#8fa3be", whiteSpace: "nowrap" }}>
                        {Math.round(l.kW * l.qty / l.pf).toLocaleString()}
                      </td>
                      <td style={{ padding: "7px 10px" }}>
                        <button onClick={() => toggleRunning(i)}
                          style={{ background: l.running ? "rgba(0,212,170,0.15)" : "rgba(255,255,255,0.05)", border: `1px solid ${l.running ? "rgba(0,212,170,0.4)" : "rgba(255,255,255,0.1)"}`, borderRadius: 20, padding: "2px 12px", color: l.running ? "#00d4aa" : "#4a6080", cursor: "pointer", fontSize: "0.75rem", fontWeight: 600 }}>
                          {l.running ? "ON" : "OFF"}
                        </button>
                      </td>
                      <td style={{ padding: "7px 6px" }}>
                        <button onClick={() => deleteRow(i)}
                          style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 5, color: "#ef4444", fontSize: "0.75rem", padding: "2px 8px", cursor: "pointer" }}>
                          ✕
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 20, flexWrap: "wrap" }}>
              <button className="btn-primary" style={{ background: "linear-gradient(135deg, #b45309, #f59e0b)" }}
                onClick={() => setRan(true)}>
                ▶ Analyse Load
              </button>
              <button onClick={addRow}
                style={{ background: "rgba(0,191,255,0.1)", border: "1px solid rgba(0,191,255,0.3)", borderRadius: 8, color: "#00bfff", fontSize: "0.82rem", padding: "8px 16px", cursor: "pointer", fontWeight: 600 }}>
                + Add Consumer
              </button>
            </div>
          </div>

          {/* Results panel */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {!ran ? (
              <div className="glass" style={{ padding: isMobile ? 24 : 40, textAlign: "center" }}>
                <div style={{ fontSize: "3rem", marginBottom: 12 }}>⚡</div>
                <p style={{ color: "#8fa3be", fontSize: "0.85rem" }}>Edit values, toggle loads ON/OFF, then click Analyse Load</p>
              </div>
            ) : result ? (
              <>
                {[
                  { l: "Connected Load", v: `${result.totalKW.toLocaleString()} kW`, sub: `${result.totalKVA.toLocaleString()} kVA`, c: "#00bfff" },
                  { l: "Demand Load (×0.85)", v: `${result.demandKW.toLocaleString()} kW`, sub: `${result.demandKVA.toLocaleString()} kVA`, c: "#f59e0b" },
                  { l: "Average Power Factor", v: result.avgPF.toString(), sub: result.avgPF < 0.85 ? "⚠ Below 0.85 — consider PF correction" : "✓ Acceptable", c: result.avgPF < 0.85 ? "#ef4444" : "#00d4aa" },
                  { l: "Recommended Generator", v: `${result.recommended.toLocaleString()} kVA`, sub: `2× units (N+1 redundancy)`, c: "#a78bfa" },
                ].map(({ l, v, sub, c }) => (
                  <div key={l} className="glass" style={{ padding: "16px 18px" }}>
                    <div style={{ fontSize: "0.75rem", color: "#8fa3be", marginBottom: 4 }}>{l}</div>
                    <div style={{ fontSize: "1.3rem", fontWeight: 700, color: c }}>{v}</div>
                    <div style={{ fontSize: "0.72rem", color: "#8fa3be", marginTop: 4 }}>{sub}</div>
                  </div>
                ))}

                <div className="glass" style={{ padding: 16 }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#8fa3be", marginBottom: 8 }}>Load Distribution</div>
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} dataKey="value" fontSize={10}>
                        {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ background: "#0f2040", border: "1px solid rgba(0,191,255,0.2)", borderRadius: 8, fontSize: "0.75rem" }} formatter={(v: number) => [`${v.toLocaleString()} kW`]} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {ran && (
          <div className="glass" style={{ marginTop: 24, padding: 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 4, fontSize: "0.95rem" }}>Active Load Profile</h3>
            <p style={{ color: "#8fa3be", fontSize: "0.8rem", marginBottom: 20 }}>kW and kVAR by consumer (running loads only)</p>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={barData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" horizontal={false} />
                <XAxis type="number" stroke="#8fa3be" fontSize={11} />
                <YAxis dataKey="name" type="category" stroke="#8fa3be" fontSize={10} width={170} />
                <Tooltip contentStyle={{ background: "#0f2040", border: "1px solid rgba(0,191,255,0.2)", borderRadius: 8, fontSize: "0.8rem" }} formatter={(v: number) => [`${v.toLocaleString()} `]} />
                <Legend wrapperStyle={{ fontSize: "0.8rem" }} />
                <Bar dataKey="kW" fill="#00bfff" name="Active Power (kW)" radius={[0,3,3,0]} />
                <Bar dataKey="kVAR" fill="#f59e0b" name="Reactive Power (kVAR)" radius={[0,3,3,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="glass" style={{ marginTop: 24, padding: "14px 20px", display: "flex", gap: 10, alignItems: "center" }}>
          <span>⚙️</span>
          <span style={{ fontSize: "0.78rem", color: "#8fa3be" }}>
            Electrical plant analysis based on{" "}
            <a href="https://github.com/BasilioPV/ShipSIM" target="_blank" rel="noopener noreferrer" style={{ color: "#00d4aa" }}>ShipSIM</a>
            {" "}ElectricPowerPlant component models · IEC 60092 / SOLAS load table methodology · Diversity factors per DNV-RP-0353.
          </span>
        </div>
      </main>
    </div>
  )
}

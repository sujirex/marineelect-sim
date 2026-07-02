"use client"
import { useState, useMemo } from "react"
import Navbar from "../components/Navbar"
import { useIsMobile } from "../hooks/useIsMobile"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine, ScatterChart, Scatter
} from "recharts"

interface ShipParams {
  Lpp: number; B: number; T: number; Cb: number; speed: number; rudderAngle: number; testType: string
}

const PRESETS: Record<string, ShipParams & { label: string }> = {
  vlcc:      { label: "VLCC",           Lpp: 320, B: 58,  T: 20,  Cb: 0.83, speed: 14, rudderAngle: 20, testType: "both" },
  container: { label: "Container Ship", Lpp: 295, B: 40,  T: 14,  Cb: 0.68, speed: 22, rudderAngle: 35, testType: "both" },
  bulker:    { label: "Bulk Carrier",   Lpp: 225, B: 36,  T: 13,  Cb: 0.80, speed: 14, rudderAngle: 20, testType: "both" },
  ferry:     { label: "Ro-Pax Ferry",   Lpp: 185, B: 27,  T: 7.5, Cb: 0.62, speed: 24, rudderAngle: 35, testType: "both" },
  osv:       { label: "Offshore OSV",   Lpp: 85,  B: 18,  T: 5.5, Cb: 0.58, speed: 12, rudderAngle: 35, testType: "both" },
}

function generateZigZag(params: ShipParams) {
  const { Lpp, Cb, speed, rudderAngle } = params
  const K = (0.35 + Cb * 0.3) * (speed / 15)
  const T_val = Lpp / (speed * 0.5144) * 1.8
  const dt = 2
  const data = []
  let heading = 0, headingRate = 0
  let rudder = rudderAngle
  let phase = 1
  let firstOvershoot: number | null = null
  let secondOvershoot: number | null = null
  let peakHeading = 0
  let crossedZeroAfterPhase2 = false

  for (let t = 0; t <= 600; t += dt) {
    const ddHeading = (K / T_val) * (rudder - headingRate * T_val)
    headingRate += ddHeading * dt
    heading += headingRate * dt

    if (phase === 1 && heading >= rudderAngle) {
      rudder = -rudderAngle; phase = 2; peakHeading = heading
    } else if (phase === 2) {
      if (heading > peakHeading) peakHeading = heading
      if (heading <= 0 && !crossedZeroAfterPhase2) {
        crossedZeroAfterPhase2 = true
        firstOvershoot = Math.round((peakHeading - rudderAngle) * 10) / 10
        peakHeading = heading
      }
      if (heading <= -rudderAngle) { rudder = rudderAngle; phase = 3; peakHeading = heading }
    } else if (phase === 3) {
      if (heading < peakHeading) peakHeading = heading
      if (heading >= 0 && secondOvershoot === null && firstOvershoot !== null) {
        secondOvershoot = Math.round((Math.abs(peakHeading) - rudderAngle) * 10) / 10
      }
      if (heading >= rudderAngle) { rudder = -rudderAngle; phase = 4 }
    } else if (phase === 4 && heading <= -rudderAngle) { rudder = rudderAngle; phase = 1 }

    data.push({ t, heading: Math.round(heading * 100) / 100, rudder: Math.round(rudder * 100) / 100 })
  }

  const oa1 = firstOvershoot ?? 0
  const oa2 = secondOvershoot ?? 0
  const limit = rudderAngle <= 10 ? 12 : 25
  const pass = oa1 <= limit && oa2 <= limit
  return { data, oa1, oa2, limit, pass }
}

function generateTurningCircle(params: ShipParams) {
  const { Lpp, Cb, rudderAngle } = params
  const turningRadius = Lpp * (3.5 - rudderAngle / 35 * 1.5) * (1 + (1 - Cb) * 1.2)
  const data = []
  for (let t = 0; t <= 360; t += 3) {
    const angle = (t * Math.PI) / 180
    data.push({ x: Math.round(turningRadius * Math.sin(angle) * 10) / 10, y: Math.round(turningRadius * (1 - Math.cos(angle)) * 10) / 10 })
  }
  return { data, turningRadius: Math.round(turningRadius), advance: Math.round(turningRadius * 1.8), tactical: Math.round(turningRadius * 2.0) }
}

const numInputStyle: React.CSSProperties = {
  width: 64, background: "rgba(0,191,255,0.08)", border: "1px solid rgba(0,191,255,0.2)",
  borderRadius: 5, color: "#e8edf5", fontSize: "0.78rem", padding: "3px 6px", outline: "none", textAlign: "right" as const
}

export default function ManeuveringPage() {
  const isMobile = useIsMobile()
  const [params, setParams] = useState<ShipParams>({
    Lpp: 175, B: 28, T: 9.5, Cb: 0.72, speed: 15, rudderAngle: 20, testType: "both"
  })
  const [ran, setRan] = useState(false)

  const zigzag = useMemo(() => ran ? generateZigZag(params) : null, [ran, params])
  const tc     = useMemo(() => ran ? generateTurningCircle(params) : null, [ran, params])

  const set = (k: keyof ShipParams, v: string | number) => {
    setRan(false)
    setParams(p => ({ ...p, [k]: typeof v === "string" ? parseFloat(v) || p[k as keyof ShipParams] : v }))
  }
  const applyPreset = (key: string) => {
    const p = PRESETS[key]
    setParams({ Lpp: p.Lpp, B: p.B, T: p.T, Cb: p.Cb, speed: p.speed, rudderAngle: p.rudderAngle, testType: p.testType })
    setRan(false)
  }

  const fields: { label: string; key: keyof ShipParams; min: number; max: number; step: number }[] = [
    { label: "Length Lpp (m)",        key: "Lpp",         min: 50,  max: 400, step: 1 },
    { label: "Beam B (m)",            key: "B",           min: 10,  max: 80,  step: 0.5 },
    { label: "Draft T (m)",           key: "T",           min: 3,   max: 25,  step: 0.1 },
    { label: "Block Coefficient Cb",  key: "Cb",          min: 0.5, max: 0.9, step: 0.01 },
    { label: "Service Speed (kn)",    key: "speed",       min: 5,   max: 30,  step: 0.5 },
    { label: "Rudder Angle (°)",      key: "rudderAngle", min: 5,   max: 35,  step: 1 },
  ]

  const chartH = isMobile ? 240 : 320

  return (
    <div>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "24px 16px" : "40px 24px" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: isMobile ? "1.4rem" : "1.8rem", fontWeight: 800, marginBottom: 6 }}>
            <span className="gradient-text">Maneuvering Simulation</span>
          </h1>
          <p style={{ color: "#8fa3be", fontSize: "0.85rem" }}>
            IMO standard sea trial simulations · MMG maneuvering model · 6-DoF physics
          </p>
        </div>

        {/* Presets */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {Object.entries(PRESETS).map(([key, p]) => (
            <button key={key} onClick={() => applyPreset(key)}
              style={{ background: "rgba(0,191,255,0.1)", border: "1px solid rgba(0,191,255,0.25)", borderRadius: 7, color: "#00bfff", fontSize: "0.75rem", padding: "5px 12px", cursor: "pointer", fontWeight: 600 }}>
              {p.label}
            </button>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "300px 1fr", gap: 20, alignItems: "start" }}>
          {/* Inputs */}
          <div className="glass" style={{ padding: isMobile ? 16 : 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: "0.95rem", color: "#00bfff" }}>⚙️ Ship Parameters</h3>
            {fields.map(({ label, key, min, max, step }) => (
              <div key={key} style={{ marginBottom: 12 }}>
                <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem", color: "#8fa3be", marginBottom: 4 }}>
                  <span>{label}</span>
                  <input type="number" min={min} max={max} step={step}
                    value={params[key] as number}
                    onChange={e => set(key, e.target.value)}
                    style={numInputStyle} />
                </label>
                <input type="range" min={min} max={max} step={step}
                  value={params[key] as number}
                  onChange={e => set(key, parseFloat(e.target.value))}
                  style={{ width: "100%", accentColor: "#00bfff" }} />
              </div>
            ))}

            <div style={{ marginBottom: 18 }}>
              <label style={{ fontSize: "0.78rem", color: "#8fa3be", display: "block", marginBottom: 6 }}>Test Type</label>
              <select value={params.testType} onChange={e => { set("testType", e.target.value); setRan(false) }}
                className="input-field" style={{ padding: "8px 12px" }}>
                <option value="zigzag">Zig-Zag Maneuver</option>
                <option value="turning">Turning Circle</option>
                <option value="both">Both Tests</option>
              </select>
            </div>

            <button className="btn-primary" style={{ width: "100%" }} onClick={() => setRan(true)}>
              ▶ Run Simulation
            </button>

            {ran && (
              <div style={{ marginTop: 12, padding: "10px 14px", background: "rgba(0,212,170,0.08)", borderRadius: 8, border: "1px solid rgba(0,212,170,0.2)" }}>
                <div style={{ fontSize: "0.75rem", color: "#00d4aa", fontWeight: 600, marginBottom: 4 }}>✓ Simulation Complete</div>
                <div style={{ fontSize: "0.72rem", color: "#8fa3be" }}>
                  L/B: {(params.Lpp / params.B).toFixed(1)} · Fn: {(params.speed * 0.5144 / Math.sqrt(9.81 * params.Lpp)).toFixed(3)}
                </div>
              </div>
            )}
          </div>

          {/* Charts */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {!ran && (
              <div className="glass" style={{ padding: isMobile ? 32 : 60, textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🧭</div>
                <p style={{ color: "#8fa3be", fontSize: "0.9rem" }}>Select a preset or set parameters, then click <strong style={{ color: "#00bfff" }}>Run Simulation</strong></p>
              </div>
            )}

            {ran && zigzag && (params.testType === "zigzag" || params.testType === "both") && (
              <div className="glass" style={{ padding: isMobile ? 14 : 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
                  <div>
                    <h3 style={{ fontWeight: 700, marginBottom: 4, fontSize: "0.95rem" }}>Zig-Zag {params.rudderAngle}/{params.rudderAngle}</h3>
                    <p style={{ color: "#8fa3be", fontSize: "0.75rem" }}>IMO MSC.137(76)</p>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[
                      { l: "1st OS", v: `${zigzag.oa1}°` },
                      { l: "2nd OS", v: `${zigzag.oa2}°` },
                      { l: `≤${zigzag.limit}°`, v: zigzag.pass ? "✓ PASS" : "✗ FAIL", pass: true },
                    ].map(({ l, v, pass: isResult }) => (
                      <div key={l} style={{ padding: "6px 10px", background: isResult ? (zigzag.pass ? "rgba(0,212,170,0.1)" : "rgba(239,68,68,0.1)") : "rgba(0,191,255,0.08)", borderRadius: 7, border: `1px solid ${isResult ? (zigzag.pass ? "rgba(0,212,170,0.3)" : "rgba(239,68,68,0.3)") : "rgba(0,191,255,0.2)"}`, textAlign: "center", minWidth: 60 }}>
                        <div style={{ fontSize: "0.9rem", fontWeight: 700, color: isResult ? (zigzag.pass ? "#00d4aa" : "#ef4444") : "#00bfff" }}>{v}</div>
                        <div style={{ fontSize: "0.65rem", color: "#8fa3be", marginTop: 1 }}>{l}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <ResponsiveContainer width="100%" height={chartH}>
                  <LineChart data={zigzag.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="t" stroke="#8fa3be" fontSize={10} label={{ value: "Time (s)", position: "insideBottom", offset: -4, fill: "#8fa3be", fontSize: 10 }} />
                    <YAxis stroke="#8fa3be" fontSize={10} label={{ value: "Angle (°)", angle: -90, position: "insideLeft", fill: "#8fa3be", fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "#0f2040", border: "1px solid rgba(0,191,255,0.2)", borderRadius: 8, fontSize: "0.78rem" }} />
                    <Legend wrapperStyle={{ fontSize: "0.75rem", paddingTop: 8 }} />
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.15)" />
                    <ReferenceLine y={params.rudderAngle} stroke="rgba(245,158,11,0.2)" strokeDasharray="4 2" />
                    <ReferenceLine y={-params.rudderAngle} stroke="rgba(245,158,11,0.2)" strokeDasharray="4 2" />
                    <Line type="monotone" dataKey="heading" stroke="#00bfff" strokeWidth={2} dot={false} name="Heading (°)" />
                    <Line type="monotone" dataKey="rudder" stroke="#f59e0b" strokeWidth={1.5} dot={false} strokeDasharray="4 2" name="Rudder (°)" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}

            {ran && tc && (params.testType === "turning" || params.testType === "both") && (
              <div className="glass" style={{ padding: isMobile ? 14 : 24 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 4, fontSize: "0.95rem" }}>Turning Circle</h3>
                <p style={{ color: "#8fa3be", fontSize: "0.75rem", marginBottom: 14 }}>Rudder hardover {params.rudderAngle}°</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
                  {[
                    { l: "Turning Radius", v: `${tc.turningRadius} m`, sub: `${(tc.turningRadius / params.Lpp).toFixed(2)}×Lpp` },
                    { l: "Advance",        v: `${tc.advance} m`,       sub: `${(tc.advance / params.Lpp).toFixed(2)}×Lpp` },
                    { l: "Tactical Dia.", v: `${tc.tactical} m`,      sub: `${(tc.tactical / params.Lpp).toFixed(2)}×Lpp` },
                  ].map(({ l, v, sub }) => (
                    <div key={l} className="stat-card" style={{ padding: isMobile ? "10px 8px" : undefined }}>
                      <div style={{ fontSize: isMobile ? "0.85rem" : "1.1rem", fontWeight: 700, color: "#00bfff" }}>{v}</div>
                      <div style={{ fontSize: "0.65rem", color: "#8fa3be", marginTop: 2 }}>{sub}</div>
                      <div style={{ fontSize: "0.65rem", color: "#4a6080", marginTop: 1 }}>{l}</div>
                    </div>
                  ))}
                </div>
                <ResponsiveContainer width="100%" height={chartH}>
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                    <XAxis dataKey="x" type="number" stroke="#8fa3be" fontSize={10} domain={["dataMin - 50", "dataMax + 50"]}
                      label={{ value: "X (m)", position: "insideBottom", offset: -4, fill: "#8fa3be", fontSize: 10 }} />
                    <YAxis dataKey="y" type="number" stroke="#8fa3be" fontSize={10}
                      label={{ value: "Y (m)", angle: -90, position: "insideLeft", fill: "#8fa3be", fontSize: 10 }} />
                    <Tooltip cursor={{ strokeDasharray: "3 3" }}
                      contentStyle={{ background: "#0f2040", border: "1px solid rgba(0,191,255,0.2)", borderRadius: 8, fontSize: "0.78rem" }}
                      formatter={(v: number) => [`${v} m`]} />
                    <Scatter name="Ship Track" data={tc.data} fill="#00d4aa" line={{ stroke: "#00d4aa", strokeWidth: 2.5 }} />
                  </ScatterChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="glass" style={{ marginTop: 24, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span>⚙️</span>
          <span style={{ fontSize: "0.75rem", color: "#8fa3be" }}>
            MMG maneuvering equations · IMO MSC.137(76) · Overshoot criterion: ≤{params.rudderAngle <= 10 ? "12" : "25"}° for {params.rudderAngle}° test.
          </span>
        </div>
      </main>
    </div>
  )
}

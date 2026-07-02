"use client"
import { useState, useMemo } from "react"
import Navbar from "../components/Navbar"
import { useIsMobile } from "../hooks/useIsMobile"
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine
} from "recharts"

const KT_COEFFS = [0.00880496,-0.204554,0.166351,0.158114,-0.147581,-0.481497,0.415437,0.0144043,-0.0530054,0.0143481,0.0606826,0.0125894,0.0109689,-0.133698,-0.00638407,-0.00132718,0.168496,-0.0507214,0.0854559,-0.0504475,0.010465,-0.00648272,-0.00841728,0.0168424,-0.00102296,-0.0317791,-0.018604,0.00869243,-0.0064228,0.00678194,-0.00244382]
const KQ_COEFFS = [0.00379368,0.00886523,-0.032241,0.00344778,-0.0408811,-0.108009,-0.0885381,0.188561,-0.00370871,0.00513696,0.0209449,0.00474319,-0.00723408,0.00438388,-0.0269403,0.0558082,0.0161886,0.0130756,-0.01836,0.00433018,-0.0529461,0.0161816,0.0070569,-0.00242921,0.00269551,0.00161886,0.00188045,-0.000950955,-0.000869785,-0.00125824,0.00766374,-0.0008836,-0.000879741]
const TERMS = [[0,0,0],[1,1,0],[0,2,0],[0,2,1],[2,1,0],[1,2,0],[0,2,2],[0,4,0],[0,0,1],[1,1,1],[0,2,1],[2,2,1],[0,0,2],[0,1,2],[2,0,2],[0,4,2],[3,0,0],[0,1,1],[0,2,1],[0,1,2],[3,1,2],[0,0,3],[1,1,3],[0,2,3],[0,0,0],[0,1,0],[0,2,0],[0,0,1],[1,0,1],[0,1,1],[0,0,2],[2,0,2],[3,0,2]]

interface PropPreset { label: string; AeAo: number; z: number; PD: number; D: number; n: number; Va: number }
const PRESETS: Record<string, PropPreset> = {
  vlcc:      { label: "VLCC",         AeAo: 0.65, z: 4, PD: 0.70, D: 9.8,  n: 85,  Va: 6.5 },
  container: { label: "Container",    AeAo: 0.80, z: 5, PD: 0.95, D: 7.5,  n: 110, Va: 10.0 },
  bulker:    { label: "Bulk Carrier", AeAo: 0.65, z: 4, PD: 0.75, D: 7.0,  n: 100, Va: 6.0 },
  ferry:     { label: "Ferry",        AeAo: 0.75, z: 4, PD: 1.05, D: 4.5,  n: 200, Va: 9.5 },
  osv:       { label: "OSV / Tug",    AeAo: 0.85, z: 4, PD: 1.20, D: 3.2,  n: 250, Va: 4.0 },
}

function computeBseries(J: number, AeAo: number, z: number, PD: number) {
  let KT = 0, KQ = 0
  for (let i = 0; i < 31; i++) {
    const [sn, tn, un] = TERMS[i]
    const val = Math.pow(J, sn) * Math.pow(PD, tn) * Math.pow(AeAo, un)
    KT += KT_COEFFS[i] * val
    if (i < KQ_COEFFS.length) KQ += KQ_COEFFS[i] * val
  }
  return { KT: Math.max(0, KT), KQ: Math.max(0.0001, KQ) }
}

function generateCurves(AeAo: number, z: number, PD: number) {
  const data = []
  let bestEta = 0, bestJ = 0
  for (let J = 0; J <= 1.0; J += 0.02) {
    const { KT, KQ } = computeBseries(J, AeAo, z, PD)
    const eta = J > 0.01 ? Math.min((J * KT) / (2 * Math.PI * KQ), 0.80) : 0
    if (eta > bestEta) { bestEta = eta; bestJ = J }
    data.push({ J: Math.round(J * 1000) / 1000, KT: Math.round(KT * 10000) / 10000, KQ10: Math.round(KQ * 10 * 10000) / 10000, eta: Math.round(eta * 10000) / 10000 })
  }
  return { data, bestJ: Math.round(bestJ * 1000) / 1000, bestEta: Math.round(bestEta * 1000) / 1000 }
}

function computePerf(D: number, n: number, Va: number, rho: number, AeAo: number, z: number, PD: number) {
  const nRPS = n / 60
  const J = Va > 0 ? Va / (nRPS * D) : 0
  const { KT, KQ } = computeBseries(J, AeAo, z, PD)
  const T = KT * rho * nRPS * nRPS * Math.pow(D, 4)
  const Q = KQ * rho * nRPS * nRPS * Math.pow(D, 5)
  const P = 2 * Math.PI * nRPS * Q
  const eta = J > 0.01 ? Math.min((J * KT) / (2 * Math.PI * KQ), 0.80) : 0
  const A0 = Math.PI * D * D / 4
  const Ct = T / (0.5 * rho * A0 * (Va > 0.5 ? Va * Va : 1))
  const cavRisk = Ct > 0.5 ? (Ct > 1.0 ? "high" : "moderate") : "low"
  return { thrust: Math.round(T / 1000), torque: Math.round(Q / 1000), power: Math.round(P / 1000), efficiency: Math.round(eta * 100 * 10) / 10, J: Math.round(J * 1000) / 1000, Ct: Math.round(Ct * 100) / 100, cavRisk }
}

export default function PropulsionPage() {
  const isMobile = useIsMobile()
  const [AeAo, setAeAo] = useState(0.70)
  const [z, setZ]       = useState(4)
  const [PD, setPD]     = useState(1.0)
  const [D, setD]       = useState(6.0)
  const [n, setN]       = useState(120)
  const [Va, setVa]     = useState(7.5)
  const [bollard, setBollard] = useState(false)
  const [ran, setRan]   = useState(false)
  const rho = 1025

  const vaEff = bollard ? 0 : Va
  const { data: curves, bestJ, bestEta } = useMemo(() => ran ? generateCurves(AeAo, z, PD) : { data: [], bestJ: 0, bestEta: 0 }, [ran, AeAo, z, PD])
  const perf = useMemo(() => ran ? computePerf(D, n, vaEff, rho, AeAo, z, PD) : null, [ran, D, n, vaEff, rho, AeAo, z, PD])

  const applyPreset = (key: string) => {
    const p = PRESETS[key]; setAeAo(p.AeAo); setZ(p.z); setPD(p.PD); setD(p.D); setN(p.n); setVa(p.Va); setBollard(false); setRan(false)
  }

  const numInputStyle: React.CSSProperties = { width: 64, background: "rgba(0,212,170,0.07)", border: "1px solid rgba(0,212,170,0.2)", borderRadius: 5, color: "var(--text-strong)", fontSize: "0.78rem", padding: "3px 6px", outline: "none", textAlign: "right" as const }
  const numInputStyleBlue: React.CSSProperties = { ...numInputStyle, background: "rgba(0,191,255,0.07)", border: "1px solid rgba(0,191,255,0.2)" }
  const chartH = isMobile ? 240 : 340

  const propFields = [
    { label: "Ae/Ao", val: AeAo, set: setAeAo, min: 0.30, max: 1.05, step: 0.05, accent: "var(--success)", style: numInputStyle },
    { label: `Blades z=${z}`, val: z, set: (v: number) => setZ(Math.round(v)), min: 3, max: 7, step: 1, accent: "var(--success)", style: numInputStyle },
    { label: "Pitch P/D", val: PD, set: setPD, min: 0.50, max: 1.40, step: 0.05, accent: "var(--success)", style: numInputStyle },
  ]
  const opFields = [
    { label: "Diameter D (m)",     val: D,  set: setD,  min: 1.0, max: 12.0, step: 0.1,  accent: "var(--accent2)", style: numInputStyleBlue },
    { label: "Speed n (rpm)",      val: n,  set: setN,  min: 40,  max: 350,  step: 5,    accent: "var(--accent2)", style: numInputStyleBlue },
    { label: "Va (m/s)",           val: Va, set: setVa, min: 0.5, max: 15.0, step: 0.25, accent: "var(--accent2)", style: numInputStyleBlue, disabled: bollard },
  ]

  return (
    <div>
      <Navbar />
      <main style={{ maxWidth: 1200, margin: "0 auto", padding: isMobile ? "24px 16px" : "40px 24px" }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: isMobile ? "1.4rem" : "1.8rem", fontWeight: 800, marginBottom: 6 }}>
            <span className="gradient-text">Propulsion Analysis</span>
          </h1>
          <p style={{ color: "var(--text-dim)", fontSize: "0.85rem" }}>Wageningen B-Series · KT/KQ open water · Published polynomial coefficients</p>
        </div>

        {/* Presets */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }}>
          {Object.entries(PRESETS).map(([key, p]) => (
            <button key={key} onClick={() => applyPreset(key)}
              style={{ background: "rgba(0,212,170,0.1)", border: "1px solid rgba(0,212,170,0.25)", borderRadius: 7, color: "var(--success)", fontSize: "0.75rem", padding: "5px 12px", cursor: "pointer", fontWeight: 600 }}>
              {p.label}
            </button>
          ))}
          <button onClick={() => { setBollard(b => !b); setRan(false) }}
            style={{ background: bollard ? "rgba(245,158,11,0.15)" : "rgba(125,160,160,0.10)", border: `1px solid ${bollard ? "rgba(245,158,11,0.4)" : "rgba(125,160,160,0.35)"}`, borderRadius: 7, color: bollard ? "#f59e0b" : "var(--text-dim)", fontSize: "0.75rem", padding: "5px 12px", cursor: "pointer", fontWeight: 600 }}>
            ⚓ Bollard Pull
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "300px 1fr", gap: 20, alignItems: "start" }}>
          {/* Inputs */}
          <div className="glass" style={{ padding: isMobile ? 16 : 24 }}>
            <h3 style={{ fontWeight: 700, marginBottom: 16, fontSize: "0.95rem", color: "var(--success)" }}>🔩 Propeller Parameters</h3>
            {propFields.map(({ label, val, set: setter, min, max, step, accent, style: ns }) => (
              <div key={label} style={{ marginBottom: 12 }}>
                <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem", color: "var(--text-dim)", marginBottom: 4 }}>
                  <span>{label}</span>
                  <input type="number" min={min} max={max} step={step} value={val}
                    onChange={e => { setter(parseFloat(e.target.value) || val); setRan(false) }} style={ns} />
                </label>
                <input type="range" min={min} max={max} step={step} value={val}
                  onChange={e => { setter(parseFloat(e.target.value)); setRan(false) }}
                  style={{ width: "100%", accentColor: accent }} />
              </div>
            ))}
            <div style={{ marginTop: 10, paddingTop: 12, borderTop: "1px solid rgba(0,191,255,0.1)" }}>
              <h4 style={{ fontSize: "0.82rem", color: "var(--accent2)", fontWeight: 600, marginBottom: 12 }}>Operating Conditions</h4>
              {opFields.map(({ label, val, set: setter, min, max, step, accent, style: ns, disabled }) => (
                <div key={label} style={{ marginBottom: 12 }}>
                  <label style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem", color: "var(--text-dim)", marginBottom: 4 }}>
                    <span>{label}</span>
                    <input type="number" min={min} max={max} step={step} value={val}
                      onChange={e => { setter(parseFloat(e.target.value) || val); setRan(false) }} style={ns} disabled={disabled} />
                  </label>
                  <input type="range" min={min} max={max} step={step} value={val}
                    onChange={e => { setter(parseFloat(e.target.value)); setRan(false) }}
                    style={{ width: "100%", accentColor: accent, opacity: disabled ? 0.35 : 1 }} disabled={disabled} />
                </div>
              ))}
            </div>
            <button className="btn-primary" style={{ width: "100%", marginTop: 8, background: "linear-gradient(135deg, #00664d, var(--success))" }} onClick={() => setRan(true)}>
              ▶ Compute Performance
            </button>
          </div>

          {/* Results */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {!ran && (
              <div className="glass" style={{ padding: isMobile ? 32 : 60, textAlign: "center" }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>🔩</div>
                <p style={{ color: "var(--text-dim)" }}>Select a preset or configure propeller, then click <strong style={{ color: "var(--success)" }}>Compute Performance</strong></p>
              </div>
            )}

            {ran && perf && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 10 }}>
                  {[
                    { l: "Thrust",       v: `${perf.thrust.toLocaleString()} kN`,  c: "var(--accent2)" },
                    { l: "Torque",       v: `${perf.torque.toLocaleString()} kNm`, c: "var(--success)" },
                    { l: "Power (PD)",   v: `${perf.power.toLocaleString()} kW`,   c: "#f59e0b" },
                    { l: "η Open Water", v: `${perf.efficiency}%`,                 c: "#a78bfa" },
                  ].map(({ l, v, c }) => (
                    <div key={l} className="stat-card" style={{ textAlign: "center" }}>
                      <div style={{ fontSize: isMobile ? "0.95rem" : "1.1rem", fontWeight: 700, color: c }}>{v}</div>
                      <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginTop: 4 }}>{l}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10 }}>
                  <div className="glass" style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginBottom: 4 }}>Advance Coeff.</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "var(--accent2)" }}>J = {perf.J}</div>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-faint)", marginTop: 2 }}>Operating point</div>
                  </div>
                  <div className="glass" style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginBottom: 4 }}>Best Efficiency</div>
                    <div style={{ fontSize: "1.1rem", fontWeight: 700, color: "#a78bfa" }}>J = {bestJ}</div>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-dim)", marginTop: 2 }}>η = {(bestEta * 100).toFixed(1)}%</div>
                  </div>
                  <div className="glass" style={{ padding: "12px 14px" }}>
                    <div style={{ fontSize: "0.7rem", color: "var(--text-dim)", marginBottom: 4 }}>Cavitation (Ct={perf.Ct})</div>
                    <div style={{ fontSize: "1rem", fontWeight: 700, color: perf.cavRisk === "high" ? "#ef4444" : perf.cavRisk === "moderate" ? "#f59e0b" : "var(--success)" }}>
                      {perf.cavRisk === "high" ? "⚠ HIGH" : perf.cavRisk === "moderate" ? "⚡ MOD." : "✓ LOW"}
                    </div>
                    <div style={{ fontSize: "0.68rem", color: "var(--text-faint)", marginTop: 2 }}>Burrill criterion</div>
                  </div>
                </div>
              </>
            )}

            {ran && (
              <div className="glass" style={{ padding: isMobile ? 14 : 24 }}>
                <h3 style={{ fontWeight: 700, marginBottom: 4, fontSize: "0.9rem" }}>Open Water Characteristics</h3>
                <p style={{ color: "var(--text-dim)", fontSize: "0.75rem", marginBottom: 16 }}>
                  B{z}-{Math.round(AeAo * 100)} · P/D={PD}
                  {perf && <span style={{ color: "var(--accent2)" }}> · OP: J={perf.J}</span>}
                  <span style={{ color: "#a78bfa" }}> · BEP: J={bestJ}</span>
                </p>
                <ResponsiveContainer width="100%" height={chartH}>
                  <LineChart data={curves}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="J" stroke="var(--text-dim)" fontSize={10} label={{ value: "Advance Ratio J", position: "insideBottom", offset: -4, fill: "var(--text-dim)", fontSize: 10 }} />
                    <YAxis stroke="var(--text-dim)" fontSize={10} domain={[0, 0.85]} />
                    <Tooltip contentStyle={{ background: "var(--card)", color: "var(--text)", border: "1px solid rgba(0,191,255,0.2)", borderRadius: 8, fontSize: "0.78rem" }} />
                    <Legend wrapperStyle={{ fontSize: "0.75rem", paddingTop: 8 }} />
                    <ReferenceLine x={bestJ} stroke="rgba(167,139,250,0.5)" strokeDasharray="4 2" label={{ value: "BEP", position: "top", fill: "#a78bfa", fontSize: 9 }} />
                    {perf && <ReferenceLine x={perf.J} stroke="rgba(0,191,255,0.6)" strokeWidth={1.5} label={{ value: "OP", position: "insideTopRight", fill: "var(--accent2)", fontSize: 9 }} />}
                    <Line type="monotone" dataKey="KT"   stroke="var(--accent2)" strokeWidth={2.5} dot={false} name="KT" />
                    <Line type="monotone" dataKey="KQ10" stroke="#f59e0b" strokeWidth={2}   dot={false} name="10·KQ" />
                    <Line type="monotone" dataKey="eta"  stroke="var(--success)" strokeWidth={2.5} dot={false} name="η" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>

        <div className="glass" style={{ marginTop: 24, padding: "12px 16px", display: "flex", gap: 10, alignItems: "flex-start" }}>
          <span>⚙️</span>
          <span style={{ fontSize: "0.75rem", color: "var(--text-dim)" }}>
            Wageningen B-series · Oosterveld & van Oossanen (1975) · Cavitation: Burrill Ct criterion.
          </span>
        </div>
      </main>
    </div>
  )
}
                                                                                                                                                            
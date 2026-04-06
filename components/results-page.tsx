"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence, LayoutGroup } from "framer-motion"
import Image from "next/image"
import { MigrationPlan, SourceType } from "@/app/page"

interface ResultsPageProps {
  plan: MigrationPlan
  source: SourceType
  onReset: () => void
  currentSpend?: string
}

const SOURCE_LABELS: Record<SourceType, string> = {
  "on-prem": "On-Premises",
  "azure":   "Microsoft Azure",
  "gcp":     "Google Cloud",
}

const COMPLEXITY_CONFIG = {
  Low:    { color: "#4ade80", track: "rgba(74,222,128,0.15)",  arc: 0.33, label: "Low"    },
  Medium: { color: "#fbbf24", track: "rgba(251,191,36,0.15)",  arc: 0.66, label: "Medium" },
  High:   { color: "#f87171", track: "rgba(248,113,113,0.15)", arc: 1.00, label: "High"   },
}

const RISK_COLORS = {
  High:   { bg: "rgba(248,113,113,0.1)",  border: "rgba(248,113,113,0.25)", text: "#f87171" },
  Medium: { bg: "rgba(251,191,36,0.1)",   border: "rgba(251,191,36,0.25)",  text: "#fbbf24" },
  Low:    { bg: "rgba(74,222,128,0.1)",   border: "rgba(74,222,128,0.25)",  text: "#4ade80" },
}

const STRATEGY_COLORS = {
  Rehost:     { bg: "rgba(147,197,253,0.12)", color: "#93c5fd", border: "rgba(147,197,253,0.25)" },
  Replatform: { bg: "rgba(196,181,253,0.12)", color: "#c4b5fd", border: "rgba(196,181,253,0.25)" },
  Refactor:   { bg: "rgba(252,211,77,0.12)",  color: "#fcd34d", border: "rgba(252,211,77,0.25)"  },
}

function parseSpend(s: string): number {
  const nums = [...s.matchAll(/[\d,]+/g)].map(m => parseInt(m[0].replace(/,/g, "")))
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0
}

function getBarWidth(current: string, aws: string): number {
  const c = parseSpend(current), a = parseSpend(aws)
  if (!c || !a) return 72
  return Math.min(Math.round((a / c) * 100), 96)
}

// ── Beams background canvas ──
function BeamsCanvas() {
  const ref = useRef<HTMLCanvasElement>(null)
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return
    const ctx = canvas.getContext("2d"); if (!ctx) return
    let animId: number
    const beams: any[] = []
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight }
    resize(); window.addEventListener("resize", resize)
    for (let i = 0; i < 22; i++) {
      beams.push({ x: Math.random() * canvas.width * 1.4 - canvas.width * 0.2, y: Math.random() * canvas.height, width: 40 + Math.random() * 90, length: canvas.height * 2.8, angle: -28 + Math.random() * 14, speed: 0.25 + Math.random() * 0.45, opacity: 0.05 + Math.random() * 0.09, hue: 205 + Math.random() * 45, pulse: Math.random() * Math.PI * 2, pulseSpeed: 0.012 + Math.random() * 0.018 })
    }
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height); ctx.filter = "blur(28px)"
      beams.forEach(b => {
        b.y -= b.speed; b.pulse += b.pulseSpeed
        if (b.y + b.length < -50) { b.y = canvas.height + 100; b.x = Math.random() * canvas.width * 1.2 - canvas.width * 0.1 }
        ctx.save(); ctx.translate(b.x, b.y); ctx.rotate((b.angle * Math.PI) / 180)
        const op = b.opacity * (0.8 + Math.sin(b.pulse) * 0.2)
        const g = ctx.createLinearGradient(0, 0, 0, b.length)
        g.addColorStop(0, `hsla(${b.hue},80%,70%,0)`); g.addColorStop(0.15, `hsla(${b.hue},80%,70%,${op * 0.5})`)
        g.addColorStop(0.4, `hsla(${b.hue},80%,70%,${op})`); g.addColorStop(0.6, `hsla(${b.hue},80%,70%,${op})`)
        g.addColorStop(0.85, `hsla(${b.hue},80%,70%,${op * 0.5})`); g.addColorStop(1, `hsla(${b.hue},80%,70%,0)`)
        ctx.fillStyle = g; ctx.fillRect(-b.width / 2, 0, b.width, b.length); ctx.restore()
      })
      animId = requestAnimationFrame(draw)
    }
    draw()
    return () => { window.removeEventListener("resize", resize); cancelAnimationFrame(animId) }
  }, [])
  return <canvas ref={ref} style={{ position: "fixed", inset: 0, width: "100%", height: "100%", pointerEvents: "none", zIndex: 0 }} />
}

function AnimatedCount({ target }: { target: number }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    const dur = 1100, s = Date.now()
    const t = setInterval(() => { const p = Math.min((Date.now() - s) / dur, 1); setV(Math.round((1 - Math.pow(1 - p, 3)) * target)); if (p >= 1) clearInterval(t) }, 16)
    return () => clearInterval(t)
  }, [target])
  return <>{v}</>
}

function ComplexityArc({ complexity, mounted }: { complexity: string; mounted: boolean }) {
  const cfg = COMPLEXITY_CONFIG[complexity as keyof typeof COMPLEXITY_CONFIG] || COMPLEXITY_CONFIG.Medium
  const r = 44, cx = 56, cy = 56, circ = 2 * Math.PI * r, track = circ * 0.75
  return (
    <div style={{ position: "relative", width: 112, height: 84 }}>
      <svg width="112" height="88" viewBox="0 0 112 88">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={cfg.track} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${track} ${circ}`} strokeDashoffset={-circ * 0.125} transform={`rotate(135 ${cx} ${cy})`} />
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={cfg.color} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${mounted ? track * cfg.arc : 0} ${circ}`} strokeDashoffset={-circ * 0.125} transform={`rotate(135 ${cx} ${cy})`} style={{ transition: "stroke-dasharray 1.2s 0.5s cubic-bezier(0.16,1,0.3,1)", filter: `drop-shadow(0 0 8px ${cfg.color}88)` }} />
        <text x={cx} y={cy + 6} textAnchor="middle" fill={cfg.color} style={{ fontFamily: "'Cabinet Grotesk',sans-serif", fontSize: 15, fontWeight: 800 }}>{cfg.label}</text>
      </svg>
    </div>
  )
}

function SourceLogo({ source }: { source: SourceType }) {
  if (source === "azure") return <Image src="/icons/azure.svg" alt="Azure" width={26} height={26} style={{ objectFit: "contain" }} />
  if (source === "gcp")   return <Image src="/icons/gcp.png"   alt="GCP"   width={26} height={26} style={{ objectFit: "contain" }} />
  return (
    <svg viewBox="0 0 64 64" width="26" height="26" fill="none">
      <rect x="8" y="10" width="48" height="12" rx="3" fill="#fff" opacity="0.9"/>
      <rect x="8" y="26" width="48" height="12" rx="3" fill="#fff" opacity="0.65"/>
      <rect x="8" y="42" width="48" height="12" rx="3" fill="#fff" opacity="0.4"/>
      <circle cx="52" cy="16" r="3" fill="#4ade80"/><circle cx="52" cy="32" r="3" fill="#4ade80"/><circle cx="52" cy="48" r="3" fill="#fbbf24"/>
    </svg>
  )
}

// ── Glass card (pricing-inspired) ──
function GCard({ children, style, glow }: { children: React.ReactNode; style?: React.CSSProperties; glow?: string }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.03) 100%)",
      backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)",
      border: glow ? `1px solid ${glow}` : "1px solid rgba(255,255,255,0.1)",
      borderRadius: 20, overflow: "hidden",
      boxShadow: glow ? `0 4px 32px rgba(0,0,0,0.3), 0 0 30px ${glow}30` : "0 4px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.08)",
      ...style,
    }}>
      {children}
    </div>
  )
}

// ── Morphing card (phase/risk) ──
function MorphCard({ item, index, isActive, onClick }: { item: any; index: number; isActive: boolean; onClick: () => void }) {
  return (
    <motion.div
      layoutId={`card-${index}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, scale: isActive ? 1.02 : 1 }}
      transition={{ duration: 0.4, delay: index * 0.06, ease: [0.16,1,0.3,1] }}
      whileHover={{ scale: isActive ? 1.02 : 1.01, y: -2 }}
      style={{
        background: isActive
          ? "linear-gradient(135deg, rgba(147,197,253,0.15) 0%, rgba(165,180,252,0.1) 100%)"
          : "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
        backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)",
        border: isActive ? "1px solid rgba(147,197,253,0.3)" : "1px solid rgba(255,255,255,0.08)",
        borderRadius: 16, padding: "16px", cursor: "pointer",
        boxShadow: isActive ? "0 4px 24px rgba(147,197,253,0.15)" : "0 2px 12px rgba(0,0,0,0.2)",
        transition: "border-color 0.2s, background 0.2s, box-shadow 0.2s",
      }}
    >
      {item}
    </motion.div>
  )
}

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as any },
})

const mono: React.CSSProperties = { fontFamily: "'DM Mono', monospace" }
const lbl = (extra?: React.CSSProperties): React.CSSProperties => ({ ...mono, fontSize: 9, textTransform: "uppercase", letterSpacing: "0.16em", color: "rgba(255,255,255,0.3)", display: "block", marginBottom: 8, ...extra })
const divider: React.CSSProperties = { height: 1, background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.08) 50%, transparent)", margin: "0 -1px" }

export default function ResultsPage({ plan, source, onReset, currentSpend = "" }: ResultsPageProps) {
  const [mounted, setMounted] = useState(false)
  const [activePhase, setActivePhase] = useState<number | null>(null)
  const [activeRisk, setActiveRisk] = useState<number | null>(null)
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const [checkOpen, setCheckOpen] = useState(true)
  const [phasesOpen, setPhasesOpen] = useState(true)
  const [risksOpen, setRisksOpen] = useState(true)

  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t) }, [])

  const toggleCheck = (i: number) => { const s = new Set(checked); s.has(i) ? s.delete(i) : s.add(i); setChecked(s) }

  const complexity = plan.complexity || "Medium"
  const phaseCount = plan.migration_phases?.length || 0
  const serviceCount = plan.service_mapping?.length || 0
  const riskCount = plan.risks?.length || 0
  const awsBarWidth = currentSpend ? getBarWidth(currentSpend, plan.monthly_cost_estimate) : 72
  const displaySpend = currentSpend || "—"

  const highs = plan.risks?.filter(r => (typeof r === "string" ? "Medium" : r.severity) === "High").length || 0
  const meds  = plan.risks?.filter(r => (typeof r === "string" ? "Medium" : r.severity) === "Medium").length || 0
  const lows  = plan.risks?.filter(r => (typeof r === "string" ? "Medium" : r.severity) === "Low").length || 0

  const chevron = (open: boolean) => (
    <div style={{ width: 22, height: 22, borderRadius: "50%", background: "rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transform: open ? "rotate(180deg)" : "rotate(0)", transition: "transform 0.25s" }}>
      <svg width="9" height="6" viewBox="0 0 9 6" fill="none"><path d="M1 1l3.5 4L8 1" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5" strokeLinecap="round"/></svg>
    </div>
  )

  return (
    <div style={{ minHeight: "100vh", fontFamily: "'Cabinet Grotesk', sans-serif", position: "relative", background: "linear-gradient(135deg, #060a14 0%, #0d1628 30%, #1a2540 55%, #2e3a58 72%, #6b6058 86%, #f0ebe0 100%)" }}>

      <BeamsCanvas />
      <div style={{ position: "fixed", inset: 0, zIndex: 0, opacity: 0.022, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", pointerEvents: "none" }} />
      <div style={{ position: "fixed", top: -150, left: -80, width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 65%)", filter: "blur(50px)", zIndex: 0, pointerEvents: "none" }} />
      <div style={{ position: "fixed", bottom: -100, right: 0, width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(240,235,224,0.35) 0%, transparent 65%)", filter: "blur(50px)", zIndex: 0, pointerEvents: "none" }} />

      <div style={{ position: "relative", zIndex: 1 }}>

        {/* ── TOP BAR ── */}
        <div style={{ position: "sticky", top: 0, zIndex: 20, background: "rgba(6,10,20,0.75)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "13px 32px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, ...mono, fontSize: 11, color: "rgba(255,255,255,0.22)", letterSpacing: "0.1em" }}>
            <span>01 Source</span><span style={{ opacity: 0.3 }}>—</span><span>02 Details</span><span style={{ opacity: 0.3 }}>—</span>
            <span style={{ color: "#4ade80" }}>03 Plan ✓</span>
          </div>
          <button onClick={onReset} style={{ background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.65)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 100, padding: "7px 18px", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s" }}
            onMouseEnter={e => { (e.target as HTMLElement).style.background = "rgba(255,255,255,0.12)"; (e.target as HTMLElement).style.color = "#fff" }}
            onMouseLeave={e => { (e.target as HTMLElement).style.background = "rgba(255,255,255,0.06)"; (e.target as HTMLElement).style.color = "rgba(255,255,255,0.65)" }}
          >New Plan</button>
        </div>

        <div style={{ padding: "28px 32px 48px", maxWidth: 1400, margin: "0 auto" }}>

          {/* ── HERO — full width ── */}
          <motion.div {...rise(0)} style={{ marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 32, flexWrap: "wrap" as const }}>
              <div style={{ flex: "1 1 580px", minWidth: 0 }}>
                {/* Source → AWS */}
                <div style={{ display: "inline-flex", alignItems: "center", gap: 10, background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 100, padding: "7px 14px 7px 9px", marginBottom: 24, backdropFilter: "blur(12px)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(255,255,255,0.09)", borderRadius: 100, padding: "4px 11px 4px 7px" }}>
                    <SourceLogo source={source} />
                    <span style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)" }}>{SOURCE_LABELS[source]}</span>
                  </div>
                  <div style={{ display: "flex", gap: 2 }}>{[0,1,2].map(i => <div key={i} style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(255,255,255,0.25)", opacity: 0.3 + i * 0.2 }} />)}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, background: "#FF9900", borderRadius: 100, padding: "4px 11px 4px 7px" }}>
                    <Image src="/icons/aws.png" alt="AWS" width={20} height={13} style={{ objectFit: "contain", filter: "brightness(0) invert(1)" }} />
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#fff" }}>AWS</span>
                  </div>
                </div>
                <h1 style={{ fontSize: "clamp(18px,1.9vw,26px)", fontWeight: 400, color: "rgba(255,255,255,0.85)", lineHeight: 1.65, letterSpacing: "-0.2px", marginBottom: 20, textAlign: "justify", maxWidth: 680 }}>
                  {plan.summary.length > 220 ? plan.summary.slice(0, 220).trim() + "..." : plan.summary}
                </h1>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" as const }}>
                  {[
                    { t: `${complexity} Complexity`, c: COMPLEXITY_CONFIG[complexity as keyof typeof COMPLEXITY_CONFIG]?.color || "#fbbf24" },
                    { t: plan.estimated_duration, c: "#93c5fd" },
                    { t: plan.cost_savings, c: "#4ade80" },
                    { t: plan.migration_strategy, c: "rgba(255,255,255,0.4)" },
                  ].map((x, i) => (
                    <span key={i} style={{ ...mono, fontSize: 10, padding: "5px 13px", borderRadius: 100, background: `${x.c}12`, color: x.c, border: `1px solid ${x.c}28`, backdropFilter: "blur(8px)", letterSpacing: "0.04em" }}>{x.t}</span>
                  ))}
                </div>
              </div>

              {/* Quick stats — right side hero */}
              <div style={{ display: "flex", gap: 12, flexShrink: 0 }}>
                {[
                  { n: phaseCount,   l: "Phases",   c: "#93c5fd" },
                  { n: serviceCount, l: "Services",  c: "#c4b5fd" },
                  { n: riskCount,    l: "Risks",     c: "#fbbf24" },
                ].map((s, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.05)", backdropFilter: "blur(16px)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 16, padding: "20px 24px", textAlign: "center" as const, minWidth: 80 }}>
                    <div style={{ fontSize: 44, fontWeight: 800, color: s.c, letterSpacing: "-2.5px", lineHeight: 1, textShadow: `0 0 24px ${s.c}50` }}>
                      {mounted ? <AnimatedCount target={s.n} /> : 0}
                    </div>
                    <div style={{ ...mono, fontSize: 9, color: "rgba(255,255,255,0.28)", textTransform: "uppercase" as const, letterSpacing: "0.14em", marginTop: 6 }}>{s.l}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── ROW 1: Metrics (3 wide) + Service Mapping ── */}
          <motion.div {...rise(0.1)} style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 2.2fr", gap: 10, marginBottom: 10 }}>

            <GCard style={{ padding: "16px", display: "flex", flexDirection: "column", alignItems: "center" }}>
              <span style={lbl()}>Complexity</span>
              <ComplexityArc complexity={complexity} mounted={mounted} />
            </GCard>

            <GCard style={{ padding: "16px 18px" }}>
              <span style={lbl()}>Timeline</span>
              <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: "-1px", lineHeight: 1, marginBottom: 4 }}>{plan.estimated_duration}</div>
              <div style={{ ...mono, fontSize: 10, color: "rgba(255,255,255,0.28)" }}>end-to-end</div>
              <div style={{ display: "flex", gap: 3, marginTop: 12, flexWrap: "wrap" as const }}>
                {Array.from({ length: Math.min(phaseCount * 2, 14) }).map((_, i) => (
                  <div key={i} style={{ height: 3, flex: 1, minWidth: 6, borderRadius: 2, background: mounted && i < phaseCount ? "#93c5fd" : "rgba(255,255,255,0.08)", transition: `background 0.3s ${0.6 + i * 0.04}s`, boxShadow: mounted && i < phaseCount ? "0 0 5px rgba(147,197,253,0.5)" : "none" }} />
                ))}
              </div>
            </GCard>

            <GCard style={{ padding: "16px 18px" }} glow="rgba(74,222,128,0.2)">
              <span style={lbl()}>AWS Monthly</span>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#4ade80", letterSpacing: "-0.8px", marginBottom: 3, textShadow: "0 0 18px rgba(74,222,128,0.35)" }}>{plan.monthly_cost_estimate}</div>
              <div style={{ ...mono, fontSize: 10, color: "#4ade80", opacity: 0.6 }}>↘ {plan.cost_savings}</div>
              <div style={{ marginTop: 16, height: 5, background: "rgba(255,255,255,0.05)", borderRadius: 3, overflow: "hidden" }}>
                <div style={{ height: "100%", width: mounted ? `${awsBarWidth}%` : "0%", background: "linear-gradient(90deg,#4ade80,#34d399)", borderRadius: 3, transition: "width 1.4s 0.6s cubic-bezier(0.16,1,0.3,1)", boxShadow: "0 0 8px rgba(74,222,128,0.4)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, ...mono, fontSize: 9, color: "rgba(255,255,255,0.18)" }}>
                <span>$0</span><span>{displaySpend}</span>
              </div>
            </GCard>

            {/* Service Mapping — spans wider */}
            <GCard>
              <div style={{ padding: "16px 20px", borderBottom: "1px solid rgba(255,255,255,0.07)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Service Mapping</div>
                <span style={{ ...mono, fontSize: 9, color: "#93c5fd", background: "rgba(147,197,253,0.1)", border: "1px solid rgba(147,197,253,0.2)", borderRadius: 100, padding: "3px 10px" }}>{serviceCount} services</span>
              </div>
              <div style={{ overflowX: "auto" as const, maxHeight: 220, overflowY: "auto" as const }}>
                <table style={{ width: "100%", borderCollapse: "collapse" as const }}>
                  <thead>
                    <tr>{["Current","","AWS Equivalent","Strategy","Notes"].map((h,i) => <th key={i} style={{ padding: "8px 14px", textAlign: "left" as const, ...mono, fontSize: 8, color: "rgba(255,255,255,0.2)", textTransform: "uppercase" as const, letterSpacing: "0.14em", fontWeight: 400, borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.15)", position: "sticky" as const, top: 0 }}>{h}</th>)}</tr>
                  </thead>
                  <tbody>
                    {plan.service_mapping?.map((m, i) => {
                      const sc = STRATEGY_COLORS[m.strategy as keyof typeof STRATEGY_COLORS] || STRATEGY_COLORS.Rehost
                      return (
                        <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.04)", transition: "background 0.12s" }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}>
                          <td style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{m.current}</td>
                          <td style={{ padding: "10px 5px", color: "rgba(255,255,255,0.18)", fontSize: 13 }}>→</td>
                          <td style={{ padding: "10px 14px", fontSize: 11, fontWeight: 600, color: "#93c5fd" }}>{m.aws_equivalent}</td>
                          <td style={{ padding: "10px 14px" }}><span style={{ ...mono, fontSize: 9, background: sc.bg, color: sc.color, border: `1px solid ${sc.border}`, borderRadius: 5, padding: "2px 7px" }}>{m.strategy}</span></td>
                          <td style={{ padding: "10px 14px", fontSize: 11, color: "rgba(255,255,255,0.3)", maxWidth: 180 }}>{m.notes}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </GCard>
          </motion.div>

          {/* ── ROW 2: Migration Phases (morphing cards) + Risk + Cost ── */}
          <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1fr", gap: 10, marginBottom: 10 }}>

            {/* Phases — morphing card grid */}
            <motion.div {...rise(0.2)}>
              <GCard>
                <button onClick={() => setPhasesOpen(!phasesOpen)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "none", border: "none", cursor: "pointer", borderBottom: phasesOpen ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Migration Phases</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ ...mono, fontSize: 9, color: "#93c5fd", background: "rgba(147,197,253,0.1)", border: "1px solid rgba(147,197,253,0.2)", borderRadius: 100, padding: "3px 10px" }}>{phaseCount} phases</span>
                    {chevron(phasesOpen)}
                  </div>
                </button>
                <AnimatePresence>
                {phasesOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16,1,0.3,1] }} style={{ overflow: "hidden" }}>
                <div style={{ padding: "14px 16px" }}>
                  <LayoutGroup>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {plan.migration_phases?.map((phase, i) => (
                        <MorphCard key={i} index={i} isActive={activePhase === i} onClick={() => setActivePhase(activePhase === i ? null : i)}
                          item={
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: activePhase === i ? 10 : 4 }}>
                                <div style={{ width: 26, height: 26, borderRadius: "50%", background: activePhase === i ? "rgba(147,197,253,0.2)" : "rgba(255,255,255,0.07)", border: `1px solid ${activePhase === i ? "rgba(147,197,253,0.4)" : "rgba(255,255,255,0.1)"}`, display: "flex", alignItems: "center", justifyContent: "center", ...mono, fontSize: 10, color: activePhase === i ? "#93c5fd" : "rgba(255,255,255,0.4)", flexShrink: 0 }}>{phase.phase}</div>
                                <div>
                                  <div style={{ fontSize: 11, fontWeight: 700, color: "#fff", lineHeight: 1.2 }}>{phase.title}</div>
                                  <div style={{ ...mono, fontSize: 9, color: "rgba(255,255,255,0.3)", marginTop: 2 }}>{phase.duration}</div>
                                </div>
                              </div>
                              <AnimatePresence>
                                {activePhase === i && (
                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }} style={{ overflow: "hidden" }}>
                                    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                                      {phase.tasks?.slice(0, 3).map((task, j) => (
                                        <div key={j} style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
                                          <div style={{ width: 3, height: 3, borderRadius: "50%", background: "#93c5fd", flexShrink: 0, marginTop: 5, opacity: 0.5 }} />
                                          <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", lineHeight: 1.5 }}>{task}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          }
                        />
                      ))}
                    </div>
                  </LayoutGroup>
                </div>
                </motion.div>
                )}
                </AnimatePresence>
              </GCard>
            </motion.div>

            {/* Risk Assessment — morphing cards */}
            <motion.div {...rise(0.25)}>
              <GCard>
                <button onClick={() => setRisksOpen(!risksOpen)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px", background: "none", border: "none", cursor: "pointer", borderBottom: risksOpen ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Risk Assessment</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {highs > 0 && <span style={{ ...mono, fontSize: 8, padding: "2px 7px", borderRadius: 100, background: "rgba(248,113,113,0.12)", color: "#f87171", border: "1px solid rgba(248,113,113,0.22)" }}>{highs}H</span>}
                    {meds > 0  && <span style={{ ...mono, fontSize: 8, padding: "2px 7px", borderRadius: 100, background: "rgba(251,191,36,0.12)",  color: "#fbbf24", border: "1px solid rgba(251,191,36,0.22)"  }}>{meds}M</span>}
                    {lows > 0  && <span style={{ ...mono, fontSize: 8, padding: "2px 7px", borderRadius: 100, background: "rgba(74,222,128,0.12)",  color: "#4ade80", border: "1px solid rgba(74,222,128,0.22)"  }}>{lows}L</span>}
                    {chevron(risksOpen)}
                  </div>
                </button>
                <AnimatePresence>
                {risksOpen && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3, ease: [0.16,1,0.3,1] }} style={{ overflow: "hidden" }}>
                <div style={{ padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
                  <LayoutGroup>
                    {plan.risks?.map((risk, i) => {
                      const r = typeof risk === "string" ? { description: risk, severity: "Medium" as const } : risk
                      const c = RISK_COLORS[r.severity as keyof typeof RISK_COLORS] || RISK_COLORS.Medium
                      return (
                        <MorphCard key={i} index={i} isActive={activeRisk === i} onClick={() => setActiveRisk(activeRisk === i ? null : i)}
                          item={
                            <div>
                              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: activeRisk === i ? 8 : 0 }}>
                                <div style={{ width: 6, height: 6, borderRadius: "50%", background: c.text, boxShadow: `0 0 6px ${c.text}80`, flexShrink: 0 }} />
                                <span style={{ ...mono, fontSize: 9, color: c.text, textTransform: "uppercase" as const, letterSpacing: "0.1em" }}>{r.severity}</span>
                                {activeRisk !== i && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, flex: 1 }}>{r.description.slice(0, 40)}...</span>}
                              </div>
                              <AnimatePresence>
                                {activeRisk === i && (
                                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: "hidden" }}>
                                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{r.description}</span>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          }
                        />
                      )
                    })}
                  </LayoutGroup>
                </div>
                </motion.div>
                )}
                </AnimatePresence>
              </GCard>
            </motion.div>

            {/* Cost Analysis — glass pricing card style */}
            <motion.div {...rise(0.3)}>
              <GCard glow="rgba(74,222,128,0.2)" style={{ height: "100%" }}>
                <div style={{ padding: "16px 20px 0" }}>
                  <span style={lbl()}>Cost Analysis</span>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 20 }}>{SOURCE_LABELS[source]} → AWS</div>
                </div>

                {/* Glass pricing divider line */}
                <div style={divider} />

                <div style={{ padding: "18px 20px" }}>
                  {/* Current */}
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                      <span style={{ ...mono, fontSize: 10, color: "rgba(255,255,255,0.3)" }}>Current</span>
                      <span style={{ fontSize: 18, fontWeight: 800, color: "rgba(255,255,255,0.6)", letterSpacing: "-0.5px" }}>{displaySpend}</span>
                    </div>
                    <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: mounted ? "100%" : "0%", background: "rgba(255,255,255,0.18)", borderRadius: 3, transition: "width 0.9s 0.5s ease" }} />
                    </div>
                  </div>

                  <div style={divider} />

                  {/* AWS */}
                  <div style={{ margin: "18px 0" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                      <span style={{ ...mono, fontSize: 10, color: "rgba(255,255,255,0.3)" }}>AWS</span>
                      <span style={{ fontSize: 18, fontWeight: 800, color: "#4ade80", letterSpacing: "-0.5px", textShadow: "0 0 16px rgba(74,222,128,0.3)" }}>{plan.monthly_cost_estimate}</span>
                    </div>
                    <div style={{ height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: mounted ? `${awsBarWidth}%` : "0%", background: "linear-gradient(90deg,#4ade80,#34d399)", borderRadius: 3, transition: "width 1.4s 0.7s cubic-bezier(0.16,1,0.3,1)", boxShadow: "0 0 8px rgba(74,222,128,0.4)" }} />
                    </div>
                  </div>

                  <div style={divider} />

                  {/* Savings */}
                  <div style={{ marginTop: 18, background: "rgba(74,222,128,0.07)", border: "1px solid rgba(74,222,128,0.14)", borderRadius: 12, padding: "14px 16px", textAlign: "center" as const }}>
                    <div style={{ ...mono, fontSize: 9, color: "rgba(74,222,128,0.45)", letterSpacing: "0.15em", textTransform: "uppercase" as const, marginBottom: 5 }}>Projected Savings</div>
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#4ade80", letterSpacing: "-0.5px", textShadow: "0 0 18px rgba(74,222,128,0.3)" }}>{plan.cost_savings}</div>
                  </div>
                </div>
              </GCard>
            </motion.div>
          </div>

          {/* ── ROW 3: Checklist full width ── */}
          <motion.div {...rise(0.35)}>
            <GCard>
              <button onClick={() => setCheckOpen(!checkOpen)} style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", background: "none", border: "none", cursor: "pointer", borderBottom: checkOpen ? "1px solid rgba(255,255,255,0.07)" : "none" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>Pre-Migration Checklist</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div style={{ width: 80, height: 3, background: "rgba(255,255,255,0.07)", borderRadius: 2, overflow: "hidden" }}>
                      <div style={{ height: "100%", width: plan.checklist?.length ? `${(checked.size / plan.checklist.length) * 100}%` : "0%", background: "linear-gradient(90deg,#4ade80,#34d399)", borderRadius: 2, transition: "width 0.3s", boxShadow: "0 0 5px rgba(74,222,128,0.4)" }} />
                    </div>
                    <span style={{ ...mono, fontSize: 10, color: "rgba(255,255,255,0.22)" }}>{checked.size}/{plan.checklist?.length || 0}</span>
                  </div>
                </div>
                {chevron(checkOpen)}
              </button>
              <AnimatePresence>
                {checkOpen && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.32, ease: [0.16,1,0.3,1] }} style={{ overflow: "hidden" }}>
                    <div style={{ padding: "14px 22px 20px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(380px, 1fr))", gap: 8 }}>
                      {plan.checklist?.map((item, i) => {
                        const done = checked.has(i)
                        return (
                          <button key={i} onClick={() => toggleCheck(i)} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "11px 13px", borderRadius: 10, border: `1px solid ${done ? "rgba(74,222,128,0.2)" : "rgba(255,255,255,0.06)"}`, background: done ? "rgba(74,222,128,0.05)" : "rgba(255,255,255,0.02)", cursor: "pointer", textAlign: "left" as const, transition: "all 0.15s" }}>
                            <div style={{ width: 17, height: 17, borderRadius: 5, flexShrink: 0, marginTop: 1, border: `1.5px solid ${done ? "#4ade80" : "rgba(255,255,255,0.18)"}`, background: done ? "rgba(74,222,128,0.15)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.15s" }}>
                              {done && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5l2.5 2.5L8 1" stroke="#4ade80" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                            </div>
                            <span style={{ fontSize: 12, color: done ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.6)", textDecoration: done ? "line-through" : "none", lineHeight: 1.6, transition: "all 0.15s" }}>{item}</span>
                          </button>
                        )
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </GCard>
          </motion.div>

          {/* ── CTA ── */}
          <motion.div {...rise(0.4)} style={{ textAlign: "center" as const, marginTop: 24 }}>
            <button onClick={onReset} style={{ background: "rgba(255,255,255,0.07)", color: "#fff", border: "1px solid rgba(255,255,255,0.14)", borderRadius: 100, padding: "14px 52px", fontSize: 14, fontWeight: 700, cursor: "pointer", backdropFilter: "blur(12px)", transition: "all 0.2s", boxShadow: "0 4px 24px rgba(0,0,0,0.25)" }}
              onMouseEnter={e => { (e.target as HTMLElement).style.background = "rgba(255,255,255,0.13)"; (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.22)" }}
              onMouseLeave={e => { (e.target as HTMLElement).style.background = "rgba(255,255,255,0.07)"; (e.target as HTMLElement).style.borderColor = "rgba(255,255,255,0.14)" }}
            >Plan Another Migration</button>
          </motion.div>

        </div>
      </div>
    </div>
  )
}
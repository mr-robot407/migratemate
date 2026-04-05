"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { SourceType, FormData } from "@/app/page"
import Image from "next/image"

interface FormPageProps {
  source: SourceType
  onSubmit: (data: FormData) => void
  onBack: () => void
  error: string | null
}

const SOURCE_LABELS: Record<SourceType, { label: string; color: string; iconSrc?: string; iconSvg?: React.ReactNode }> = {
  "on-prem": {
    label: "On-Premises", color: "#1a1a1a",
    iconSvg: (
      <svg viewBox="0 0 64 64" width="20" height="20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="12" width="48" height="10" rx="3" fill="#fff" opacity="0.9"/>
        <rect x="8" y="26" width="48" height="10" rx="3" fill="#fff" opacity="0.75"/>
        <rect x="8" y="40" width="48" height="10" rx="3" fill="#fff" opacity="0.6"/>
        <circle cx="50" cy="17" r="2.5" fill="#22c55e"/>
        <circle cx="50" cy="31" r="2.5" fill="#22c55e"/>
        <circle cx="50" cy="45" r="2.5" fill="#f59e0b"/>
      </svg>
    ),
  },
  "azure": { label: "Microsoft Azure", color: "#0078D4", iconSrc: "/icons/azure.svg" },
  "gcp": { label: "Google Cloud", color: "#4285F4", iconSrc: "/icons/gcp.png" },
}

const UPTIME_OPTIONS = ["99% (87.6 hrs/yr)", "99.9% (8.76 hrs/yr)", "99.95% (4.38 hrs/yr)", "99.99% (52.6 min/yr)"]
const BUDGET_OPTIONS = ["Cost Sensitive — Minimize spend", "Balanced — Cost & performance", "Performance First — Best architecture"]

// Wire animation paths
const WIRES = [
  { id: "w1", d: "M-60,180 Q200,140 400,160 T860,190", delay: 0,   duration: 4.2 },
  { id: "w2", d: "M-60,230 Q250,200 450,220 T860,250", delay: 0.6, duration: 4.8 },
  { id: "w3", d: "M-60,280 Q200,270 400,300 T860,320", delay: 1.2, duration: 5.0 },
  { id: "w4", d: "M-60,330 Q250,310 450,350 T860,370", delay: 1.8, duration: 4.5 },
  { id: "w5", d: "M-60,380 Q200,400 400,420 T860,440", delay: 0.3, duration: 5.2 },
]

function MigrationWireAnimation({ source }: { source: SourceType }) {
  const renderSourceIcon = () => {
    if (source === "azure") {
    return (
    <div style={{ filter: "drop-shadow(0 0 20px #0078D488)", width: 100, height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Image src="/icons/azure.svg" alt="Azure" width={90} height={90} style={{ objectFit: "contain" }} />
    </div>
  )
}
    if (source === "gcp") {
    return (
    <div style={{ filter: "drop-shadow(0 0 20px #4285F488)", width: 100, height: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <Image src="/icons/gcp.png" alt="GCP" width={90} height={90} style={{ objectFit: "contain" }} />
    </div>
  )
}
    // on-prem server rack
    return (
      <svg width="90" height="140" viewBox="0 0 120 180">
        <defs>
          <linearGradient id="serverGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#374151"/>
            <stop offset="100%" stopColor="#1f2937"/>
          </linearGradient>
          <filter id="serverGlow">
            <feGaussianBlur stdDeviation="8" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        {/* Glow behind rack */}
        <ellipse cx="60" cy="90" rx="50" ry="70" fill="rgba(96,165,250,0.08)" filter="url(#serverGlow)"/>
        <rect x="20" y="20" width="80" height="38" rx="4" fill="url(#serverGrad)" stroke="#4b5563" strokeWidth="1.5"/>
        <circle cx="34" cy="39" r="4" fill="#10b981"/>
        <circle cx="48" cy="39" r="4" fill="#fbbf24"/>
        <rect x="62" y="34" width="28" height="10" rx="2" fill="#374151"/>
        <rect x="20" y="68" width="80" height="38" rx="4" fill="url(#serverGrad)" stroke="#4b5563" strokeWidth="1.5"/>
        <circle cx="34" cy="87" r="4" fill="#10b981"/>
        <circle cx="48" cy="87" r="4" fill="#10b981"/>
        <rect x="62" y="82" width="28" height="10" rx="2" fill="#374151"/>
        <rect x="20" y="116" width="80" height="38" rx="4" fill="url(#serverGrad)" stroke="#4b5563" strokeWidth="1.5"/>
        <circle cx="34" cy="135" r="4" fill="#10b981"/>
        <circle cx="48" cy="135" r="4" fill="#fbbf24"/>
        <rect x="62" y="130" width="28" height="10" rx="2" fill="#374151"/>
      </svg>
    )
  }

  return (
    <div style={{ position: "absolute", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      <svg
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
        viewBox="0 0 800 600"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="particleGlow">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="1"/>
            <stop offset="40%" stopColor="#06b6d4" stopOpacity="0.8"/>
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0"/>
          </radialGradient>
          <filter id="wireGlow">
            <feGaussianBlur stdDeviation="3" result="blur"/>
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          {/* Source glow */}
          <radialGradient id="sourceGlow" cx="0%" cy="50%" r="100%">
            <stop offset="0%" stopColor={source === "azure" ? "#0078D4" : source === "gcp" ? "#4285F4" : "#60a5fa"} stopOpacity="0.4"/>
            <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="awsGlow" cx="100%" cy="50%" r="100%">
            <stop offset="0%" stopColor="#FF9900" stopOpacity="0.4"/>
            <stop offset="100%" stopColor="transparent" stopOpacity="0"/>
          </radialGradient>
        </defs>

        {/* Source glow blob */}
        <ellipse cx="0" cy="300" rx="120" ry="200" fill="url(#sourceGlow)"/>
        {/* AWS glow blob */}
        <ellipse cx="800" cy="300" rx="120" ry="200" fill="url(#awsGlow)"/>

        {/* Wire paths */}
        {WIRES.map(wire => (
          <g key={wire.id}>
            <path d={wire.d} stroke="rgba(96,165,250,0.12)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
            {/* Glow version of wire */}
            <path d={wire.d} stroke="rgba(96,165,250,0.06)" strokeWidth="6" fill="none" strokeLinecap="round" filter="url(#wireGlow)"/>
            {/* Traveling particle */}
            <motion.circle
              r="5"
              fill="url(#particleGlow)"
              filter="url(#wireGlow)"
              initial={{ offsetDistance: "0%" }}
              animate={{ offsetDistance: ["0%", "100%"] }}
              transition={{ duration: wire.duration, delay: wire.delay, repeat: Infinity, ease: "linear" }}
              style={{ offsetPath: `path("${wire.d}")` } as any}
            />
            {/* Inner bright dot */}
            <motion.circle
              r="2.5"
              fill="#ffffff"
              initial={{ offsetDistance: "0%" }}
              animate={{ offsetDistance: ["0%", "100%"] }}
              transition={{ duration: wire.duration, delay: wire.delay, repeat: Infinity, ease: "linear" }}
              style={{ offsetPath: `path("${wire.d}")` } as any}
            />
          </g>
        ))}
      </svg>

      {/* Source icon — left */}
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        style={{
          position: "absolute", left: -20, top: "50%",
          transform: "translateY(-50%)",
          filter: `drop-shadow(0 0 20px ${source === "azure" ? "#0078D4" : source === "gcp" ? "#4285F4" : "#60a5fa"}88)`,
        }}
      >
        {renderSourceIcon()}
      </motion.div>

      {/* AWS icon — right */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 1 }}
        style={{
          position: "absolute", right: 0, top: "50%",
          transform: "translateY(-50%)",
          filter: "drop-shadow(0 0 20px #FF990088)",
        }}
      >
        <Image
          src="/icons/aws.png"
          alt="AWS"
          width={100}
          height={60}
          style={{ objectFit: "contain", opacity: 0.85 }}
        />
      </motion.div>
    </div>
  )
}

function StardustButton({ onClick, isSubmitting }: { onClick: () => void; isSubmitting: boolean }) {
  return (
    <>
      <style>{`
        .stardust-btn { position: relative; border-radius: 100px; background: #0a1929; border: 0; outline: none; width: 100%; cursor: pointer; transition: all 0.2s ease;
          box-shadow: inset 0 0.3rem 0.9rem rgba(255,255,255,0.3), inset 0 -0.1rem 0.3rem rgba(0,0,0,0.7), inset 0 -0.4rem 0.9rem rgba(255,255,255,0.5), 0 1rem 1rem -0.6rem rgba(0,0,0,0.8);
        }
        .stardust-btn:hover { box-shadow: inset 0 0.3rem 0.5rem rgba(129,216,255,0.4), inset 0 -0.1rem 0.3rem rgba(0,0,0,0.7), inset 0 -0.4rem 0.9rem rgba(64,180,255,0.6), 0 1rem 1rem -0.6rem rgba(0,0,0,0.8); }
        .stardust-btn:active { transform: translateY(3px); }
        .stardust-btn:disabled { opacity: 0.7; cursor: not-allowed; }
      `}</style>
      <button className="stardust-btn" onClick={onClick} disabled={isSubmitting}>
        <div style={{
          fontSize: 18, fontWeight: 600, color: "rgba(129,216,255,0.9)",
          padding: "18px 32px", display: "flex", alignItems: "center",
          justifyContent: "center", gap: 10,
          fontFamily: "'Cabinet Grotesk', sans-serif", letterSpacing: "-0.3px",
        }}>
          {isSubmitting ? (
            <>
              <span style={{ width: 16, height: 16, border: "2px solid rgba(129,216,255,0.3)", borderTopColor: "rgba(129,216,255,0.9)", borderRadius: "50%", display: "inline-block", animation: "spin 0.7s linear infinite" }} />
              Generating your plan...
            </>
          ) : (
            <><span>✧</span> Generate Migration Plan <span>✦</span></>
          )}
        </div>
      </button>
    </>
  )
}

export default function FormPage({ source, onSubmit, onBack, error }: FormPageProps) {
  const [servers, setServers] = useState("")
  const [databases, setDatabases] = useState("")
  const [dataSize, setDataSize] = useState("")
  const [uptime, setUptime] = useState("99.9% (8.76 hrs/yr)")
  const [budget, setBudget] = useState("Balanced — Cost & performance")
  const [currentSpend, setCurrentSpend] = useState("")
  const [additional, setAdditional] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const src = SOURCE_LABELS[source]

  const handleSubmit = () => {
    if (!servers.trim() || !databases.trim()) {
      alert("Please fill in at least the servers and databases fields.")
      return
    }
    setIsSubmitting(true)
    const additionalContext = currentSpend ? `Current monthly spend: ${currentSpend}. ${additional}` : additional
    onSubmit({ source, servers, databases, data_size: dataSize, uptime_requirement: uptime, budget, additional: additionalContext })
  }

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "rgba(240,245,255,0.88)",
    border: "1px solid rgba(255,255,255,0.5)",
    borderRadius: 10, padding: "12px 14px",
    fontSize: 14, color: "#0f1e3a",
    fontFamily: "inherit", outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    boxSizing: "border-box" as const,
  }

  const labelStyle: React.CSSProperties = {
    fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.9)",
    marginBottom: 6, display: "block" as const,
  }

  const hintStyle: React.CSSProperties = {
    fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4, fontFamily: "monospace",
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #c8d8f0 0%, #b0c8e8 30%, #90b0e0 60%, #6a94d4 100%)",
      padding: "60px 24px",
      display: "flex", flexDirection: "column", alignItems: "center",
      position: "relative", overflow: "hidden",
    }}>

      {/* Wire animation behind everything */}
      <MigrationWireAnimation source={source} />

      {/* Back button */}
      <button onClick={onBack} style={{
        position: "fixed", top: 24, left: 24,
        background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.4)",
        borderRadius: 12, padding: "8px 16px",
        fontSize: 13, color: "#fff", cursor: "pointer",
        display: "flex", alignItems: "center", gap: 6,
        backdropFilter: "blur(10px)", fontFamily: "monospace", zIndex: 10,
      }}>
        ← Back
      </button>

      {/* Step indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 48, fontFamily: "monospace", fontSize: 12, color: "rgba(255,255,255,0.6)", position: "relative", zIndex: 2 }}>
        <span>① Select Source</span><span>→</span>
        <span style={{ color: "#fff", fontWeight: 600 }}>② Fill Details</span>
        <span>→</span><span>③ Get Plan</span>
      </div>

      <div style={{ width: "100%", maxWidth: 700, position: "relative", zIndex: 2 }}>

        {/* Source badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 10,
          background: "rgba(220, 191, 191, 0.2)", border: "1px solid rgba(255,255,255,0.4)",
          borderRadius: 20, padding: "8px 18px",
          fontSize: 13, color: "#030202", fontFamily: "monospace",
          marginBottom: 28, backdropFilter: "blur(10px)", fontWeight: 600,
        }}>
          {src.iconSrc ? (
            <Image src={src.iconSrc} alt={src.label} width={20} height={20} style={{ borderRadius: 4, objectFit: "contain" }} />
          ) : src.iconSvg}
          Migrating from {src.label}
        </div>

        {error && (
          <div style={{
            background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)",
            borderRadius: 12, padding: "12px 16px", fontSize: 13, color: "#fca5a5", marginBottom: 20,
          }}>
            {error}
          </div>
        )}

        {/* Form card */}
        <div style={{
          background: "rgba(220,232,255,0.2)", backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(255,255,255,0.3)", borderRadius: 24,
          boxShadow: "0 8px 40px rgba(0,0,0,0.2), inset 0 1px 0 rgba(255,255,255,0.3)",
          overflow: "hidden",
        }}>

          <div style={{ padding: "28px 32px", borderBottom: "1px solid rgba(255,255,255,0.15)", background: "rgba(255,255,255,0.08)" }}>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#0d0000", fontFamily: "'Cabinet Grotesk', Georgia, serif", letterSpacing: "-0.5px", margin: 0 }}>
              Infrastructure Details
            </h2>
            <p style={{ fontSize: 14, color: "rgba(6, 3, 3, 0.65)", marginTop: 6, marginBottom: 0, fontStyle: "italic", fontFamily: "'DM Serif Display', Georgia, serif" }}>
              Tell us about your current {src.label} setup and we'll craft your perfect migration plan
            </p>
          </div>

          <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20 }}>

            <div>
              <label style={labelStyle}>Current Servers / Compute *</label>
              <textarea value={servers} onChange={e => setServers(e.target.value)}
                placeholder={source === "azure" ? "e.g. 4 Azure VMs (Standard_D4s_v3), 1 App Service Plan (P2v3)" : source === "gcp" ? "e.g. 3 Compute Engine n2-standard-4 VMs, 1 GKE cluster" : "e.g. 3 Apache web servers (8 CPU, 16GB RAM), 1 Node.js app server, 1 Nginx load balancer"}
                style={{ ...inputStyle, minHeight: 80, resize: "none" }}
                onFocus={e => { e.target.style.borderColor = "#60a5fa"; e.target.style.boxShadow = "0 0 0 3px rgba(96,165,250,0.15)" }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.5)"; e.target.style.boxShadow = "none" }}
              />
              <p style={hintStyle}>List all compute resources with specs</p>
            </div>

            <div>
              <label style={labelStyle}>Current Databases *</label>
              <textarea value={databases} onChange={e => setDatabases(e.target.value)}
                placeholder={source === "azure" ? "e.g. Azure SQL Database (Business Critical, 8 vCores), Azure Cosmos DB" : source === "gcp" ? "e.g. Cloud SQL PostgreSQL 14 (500GB), Cloud Spanner, Firestore" : "e.g. MySQL 8.0 primary with 2 read replicas (500GB), Redis cache"}
                style={{ ...inputStyle, minHeight: 80, resize: "none" }}
                onFocus={e => { e.target.style.borderColor = "#60a5fa"; e.target.style.boxShadow = "0 0 0 3px rgba(96,165,250,0.15)" }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.5)"; e.target.style.boxShadow = "none" }}
              />
              <p style={hintStyle}>Include type, version and size</p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Total Data Size</label>
                <input type="text" value={dataSize} onChange={e => setDataSize(e.target.value)}
                  placeholder="e.g. 500GB database, 2TB storage" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = "#60a5fa"; e.target.style.boxShadow = "0 0 0 3px rgba(96,165,250,0.15)" }}
                  onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.5)"; e.target.style.boxShadow = "none" }}
                />
              </div>
              <div>
                <label style={labelStyle}>Current Monthly Spend</label>
                <input type="text" value={currentSpend} onChange={e => setCurrentSpend(e.target.value)}
                  placeholder="e.g. $8,000/month" style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = "#60a5fa"; e.target.style.boxShadow = "0 0 0 3px rgba(96,165,250,0.15)" }}
                  onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.5)"; e.target.style.boxShadow = "none" }}
                />
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Uptime Requirement</label>
                <select value={uptime} onChange={e => setUptime(e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer", appearance: "none" as const }}>
                  {UPTIME_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Budget Sensitivity</label>
                <select value={budget} onChange={e => setBudget(e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer", appearance: "none" as const }}>
                  {BUDGET_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Additional Context</label>
              <textarea value={additional} onChange={e => setAdditional(e.target.value)}
                placeholder="e.g. E-commerce platform, 10k daily users, peak traffic weekends, zero downtime required, PCI DSS compliance..."
                style={{ ...inputStyle, minHeight: 80, resize: "none" }}
                onFocus={e => { e.target.style.borderColor = "#60a5fa"; e.target.style.boxShadow = "0 0 0 3px rgba(96,165,250,0.15)" }}
                onBlur={e => { e.target.style.borderColor = "rgba(255,255,255,0.5)"; e.target.style.boxShadow = "none" }}
              />
              <p style={hintStyle}>Compliance, traffic patterns, special requirements</p>
            </div>
          </div>

          <div style={{ padding: "0 32px 32px" }}>
            <StardustButton onClick={handleSubmit} isSubmitting={isSubmitting} />
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        select option { background: #1a3a6a; color: #fff; }
      `}</style>
    </div>
  )
}
"use client"

import { useState } from "react"
import { SourceType, FormData } from "@/app/page"

interface FormPageProps {
  source: SourceType
  onSubmit: (data: FormData) => void
  onBack: () => void
  error: string | null
}

const SOURCE_LABELS: Record<SourceType, { label: string; icon: string; color: string }> = {
  "on-prem": { label: "On-Premises", icon: "🏢", color: "#1a1a1a" },
  "azure": { label: "Microsoft Azure", icon: "☁️", color: "#0078D4" },
  "gcp": { label: "Google Cloud", icon: "🌐", color: "#4285F4" },
}

const UPTIME_OPTIONS = ["99% (87.6 hrs/yr)", "99.9% (8.76 hrs/yr)", "99.95% (4.38 hrs/yr)", "99.99% (52.6 min/yr)"]
const BUDGET_OPTIONS = ["Cost Sensitive — Minimize spend", "Balanced — Cost & performance", "Performance First — Best architecture"]

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
    const additionalContext = currentSpend
      ? `Current monthly spend: ${currentSpend}. ${additional}`
      : additional

    onSubmit({
      source,
      servers,
      databases,
      data_size: dataSize,
      uptime_requirement: uptime,
      budget,
      additional: additionalContext,
    })
  }

  const inputStyle = {
    width: "100%",
    background: "#f9f8f6",
    border: "1px solid rgba(0,0,0,0.1)",
    borderRadius: 10,
    padding: "12px 14px",
    fontSize: 14,
    color: "#0f0e0c",
    fontFamily: "inherit",
    outline: "none",
    transition: "border-color 0.15s, box-shadow 0.15s",
    boxSizing: "border-box" as const,
  }

  const labelStyle = {
    fontSize: 13,
    fontWeight: 600,
    color: "#0f0e0c",
    marginBottom: 6,
    display: "block" as const,
  }

  const hintStyle = {
    fontSize: 11,
    color: "#a8a59f",
    marginTop: 4,
    fontFamily: "monospace",
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #faf8f4 0%, #f0ebe0 100%)",
      padding: "60px 24px",
      display: "flex", flexDirection: "column", alignItems: "center",
    }}>

      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          position: "fixed", top: 24, left: 24,
          background: "rgba(255,255,255,0.8)",
          border: "1px solid rgba(0,0,0,0.1)",
          borderRadius: 12, padding: "8px 16px",
          fontSize: 13, color: "#6b6456", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
          backdropFilter: "blur(8px)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          fontFamily: "monospace", zIndex: 10,
        }}
      >
        ← Back
      </button>

      {/* Step indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 48, fontFamily: "monospace", fontSize: 12, color: "#a8a59f" }}>
        <span>① Select Source</span>
        <span>→</span>
        <span style={{ color: "#0f0e0c", fontWeight: 600 }}>② Fill Details</span>
        <span>→</span>
        <span>③ Get Plan</span>
      </div>

      <div style={{ width: "100%", maxWidth: 700 }}>

        {/* Source badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,0.8)",
          border: `1px solid rgba(0,0,0,0.1)`,
          borderRadius: 20, padding: "6px 16px",
          fontSize: 13, color: src.color,
          fontFamily: "monospace", marginBottom: 24,
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          fontWeight: 600,
        }}>
          {src.icon} Migrating from {src.label}
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: "rgba(239,68,68,0.08)",
            border: "1px solid rgba(239,68,68,0.2)",
            borderRadius: 12, padding: "12px 16px",
            fontSize: 13, color: "#ef4444", marginBottom: 20,
          }}>
            {error}
          </div>
        )}

        {/* Form card */}
        <div style={{
          background: "#fff",
          border: "1px solid rgba(0,0,0,0.08)",
          borderRadius: 24,
          boxShadow: "0 4px 24px rgba(0,0,0,0.06)",
          overflow: "hidden",
        }}>

          {/* Card header */}
          <div style={{
            padding: "24px 32px",
            borderBottom: "1px solid rgba(0,0,0,0.06)",
            background: "#faf8f4",
          }}>
            <h2 style={{
              fontSize: 20, fontWeight: 700, color: "#0f0e0c",
              fontFamily: "'Cabinet Grotesk', sans-serif",
              letterSpacing: "-0.5px", margin: 0,
            }}>Infrastructure Details</h2>
            <p style={{ fontSize: 13, color: "#6b6456", marginTop: 4, margin: 0 }}>
              Tell us about your current {src.label} setup
            </p>
          </div>

          {/* Form fields */}
          <div style={{ padding: "28px 32px", display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Servers */}
            <div>
              <label style={labelStyle}>Current Servers / Compute *</label>
              <textarea
                value={servers}
                onChange={e => setServers(e.target.value)}
                placeholder={source === "azure"
                  ? "e.g. 4 Azure VMs (Standard_D4s_v3), 1 App Service Plan (P2v3)"
                  : source === "gcp"
                  ? "e.g. 3 Compute Engine n2-standard-4 VMs, 1 GKE cluster"
                  : "e.g. 3 Apache web servers (8 CPU, 16GB RAM), 1 Node.js app server, 1 Nginx load balancer"}
                style={{ ...inputStyle, minHeight: 80, resize: "none" as const }}
                onFocus={e => { e.target.style.borderColor = "#1a56db"; e.target.style.boxShadow = "0 0 0 3px rgba(26,86,219,0.08)" }}
                onBlur={e => { e.target.style.borderColor = "rgba(0,0,0,0.1)"; e.target.style.boxShadow = "none" }}
              />
              <p style={hintStyle}>List all compute resources with specs</p>
            </div>

            {/* Databases */}
            <div>
              <label style={labelStyle}>Current Databases *</label>
              <textarea
                value={databases}
                onChange={e => setDatabases(e.target.value)}
                placeholder={source === "azure"
                  ? "e.g. Azure SQL Database (Business Critical, 8 vCores), Azure Cosmos DB"
                  : source === "gcp"
                  ? "e.g. Cloud SQL PostgreSQL 14 (500GB), Cloud Spanner, Firestore"
                  : "e.g. MySQL 8.0 primary with 2 read replicas (500GB), Redis cache"}
                style={{ ...inputStyle, minHeight: 80, resize: "none" as const }}
                onFocus={e => { e.target.style.borderColor = "#1a56db"; e.target.style.boxShadow = "0 0 0 3px rgba(26,86,219,0.08)" }}
                onBlur={e => { e.target.style.borderColor = "rgba(0,0,0,0.1)"; e.target.style.boxShadow = "none" }}
              />
              <p style={hintStyle}>Include type, version and size</p>
            </div>

            {/* Grid row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Total Data Size</label>
                <input
                  type="text"
                  value={dataSize}
                  onChange={e => setDataSize(e.target.value)}
                  placeholder="e.g. 500GB database, 2TB storage"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = "#1a56db"; e.target.style.boxShadow = "0 0 0 3px rgba(26,86,219,0.08)" }}
                  onBlur={e => { e.target.style.borderColor = "rgba(0,0,0,0.1)"; e.target.style.boxShadow = "none" }}
                />
              </div>
              <div>
                <label style={labelStyle}>Current Monthly Spend</label>
                <input
                  type="text"
                  value={currentSpend}
                  onChange={e => setCurrentSpend(e.target.value)}
                  placeholder="e.g. $8,000/month"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = "#1a56db"; e.target.style.boxShadow = "0 0 0 3px rgba(26,86,219,0.08)" }}
                  onBlur={e => { e.target.style.borderColor = "rgba(0,0,0,0.1)"; e.target.style.boxShadow = "none" }}
                />
              </div>
            </div>

            {/* Grid row 2 */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div>
                <label style={labelStyle}>Uptime Requirement</label>
                <select
                  value={uptime}
                  onChange={e => setUptime(e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer", appearance: "none" as const }}
                >
                  {UPTIME_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Budget Sensitivity</label>
                <select
                  value={budget}
                  onChange={e => setBudget(e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer", appearance: "none" as const }}
                >
                  {BUDGET_OPTIONS.map(opt => <option key={opt}>{opt}</option>)}
                </select>
              </div>
            </div>

            {/* Additional context */}
            <div>
              <label style={labelStyle}>Additional Context</label>
              <textarea
                value={additional}
                onChange={e => setAdditional(e.target.value)}
                placeholder="e.g. E-commerce platform, 10k daily users, peak traffic weekends, zero downtime required, PCI DSS compliance..."
                style={{ ...inputStyle, minHeight: 80, resize: "none" as const }}
                onFocus={e => { e.target.style.borderColor = "#1a56db"; e.target.style.boxShadow = "0 0 0 3px rgba(26,86,219,0.08)" }}
                onBlur={e => { e.target.style.borderColor = "rgba(0,0,0,0.1)"; e.target.style.boxShadow = "none" }}
              />
              <p style={hintStyle}>Compliance, traffic patterns, special requirements</p>
            </div>
          </div>

          {/* Submit button */}
          <div style={{ padding: "0 32px 28px" }}>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                width: "100%",
                background: isSubmitting ? "#555" : "#0f0e0c",
                color: "#fff",
                border: "none",
                borderRadius: 14,
                padding: "16px",
                fontSize: 16,
                fontWeight: 700,
                fontFamily: "'Cabinet Grotesk', sans-serif",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                transition: "all 0.15s",
                letterSpacing: "-0.3px",
              }}
            >
              {isSubmitting ? (
                <>
                  <span style={{
                    width: 16, height: 16,
                    border: "2px solid rgba(255,255,255,0.3)",
                    borderTopColor: "#fff",
                    borderRadius: "50%",
                    display: "inline-block",
                    animation: "spin 0.7s linear infinite",
                  }} />
                  Generating your plan...
                </>
              ) : (
                <>⚡ Generate Migration Plan</>
              )}
            </button>
            <p style={{ textAlign: "center", fontSize: 11, color: "#a8a59f", marginTop: 12, fontFamily: "monospace" }}>
              Powered by Claude AI · Results in ~15 seconds
            </p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        select option { background: white; color: #0f0e0c; }
      `}</style>
    </div>
  )
}

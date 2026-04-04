"use client"

import { useState } from "react"
import { SourceType } from "@/app/page"

interface SourcePageProps {
  onSelect: (source: SourceType) => void
  onBack: () => void
}

const SOURCES = [
  {
    id: "on-prem" as SourceType,
    label: "On-Premises",
    sublabel: "Physical servers & data centers",
    description: "Migrate from your own hardware, VMware, or bare-metal servers to AWS",
    icon: (
      <svg viewBox="0 0 64 64" width="48" height="48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="8" y="12" width="48" height="10" rx="3" fill="#1a1a1a" opacity="0.9"/>
        <rect x="8" y="26" width="48" height="10" rx="3" fill="#1a1a1a" opacity="0.75"/>
        <rect x="8" y="40" width="48" height="10" rx="3" fill="#1a1a1a" opacity="0.6"/>
        <circle cx="50" cy="17" r="2.5" fill="#22c55e"/>
        <circle cx="50" cy="31" r="2.5" fill="#22c55e"/>
        <circle cx="50" cy="45" r="2.5" fill="#f59e0b"/>
        <rect x="12" y="15" width="16" height="4" rx="1" fill="#555" opacity="0.5"/>
        <rect x="12" y="29" width="12" height="4" rx="1" fill="#555" opacity="0.5"/>
      </svg>
    ),
    color: "#1a1a1a",
    bg: "rgba(0,0,0,0.04)",
    border: "rgba(0,0,0,0.12)",
    tag: "Most Common",
  },
  {
    id: "azure" as SourceType,
    label: "Microsoft Azure",
    sublabel: "Azure VMs, SQL, Blob Storage",
    description: "Migrate Azure workloads to equivalent AWS services with zero downtime",
    icon: (
      <svg viewBox="0 0 64 64" width="48" height="48" xmlns="http://www.w3.org/2000/svg">
        <path d="M16 48 L30 16 L44 32 L36 48 Z" fill="#0078D4"/>
        <path d="M30 16 L44 32 L52 48 L36 48 Z" fill="#50B4E8"/>
        <path d="M16 48 L36 48 L28 40 Z" fill="#001E6C" opacity="0.3"/>
      </svg>
    ),
    color: "#0078D4",
    bg: "rgba(0,120,212,0.05)",
    border: "rgba(0,120,212,0.2)",
    tag: "Enterprise",
  },
  {
    id: "gcp" as SourceType,
    label: "Google Cloud",
    sublabel: "Compute Engine, BigQuery, GCS",
    description: "Move GCP workloads to AWS with service-to-service mapping and cost analysis",
    icon: (
      <svg viewBox="0 0 64 64" width="48" height="48" xmlns="http://www.w3.org/2000/svg">
        <path d="M38 20H26L18 32L26 44H38L46 32Z" fill="none"/>
        <path d="M32 14L20 20V32L26 38L38 38L44 32V20L32 14Z" fill="none"/>
        <circle cx="32" cy="24" r="5" fill="#4285F4"/>
        <path d="M20 38 Q14 32 20 26 L26 32 Q22 35 26 40Z" fill="#34A853"/>
        <path d="M44 26 Q50 32 44 38 L38 32 Q42 29 38 24Z" fill="#FBBC05"/>
        <path d="M26 40 Q32 46 38 40 L32 34 Q29 38 26 40Z" fill="#EA4335"/>
        <path d="M38 24 Q32 18 26 24 L32 30 Q35 26 38 24Z" fill="#4285F4" opacity="0.7"/>
      </svg>
    ),
    color: "#4285F4",
    bg: "rgba(66,133,244,0.05)",
    border: "rgba(66,133,244,0.2)",
    tag: "Growing",
  },
]

export default function SourcePage({ onSelect, onBack }: SourcePageProps) {
  const [hovered, setHovered] = useState<SourceType | null>(null)
  const [selected, setSelected] = useState<SourceType | null>(null)

  const handleSelect = (id: SourceType) => {
    setSelected(id)
    setTimeout(() => onSelect(id), 200)
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #faf8f4 0%, #f0ebe0 50%, #faf8f4 100%)",
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
          fontFamily: "monospace",
          zIndex: 10,
        }}
      >
        ← Back
      </button>

      {/* Step indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 48, fontFamily: "monospace", fontSize: 12, color: "#a8a59f" }}>
        <span style={{ color: "#0f0e0c", fontWeight: 600 }}>① Select Source</span>
        <span>→</span>
        <span>② Fill Details</span>
        <span>→</span>
        <span>③ Get Plan</span>
      </div>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 56, maxWidth: 560 }}>
        <h2 style={{
          fontFamily: "'Cabinet Grotesk', Georgia, serif",
          fontSize: "clamp(28px, 4vw, 44px)",
          fontWeight: 800, color: "#0f0e0c",
          letterSpacing: "-1.5px", marginBottom: 12,
        }}>
          Where are you migrating from?
        </h2>
        <p style={{ fontSize: 16, color: "#6b6456", lineHeight: 1.6 }}>
          Choose your current infrastructure. We'll tailor the AWS migration plan specifically for your platform.
        </p>
      </div>

      {/* Source cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 16, width: "100%", maxWidth: 900,
      }}>
        {SOURCES.map((src) => {
          const isHovered = hovered === src.id
          const isSelected = selected === src.id

          return (
            <button
              key={src.id}
              onClick={() => handleSelect(src.id)}
              onMouseEnter={() => setHovered(src.id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: isHovered || isSelected ? "#fff" : "rgba(255,255,255,0.6)",
                border: `2px solid ${isHovered || isSelected ? src.color : "rgba(0,0,0,0.08)"}`,
                borderRadius: 20,
                padding: "28px 24px",
                cursor: "pointer",
                textAlign: "left",
                transition: "all 0.2s ease",
                transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                boxShadow: isHovered
                  ? `0 12px 40px ${src.color}20`
                  : "0 2px 12px rgba(0,0,0,0.05)",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {/* Tag */}
              <div style={{
                position: "absolute", top: 16, right: 16,
                background: src.bg,
                border: `1px solid ${src.border}`,
                borderRadius: 20, padding: "2px 10px",
                fontSize: 11, color: src.color,
                fontFamily: "monospace", fontWeight: 600,
              }}>
                {src.tag}
              </div>

              {/* Icon */}
              <div style={{
                width: 72, height: 72,
                background: isHovered ? src.bg : "rgba(0,0,0,0.03)",
                borderRadius: 16, marginBottom: 20,
                display: "flex", alignItems: "center", justifyContent: "center",
                border: `1px solid ${isHovered ? src.border : "rgba(0,0,0,0.06)"}`,
                transition: "all 0.2s ease",
              }}>
                {src.icon}
              </div>

              {/* Text */}
              <div style={{
                fontSize: 18, fontWeight: 700, color: "#0f0e0c",
                fontFamily: "'Cabinet Grotesk', sans-serif",
                letterSpacing: "-0.3px", marginBottom: 4,
              }}>
                {src.label}
              </div>
              <div style={{ fontSize: 12, color: src.color, fontFamily: "monospace", marginBottom: 12, fontWeight: 600 }}>
                {src.sublabel}
              </div>
              <div style={{ fontSize: 13, color: "#6b6456", lineHeight: 1.5 }}>
                {src.description}
              </div>

              {/* Arrow */}
              <div style={{
                marginTop: 20, fontSize: 13, color: src.color,
                fontWeight: 600, display: "flex", alignItems: "center", gap: 4,
                opacity: isHovered ? 1 : 0,
                transition: "opacity 0.2s ease",
              }}>
                Select this source →
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer note */}
      <p style={{ marginTop: 40, fontSize: 12, color: "#a8a59f", fontFamily: "monospace" }}>
        Supports on-prem, Azure, and GCP to AWS migrations
      </p>
    </div>
  )
}

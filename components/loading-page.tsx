"use client"

import { useEffect, useState } from "react"

const STEPS = [
  { icon: "🔍", label: "Analyzing infrastructure", detail: "Scanning compute, databases, and storage" },
  { icon: "🗺️", label: "Mapping AWS services", detail: "Finding the best AWS equivalent for each component" },
  { icon: "💰", label: "Calculating costs", detail: "Estimating monthly spend and projected savings" },
  { icon: "⚠️", label: "Assessing risks", detail: "Identifying migration risks and mitigations" },
  { icon: "📋", label: "Building roadmap", detail: "Creating your phased migration plan" },
]

export default function LoadingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const stepDuration = 2800
    const interval = setInterval(() => {
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1))
    }, stepDuration)

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 1, 95))
    }, 150)

    return () => {
      clearInterval(interval)
      clearInterval(progressInterval)
    }
  }, [])

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #faf8f4 0%, #f0ebe0 50%, #faf8f4 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "40px 24px",
    }}>

      {/* Main loader card */}
      <div style={{
        background: "#fff",
        border: "1px solid rgba(0,0,0,0.08)",
        borderRadius: 24,
        padding: "48px 40px",
        maxWidth: 520, width: "100%",
        boxShadow: "0 8px 40px rgba(0,0,0,0.08)",
        textAlign: "center",
      }}>

        {/* Animated cloud icon */}
        <div style={{
          width: 80, height: 80,
          background: "linear-gradient(135deg, rgba(26,86,219,0.1), rgba(13,122,78,0.1))",
          borderRadius: 24,
          margin: "0 auto 28px",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 36,
          animation: "pulse 2s ease-in-out infinite",
          border: "1px solid rgba(26,86,219,0.15)",
        }}>
          ☁️
        </div>

        <h2 style={{
          fontFamily: "'Cabinet Grotesk', Georgia, serif",
          fontSize: 24, fontWeight: 800,
          color: "#0f0e0c", marginBottom: 8,
          letterSpacing: "-0.5px",
        }}>
          Building your migration plan
        </h2>
        <p style={{ fontSize: 14, color: "#6b6456", marginBottom: 36, lineHeight: 1.5 }}>
          Our AI is analyzing your infrastructure and crafting a tailored AWS migration strategy
        </p>

        {/* Progress bar */}
        <div style={{
          height: 6, background: "#f0ebe0",
          borderRadius: 3, overflow: "hidden", marginBottom: 32,
        }}>
          <div style={{
            height: "100%",
            width: `${progress}%`,
            background: "linear-gradient(90deg, #1a56db, #0d7a4e)",
            borderRadius: 3,
            transition: "width 0.15s ease",
          }} />
        </div>

        {/* Steps */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {STEPS.map((step, i) => {
            const isDone = i < currentStep
            const isActive = i === currentStep

            return (
              <div
                key={i}
                style={{
                  display: "flex", alignItems: "center", gap: 12,
                  padding: "10px 14px",
                  borderRadius: 10,
                  background: isActive ? "rgba(26,86,219,0.06)" : isDone ? "rgba(13,122,78,0.04)" : "transparent",
                  border: isActive ? "1px solid rgba(26,86,219,0.15)" : isDone ? "1px solid rgba(13,122,78,0.12)" : "1px solid transparent",
                  transition: "all 0.3s ease",
                }}
              >
                {/* Icon / Check */}
                <div style={{
                  width: 32, height: 32, borderRadius: 8, flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: isDone ? "#0d7a4e" : isActive ? "rgba(26,86,219,0.1)" : "#f0ebe0",
                  fontSize: isDone ? 14 : 16,
                  color: isDone ? "#fff" : "#0f0e0c",
                  transition: "all 0.3s ease",
                }}>
                  {isDone ? "✓" : step.icon}
                </div>

                {/* Text */}
                <div style={{ textAlign: "left", flex: 1 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600,
                    color: isDone ? "#0d7a4e" : isActive ? "#1a56db" : "#a8a59f",
                    transition: "color 0.3s ease",
                  }}>
                    {step.label}
                  </div>
                  {isActive && (
                    <div style={{ fontSize: 11, color: "#6b6456", marginTop: 2, fontFamily: "monospace" }}>
                      {step.detail}
                    </div>
                  )}
                </div>

                {/* Spinner for active */}
                {isActive && (
                  <div style={{
                    width: 16, height: 16,
                    border: "2px solid rgba(26,86,219,0.2)",
                    borderTopColor: "#1a56db",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                    flexShrink: 0,
                  }} />
                )}
              </div>
            )
          })}
        </div>

        <p style={{ fontSize: 11, color: "#a8a59f", marginTop: 24, fontFamily: "monospace" }}>
          {progress}% complete · Estimated 15-20 seconds
        </p>
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}

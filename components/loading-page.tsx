"use client"
import Image from "next/image"
import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

const STEPS = [
  { icon: "🔍", label: "Analyzing infrastructure",   detail: "Scanning compute, databases, and storage resources" },
  { icon: "🗺️", label: "Mapping AWS services",       detail: "Finding the best AWS equivalent for each component" },
  { icon: "💰", label: "Calculating costs",           detail: "Estimating monthly spend and projected savings" },
  { icon: "⚠️", label: "Assessing risks",             detail: "Identifying migration risks and mitigations" },
  { icon: "📋", label: "Building roadmap",            detail: "Creating your phased migration plan" },
]

export default function LoadingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])

  useEffect(() => {
    const stepDuration = 2800

    const interval = setInterval(() => {
      setCurrentStep(prev => {
        const next = Math.min(prev + 1, STEPS.length - 1)
        setCompletedSteps(c => [...c, prev])
        return next
      })
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
      background: "radial-gradient(ellipse at 50% 40%, #2a3a6a 0%, #1a2848 40%, #0f1830 100%)",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      padding: "40px 24px",
      position: "relative", overflow: "hidden",
    }}>

      {/* Ambient radial glow orbs */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        <div style={{
          position: "absolute", width: 600, height: 600,
          borderRadius: "50%", top: "10%", left: "50%",
          transform: "translateX(-50%)",
          background: "radial-gradient(circle, rgba(26,86,219,0.08) 0%, transparent 70%)",
          animation: "pulse-orb 4s ease-in-out infinite",
        }} />
        <div style={{
          position: "absolute", width: 400, height: 400,
          borderRadius: "50%", bottom: "10%", left: "50%",
          transform: "translateX(-50%)",
          background: "radial-gradient(circle, rgba(13,122,78,0.06) 0%, transparent 70%)",
          animation: "pulse-orb 5s ease-in-out infinite 1s",
        }} />
      </div>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ textAlign: "center", marginBottom: 48, position: "relative", zIndex: 1 }}
      >
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          style={{
            width: 72, height: 72,
            background: "rgba(255,255,255,0.12)",
            borderRadius: 20, margin: "0 auto 20px",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 32, border: "1px solid rgba(96,165,250,0.2)",
            boxShadow: "0 0 40px rgba(26,86,219,0.2)",
          }}
        >
          <Image src="/icons/aws.png" alt="AWS" width={48} height={28} style={{ objectFit: "contain" }} />

        </motion.div>

        <h2 style={{
          fontFamily: "'Cabinet Grotesk', Georgia, serif",
          fontSize: 26, fontWeight: 800, color: "#fff",
          letterSpacing: "-0.5px", marginBottom: 8,
        }}>
          Building your migration plan
        </h2>
        <p style={{
          fontSize: 14, color: "rgba(255,255,255,0.45)",
          fontFamily: "'DM Serif Display', Georgia, serif",
          fontStyle: "italic",
        }}>
          AI is analyzing your infrastructure
        </p>
      </motion.div>

      {/* Progress bar */}
      <div style={{
        width: "100%", maxWidth: 520,
        height: 3, background: "rgba(255,255,255,0.06)",
        borderRadius: 2, overflow: "hidden",
        marginBottom: 36, position: "relative", zIndex: 1,
      }}>
        <motion.div
          style={{
            height: "100%",
            background: "linear-gradient(90deg, #1a56db, #06b6d4, #0d7a4e)",
            borderRadius: 2,
            boxShadow: "0 0 8px rgba(96,165,250,0.6)",
          }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.15, ease: "linear" }}
        />
      </div>

      {/* Step cards */}
      <div style={{
        width: "100%", maxWidth: 520,
        display: "flex", flexDirection: "column", gap: 10,
        position: "relative", zIndex: 1,
      }}>
        {STEPS.map((step, i) => {
          const isDone = completedSteps.includes(i)
          const isActive = i === currentStep
          const isPending = !isDone && !isActive

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isPending ? 0.4 : 1, y: 0 }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              style={{
                borderRadius: 14,
                border: isActive
                  ? "1px solid rgba(96,165,250,0.3)"
                  : isDone
                  ? "1px solid rgba(52,211,153,0.2)"
                  : "1px solid rgba(255,255,255,0.06)",
                background: isActive
                  ? "rgba(26,86,219,0.12)"
                  : isDone
                  ? "rgba(13,122,78,0.08)"
                  : "rgba(255,255,255,0.03)",
                overflow: "hidden",
                transition: "all 0.3s ease",
                boxShadow: isActive ? "0 0 30px rgba(26,86,219,0.15), inset 0 1px 0 rgba(255,255,255,0.08)" : "none",
              }}
            >
              {/* Step header row */}
              <div style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "14px 16px",
              }}>
                {/* Icon */}
                <motion.div
                  animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    background: isDone
                      ? "#0d7a4e"
                      : isActive
                      ? "rgba(96,165,250,0.15)"
                      : "rgba(255,255,255,0.05)",
                    fontSize: isDone ? 15 : 18,
                    color: isDone ? "#fff" : "rgba(255,255,255,0.8)",
                    boxShadow: isActive ? "0 0 16px rgba(96,165,250,0.3)" : "none",
                    transition: "all 0.3s ease",
                  }}
                >
                  {isDone ? "✓" : step.icon}
                </motion.div>

                {/* Label */}
                <div style={{ flex: 1, textAlign: "left" }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600,
                    color: isDone ? "#34d399" : isActive ? "#93c5fd" : "rgba(255,255,255,0.35)",
                    transition: "color 0.3s ease",
                  }}>
                    {step.label}
                  </div>
                </div>

                {/* Right — spinner or check */}
                {isActive && (
                  <div style={{
                    width: 16, height: 16, flexShrink: 0,
                    border: "2px solid rgba(96,165,250,0.2)",
                    borderTopColor: "#60a5fa",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite",
                  }} />
                )}
                {isDone && (
                  <div style={{
                    fontSize: 11, fontFamily: "monospace",
                    color: "rgba(52,211,153,0.6)",
                  }}>
                    done
                  </div>
                )}
              </div>

              {/* Expanded detail — only for active */}
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    style={{ overflow: "hidden" }}
                  >
                    <div style={{
                      padding: "0 16px 14px 64px",
                      fontSize: 12,
                      color: "rgba(255,255,255,0.4)",
                      fontFamily: "monospace",
                      lineHeight: 1.5,
                      borderTop: "1px solid rgba(255,255,255,0.05)",
                      paddingTop: 10,
                      marginTop: 0,
                    }}>
                      {step.detail}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>

      {/* Progress text */}
      <p style={{
        fontSize: 11, color: "rgba(255,255,255,0.2)",
        marginTop: 28, fontFamily: "monospace",
        position: "relative", zIndex: 1,
      }}>
        {progress}% complete · ~15 seconds remaining
      </p>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse-orb { 0%,100%{opacity:0.6;transform:translateX(-50%) scale(1)} 50%{opacity:1;transform:translateX(-50%) scale(1.1)} }
      `}</style>
    </div>
  )
}
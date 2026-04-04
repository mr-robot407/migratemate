"use client"

import { useState, useEffect } from "react"
import { MigrationPlan, SourceType } from "@/app/page"

interface ResultsPageProps {
  plan: MigrationPlan
  source: SourceType
  onReset: () => void
}

const SOURCE_LABELS: Record<SourceType, string> = {
  "on-prem": "On-Premises",
  "azure": "Microsoft Azure",
  "gcp": "Google Cloud",
}

const RISK_COLORS = {
  High: { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.2)", text: "#dc2626", dot: "#ef4444" },
  Medium: { bg: "rgba(245,158,11,0.08)", border: "rgba(245,158,11,0.2)", text: "#b45309", dot: "#f59e0b" },
  Low: { bg: "rgba(34,197,94,0.08)", border: "rgba(34,197,94,0.2)", text: "#15803d", dot: "#22c55e" },
}

const COMPLEXITY_CONFIG = {
  Low: { color: "#22c55e", bg: "rgba(34,197,94,0.1)", width: "33%" },
  Medium: { color: "#f59e0b", bg: "rgba(245,158,11,0.1)", width: "66%" },
  High: { color: "#ef4444", bg: "rgba(239,68,68,0.1)", width: "100%" },
}

function AnimatedNumber({ target, prefix = "", suffix = "" }: { target: number; prefix?: string; suffix?: string }) {
  const [value, setValue] = useState(0)

  useEffect(() => {
    const duration = 1200
    const start = Date.now()
    const timer = setInterval(() => {
      const elapsed = Date.now() - start
      const progress = Math.min(elapsed / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress >= 1) clearInterval(timer)
    }, 16)
    return () => clearInterval(timer)
  }, [target])

  return <>{prefix}{value}{suffix}</>
}

export default function ResultsPage({ plan, source, onReset }: ResultsPageProps) {
  const [mounted, setMounted] = useState(false)
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set())

  useEffect(() => {
    setTimeout(() => setMounted(true), 100)
  }, [])

  const toggleCheck = (i: number) => {
    const s = new Set(checkedItems)
    s.has(i) ? s.delete(i) : s.add(i)
    setCheckedItems(s)
  }

  const complexity = plan.complexity || "Medium"
  const complexityConfig = COMPLEXITY_CONFIG[complexity] || COMPLEXITY_CONFIG.Medium

  const phaseCount = plan.migration_phases?.length || 0
  const serviceCount = plan.service_mapping?.length || 0
  const riskCount = plan.risks?.length || 0

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #faf8f4 0%, #f4f0e8 100%)",
      padding: "40px 24px 80px",
    }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>

        {/* Top bar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "monospace", fontSize: 12, color: "#a8a59f" }}>
            <span>① Source</span><span>→</span>
            <span>② Details</span><span>→</span>
            <span style={{ color: "#0d7a4e", fontWeight: 700 }}>③ Migration Plan ✓</span>
          </div>
          <button
            onClick={onReset}
            style={{
              background: "rgba(255,255,255,0.8)",
              border: "1px solid rgba(0,0,0,0.1)",
              borderRadius: 12, padding: "8px 16px",
              fontSize: 13, color: "#6b6456", cursor: "pointer",
              fontFamily: "monospace",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          >
            ← New Plan
          </button>
        </div>

        {/* Hero summary card */}
        <div style={{
          background: "#0f0e0c",
          borderRadius: 24, padding: "36px 40px",
          marginBottom: 20,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(16px)",
          transition: "all 0.5s ease",
          position: "relative", overflow: "hidden",
        }}>
          {/* Background decoration */}
          <div style={{
            position: "absolute", top: -60, right: -60,
            width: 200, height: 200, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(26,86,219,0.15), transparent)",
            pointerEvents: "none",
          }} />
          <div style={{
            position: "absolute", bottom: -40, left: -40,
            width: 150, height: 150, borderRadius: "50%",
            background: "radial-gradient(circle, rgba(13,122,78,0.12), transparent)",
            pointerEvents: "none",
          }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 24, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 300 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
                <span style={{
                  fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.4)",
                  textTransform: "uppercase", letterSpacing: 2,
                }}>
                  {SOURCE_LABELS[source]} → AWS
                </span>
              </div>
              <h2 style={{
                fontSize: 20, fontWeight: 700, color: "#fff",
                lineHeight: 1.5, margin: "0 0 20px",
                fontFamily: "inherit",
              }}>
                {plan.summary}
              </h2>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <span style={{
                  background: complexityConfig.bg, color: complexityConfig.color,
                  border: `1px solid ${complexityConfig.color}40`,
                  borderRadius: 20, padding: "4px 12px",
                  fontSize: 12, fontFamily: "monospace",
                }}>
                  {complexity} Complexity
                </span>
                <span style={{
                  background: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: 20, padding: "4px 12px",
                  fontSize: 12, fontFamily: "monospace",
                }}>
                  ⏱ {plan.estimated_duration}
                </span>
                <span style={{
                  background: "rgba(34,197,94,0.1)", color: "#22c55e",
                  border: "1px solid rgba(34,197,94,0.2)",
                  borderRadius: 20, padding: "4px 12px",
                  fontSize: 12, fontFamily: "monospace",
                }}>
                  💰 {plan.cost_savings}
                </span>
              </div>
            </div>

            {/* Quick stats */}
            <div style={{ display: "flex", gap: 20 }}>
              {[
                { value: phaseCount, label: "Phases" },
                { value: serviceCount, label: "Mappings" },
                { value: riskCount, label: "Risks" },
              ].map((s, i) => (
                <div key={i} style={{ textAlign: "center" }}>
                  <div style={{
                    fontSize: 36, fontWeight: 800, color: "#fff",
                    fontFamily: "monospace", lineHeight: 1,
                  }}>
                    {mounted ? <AnimatedNumber target={s.value} /> : 0}
                  </div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 4, fontFamily: "monospace" }}>
                    {s.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Metrics row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 }}>

          {/* Complexity gauge */}
          <div style={{
            background: "#fff", borderRadius: 16, padding: "22px",
            border: "1px solid rgba(0,0,0,0.07)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.5s 0.1s ease",
          }}>
            <div style={{ fontSize: 11, color: "#a8a59f", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
              Complexity
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: complexityConfig.color, letterSpacing: "-1px", marginBottom: 12 }}>
              {complexity}
            </div>
            <div style={{ height: 6, background: "#f0ebe0", borderRadius: 3, overflow: "hidden" }}>
              <div style={{
                height: "100%", width: mounted ? complexityConfig.width : "0%",
                background: complexityConfig.color,
                borderRadius: 3,
                transition: "width 1s 0.3s ease",
              }} />
            </div>
          </div>

          {/* Duration */}
          <div style={{
            background: "#fff", borderRadius: 16, padding: "22px",
            border: "1px solid rgba(0,0,0,0.07)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.5s 0.15s ease",
          }}>
            <div style={{ fontSize: 11, color: "#a8a59f", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
              Timeline
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#0f0e0c", letterSpacing: "-0.5px", marginBottom: 4 }}>
              {plan.estimated_duration}
            </div>
            <div style={{ fontSize: 12, color: "#6b6456" }}>end-to-end migration</div>
          </div>

          {/* AWS Cost */}
          <div style={{
            background: "rgba(13,122,78,0.04)", borderRadius: 16, padding: "22px",
            border: "1px solid rgba(13,122,78,0.15)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.5s 0.2s ease",
          }}>
            <div style={{ fontSize: 11, color: "#a8a59f", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1, marginBottom: 12 }}>
              AWS Monthly Est.
            </div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#0d7a4e", letterSpacing: "-0.5px", marginBottom: 4 }}>
              {plan.monthly_cost_estimate}
            </div>
            <div style={{ fontSize: 12, color: "#0d7a4e" }}>↘ {plan.cost_savings}</div>
          </div>
        </div>

        {/* Service Mapping */}
        <div style={{
          background: "#fff", borderRadius: 20, overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          marginBottom: 20,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(12px)",
          transition: "all 0.5s 0.25s ease",
        }}>
          <div style={{
            padding: "18px 24px", borderBottom: "1px solid rgba(0,0,0,0.06)",
            display: "flex", alignItems: "center", justifyContent: "space-between",
            background: "#faf8f4",
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0f0e0c", fontFamily: "inherit" }}>
              🔄 Service Mapping
            </div>
            <span style={{
              fontFamily: "monospace", fontSize: 11,
              background: "rgba(26,86,219,0.08)", color: "#1a56db",
              border: "1px solid rgba(26,86,219,0.15)",
              borderRadius: 20, padding: "2px 10px",
            }}>
              {serviceCount} services
            </span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f9f8f6" }}>
                  {["Current", "→", "AWS Equivalent", "Strategy", "Notes"].map((h, i) => (
                    <th key={i} style={{
                      padding: "10px 16px", textAlign: "left",
                      fontSize: 11, color: "#a8a59f",
                      fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1,
                      fontWeight: 400, borderBottom: "1px solid rgba(0,0,0,0.06)",
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {plan.service_mapping?.map((m, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(0,0,0,0.04)" }}
                    onMouseEnter={e => (e.currentTarget as HTMLTableRowElement).style.background = "#faf8f4"}
                    onMouseLeave={e => (e.currentTarget as HTMLTableRowElement).style.background = "transparent"}
                  >
                    <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600, color: "#0f0e0c" }}>{m.current}</td>
                    <td style={{ padding: "14px 8px", color: "#a8a59f", fontSize: 16 }}>→</td>
                    <td style={{ padding: "14px 16px", fontSize: 13, fontWeight: 600, color: "#1a56db" }}>{m.aws_equivalent}</td>
                    <td style={{ padding: "14px 16px" }}>
                      <span style={{
                        fontSize: 11, fontFamily: "monospace",
                        background: "#f0ebe0", color: "#6b6456",
                        border: "1px solid rgba(0,0,0,0.1)",
                        borderRadius: 6, padding: "2px 8px",
                      }}>{m.strategy}</span>
                    </td>
                    <td style={{ padding: "14px 16px", fontSize: 12, color: "#6b6456", maxWidth: 200 }}>{m.notes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Migration Strategy */}
        <div style={{
          background: "rgba(26,86,219,0.05)",
          border: "1px solid rgba(26,86,219,0.15)",
          borderRadius: 16, padding: "18px 22px", marginBottom: 20,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(12px)",
          transition: "all 0.5s 0.3s ease",
        }}>
          <span style={{ fontSize: 12, fontFamily: "monospace", color: "#1a56db", fontWeight: 600 }}>
            🎯 Primary Strategy:
          </span>
          <span style={{ fontSize: 13, color: "#1a56db", marginLeft: 8 }}>{plan.migration_strategy}</span>
        </div>

        {/* Migration Phases */}
        <div style={{
          background: "#fff", borderRadius: 20, overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          marginBottom: 20,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(12px)",
          transition: "all 0.5s 0.35s ease",
        }}>
          <div style={{
            padding: "18px 24px", borderBottom: "1px solid rgba(0,0,0,0.06)",
            background: "#faf8f4",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0f0e0c" }}>📋 Migration Phases</div>
            <span style={{
              fontFamily: "monospace", fontSize: 11,
              background: "rgba(26,86,219,0.08)", color: "#1a56db",
              border: "1px solid rgba(26,86,219,0.15)",
              borderRadius: 20, padding: "2px 10px",
            }}>{phaseCount} phases</span>
          </div>
          <div style={{ padding: "8px 24px 24px" }}>
            {plan.migration_phases?.map((phase, i) => (
              <div key={i} style={{ display: "flex", gap: 16, paddingTop: 20 }}>
                {/* Timeline */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%",
                    background: "#0f0e0c", color: "#fff",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 13, fontWeight: 700, flexShrink: 0,
                    fontFamily: "monospace",
                  }}>
                    {phase.phase}
                  </div>
                  {i < phaseCount - 1 && (
                    <div style={{ width: 1, flex: 1, background: "rgba(0,0,0,0.1)", marginTop: 6, minHeight: 20 }} />
                  )}
                </div>
                {/* Content */}
                <div style={{ flex: 1, paddingBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#0f0e0c" }}>{phase.title}</span>
                    <span style={{
                      fontSize: 11, fontFamily: "monospace",
                      background: "#f0ebe0", color: "#6b6456",
                      border: "1px solid rgba(0,0,0,0.08)",
                      borderRadius: 6, padding: "2px 8px",
                    }}>{phase.duration}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {phase.tasks?.map((task, j) => (
                      <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                        <span style={{ color: "#1a56db", fontSize: 10, marginTop: 4, flexShrink: 0 }}>→</span>
                        <span style={{ fontSize: 13, color: "#6b6456", lineHeight: 1.5 }}>{task}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom grid: Risks + Cost */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 20 }}>

          {/* Risks */}
          <div style={{
            background: "#fff", borderRadius: 20, overflow: "hidden",
            border: "1px solid rgba(0,0,0,0.07)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.5s 0.4s ease",
          }}>
            <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#faf8f4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0f0e0c" }}>⚠️ Risk Assessment</div>
              <span style={{ fontFamily: "monospace", fontSize: 11, background: "rgba(245,158,11,0.08)", color: "#b45309", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 20, padding: "2px 10px" }}>
                {riskCount} risks
              </span>
            </div>
            <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
              {plan.risks?.map((risk, i) => {
                const r = typeof risk === "string"
                  ? { description: risk, severity: "Medium" as const }
                  : risk
                const c = RISK_COLORS[r.severity] || RISK_COLORS.Medium
                return (
                  <div key={i} style={{
                    background: c.bg, border: `1px solid ${c.border}`,
                    borderRadius: 10, padding: "10px 12px",
                    display: "flex", gap: 10, alignItems: "flex-start",
                  }}>
                    <div style={{ width: 6, height: 6, borderRadius: "50%", background: c.dot, flexShrink: 0, marginTop: 5 }} />
                    <div style={{ flex: 1 }}>
                      <span style={{
                        fontSize: 10, fontFamily: "monospace", fontWeight: 700,
                        color: c.text, textTransform: "uppercase", letterSpacing: 0.5,
                        marginBottom: 4, display: "block",
                      }}>
                        {r.severity}
                      </span>
                      <span style={{ fontSize: 12, color: "#0f0e0c", lineHeight: 1.5 }}>{r.description}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Cost savings visual */}
          <div style={{
            background: "#fff", borderRadius: 20,
            border: "1px solid rgba(0,0,0,0.07)",
            boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
            overflow: "hidden",
            opacity: mounted ? 1 : 0,
            transform: mounted ? "translateY(0)" : "translateY(12px)",
            transition: "all 0.5s 0.45s ease",
          }}>
            <div style={{ padding: "18px 20px", borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#faf8f4" }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#0f0e0c" }}>💰 Cost Analysis</div>
            </div>
            <div style={{ padding: "20px" }}>
              {/* Cost bars */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "#6b6456" }}>Current infrastructure</span>
                  <span style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 600, color: "#0f0e0c" }}>—</span>
                </div>
                <div style={{ height: 10, background: "#f0ebe0", borderRadius: 5, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: mounted ? "100%" : "0%",
                    background: "#d1d0ca", borderRadius: 5,
                    transition: "width 1s 0.5s ease",
                  }} />
                </div>
              </div>
              <div style={{ marginBottom: 24 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: "#6b6456" }}>AWS (estimated)</span>
                  <span style={{ fontSize: 12, fontFamily: "monospace", fontWeight: 600, color: "#0d7a4e" }}>
                    {plan.monthly_cost_estimate}
                  </span>
                </div>
                <div style={{ height: 10, background: "#f0ebe0", borderRadius: 5, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: mounted ? "65%" : "0%",
                    background: "linear-gradient(90deg, #0d7a4e, #22c55e)",
                    borderRadius: 5,
                    transition: "width 1.2s 0.6s ease",
                  }} />
                </div>
              </div>

              {/* Savings highlight */}
              <div style={{
                background: "rgba(13,122,78,0.06)",
                border: "1px solid rgba(13,122,78,0.15)",
                borderRadius: 12, padding: "14px 16px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 11, color: "#0d7a4e", fontFamily: "monospace", marginBottom: 4 }}>
                  PROJECTED SAVINGS
                </div>
                <div style={{ fontSize: 20, fontWeight: 800, color: "#0d7a4e", letterSpacing: "-0.5px" }}>
                  {plan.cost_savings}
                </div>
              </div>

              <p style={{ fontSize: 11, color: "#a8a59f", marginTop: 12, fontFamily: "monospace", textAlign: "center" }}>
                *Estimates based on typical AWS pricing
              </p>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div style={{
          background: "#fff", borderRadius: 20, overflow: "hidden",
          border: "1px solid rgba(0,0,0,0.07)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.04)",
          marginBottom: 20,
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(12px)",
          transition: "all 0.5s 0.5s ease",
        }}>
          <div style={{ padding: "18px 24px", borderBottom: "1px solid rgba(0,0,0,0.06)", background: "#faf8f4", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#0f0e0c" }}>✅ Pre-Migration Checklist</div>
            <span style={{ fontSize: 12, fontFamily: "monospace", color: "#a8a59f" }}>
              {checkedItems.size}/{plan.checklist?.length || 0} done
            </span>
          </div>
          <div style={{ padding: "16px 24px", display: "flex", flexDirection: "column", gap: 8 }}>
            {plan.checklist?.map((item, i) => {
              const checked = checkedItems.has(i)
              return (
                <button
                  key={i}
                  onClick={() => toggleCheck(i)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 14px", borderRadius: 10,
                    border: `1px solid ${checked ? "rgba(13,122,78,0.2)" : "rgba(0,0,0,0.07)"}`,
                    background: checked ? "rgba(13,122,78,0.05)" : "#faf8f4",
                    cursor: "pointer", textAlign: "left",
                    transition: "all 0.15s ease",
                    width: "100%",
                  }}
                >
                  <div style={{
                    width: 20, height: 20, borderRadius: 6, flexShrink: 0,
                    border: `2px solid ${checked ? "#0d7a4e" : "rgba(0,0,0,0.2)"}`,
                    background: checked ? "#0d7a4e" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: 11, color: "#fff",
                    transition: "all 0.15s ease",
                  }}>
                    {checked && "✓"}
                  </div>
                  <span style={{
                    fontSize: 13, color: checked ? "#6b6456" : "#0f0e0c",
                    textDecoration: checked ? "line-through" : "none",
                    opacity: checked ? 0.6 : 1,
                    transition: "all 0.15s ease",
                  }}>
                    {item}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Footer CTA */}
        <div style={{
          textAlign: "center",
          opacity: mounted ? 1 : 0,
          transition: "all 0.5s 0.6s ease",
        }}>
          <button
            onClick={onReset}
            style={{
              background: "#0f0e0c", color: "#fff",
              border: "none", borderRadius: 14,
              padding: "14px 36px", fontSize: 15,
              fontWeight: 700, cursor: "pointer",
              fontFamily: "'Cabinet Grotesk', sans-serif",
              letterSpacing: "-0.3px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.15)",
            }}
          >
            Plan Another Migration →
          </button>
        </div>
      </div>
    </div>
  )
}

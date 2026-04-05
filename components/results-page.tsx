"use client"

import { useState, useEffect } from "react"
import { motion, useSpring, useTransform } from "framer-motion"
import { CheckCircle2, Circle, ArrowRight } from "lucide-react"
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

const height = 50

function Digit({ place, value }: { place: number; value: number }) {
  const valueRoundedToPlace = Math.floor(value / place)
  const animatedValue = useSpring(valueRoundedToPlace)
  useEffect(() => { animatedValue.set(valueRoundedToPlace) }, [animatedValue, valueRoundedToPlace])
  return (
    <div style={{ height }} className="relative w-[1ch] tabular-nums overflow-hidden">
      {[...Array(10)].map((_, i) => {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        const y = useTransform(animatedValue, (latest) => {
          const placeValue = latest % 10
          const offset = (10 + i - placeValue) % 10
          let memo = offset * height
          if (offset > 5) memo -= 10 * height
          return memo
        })
        return (
          <motion.span key={i} style={{ y }} className="absolute inset-0 flex items-center justify-center">
            {i}
          </motion.span>
        )
      })}
    </div>
  )
}

function Counter({ end, duration = 1.5 }: { end: number; duration?: number }) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (end === 0) return
    const stepDuration = (duration * 1000) / end
    const interval = setInterval(() => {
      setValue(prev => {
        if (prev < end) return prev + 1
        clearInterval(interval)
        return prev
      })
    }, stepDuration)
    return () => clearInterval(interval)
  }, [end, duration])

  return (
    <div className="flex overflow-hidden leading-none text-4xl font-bold justify-center text-white">
      {value >= 10 && <Digit place={10} value={value} />}
      <Digit place={1} value={value} />
    </div>
  )
}

export default function ResultsPage({ plan, source, onReset }: ResultsPageProps) {
  const [expandedPhase, setExpandedPhase] = useState<number | null>(1)
  const [checkedItems, setCheckedItems] = useState<boolean[]>(
    new Array(plan.checklist?.length || 0).fill(false)
  )

  const complexity = plan.complexity || "Medium"
  const phaseCount = plan.migration_phases?.length || 0
  const serviceCount = plan.service_mapping?.length || 0
  const riskCount = plan.risks?.length || 0
  const completedCount = checkedItems.filter(Boolean).length
  const progressPercent = checkedItems.length > 0 ? (completedCount / checkedItems.length) * 100 : 0

  const rawCost = plan.monthly_cost_estimate?.replace(/[^0-9]/g, "") || "0"
  const currentCost = parseInt(rawCost) || 8000
  const awsPercent = 65

  const complexityColor: Record<string, string> = {
    Low: "text-green-400", Medium: "text-yellow-400", High: "text-red-400",
  }
  const strategyColors: Record<string, string> = {
    Rehost: "bg-blue-500/20 text-blue-300 border-blue-500/50",
    Replatform: "bg-purple-500/20 text-purple-300 border-purple-500/50",
    Refactor: "bg-orange-500/20 text-orange-300 border-orange-500/50",
  }
  const severityColors: Record<string, string> = {
    High: "border-l-red-500 bg-red-500/10",
    Medium: "border-l-yellow-500 bg-yellow-500/10",
    Low: "border-l-green-500 bg-green-500/10",
  }

  const toggleCheck = (i: number) => {
    const n = [...checkedItems]
    n[i] = !n[i]
    setCheckedItems(n)
  }

  return (
    <div className="min-h-screen bg-[#080c18] text-white relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-[900px] mx-auto px-6 py-10 space-y-5">

        {/* Top bar */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
            <span>① Source</span><span>→</span><span>② Details</span><span>→</span>
            <span className="text-green-400 font-semibold">③ Migration Plan ✓</span>
          </div>
          <button onClick={onReset} className="text-xs font-mono text-gray-400 hover:text-white px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
            ← New Plan
          </button>
        </div>

        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-gray-400 font-mono">{SOURCE_LABELS[source]}</span>
            <ArrowRight className="w-4 h-4 text-gray-500" />
            <span className="px-3 py-1 bg-orange-500/20 text-orange-300 rounded-full text-xs font-mono border border-orange-500/40">AWS</span>
          </div>
          <p className="text-base text-gray-300 mb-8 leading-relaxed">{plan.summary}</p>
          <div className="grid grid-cols-3 gap-6 mb-8">
            {[{ label: "Migration Phases", value: phaseCount }, { label: "Service Mappings", value: serviceCount }, { label: "Identified Risks", value: riskCount }].map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-xs text-gray-500 font-mono mb-2">{s.label}</div>
                <Counter end={s.value} />
              </div>
            ))}
          </div>
          <div className="flex gap-3 flex-wrap">
            <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-sm">
              <span className="text-gray-400">Complexity: </span>
              <span className={`font-semibold ${complexityColor[complexity]}`}>{complexity}</span>
            </div>
            <div className="px-4 py-2 bg-white/5 rounded-xl border border-white/10 text-sm">
              <span className="text-gray-400">Duration: </span>
              <span className="font-semibold text-white">{plan.estimated_duration}</span>
            </div>
            <div className="px-4 py-2 bg-green-500/10 rounded-xl border border-green-500/30 text-sm">
              <span className="text-green-400">Savings: </span>
              <span className="font-semibold text-green-300">{plan.cost_savings}</span>
            </div>
          </div>
        </motion.div>

        {/* Metrics */}
        <div className="grid grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-xs font-mono text-gray-400 mb-3 uppercase tracking-wider">Complexity</h3>
            <div className="flex items-center justify-center">
              <svg width="120" height="75" viewBox="0 0 120 75">
                <path d="M 10 70 A 50 50 0 0 1 110 70" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" strokeLinecap="round"/>
                <motion.path d="M 10 70 A 50 50 0 0 1 110 70" fill="none"
                  stroke={complexity === "Low" ? "#22c55e" : complexity === "Medium" ? "#eab308" : "#ef4444"}
                  strokeWidth="8" strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: complexity === "Low" ? 0.33 : complexity === "Medium" ? 0.66 : 1 }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                />
              </svg>
            </div>
            <div className={`text-center text-xl font-bold ${complexityColor[complexity]}`}>{complexity}</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-xs font-mono text-gray-400 mb-3 uppercase tracking-wider">Timeline</h3>
            <div className="text-2xl font-bold text-white mb-3">{plan.estimated_duration}</div>
            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden mb-2">
              <motion.div className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-purple-500"
                initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 2, ease: "easeOut" }} />
            </div>
            <div className="text-xs text-gray-500 font-mono">end-to-end migration</div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h3 className="text-xs font-mono text-gray-400 mb-3 uppercase tracking-wider">AWS Monthly Est.</h3>
            <div className="text-2xl font-bold text-green-400 mb-1">{plan.monthly_cost_estimate}</div>
            <div className="text-xs text-green-400 mb-3">↘ {plan.cost_savings}</div>
            <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-400"
                initial={{ width: 0 }} animate={{ width: `${awsPercent}%` }}
                transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }} />
            </div>
          </motion.div>
        </div>

        {/* Service Mapping */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-bold">🔄 Service Mapping</h2>
            <span className="text-xs font-mono px-3 py-1 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-full">{serviceCount} services</span>
          </div>
          <div className="space-y-2">
            {plan.service_mapping?.map((m, i) => (
              <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.07 }}
                className="bg-white/3 border border-white/8 rounded-xl p-4 hover:bg-white/8 transition-colors">
                <div className="grid grid-cols-4 gap-4 items-start">
                  <div className="text-sm font-semibold text-white">{m.current}</div>
                  <div className="text-sm font-semibold text-orange-300">{m.aws_equivalent}</div>
                  <div className="flex justify-center">
                    <span className={`px-2 py-1 rounded-full text-xs font-mono border ${strategyColors[m.strategy] || strategyColors.Rehost}`}>{m.strategy}</span>
                  </div>
                  <div className="text-xs text-gray-400 leading-relaxed">{m.notes}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Phases */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-base font-bold">📋 Migration Phases</h2>
            <span className="text-xs font-mono px-3 py-1 bg-blue-500/10 text-blue-300 border border-blue-500/20 rounded-full">{phaseCount} phases</span>
          </div>
          <div className="relative flex justify-between items-start mb-5">
            <div className="absolute top-6 left-0 right-0 h-px bg-white/10 z-0" />
            {plan.migration_phases?.map((phase) => (
              <div key={phase.phase} className="flex flex-col items-center flex-1 z-10">
                <motion.button
                  onClick={() => setExpandedPhase(expandedPhase === phase.phase ? null : phase.phase)}
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}
                  className={`w-11 h-11 rounded-full border-2 flex items-center justify-center font-bold text-sm transition-all ${
                    expandedPhase === phase.phase ? "bg-blue-500 border-blue-500 shadow-lg shadow-blue-500/40 text-white" : "bg-[#080c18] border-white/20 hover:border-white/50 text-gray-300"
                  }`}
                >{phase.phase}</motion.button>
                <div className="text-xs font-medium mt-2 text-center text-white px-1 leading-tight">{phase.title}</div>
                <div className="text-xs text-gray-500 mt-1 font-mono">{phase.duration}</div>
              </div>
            ))}
          </div>
          {expandedPhase !== null && (() => {
            const phase = plan.migration_phases?.find(p => p.phase === expandedPhase)
            if (!phase) return null
            return (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}
                className="bg-white/5 rounded-xl p-5 border border-white/10">
                <h3 className="font-semibold mb-3 text-sm text-white">
                  Phase {phase.phase}: {phase.title}
                  <span className="ml-2 text-xs font-mono text-gray-400">{phase.duration}</span>
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  {phase.tasks?.map((task, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-gray-300">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />{task}
                    </div>
                  ))}
                </div>
              </motion.div>
            )
          })()}
        </motion.div>

        {/* Risk + Cost */}
        <div className="grid grid-cols-2 gap-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-bold">⚠️ Risk Assessment</h2>
              <span className="text-xs font-mono px-2 py-1 bg-yellow-500/10 text-yellow-300 border border-yellow-500/20 rounded-full">{riskCount} risks</span>
            </div>
            <div className="space-y-2">
              {plan.risks?.map((risk, i) => {
                const r = typeof risk === "string" ? { description: risk, severity: "Medium" as const } : risk
                return (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.7 + i * 0.07 }}
                    className={`border-l-4 rounded-r-xl p-3 ${severityColors[r.severity] || severityColors.Medium}`}>
                    <div className="text-xs font-mono font-bold text-gray-400 mb-1 uppercase">{r.severity}</div>
                    <p className="text-xs text-gray-200 leading-relaxed">{r.description}</p>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
            className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
            <h2 className="text-base font-bold mb-4">💰 Cost Analysis</h2>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">Current infrastructure</span>
                  <span className="font-mono">{plan.monthly_cost_estimate}</span>
                </div>
                <div className="relative h-6 bg-white/8 rounded-lg overflow-hidden">
                  <motion.div className="absolute inset-y-0 left-0 bg-gradient-to-r from-red-500/80 to-red-600/80 flex items-center justify-end pr-2"
                    initial={{ width: 0 }} animate={{ width: "100%" }} transition={{ duration: 1.5, ease: "easeOut" }}>
                    <span className="text-xs font-mono">100%</span>
                  </motion.div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400">AWS (estimated)</span>
                  <span className="font-mono text-green-400">{plan.monthly_cost_estimate}</span>
                </div>
                <div className="relative h-6 bg-white/8 rounded-lg overflow-hidden">
                  <motion.div className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500/80 to-emerald-500/80 flex items-center justify-end pr-2"
                    initial={{ width: 0 }} animate={{ width: `${awsPercent}%` }}
                    transition={{ duration: 1.5, ease: "easeOut", delay: 0.3 }}>
                    <span className="text-xs font-mono">{awsPercent}%</span>
                  </motion.div>
                </div>
              </div>
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 text-center">
                <div className="text-xs font-mono text-green-400 mb-1 uppercase tracking-wider">Projected Savings</div>
                <div className="text-2xl font-bold text-green-300">{plan.cost_savings}</div>
              </div>
              <p className="text-xs text-gray-600 font-mono text-center">*Based on typical AWS pricing</p>
            </div>
          </motion.div>
        </div>

        {/* Checklist */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
          className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold">✅ Pre-Migration Checklist</h2>
            <span className="text-xs font-mono text-gray-400">{completedCount}/{checkedItems.length} done</span>
          </div>
          <div className="relative h-1.5 bg-white/10 rounded-full overflow-hidden mb-4">
            <motion.div className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-emerald-400"
              animate={{ width: `${progressPercent}%` }} transition={{ duration: 0.5 }} />
          </div>
          <div className="space-y-2">
            {plan.checklist?.map((item, i) => (
              <motion.button key={i} onClick={() => toggleCheck(i)} whileHover={{ x: 4 }}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/3 hover:bg-white/8 transition-colors text-left border border-white/5 hover:border-white/15">
                {checkedItems[i] ? <CheckCircle2 className="w-4 h-4 text-green-400 flex-shrink-0" /> : <Circle className="w-4 h-4 text-gray-500 flex-shrink-0" />}
                <span className={`text-sm ${checkedItems[i] ? "line-through text-gray-500" : "text-gray-200"}`}>{item}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* CTA */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9 }}
          className="flex justify-center pb-8">
          <button onClick={onReset}
            className="px-8 py-4 bg-white/8 hover:bg-white/15 border border-white/15 hover:border-white/30 rounded-2xl text-white font-semibold transition-all text-sm">
            Plan Another Migration →
          </button>
        </motion.div>
      </div>
    </div>
  )
}
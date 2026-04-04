"use client"

import { useRef, useState, useEffect, useCallback } from "react"
import { useScroll, useTransform, motion, AnimatePresence } from "framer-motion"
import { FlowButton } from "@/components/ui/flow-button"
import Image from "next/image"

interface HeroPageProps {
  onStart: () => void
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*"
const SCRAMBLE_SPEED = 10
const CYCLES_PER_LETTER = 3

const AWS_ICONS = [
  { src: "/icons/ec2.png",        label: "EC2",        desc: "Virtual servers in the cloud",    color: "#FF9900", x: 15.6, y: 50,   delay: 0,    flip: false },
  { src: "/icons/s3.png",         label: "S3",         desc: "Scalable object storage",         color: "#569A31", x: 78.5,   y: 65,   delay: 0.3,  flip: true  },
  { src: "/icons/lambda.png",     label: "Lambda",     desc: "Run code without servers",        color: "#FF9900", x: 15.6, y: 65,   delay: 0.6,  flip: false },
  { src: "/icons/rds.png",        label: "RDS",        desc: "Managed relational databases",    color: "#527FFF", x: 77.5,   y: 50,   delay: 0.9,  flip: true  },
  { src: "/icons/dynamodb.png",   label: "DynamoDB",   desc: "Fast NoSQL key-value database",   color: "#527FFF", x: 15.4, y: 80,   delay: 1.2,  flip: false },
  { src: "/icons/cloudwatch.png", label: "CloudWatch", desc: "Monitor metrics and logs",        color: "#E7157B", x: 74.5,   y: 80,   delay: 0.15, flip: true  },
  { src: "/icons/cloudfront.png", label: "CloudFront", desc: "Global content delivery CDN",     color: "#8C4FFF", x: 46,   y: 89,   delay: 0.75, flip: true  },
  { src: "/icons/iam.png",        label: "IAM",        desc: "Access and identity control",     color: "#DD344C", x: 20,   y: 89,   delay: 1.05, flip: true  },
  { src: "/icons/sns.png",        label: "SNS",        desc: "Push notifications and alerts",   color: "#E7157B", x: 72,   y: 89,   delay: 1.35, flip: true  },
]

const FEATURES = [
  { icon: "🗺️", title: "Service Mapping", desc: "Every component mapped to its AWS equivalent" },
  { icon: "💰", title: "Cost Analysis", desc: "Real savings estimates vs your current spend" },
  { icon: "⚠️", title: "Risk Assessment", desc: "High/Medium/Low risks identified upfront" },
  { icon: "📋", title: "Phased Roadmap", desc: "Step-by-step migration plan with timelines" },
  { icon: "☁️", title: "Multi-Cloud", desc: "On-prem, Azure and GCP to AWS migrations" },
  { icon: "✅", title: "Checklist", desc: "Pre-migration actions to ensure success" },
]

function useScramble(text: string) {
  const [display, setDisplay] = useState(text)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  const scramble = useCallback(() => {
    let pos = 0
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(() => {
      const scrambled = text.split("").map((char, i) => {
        if (char === " ") return " "
        if (pos / CYCLES_PER_LETTER > i) return char
        return CHARS[Math.floor(Math.random() * CHARS.length)]
      }).join("")
      setDisplay(scrambled)
      pos++
      if (pos >= text.length * CYCLES_PER_LETTER) {
        clearInterval(intervalRef.current!)
        setDisplay(text)
      }
    }, SCRAMBLE_SPEED)
  }, [text])

  const reset = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current)
    setDisplay(text)
  }, [text])

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current) }, [])
  return { display, scramble, reset }
}

function AwsIconCard({ icon, index }: { icon: typeof AWS_ICONS[0]; index: number }) {
  const [hovered, setHovered] = useState(false)
  const { display, scramble, reset } = useScramble(icon.label)

  const textBlock = (
    <div style={{ display: "flex", flexDirection: "column", gap: 2, minWidth: 0 }}>
      <span style={{
        fontSize: 14, fontFamily: "monospace", fontWeight: 800,
        color: hovered ? "#ffffff" : "#3d3830",
        letterSpacing: hovered ? "0.5px" : "0px",
        transition: "color 0.2s", display: "block",
      }}>
        {display}
      </span>
      <AnimatePresence>
        {hovered && (
          <motion.span
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", fontFamily: "monospace", lineHeight: 1.4, display: "block", whiteSpace: "nowrap" }}
          >
            {icon.desc}
          </motion.span>
        )}
      </AnimatePresence>
    </div>
  )

  const imageBlock = (
    <motion.div animate={{ scale: hovered ? 1.15 : 1 }} transition={{ type: "spring", stiffness: 400, damping: 20 }}>
      <Image src={icon.src} alt={icon.label} width={48} height={48} style={{ borderRadius: 10, display: "block", flexShrink: 0 }} />
    </motion.div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: [0, -12, 0], rotate: [0, 1, -1, 0] }}
      transition={{
        opacity: { delay: icon.delay, duration: 0.5 },
        y: { delay: icon.delay, duration: 4 + index * 0.3, repeat: Infinity, ease: "easeInOut" },
        rotate: { delay: icon.delay, duration: 5 + index * 0.4, repeat: Infinity, ease: "easeInOut" },
      }}
      style={{
        position: "fixed",
        left: `${icon.x}%`,
        top: `${icon.y}%`,
        zIndex: hovered ? 999 : 5,
        pointerEvents: "auto",
      }}
      onMouseEnter={() => { setHovered(true); scramble() }}
      onMouseLeave={() => { setHovered(false); reset() }}
    >
      <motion.div
        animate={{
          width: hovered ? 250 : "auto",
          boxShadow: hovered
            ? `0 12px 40px ${icon.color}50, 0 0 0 1px ${icon.color}60`
            : "0 4px 16px rgba(0,0,0,0.08)",
        }}
        transition={{ type: "spring", stiffness: 280, damping: 24 }}
        style={{
          background: hovered ? "#000000" : "rgba(255,255,255,0.82)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          border: `1px solid ${hovered ? icon.color + "70" : "rgba(0,0,0,0.08)"}`,
          borderRadius: 16,
          padding: "10px 14px",
          display: "flex",
          alignItems: "center",
          flexDirection: "row",
          gap: 10,
          cursor: "default",
          overflow: "hidden",
          whiteSpace: "nowrap",
          minWidth: "fit-content",
          position: "relative",
        }}
      >
        {/* flip=true: text first, icon second (right/bottom side — icon peeks off screen) */}
        {/* flip=false: icon first, text second (left side — label peeks off screen) */}
        {icon.flip ? (
          <>{textBlock}{imageBlock}</>
        ) : (
          <>{imageBlock}{textBlock}</>
        )}

        <AnimatePresence>
          {hovered && (
            <>
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                style={{ position: "absolute", top: 6, right: 6, width: 6, height: 6, borderRadius: "50%", background: icon.color }} />
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}
                style={{ position: "absolute", bottom: 6, left: 6, width: 6, height: 6, borderRadius: "50%", background: "#E7157B" }} />
            </>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}

export default function HeroPage({ onStart }: HeroPageProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  const [showTransition, setShowTransition] = useState(false)

  const { scrollYProgress } = useScroll({ target: containerRef })
  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [1.05, 1])
  const translateY = useTransform(scrollYProgress, [0, 1], [0, -100])

  useEffect(() => { setMounted(true) }, [])

  const handleStart = () => {
    setShowTransition(true)
    setTimeout(() => onStart(), 900)
  }

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: "linear-gradient(135deg, #f8f4ee 0%, #eee8dc 20%, #e8dfd0 40%, #ede8f0 60%, #dce8f0 80%, #f0f4f8 100%)" }}
    >
      {/* Mesh orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div style={{ position: "absolute", width: 700, height: 700, borderRadius: "50%", top: -200, right: -150, background: "radial-gradient(circle, rgba(26,86,219,0.06) 0%, transparent 70%)", animation: "float1 10s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: 500, height: 500, borderRadius: "50%", bottom: -100, left: -100, background: "radial-gradient(circle, rgba(13,122,78,0.06) 0%, transparent 70%)", animation: "float2 12s ease-in-out infinite" }} />
        <div style={{ position: "absolute", width: 400, height: 400, borderRadius: "50%", top: "30%", left: "30%", background: "radial-gradient(circle, rgba(180,83,9,0.03) 0%, transparent 70%)", animation: "float3 9s ease-in-out infinite" }} />
      </div>

      {/* Icons */}
      {mounted && AWS_ICONS.map((icon, i) => (
        <AwsIconCard key={i} icon={icon} index={i} />
      ))}

      {/* Hero */}
      <div
        ref={containerRef}
        style={{
          height: "80rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <div style={{ perspective: "1000px", width: "100%", padding: "0 24px", pointerEvents: "none" }}>
          <motion.div
            style={{ translateY, pointerEvents: "none" }}
            className="text-center mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          >
            <h1 style={{
              fontFamily: "'Cabinet Grotesk', Georgia, serif",
              fontSize: "clamp(44px, 7vw, 84px)",
              fontWeight: 800, lineHeight: 1.0,
              letterSpacing: "-3px", color: "#0f0e0c", marginBottom: 20,
              pointerEvents: "none",
            }}>
              Your AWS Migration<br />
              <span style={{
                background: "linear-gradient(135deg, #1a56db 0%, #0d7a4e 100%)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
              }}>
                Plan, in minutes
              </span>
            </h1>

            <p style={{
              fontSize: 19, color: "#6b6456", lineHeight: 1.7,
              maxWidth: 520, margin: "0 auto 40px",
              fontFamily: "'DM Serif Display', Georgia, serif",
              fontWeight: 400, fontStyle: "italic",
              pointerEvents: "none",
            }}>
              Describe your infrastructure. Get a complete AI-generated AWS migration strategy — service mapping, cost estimates, risk assessment and a phased roadmap.
            </p>

            <div style={{
              display: "flex", justifyContent: "center",
              marginBottom: 80,
              transform: "scale(1.3)", transformOrigin: "center",
              pointerEvents: "auto",
            }}>
              <FlowButton text="Plan Your Migration" onClick={handleStart} />
            </div>

            <p style={{ fontSize: 12, color: "#a8a59f", fontFamily: "monospace", marginTop: 16, pointerEvents: "none" }}>
              Supports On-Premises · Azure · GCP → AWS
            </p>
          </motion.div>

          {/* Tablet */}
          <motion.div
            style={{
              rotateX: rotate, scale, marginTop: 0,
              boxShadow: "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026",
              pointerEvents: "none",
            }}
            className="max-w-5xl mx-auto w-full border-4 border-[#d4cfc6] rounded-[30px] bg-[#1a1814] p-3"
          >
            <div className="h-full w-full overflow-hidden rounded-2xl bg-[#0f0e0c] p-8">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 11, fontFamily: "monospace", color: "rgba(255,255,255,0.4)", letterSpacing: 2, textTransform: "uppercase", marginBottom: 4 }}>
                    AWS Migration Plan · E-Commerce Platform
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 700, color: "#fff", letterSpacing: "-0.5px" }}>
                    On-Premises → AWS · 8-12 weeks
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  {[
                    { label: "Complexity", value: "Medium", color: "#f59e0b" },
                    { label: "Savings", value: "35-45%", color: "#22c55e" },
                  ].map((s, i) => (
                    <div key={i} style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12, padding: "8px 14px", textAlign: "center" }}>
                      <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "monospace", marginBottom: 2 }}>{s.label}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: s.color, fontFamily: "monospace" }}>{s.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>
                  Service Mapping
                </div>
                {[
                  { from: "Apache web server (x3)", to: "Amazon EC2 Auto Scaling Group", strategy: "Rehost" },
                  { from: "MySQL 8.0 + 2 read replicas", to: "Amazon RDS MySQL Multi-AZ", strategy: "Replatform" },
                  { from: "Redis cache server", to: "Amazon ElastiCache for Redis", strategy: "Replatform" },
                  { from: "Nginx load balancer", to: "AWS Application Load Balancer", strategy: "Replatform" },
                ].map((row, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", flex: 1, fontFamily: "monospace" }}>{row.from}</span>
                    <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>→</span>
                    <span style={{ fontSize: 12, color: "#60a5fa", flex: 1, fontFamily: "monospace" }}>{row.to}</span>
                    <span style={{ fontSize: 10, fontFamily: "monospace", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 4, padding: "2px 8px", color: "rgba(255,255,255,0.5)" }}>{row.strategy}</span>
                  </div>
                ))}
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {FEATURES.map((f, i) => (
                  <div key={i} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "12px 14px" }}>
                    <div style={{ fontSize: 18, marginBottom: 6 }}>{f.icon}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.8)", marginBottom: 3 }}>{f.title}</div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", lineHeight: 1.4, fontFamily: "monospace" }}>{f.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {showTransition && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ position: "fixed", inset: 0, zIndex: 9999, background: "linear-gradient(135deg, #faf8f4, #f0ebe0)", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 32 }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 40 }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 80, height: 80, borderRadius: 20, background: "rgba(0,0,0,0.06)", border: "2px solid rgba(0,0,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, marginBottom: 8 }}>🏢</div>
              <div style={{ fontSize: 13, color: "#6b6456", fontFamily: "monospace" }}>Your Infrastructure</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
              {[0,1,2,3,4].map(i => (
                <motion.div key={i} animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }} transition={{ duration: 0.8, delay: i * 0.1, repeat: Infinity }} style={{ width: 8, height: 8, borderRadius: "50%", background: "#1a56db" }} />
              ))}
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ width: 80, height: 80, borderRadius: 20, background: "linear-gradient(135deg, rgba(26,86,219,0.1), rgba(13,122,78,0.1))", border: "2px solid rgba(26,86,219,0.2)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36, marginBottom: 8 }}>☁️</div>
              <div style={{ fontSize: 13, color: "#1a56db", fontFamily: "monospace", fontWeight: 600 }}>AWS Cloud</div>
            </div>
          </div>
          <div style={{ fontSize: 14, color: "#a8a59f", fontFamily: "monospace" }}>Preparing your migration planner...</div>
        </motion.div>
      )}

      <style>{`
        @keyframes float1 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(30px,-20px)} }
        @keyframes float2 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-20px,30px)} }
        @keyframes float3 { 0%,100%{transform:translate(0,0)} 50%{transform:translate(20px,20px)} }
      `}</style>
    </div>
  )
}
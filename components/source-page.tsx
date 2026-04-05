"use client"

import { useState, useEffect, useRef } from "react"
import { SourceType } from "@/app/page"
import Image from "next/image"
import { motion } from "framer-motion"

interface SourcePageProps {
  onSelect: (source: SourceType) => void
  onBack: () => void
}

const FLOATING_ICONS = [
  { src: "/icons/1.png",  x: 3,   y: 12,  delay: 0,    duration: 4.2 },
  { src: "/icons/2.png",  x: 88,  y: 8,   delay: 0.3,  duration: 5.1 },
  { src: "/icons/3.png",  x: 5,   y: 35,  delay: 0.6,  duration: 4.8 },
  { src: "/icons/4.png",  x: 85,  y: 30,  delay: 0.2,  duration: 5.5 },
  { src: "/icons/5.png",  x: 2,   y: 58,  delay: 0.9,  duration: 4.3 },
  { src: "/icons/6.png",  x: 87,  y: 55,  delay: 0.5,  duration: 5.2 },
  { src: "/icons/7.png",  x: 4,   y: 78,  delay: 1.1,  duration: 4.6 },
  { src: "/icons/8.png",  x: 84,  y: 75,  delay: 0.7,  duration: 5.0 },
  { src: "/icons/9.png",  x: 15,  y: 92,  delay: 0.4,  duration: 4.9 },
  { src: "/icons/10.png", x: 26,  y: 92,   delay: 0.8,  duration: 4.4 },
  { src: "/icons/11.png", x: 72,  y: 90,  delay: 1.2,  duration: 5.3 },
  { src: "/icons/12.png", x: 50,  y: 93,  delay: 0.1,  duration: 4.7 },
  { src: "/icons/13.png", x: 60,  y: 92,  delay: 1.0,  duration: 5.4 },
  { src: "/icons/14.png", x: 40,  y: 92,  delay: 0.35, duration: 4.1 },
]

function FloatingIcon({ icon, index }: { icon: typeof FLOATING_ICONS[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [repel, setRepel] = useState({ x: 0, y: 0 })
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const handleMouseMove = (e: MouseEvent) => {
      if (!ref.current) return
      const rect = ref.current.getBoundingClientRect()
      const cx = rect.left + rect.width / 2
      const cy = rect.top + rect.height / 2
      const dist = Math.sqrt(Math.pow(e.clientX - cx, 2) + Math.pow(e.clientY - cy, 2))
      if (dist < 130) {
        const angle = Math.atan2(e.clientY - cy, e.clientX - cx)
        const force = (1 - dist / 130) * 45
        setRepel({ x: -Math.cos(angle) * force, y: -Math.sin(angle) * force })
      } else {
        setRepel({ x: 0, y: 0 })
      }
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  if (!mounted) return null

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{
        opacity: 1,
        scale: 1,
        x: repel.x,
        y: [repel.y, repel.y - 10, repel.y],
        rotate: [0, 2, -2, 0],
      }}
      transition={{
        opacity: { delay: icon.delay, duration: 0.5 },
        scale: { delay: icon.delay, duration: 0.5, type: "spring" },
        x: { type: "spring", stiffness: 200, damping: 20 },
        y: { duration: icon.duration, repeat: Infinity, ease: "easeInOut", delay: icon.delay },
        rotate: { duration: icon.duration + 1, repeat: Infinity, ease: "easeInOut", delay: icon.delay },
      }}
      style={{
        position: "fixed",
        left: `${icon.x}%`,
        top: `${icon.y}%`,
        zIndex: 1,
        pointerEvents: "none",
      }}
    >
      <div style={{
        background: "rgba(255,255,255,0.72)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(255,255,255,0.6)",
        borderRadius: 16,
        padding: "10px",
        display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: "0 4px 20px rgba(26,86,219,0.08)",
        width: 60, height: 60,
      }}>
        <Image src={icon.src} alt={`icon-${index}`} width={36} height={36} style={{ borderRadius: 6, objectFit: "contain" }} />
      </div>
    </motion.div>
  )
}

// Spotlight card effect
function SpotlightCard({
  children,
  isHovered,
  color,
}: {
  children: React.ReactNode
  isHovered: boolean
  color: string
}) {
  const cardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const syncPointer = (e: PointerEvent) => {
      if (cardRef.current) {
        cardRef.current.style.setProperty("--x", e.clientX.toFixed(2))
        cardRef.current.style.setProperty("--y", e.clientY.toFixed(2))
      }
    }
    document.addEventListener("pointermove", syncPointer)
    return () => document.removeEventListener("pointermove", syncPointer)
  }, [])

  return (
    <div
      ref={cardRef}
      style={{
        borderRadius: 20,
        width: "100%",
        position: "relative",
        background: isHovered
          ? `radial-gradient(300px circle at calc(var(--x, 0) * 1px) calc(var(--y, 0) * 1px), rgba(255,255,255,0.18), transparent 60%), rgba(255,255,255,0.85)`
          : "rgba(255,255,255,0.65)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        backgroundAttachment: isHovered ? "fixed" : undefined,
        transition: "background 0.2s ease",
      }}
    >
      {children}
    </div>
  )
}

const SOURCES = [
  {
    id: "on-prem" as SourceType,
    label: "On-Premises",
    sublabel: "Physical servers & data centers",
    description: "Migrate from your own hardware, VMware, or bare-metal servers to AWS",
    icon: (
      <svg viewBox="0 0 64 64" width="52" height="52" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    icon: <Image src="/icons/azure.svg" alt="Azure" width={52} height={52} style={{ objectFit: "contain" }} />,
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
    icon: <Image src="/icons/gcp.png" alt="GCP" width={52} height={52} style={{ objectFit: "contain" }} />,
    color: "#4285F4",
    bg: "rgba(66,133,244,0.05)",
    border: "rgba(66,133,244,0.2)",
    tag: "Growing",
  },
]

export default function SourcePage({ onSelect, onBack }: SourcePageProps) {
  const [hovered, setHovered] = useState<SourceType | null>(null)
  const [selected, setSelected] = useState<SourceType | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  const handleSelect = (id: SourceType) => {
    setSelected(id)
    setTimeout(() => onSelect(id), 200)
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(160deg, #eef2ff 0%, #dde8f8 25%, #ccd8f0 50%, #b8cce8 75%, #a8c0e0 100%)",
      padding: "60px 24px",
      display: "flex", flexDirection: "column", alignItems: "center",
      position: "relative", overflow: "hidden",
    }}>

      {/* Floating icons */}
      {mounted && FLOATING_ICONS.map((icon, i) => (
        <FloatingIcon key={i} icon={icon} index={i} />
      ))}

      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          position: "fixed", top: 24, left: 24,
          background: "rgba(255,255,255,0.75)",
          border: "1px solid rgba(255,255,255,0.6)",
          borderRadius: 12, padding: "8px 16px",
          fontSize: 13, color: "#3a4a6a", cursor: "pointer",
          display: "flex", alignItems: "center", gap: 6,
          backdropFilter: "blur(10px)",
          boxShadow: "0 2px 8px rgba(26,86,219,0.1)",
          fontFamily: "monospace", zIndex: 10,
        }}
      >
        ← Back
      </button>

      {/* Step indicator */}
      <div style={{
        display: "flex", alignItems: "center", gap: 8,
        marginBottom: 48, fontFamily: "monospace", fontSize: 12,
        color: "#6a7a9a", position: "relative", zIndex: 5,
      }}>
        <span style={{ color: "#1a2a4a", fontWeight: 600 }}>① Select Source</span>
        <span>→</span><span>② Fill Details</span>
        <span>→</span><span>③ Get Plan</span>
      </div>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 56, maxWidth: 560, position: "relative", zIndex: 5 }}>
        <h2 style={{
          fontFamily: "'Cabinet Grotesk', Georgia, serif",
          fontSize: "clamp(28px, 4vw, 44px)",
          fontWeight: 800, color: "#0f1e3a",
          letterSpacing: "-1.5px", marginBottom: 12,
        }}>
          Where are you migrating from?
        </h2>
        <p style={{ fontSize: 16, color: "#4a5a7a", lineHeight: 1.6 }}>
          Choose your current infrastructure. We'll tailor the AWS migration plan specifically for your platform.
        </p>
      </div>

      {/* Source cards */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
        gap: 16, width: "100%", maxWidth: 900,
        position: "relative", zIndex: 5,
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
                background: "transparent",
                border: "none", padding: 0,
                cursor: "pointer", textAlign: "left", borderRadius: 20,
              }}
            >
              <SpotlightCard isHovered={isHovered} color={src.color}>
                <div style={{
                  border: `2px solid ${isHovered || isSelected ? src.color : "rgba(255,255,255,0.6)"}`,
                  borderRadius: 20, padding: "28px 24px",
                  transition: "all 0.2s ease",
                  transform: isHovered ? "translateY(-4px)" : "translateY(0)",
                  boxShadow: isHovered
                    ? `0 16px 48px ${src.color}25`
                    : "0 2px 16px rgba(26,86,219,0.08)",
                  position: "relative", overflow: "hidden",
                  background: "transparent",
                }}>
                  {/* Tag */}
                  <div style={{
                    position: "absolute", top: 16, right: 16,
                    background: src.bg, border: `1px solid ${src.border}`,
                    borderRadius: 20, padding: "2px 10px",
                    fontSize: 11, color: src.color,
                    fontFamily: "monospace", fontWeight: 600,
                  }}>
                    {src.tag}
                  </div>

                  {/* Icon */}
                  <div style={{
                    width: 76, height: 76,
                    background: isHovered ? src.bg : "rgba(255,255,255,0.5)",
                    borderRadius: 16, marginBottom: 20,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    border: `1px solid ${isHovered ? src.border : "rgba(255,255,255,0.6)"}`,
                    transition: "all 0.2s ease",
                  }}>
                    {src.icon}
                  </div>

                  <div style={{
                    fontSize: 18, fontWeight: 700, color: "#0f1e3a",
                    fontFamily: "'Cabinet Grotesk', sans-serif",
                    letterSpacing: "-0.3px", marginBottom: 4,
                  }}>
                    {src.label}
                  </div>
                  <div style={{ fontSize: 12, color: src.color, fontFamily: "monospace", marginBottom: 12, fontWeight: 600 }}>
                    {src.sublabel}
                  </div>
                  <div style={{ fontSize: 13, color: "#4a5a7a", lineHeight: 1.5 }}>
                    {src.description}
                  </div>

                  <div style={{
                    marginTop: 20, fontSize: 13, color: src.color,
                    fontWeight: 600, display: "flex", alignItems: "center", gap: 4,
                    opacity: isHovered ? 1 : 0, transition: "opacity 0.2s ease",
                  }}>
                    Select this source →
                  </div>
                </div>
              </SpotlightCard>
            </button>
          )
        })}
      </div>

      <p style={{ marginTop: 40, fontSize: 12, color: "#6a7a9a", fontFamily: "monospace", position: "relative", zIndex: 5 }}>
        Supports on-prem, Azure, and GCP to AWS migrations
      </p>
    </div>
  )
}
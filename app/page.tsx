"use client"

import { useState, useEffect } from "react"
import HeroPage from "@/components/hero-page"
import SourcePage from "@/components/source-page"
import FormPage from "@/components/form-page"
import LoadingPage from "@/components/loading-page"
import ResultsPage from "@/components/results-page"

export type SourceType = "on-prem" | "azure" | "gcp"
export type PageType = "hero" | "source" | "form" | "loading" | "results"

export interface FormData {
  source: SourceType
  servers: string
  databases: string
  data_size: string
  uptime_requirement: string
  budget: string
  additional: string
}

export interface Risk {
  description: string
  severity: "High" | "Medium" | "Low"
}

export interface ServiceMapping {
  current: string
  aws_equivalent: string
  strategy: string
  notes: string
}

export interface MigrationPhase {
  phase: number
  title: string
  duration: string
  tasks: string[]
}

export interface MigrationPlan {
  summary: string
  source: string
  complexity: "Low" | "Medium" | "High"
  estimated_duration: string
  monthly_cost_estimate: string
  migration_strategy: string
  service_mapping: ServiceMapping[]
  migration_phases: MigrationPhase[]
  risks: Risk[]
  cost_savings: string
  checklist: string[]
}

const API_URL = "https://mvxzv3gnb3.execute-api.ap-south-1.amazonaws.com/prod/plan"

export default function Home() {
  const [page, setPage] = useState<PageType>("hero")
  const [source, setSource] = useState<SourceType>("on-prem")
  const [plan, setPlan] = useState<MigrationPlan | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<FormData | null>(null)

  // Smooth page transitions
  const [isTransitioning, setIsTransitioning] = useState(false)

  const navigateTo = (nextPage: PageType) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setPage(nextPage)
      setIsTransitioning(false)
      window.scrollTo(0, 0)
    }, 300)
  }

  const handleSourceSelect = (s: SourceType) => {
    setSource(s)
    navigateTo("form")
  }

  const handleFormSubmit = async (data: FormData) => {
    setFormData(data)
    setError(null)
    navigateTo("loading")

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await response.json()
      const body = typeof result.body === "string" ? JSON.parse(result.body) : result.body
      const planData = typeof body.plan === "string" ? JSON.parse(body.plan) : body.plan

      if (!planData) throw new Error("No plan returned")

      // Normalize risks to objects
      if (planData.risks && planData.risks.length > 0) {
        planData.risks = planData.risks.map((r: Risk | string) => {
          if (typeof r === "string") {
            const lower = r.toLowerCase()
            const severity = lower.includes("high") || lower.includes("critical") ? "High"
              : lower.includes("medium") || lower.includes("moderate") ? "Medium" : "Low"
            return { description: r, severity }
          }
          return r
        })
      }

      setPlan(planData)
      navigateTo("results")
    } catch (err) {
      console.error(err)
      setError("Failed to generate plan. Please try again.")
      navigateTo("form")
    }
  }

  const handleReset = () => {
    setPlan(null)
    setError(null)
    setFormData(null)
    navigateTo("hero")
  }

  const handleBack = () => {
    if (page === "source") navigateTo("hero")
    else if (page === "form") navigateTo("source")
    else if (page === "results") navigateTo("hero")
  }

  return (
    <div
      className="min-h-screen"
      style={{
        opacity: isTransitioning ? 0 : 1,
        transform: isTransitioning ? "translateY(8px)" : "translateY(0)",
        transition: "opacity 0.3s ease, transform 0.3s ease",
      }}
    >
      {page === "hero" && <HeroPage onStart={() => navigateTo("source")} />}
      {page === "source" && <SourcePage onSelect={handleSourceSelect} onBack={() => navigateTo("hero")} />}
      {page === "form" && (
        <FormPage
          source={source}
          onSubmit={handleFormSubmit}
          onBack={() => navigateTo("source")}
          error={error}
        />
      )}
      {page === "loading" && <LoadingPage />}
      {page === "results" && plan && (
        <ResultsPage plan={plan} source={source} onReset={handleReset} />
      )}
    </div>
  )
}

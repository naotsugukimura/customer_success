"use client"

import { ChevronRight, Monitor } from "lucide-react"

interface NavigationGuideProps {
  steps: string[]
}

export function NavigationGuide({ steps }: NavigationGuideProps) {
  if (steps.length === 0) return null

  return (
    <div className="my-2 rounded-lg border border-primary/20 bg-primary/5 p-3">
      <div className="mb-2 flex items-center gap-1.5 text-xs font-medium text-primary">
        <Monitor className="size-3.5" />
        画面遷移ガイド
      </div>
      <div className="flex flex-wrap items-center gap-1">
        {steps.map((step, i) => (
          <div key={i} className="flex items-center gap-1">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-background px-2.5 py-1 text-xs font-medium shadow-sm ring-1 ring-border">
              <span className="flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {i + 1}
              </span>
              {step}
            </span>
            {i < steps.length - 1 && (
              <ChevronRight className="size-3.5 text-muted-foreground" />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

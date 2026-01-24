"use client"

import { useEffect, useMemo, useState } from "react"

type Status = "upcoming" | "live" | "past"

type Props = {
  startDate: string
  endDate: string
}

function formatPart(value: number) {
  return value.toString().padStart(2, "0")
}

export function CountdownTimer({ startDate, endDate }: Props) {
  const start = useMemo(() => new Date(startDate), [startDate])
  const end = useMemo(() => new Date(endDate), [endDate])

  // Avoid hydration mismatch by deferring "now" until client mounts
  const [now, setNow] = useState<number | null>(null)

  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const { display, label, colorClass } = useMemo(() => {
    if (now === null) {
      return {
        display: "--:--:--:--",
        label: "Loading",
        colorClass: "text-muted-foreground",
      }
    }

    const startMs = start.getTime()
    const endMs = end.getTime()

    if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
      return {
        display: "--",
        label: "Invalid date",
        colorClass: "text-muted-foreground",
      }
    }

    const effectiveStatus: Status = now < startMs ? "upcoming" : now <= endMs ? "live" : "past"

    if (effectiveStatus === "past") {
      return {
        display: "Event Ended",
        label: "Finished",
        colorClass: "text-muted-foreground",
      }
    }

    const target = effectiveStatus === "upcoming" ? startMs : endMs
    const diff = Math.max(target - now, 0)

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
    const minutes = Math.floor((diff / (1000 * 60)) % 60)
    const seconds = Math.floor((diff / 1000) % 60)

    const colorClass = effectiveStatus === "live" ? "text-emerald-600" : "text-blue-600"
    const label = effectiveStatus === "live" ? "Ends in" : "Starts in"
    const display = `${formatPart(days)}:${formatPart(hours)}:${formatPart(minutes)}:${formatPart(seconds)}`

    return { display, label, colorClass }
  }, [end, now, start])

  return (
    <div className="flex items-center justify-between rounded-lg border border-border/70 bg-muted/40 px-3 py-2">
      <span className="text-xs uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className={`font-mono text-base tabular-nums ${colorClass}`}>{display}</span>
    </div>
  )
}
"use client"

import { useEffect, useRef, useState } from "react"

// Lazily renders children when section enters viewport to cut initial work
export function LazySection({
  children,
  fallback = null,
  rootMargin = "200px",
}: {
  children: React.ReactNode
  fallback?: React.ReactNode
  rootMargin?: string
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (visible) return
    const node = ref.current
    if (!node || typeof IntersectionObserver === "undefined") {
      setVisible(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (entry?.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { rootMargin }
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [visible, rootMargin])

  return <div ref={ref}>{visible ? children : fallback}</div>
}

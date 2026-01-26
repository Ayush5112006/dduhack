'use client'

import { useEffect } from 'react'

export function PerformanceMonitor() {
  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV !== 'development') return

    // Report Web Vitals
    const reportWebVitals = (metric: any) => {
      console.log(`[Performance] ${metric.name}:`, Math.round(metric.value), 'ms')
    }

    // Core Web Vitals
    if ('PerformanceObserver' in window) {
      try {
        // Largest Contentful Paint (LCP)
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          const lastEntry = entries[entries.length - 1]
          reportWebVitals({ name: 'LCP', value: lastEntry.startTime })
        })
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })

        // First Input Delay (FID)
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries()
          entries.forEach((entry: any) => {
            reportWebVitals({ name: 'FID', value: entry.processingStart - entry.startTime })
          })
        })
        fidObserver.observe({ entryTypes: ['first-input'] })

        // Cumulative Layout Shift (CLS)
        let clsValue = 0
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value
              reportWebVitals({ name: 'CLS', value: clsValue * 1000 })
            }
          }
        })
        clsObserver.observe({ entryTypes: ['layout-shift'] })
      } catch (err) {
        console.warn('Performance monitoring error:', err)
      }
    }

    // Navigation timing
    if (window.performance && window.performance.timing) {
      const timing = window.performance.timing
      const loadTime = timing.loadEventEnd - timing.navigationStart
      const domReadyTime = timing.domContentLoadedEventEnd - timing.navigationStart
      const renderTime = timing.domComplete - timing.domLoading

      console.log('[Performance] Page Load:', Math.round(loadTime), 'ms')
      console.log('[Performance] DOM Ready:', Math.round(domReadyTime), 'ms')
      console.log('[Performance] Render:', Math.round(renderTime), 'ms')
    }
  }, [])

  return null
}

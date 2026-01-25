"use client"

import { useEffect, useState } from 'react'

/**
 * Detect if user is on mobile device
 */
function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
}

/**
 * Detect if device supports touch
 */
function isTouchDevice(): boolean {
  if (typeof window === 'undefined') return false
  return ('ontouchstart' in window || navigator.maxTouchPoints > 0)
}

/**
 * Check if current viewport is mobile size
 */
function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth < 768
}

/**
 * Check if current viewport is tablet size
 */
function isTabletViewport(): boolean {
  if (typeof window === 'undefined') return false
  const width = window.innerWidth
  return width >= 768 && width < 1024
}

/**
 * Check if current viewport is desktop size
 */
function isDesktopViewport(): boolean {
  if (typeof window === 'undefined') return false
  return window.innerWidth >= 1024
}

/**
 * Get screen orientation
 */
function getOrientation(): 'portrait' | 'landscape' {
  if (typeof window === 'undefined') return 'portrait'
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape'
}

/**
 * Hook to detect if user is on a mobile device
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    setIsMobile(isMobileDevice())
  }, [])

  return isMobile
}

/**
 * Hook to detect if device supports touch
 */
export function useIsTouch() {
  const [isTouch, setIsTouch] = useState(false)

  useEffect(() => {
    setIsTouch(isTouchDevice())
  }, [])

  return isTouch
}

/**
 * Hook to detect current viewport size
 */
export function useViewport() {
  const [viewport, setViewport] = useState<{
    isMobile: boolean
    isTablet: boolean
    isDesktop: boolean
    width: number
  }>({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    width: 0,
  })

  useEffect(() => {
    const handleResize = () => {
      setViewport({
        isMobile: isMobileViewport(),
        isTablet: isTabletViewport(),
        isDesktop: isDesktopViewport(),
        width: window.innerWidth,
      })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return viewport
}

/**
 * Hook to detect screen orientation
 */
export function useOrientation() {
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    const handleOrientationChange = () => {
      setOrientation(getOrientation())
    }

    handleOrientationChange()
    window.addEventListener('resize', handleOrientationChange)
    window.addEventListener('orientationchange', handleOrientationChange)

    return () => {
      window.removeEventListener('resize', handleOrientationChange)
      window.removeEventListener('orientationchange', handleOrientationChange)
    }
  }, [])

  return orientation
}

/**
 * Hook to lock body scroll (useful for mobile modals/menus)
 */
export function useBodyScrollLock(locked: boolean) {
  useEffect(() => {
    if (locked) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }

    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [locked])
}

/**
 * Hook to detect if user has scrolled past a certain threshold
 */
export function useScrollPosition(threshold = 0) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > threshold)
    }

    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => window.removeEventListener('scroll', handleScroll)
  }, [threshold])

  return scrolled
}

/**
 * Hook for responsive breakpoints
 */
export function useBreakpoint() {
  const [breakpoint, setBreakpoint] = useState<'sm' | 'md' | 'lg' | 'xl' | '2xl'>('sm')

  useEffect(() => {
    const getBreakpoint = () => {
      const width = window.innerWidth
      if (width < 640) return 'sm'
      if (width < 768) return 'md'
      if (width < 1024) return 'lg'
      if (width < 1280) return 'xl'
      return '2xl'
    }

    const handleResize = () => {
      setBreakpoint(getBreakpoint())
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return breakpoint
}

/**
 * Hook to detect if reduced motion is preferred
 */
export function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = () => {
      setPrefersReducedMotion(mediaQuery.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return prefersReducedMotion
}

"use client"

import { useEffect, useRef, useState } from 'react'

type RealtimeEvent = {
  type: string
  payload: any
  timestamp: number
}

export function useRealtime(eventType?: string) {
  const [isConnected, setIsConnected] = useState(false)
  const [lastEvent, setLastEvent] = useState<RealtimeEvent | null>(null)
  const eventSourceRef = useRef<EventSource | null>(null)
  const listenersRef = useRef<Map<string, Set<(data: any) => void>>>(new Map())

  useEffect(() => {
    // Create EventSource connection
    const eventSource = new EventSource('/api/realtime/events')
    eventSourceRef.current = eventSource

    eventSource.onopen = () => {
      console.log('Real-time connection established')
      setIsConnected(true)
    }

    eventSource.onmessage = (event) => {
      try {
        const data: RealtimeEvent = JSON.parse(event.data)
        setLastEvent(data)

        // Notify specific listeners
        const listeners = listenersRef.current.get(data.type)
        if (listeners) {
          listeners.forEach(callback => callback(data.payload))
        }

        // Notify wildcard listeners
        const wildcardListeners = listenersRef.current.get('*')
        if (wildcardListeners) {
          wildcardListeners.forEach(callback => callback(data))
        }
      } catch (error) {
        console.error('Failed to parse realtime event:', error)
      }
    }

    eventSource.onerror = () => {
      console.error('Real-time connection error')
      setIsConnected(false)
    }

    // Cleanup on unmount
    return () => {
      eventSource.close()
      listenersRef.current.clear()
    }
  }, [])

  const subscribe = (type: string, callback: (data: any) => void) => {
    if (!listenersRef.current.has(type)) {
      listenersRef.current.set(type, new Set())
    }
    listenersRef.current.get(type)!.add(callback)

    // Return unsubscribe function
    return () => {
      const listeners = listenersRef.current.get(type)
      if (listeners) {
        listeners.delete(callback)
      }
    }
  }

  // Subscribe to specific event type if provided
  useEffect(() => {
    if (!eventType) return

    const handleEvent = (data: any) => {
      setLastEvent({ type: eventType, payload: data, timestamp: Date.now() })
    }

    return subscribe(eventType, handleEvent)
  }, [eventType])

  return {
    isConnected,
    lastEvent,
    subscribe,
  }
}

// Specific hooks for common use cases
export function useSubmissions(hackathonId?: string) {
  const [submissions, setSubmissions] = useState<any[]>([])
  const { subscribe } = useRealtime()

  useEffect(() => {
    return subscribe('submission:created', (data) => {
      if (!hackathonId || data.hackathonId === hackathonId) {
        setSubmissions(prev => [data.submission, ...prev])
      }
    })
  }, [hackathonId, subscribe])

  return submissions
}

export function useNotifications() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const { subscribe } = useRealtime()

  useEffect(() => {
    return subscribe('notification:new', (data) => {
      setNotifications(prev => [data.notification, ...prev])
      setUnreadCount(prev => prev + 1)
    })
  }, [subscribe])

  return { notifications, unreadCount, setNotifications, setUnreadCount }
}

export function useLeaderboard(hackathonId?: string) {
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const { subscribe } = useRealtime()

  useEffect(() => {
    const unsubscribe1 = subscribe('submission:scored', (data) => {
      if (!hackathonId || data.hackathonId === hackathonId) {
        // Refresh leaderboard
        setLeaderboard(prev => {
          const updated = [...prev]
          const index = updated.findIndex(s => s.id === data.submissionId)
          if (index >= 0) {
            updated[index] = { ...updated[index], score: data.score }
          }
          return updated.sort((a, b) => (b.score || 0) - (a.score || 0))
        })
      }
    })

    const unsubscribe2 = subscribe('leaderboard:updated', (data) => {
      if (!hackathonId || data.hackathonId === hackathonId) {
        setLeaderboard(data.leaderboard)
      }
    })

    return () => {
      unsubscribe1()
      unsubscribe2()
    }
  }, [hackathonId, subscribe])

  return leaderboard
}

// Real-time event system using Server-Sent Events (SSE)
// Lightweight alternative to WebSockets for one-way server-to-client updates

type EventCallback = (data: any) => void

interface EventSubscription {
  type: string
  callback: EventCallback
}

class RealtimeManager {
  private eventSource: EventSource | null = null
  private subscriptions: Map<string, EventCallback[]> = new Map()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectDelay = 1000

  connect() {
    if (this.eventSource) return

    try {
      this.eventSource = new EventSource('/api/realtime/events')

      this.eventSource.onopen = () => {
        console.log('Real-time connection established')
        this.reconnectAttempts = 0
      }

      this.eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.emit(data.type, data.payload)
        } catch (error) {
          console.error('Failed to parse realtime event:', error)
        }
      }

      this.eventSource.onerror = () => {
        console.error('Real-time connection error')
        this.eventSource?.close()
        this.eventSource = null
        this.reconnect()
      }
    } catch (error) {
      console.error('Failed to connect to realtime:', error)
    }
  }

  private reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached')
      return
    }

    this.reconnectAttempts++
    const delay = this.reconnectDelay * this.reconnectAttempts

    setTimeout(() => {
      console.log(`Reconnecting... (attempt ${this.reconnectAttempts})`)
      this.connect()
    }, delay)
  }

  disconnect() {
    this.eventSource?.close()
    this.eventSource = null
    this.subscriptions.clear()
  }

  subscribe(type: string, callback: EventCallback) {
    if (!this.subscriptions.has(type)) {
      this.subscriptions.set(type, [])
    }
    this.subscriptions.get(type)!.push(callback)

    // Auto-connect on first subscription
    if (!this.eventSource) {
      this.connect()
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.subscriptions.get(type)
      if (callbacks) {
        const index = callbacks.indexOf(callback)
        if (index > -1) {
          callbacks.splice(index, 1)
        }
      }
    }
  }

  private emit(type: string, data: any) {
    const callbacks = this.subscriptions.get(type)
    if (callbacks) {
      callbacks.forEach((callback) => callback(data))
    }

    // Also emit to wildcard listeners
    const wildcardCallbacks = this.subscriptions.get('*')
    if (wildcardCallbacks) {
      wildcardCallbacks.forEach((callback) => callback({ type, data }))
    }
  }
}

// Singleton instance
export const realtime = new RealtimeManager()

// Event types
export const RealtimeEvents = {
  SUBMISSION_CREATED: 'submission:created',
  SUBMISSION_SCORED: 'submission:scored',
  NOTIFICATION_NEW: 'notification:new',
  HACKATHON_UPDATED: 'hackathon:updated',
  WINNERS_ANNOUNCED: 'winners:announced',
  LEADERBOARD_UPDATED: 'leaderboard:updated',
  REGISTRATION_NEW: 'registration:new',
  TEAM_INVITE: 'team:invite',
} as const

// Broadcast function for server-side
export function broadcastEvent(type: string, payload: any) {
  // Store event in memory for SSE clients
  if (typeof window === 'undefined') {
    const event = { type, payload, timestamp: Date.now() }
    global.realtimeEvents = global.realtimeEvents || []
    global.realtimeEvents.push(event)
    
    // Keep only last 100 events
    if (global.realtimeEvents.length > 100) {
      global.realtimeEvents.shift()
    }
  }
}

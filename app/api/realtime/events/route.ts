import { NextRequest } from 'next/server'
import { getSession } from '@/lib/session'

// Global event storage
declare global {
  var realtimeEvents: Array<{ type: string; payload: any; timestamp: number }>
  var realtimeClients: Map<string, ReadableStreamDefaultController>
}

global.realtimeEvents = global.realtimeEvents || []
global.realtimeClients = global.realtimeClients || new Map()

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const session = await getSession()
  
  if (!session) {
    return new Response('Unauthorized', { status: 401 })
  }

  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    start(controller) {
      // Store client connection
      const clientId = `${session.userId}-${Date.now()}`
      global.realtimeClients.set(clientId, controller)

      // Send initial connection message
      const data = `data: ${JSON.stringify({ type: 'connected', payload: { clientId } })}\n\n`
      controller.enqueue(encoder.encode(data))

      // Send recent events
      const recentEvents = global.realtimeEvents.slice(-10)
      recentEvents.forEach(event => {
        const eventData = `data: ${JSON.stringify(event)}\n\n`
        controller.enqueue(encoder.encode(eventData))
      })

      // Cleanup on close
      request.signal.addEventListener('abort', () => {
        global.realtimeClients.delete(clientId)
        controller.close()
      })

      // Keep-alive ping every 30 seconds
      const keepAlive = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(': keep-alive\n\n'))
        } catch (error) {
          clearInterval(keepAlive)
          global.realtimeClients.delete(clientId)
        }
      }, 30000)
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}

// Helper to broadcast to all connected clients
export function broadcast(type: string, payload: any) {
  const event = { type, payload, timestamp: Date.now() }
  global.realtimeEvents.push(event)
  
  // Keep only last 100 events
  if (global.realtimeEvents.length > 100) {
    global.realtimeEvents.shift()
  }

  const encoder = new TextEncoder()
  const data = `data: ${JSON.stringify(event)}\n\n`
  
  global.realtimeClients.forEach((controller) => {
    try {
      controller.enqueue(encoder.encode(data))
    } catch (error) {
      // Client disconnected, will be cleaned up
    }
  })
}

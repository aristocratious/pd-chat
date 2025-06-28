// N8N Webhook API Service
// Replace the Supabase backend with your n8n webhook

const N8N_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook/chat'

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp?: string
  id?: string
}

// Updated interface to match your existing n8n workflow
export interface N8NRequest {
  message: string
  language: string
  timestamp: string
  sessionId: string
  userAgent: string
  referrer: string
}

export interface ChatResponse {
  message: string
  success: boolean
  error?: string
  responseTime?: number // Add performance tracking
}

export async function sendChatToN8N(userMessage: string, sessionId: string): Promise<ChatResponse> {
  const startTime = Date.now()
  
  try {
    // Format the request to match your existing n8n workflow
    const n8nPayload: N8NRequest = {
      message: userMessage,
      language: "en",
      timestamp: new Date().toISOString(),
      sessionId: sessionId,
      userAgent: "Plan Divino Chat",
      referrer: "plan-divino-chat"
    }

    // Create an AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

    try {
      console.log(`🚀 Sending request to N8N at ${startTime}`)
      
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Plan Divino Chat/1.0',
          'Connection': 'keep-alive',
          'Cache-Control': 'no-cache',
          // Add headers to optimize connection
          'Accept-Encoding': 'gzip, deflate',
        },
        body: JSON.stringify(n8nPayload),
        signal: controller.signal,
        // Add performance optimizations
        keepalive: true,
      })

      clearTimeout(timeoutId) // Clear timeout if request completes
      const responseTime = Date.now() - startTime
      
      console.log(`⚡ N8N response received in ${responseTime}ms`)

      if (!response.ok) {
        throw new Error(`N8N webhook error: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log(`✅ N8N total time: ${responseTime}ms`)
      
      return {
        message: data.response || data.message || '',
        success: data.success !== false, // Handle your webhook's success field
        responseTime,
      }
    } catch (fetchError) {
      clearTimeout(timeoutId) // Clear timeout on error
      const responseTime = Date.now() - startTime
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.log(`⏰ N8N timeout after ${responseTime}ms`)
        throw new Error('N8N webhook timeout - response took too long')
      }
      
      console.log(`❌ N8N error after ${responseTime}ms:`, fetchError)
      throw fetchError
    }
  } catch (error) {
    const responseTime = Date.now() - startTime
    console.error(`🔥 N8N API Error after ${responseTime}ms:`, error)
    
    // Return a fallback response instead of complete failure
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const isTimeout = errorMessage.includes('timeout')
    
    return {
      message: isTimeout 
        ? "I apologize, but I'm experiencing some technical difficulties right now. Please try your question again in a moment."
        : "I'm having trouble processing your request right now. Please try again.",
      success: false,
      error: errorMessage,
      responseTime,
    }
  }
}

// Add a function to test N8N performance
export async function testN8NPerformance(): Promise<{ responseTime: number; success: boolean }> {
  const startTime = Date.now()
  try {
    const response = await fetch(N8N_WEBHOOK_URL, {
      method: 'HEAD', // Just test connectivity
      signal: AbortSignal.timeout(3000), // 3 second timeout for ping
    })
    return {
      responseTime: Date.now() - startTime,
      success: response.ok,
    }
  } catch {
    return {
      responseTime: Date.now() - startTime,
      success: false,
    }
  }
}

// Simple in-memory storage for demo - replace with your preferred storage
const chatStorage = new Map<string, ChatMessage[]>()

export function saveChatMessage(chatId: string, message: ChatMessage): void {
  if (!chatStorage.has(chatId)) {
    chatStorage.set(chatId, [])
  }
  chatStorage.get(chatId)!.push(message)
}

export function getChatMessages(chatId: string): ChatMessage[] {
  return chatStorage.get(chatId) || []
}

export function getAllChats(): Record<string, ChatMessage[]> {
  const chats: Record<string, ChatMessage[]> = {}
  chatStorage.forEach((messages, chatId) => {
    chats[chatId] = messages
  })
  return chats
} 
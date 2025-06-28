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
}

export async function sendChatToN8N(userMessage: string, sessionId: string): Promise<ChatResponse> {
  try {
    // Format the request to match your existing n8n workflow
    const n8nPayload: N8NRequest = {
      message: userMessage,
      language: "en",
      timestamp: new Date().toISOString(),
      sessionId: sessionId,
      userAgent: "Zola.Chat Frontend",
      referrer: "zola-chat"
    }

    // Create an AbortController for timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 8000) // 8 second timeout

    try {
      const response = await fetch(N8N_WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(n8nPayload),
        signal: controller.signal,
      })

      clearTimeout(timeoutId) // Clear timeout if request completes

      if (!response.ok) {
        throw new Error(`N8N webhook error: ${response.statusText}`)
      }

      const data = await response.json()
      return {
        message: data.response || data.message || '',
        success: data.success !== false, // Handle your webhook's success field
      }
    } catch (fetchError) {
      clearTimeout(timeoutId) // Clear timeout on error
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        throw new Error('N8N webhook timeout - response took too long')
      }
      throw fetchError
    }
  } catch (error) {
    console.error('N8N API Error:', error)
    
    // Return a fallback response instead of complete failure
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const isTimeout = errorMessage.includes('timeout')
    
    return {
      message: isTimeout 
        ? "I apologize, but I'm experiencing some technical difficulties right now. Please try your question again in a moment."
        : "I'm having trouble processing your request right now. Please try again.",
      success: false,
      error: errorMessage,
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
import { createAsyncChatJob, saveChatMessage, type ChatMessage } from "@/lib/n8n-api"

export const maxDuration = 30 // Reduced for better compatibility with hosting platforms
export const runtime = 'nodejs' // Ensure we're using the right runtime

// Handle CORS preflight requests
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, x-csrf-token',
      'Access-Control-Max-Age': '86400',
    },
  })
}

type ChatRequest = {
  messages: Array<{ role: string; content: string }>
  chatId: string
  userId: string
  model: string
  systemPrompt?: string
  async?: boolean // Optional flag to enable async mode
}

export async function POST(req: Request) {
  try {
    // Add debugging for production
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      hasN8NUrl: !!process.env.N8N_WEBHOOK_URL,
      hasCSRF: !!process.env.CSRF_SECRET
    })

    const {
      messages,
      chatId,
      userId,
      model,
      systemPrompt,
      async: useAsync = false, // Default to sync for backward compatibility
    } = (await req.json()) as ChatRequest

    if (!messages || !chatId || !userId) {
      return new Response(
        JSON.stringify({ error: "Error, missing information" }),
        { status: 400 }
      )
    }

    // Get the last user message content
    const lastMessage = messages[messages.length - 1]
    const userMessageContent = lastMessage?.content || ""
    
    // Create a session ID from userId and chatId for n8n
    const sessionId = `${userId}_${chatId}`
    
    // Save user message to storage
    const userMessage: ChatMessage = {
      role: "user",
      content: userMessageContent,
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9)
    }
    saveChatMessage(chatId, userMessage)

    // ASYNC MODE: Create job and return immediately
    if (useAsync) {
      // Construct callback URL dynamically based on request
      const host = req.headers.get('host')
      const protocol = req.headers.get('x-forwarded-proto') || 
                      (host?.includes('localhost') ? 'http' : 'https')
      const callbackUrl = `${protocol}://${host}/api/chat/callback`
      
      console.log(`📞 Dynamic callback URL: ${callbackUrl}`)
      
      const { jobId, success } = await createAsyncChatJob(userMessageContent, sessionId, callbackUrl)
      
      return new Response(
        JSON.stringify({ 
          jobId, 
          success,
          status: 'processing',
          message: 'Request submitted for processing'
        }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          },
        }
      )
    }

    // SYNC MODE: Original behavior for backward compatibility  
    const { sendChatToN8N } = await import("@/lib/n8n-api")
    const n8nResponse = await sendChatToN8N(userMessageContent, sessionId)

    // Even if N8N fails, we should return a response rather than throw an error
    const responseMessage = n8nResponse.success 
      ? n8nResponse.message 
      : (n8nResponse.message || "I'm experiencing some technical difficulties. Please try again.")

    // Save assistant response
    const assistantMessage: ChatMessage = {
      role: "assistant",
      content: responseMessage,
      timestamp: new Date().toISOString(),
      id: Math.random().toString(36).substr(2, 9)
    }
    
    saveChatMessage(chatId, assistantMessage)

    // Return a simple streaming response that the frontend can parse
    const encoder = new TextEncoder()
    const stream = new ReadableStream({
      start(controller) {
        // Send the message content in the AI SDK format
        const content = `0:"${responseMessage.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"\n`
        controller.enqueue(encoder.encode(content))
        
        // Send finish message
        const finish = `d:{"finishReason":"stop","usage":{"promptTokens":0,"completionTokens":0}}\n`
        controller.enqueue(encoder.encode(finish))
        
        controller.close()
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Vercel-AI-Data-Stream': 'v1',
      },
    })

  } catch (err: unknown) {
    console.error("Error in /api/chat:", err)
    const error = err as {
      code?: string
      message?: string
      statusCode?: number
    }

    // Add more detailed error info for debugging
    const errorDetails = {
      error: error.message || "Internal server error",
      ...(process.env.NODE_ENV === 'development' && {
        details: err,
        stack: (err as Error)?.stack,
        env: {
          hasN8NUrl: !!process.env.N8N_WEBHOOK_URL,
          hasCSRF: !!process.env.CSRF_SECRET
        }
      })
    }

    return new Response(
      JSON.stringify(errorDetails),
      { 
        status: error.statusCode || 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      }
    )
  }
}

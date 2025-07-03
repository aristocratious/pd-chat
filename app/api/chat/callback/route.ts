import { completeJob, saveChatMessage, type ChatMessage } from "@/lib/n8n-api"

export const runtime = 'nodejs'

// Handle CORS preflight requests
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  })
}

type CallbackRequest = {
  jobId: string
  response: string
  success?: boolean
  error?: string
  sessionId?: string
}

export async function POST(req: Request) {
  try {
    const { jobId, response, success = true, error, sessionId } = (await req.json()) as CallbackRequest

    if (!jobId) {
      return new Response(
        JSON.stringify({ error: "Missing jobId" }),
        { status: 400 }
      )
    }

    console.log(`📞 Callback received for job ${jobId}`)

    // Complete the job
    const completed = completeJob(jobId, response, success, error)
    
    if (!completed) {
      return new Response(
        JSON.stringify({ error: "Job not found" }),
        { status: 404 }
      )
    }

    // If we have sessionId, save the assistant message
    if (sessionId && response && success) {
      try {
        // Extract chatId from sessionId (format: userId_chatId)
        const chatId = sessionId.split('_').slice(1).join('_') // Handle cases where userId might contain underscores
        
        if (chatId) {
          const assistantMessage: ChatMessage = {
            role: "assistant",
            content: response,
            timestamp: new Date().toISOString(),
            id: Math.random().toString(36).substr(2, 9)
          }
          
          saveChatMessage(chatId, assistantMessage)
          console.log(`💾 Saved assistant response for chat ${chatId}`)
        }
      } catch (saveError) {
        console.error('Failed to save assistant message:', saveError)
        // Don't fail the callback if saving fails
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Job completed',
        jobId
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )

  } catch (err: unknown) {
    console.error("Error in /api/chat/callback:", err)
    
    return new Response(
      JSON.stringify({ 
        error: "Internal server error",
        details: err instanceof Error ? err.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    )
  }
} 
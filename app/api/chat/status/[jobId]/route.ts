import { getJobStatus } from "@/lib/n8n-api"

export const runtime = 'nodejs'

// Handle CORS preflight requests
export async function OPTIONS() {
  return new Response(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Max-Age': '86400',
    },
  })
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ jobId: string }> }
) {
  try {
    const { jobId } = await params

    if (!jobId) {
      return new Response(
        JSON.stringify({ error: "Missing jobId" }),
        { status: 400 }
      )
    }

    // Get job status
    const job = getJobStatus(jobId)
    
    if (!job) {
      return new Response(
        JSON.stringify({ error: "Job not found" }),
        { status: 404 }
      )
    }

    // Return job status
    const response = {
      jobId: job.id,
      status: job.status,
      userMessage: job.userMessage,
      response: job.response,
      error: job.error,
      createdAt: job.createdAt,
      completedAt: job.completedAt,
      processingTime: job.completedAt ? job.completedAt - job.createdAt : Date.now() - job.createdAt
    }

    return new Response(
      JSON.stringify(response),
      {
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache, no-store, must-revalidate', // Prevent caching for real-time status
        },
      }
    )

  } catch (err: unknown) {
    console.error("Error in /api/chat/status:", err)
    
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
import { testN8NPerformance } from '@/lib/n8n-api'

export async function GET() {
  const startTime = Date.now()
  
  try {
    // Test N8N connectivity and performance
    const n8nTest = await testN8NPerformance()
    const totalTime = Date.now() - startTime
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      checks: {
        api: {
          status: 'ok',
          responseTime: totalTime,
        },
        n8n: {
          status: n8nTest.success ? 'ok' : 'error',
          responseTime: n8nTest.responseTime,
          url: process.env.N8N_WEBHOOK_URL ? 'configured' : 'missing',
        },
      },
      performance: {
        n8n_latency: n8nTest.responseTime,
        n8n_status: n8nTest.success ? 'reachable' : 'unreachable',
        recommendations: n8nTest.responseTime > 3000 
          ? ['N8N response time is slow (>3s). Consider optimizing your workflow or checking network connectivity.']
          : n8nTest.responseTime > 1000
          ? ['N8N response time is moderate (>1s). Monitor for improvements.']
          : ['N8N performance is good.']
      }
    }

    return Response.json(health, {
      status: n8nTest.success ? 200 : 206, // 206 = Partial Content if N8N is down
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    })
  } catch (error) {
    return Response.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        checks: {
          api: {
            status: 'error',
            responseTime: Date.now() - startTime,
          },
          n8n: {
            status: 'unknown',
            responseTime: null,
          }
        }
      },
      { status: 500 }
    )
  }
} 
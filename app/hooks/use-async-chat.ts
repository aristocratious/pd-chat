import { useState, useCallback, useRef, useEffect } from 'react'

export interface ChatJob {
  id: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  userMessage: string
  response?: string
  error?: string
  createdAt: number
  completedAt?: number
  processingTime?: number
}

export interface UseAsyncChatOptions {
  pollingInterval?: number // Default: 1000ms
  maxPollingTime?: number // Default: 30000ms (30 seconds)
  onStatusChange?: (job: ChatJob) => void
  onComplete?: (response: string) => void
  onError?: (error: string) => void
}

export function useAsyncChat(options: UseAsyncChatOptions = {}) {
  const {
    pollingInterval = 1000,
    maxPollingTime = 30000,
    onStatusChange,
    onComplete,
    onError
  } = options

  const [currentJob, setCurrentJob] = useState<ChatJob | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const pollingTimeoutRef = useRef<ReturnType<typeof setTimeout>>()
  const pollingStartTimeRef = useRef<number>()
  const abortControllerRef = useRef<AbortController>()

  // Clean up polling on unmount
  useEffect(() => {
    return () => {
      if (pollingTimeoutRef.current) {
        clearTimeout(pollingTimeoutRef.current)
      }
      abortControllerRef.current?.abort()
    }
  }, [])

  // Poll for job status
  const startPolling = useCallback((jobId: string) => {
    const poll = async () => {
      try {
        // Check if we've exceeded max polling time
        const elapsedTime = Date.now() - (pollingStartTimeRef.current || 0)
        if (elapsedTime > maxPollingTime) {
          throw new Error('Polling timeout - request took too long')
        }

        const response = await fetch(`/api/chat/status/${jobId}`, {
          signal: abortControllerRef.current?.signal
        })

        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Job not found')
          }
          throw new Error(`Failed to get job status: ${response.status}`)
        }

        const job: ChatJob = await response.json()
        setCurrentJob(job)
        onStatusChange?.(job)

        console.log(`📊 Job ${jobId} status: ${job.status} (${job.processingTime}ms)`)

        if (job.status === 'completed') {
          setIsLoading(false)
          if (job.response) {
            onComplete?.(job.response)
          }
          return // Stop polling
        }

        if (job.status === 'failed') {
          setIsLoading(false)
          const errorMessage = job.error || 'Chat processing failed'
          setError(errorMessage)
          onError?.(errorMessage)
          return // Stop polling
        }

        // Continue polling if still processing
        if (job.status === 'processing' || job.status === 'pending') {
          pollingTimeoutRef.current = setTimeout(poll, pollingInterval)
        }

      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return // Polling was aborted
        }
        
        const errorMessage = err instanceof Error ? err.message : 'Polling error'
        setError(errorMessage)
        setIsLoading(false)
        onError?.(errorMessage)
      }
    }

    // Start initial poll
    poll()
  }, [pollingInterval, maxPollingTime, onStatusChange, onComplete, onError])

  // Start async chat request
  const sendMessage = useCallback(async (
    messages: Array<{ role: string; content: string }>,
    chatId: string,
    userId: string,
    model: string = 'n8n-async',
    systemPrompt?: string
  ) => {
    setIsLoading(true)
    setError(null)
    setCurrentJob(null)

    // Abort any existing polling
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    abortControllerRef.current = new AbortController()

    try {
      // Send async chat request
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages,
          chatId,
          userId,
          model,
          systemPrompt,
          async: true // Enable async mode
        }),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`Failed to start chat: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      
      if (!data.success || !data.jobId) {
        throw new Error(data.error || 'Failed to create chat job')
      }

      console.log(`🚀 Started async chat job: ${data.jobId}`)
      
      // Start polling for status
      pollingStartTimeRef.current = Date.now()
      startPolling(data.jobId)

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return // Request was aborted
      }
      
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      setError(errorMessage)
      setIsLoading(false)
      onError?.(errorMessage)
    }
  }, [startPolling, onError])

  // Cancel current request
  const cancel = useCallback(() => {
    if (pollingTimeoutRef.current) {
      clearTimeout(pollingTimeoutRef.current)
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setIsLoading(false)
    setCurrentJob(null)
    setError(null)
  }, [])

  return {
    sendMessage,
    cancel,
    currentJob,
    isLoading,
    error,
    // Helper computed values
    isProcessing: isLoading && currentJob?.status === 'processing',
    isPending: isLoading && currentJob?.status === 'pending',
    processingTime: currentJob?.processingTime || (currentJob ? Date.now() - currentJob.createdAt : 0)
  }
} 
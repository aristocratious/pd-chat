import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  // No Supabase session handling needed - using N8N backend
  return NextResponse.next({
    request,
  })
}

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname
  const { pathname } = request.nextUrl

  // Set CORS headers for API routes
  if (pathname.startsWith("/api/")) {
    const response = NextResponse.next()

    // Add CORS headers
    response.headers.set("Access-Control-Allow-Credentials", "true")
    response.headers.set("Access-Control-Allow-Origin", process.env.NEXT_PUBLIC_APP_URL || "*")
    response.headers.set("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT")
    response.headers.set(
      "Access-Control-Allow-Headers",
      "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
    )

    // Check if the request is for the API routes that require authentication
    if (pathname.startsWith("/api/deploy") || pathname.startsWith("/api/ai-feedback")) {
      const token = request.cookies.get("hf_token")

      // If no token is found, return 401 Unauthorized
      if (!token) {
        return NextResponse.json({ error: "Authentication required" }, { status: 401 })
      }
    }

    return response
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/api/:path*", "/((?!_next/static|_next/image|favicon.ico|public/|assets/).*)"],
}


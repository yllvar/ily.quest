import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

// Add cache control for this endpoint
export const revalidate = 60 // Revalidate every 60 seconds

export async function GET(request: NextRequest) {
  const hf_token = cookies().get("hf_token")?.value

  if (!hf_token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const request_user = await fetch("https://huggingface.co/oauth/userinfo", {
      headers: {
        Authorization: `Bearer ${hf_token}`,
      },
      // Add cache: 'force-cache' to use Next.js cache
      cache: "force-cache",
      next: { revalidate: 300 }, // Cache for 5 minutes
    })

    if (!request_user.ok) {
      cookies().delete("hf_token")
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const user = await request_user.json()

    // Add cache headers to response
    return NextResponse.json(user, {
      headers: {
        "Cache-Control": "private, max-age=60, stale-while-revalidate=300",
      },
    })
  } catch (err) {
    cookies().delete("hf_token")
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 })
  }
}


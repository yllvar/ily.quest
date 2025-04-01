import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { feedback, solution, prompt } = await request.json()

    if (!feedback || !solution || !prompt) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Get user info if available
    const hf_token = cookies().get("hf_token")?.value
    let username = "anonymous"

    if (hf_token) {
      try {
        const userResponse = await fetch("https://huggingface.co/oauth/userinfo", {
          headers: { Authorization: `Bearer ${hf_token}` },
        })

        if (userResponse.ok) {
          const userData = await userResponse.json()
          username = userData.preferred_username || userData.name || "anonymous"
        }
      } catch (error) {
        console.error("Failed to get user info:", error)
      }
    }

    // Here you would typically store this feedback in a database
    // For now, we'll just log it
    console.log({
      timestamp: new Date().toISOString(),
      username,
      prompt,
      solution,
      feedback,
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("AI Feedback error:", error)
    return NextResponse.json({ error: error.message || "Failed to save feedback" }, { status: 500 })
  }
}


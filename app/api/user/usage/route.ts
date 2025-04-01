import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabase } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    // Get user from session
    const hf_token = cookies().get("hf_token")?.value
    if (!hf_token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Get user info from Hugging Face
    const userResponse = await fetch("https://huggingface.co/oauth/userinfo", {
      headers: { Authorization: `Bearer ${hf_token}` },
    })

    if (!userResponse.ok) {
      return NextResponse.json({ error: "Failed to get user info" }, { status: 401 })
    }

    const userData = await userResponse.json()
    const userId = userData.sub || userData.preferred_username

    // Get user's subscription from database
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    // Default values for free tier
    let used = 0
    let limit = 1
    let tier = "free"
    let resetAt = null

    if (subscription) {
      tier = subscription.tier

      // Set limits based on tier
      if (tier === "eroge") {
        limit = 4
      } else if (tier === "shibari") {
        limit = 40
      } else if (tier === "futanari") {
        limit = 999999 // Unlimited
      }

      // Get reset time
      resetAt = subscription.current_period_end

      // Get usage count from database
      const { data: usageData, error } = await supabase
        .from("usage_logs")
        .select("count")
        .eq("user_id", userId)
        .gte("created_at", subscription.current_period_start)
        .single()

      if (!error && usageData) {
        used = usageData.count
      }
    } else {
      // For free users, check if they've used their one request
      const { data: usageData } = await supabase.from("usage_logs").select("count").eq("user_id", userId).single()

      if (usageData) {
        used = usageData.count
      }
    }

    return NextResponse.json({
      used,
      limit,
      tier,
      resetAt,
    })
  } catch (error: any) {
    console.error("Usage fetch error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch usage" }, { status: 500 })
  }
}


import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import stripe from "@/lib/stripe"
import { supabaseAdmin } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { returnUrl } = await request.json()

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

    // Get user's Stripe customer ID from your database
    const { data: user } = await supabaseAdmin.from("users").select("stripe_customer_id").eq("id", userId).single()

    if (!user?.stripe_customer_id) {
      return NextResponse.json({ error: "No subscription found" }, { status: 404 })
    }

    // Create customer portal session
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripe_customer_id,
      return_url: returnUrl || `${process.env.NEXT_PUBLIC_APP_URL}/account`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error: any) {
    console.error("Stripe portal error:", error)
    return NextResponse.json({ error: error.message || "Failed to create customer portal" }, { status: 500 })
  }
}


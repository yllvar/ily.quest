import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { supabase } from "@/lib/supabase"
import stripe from "@/lib/stripe"

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

    // Get user's subscription from your database
    const { data: user } = await supabase
      .from("users")
      .select("stripe_customer_id, subscription_status, subscription_tier")
      .eq("id", userId)
      .single()

    if (!user) {
      return NextResponse.json({ subscription: null })
    }

    // If user has a Stripe customer ID, fetch the subscription details from Stripe
    let stripeSubscription = null
    if (user.stripe_customer_id) {
      const subscriptions = await stripe.subscriptions.list({
        customer: user.stripe_customer_id,
        status: "all",
        expand: ["data.default_payment_method"],
        limit: 1,
      })

      if (subscriptions.data.length > 0) {
        stripeSubscription = subscriptions.data[0]
      }
    }

    return NextResponse.json({
      subscription: {
        status: user.subscription_status || "inactive",
        tier: user.subscription_tier || "free",
        ...(stripeSubscription
          ? {
              id: stripeSubscription.id,
              current_period_start: stripeSubscription.current_period_start,
              current_period_end: stripeSubscription.current_period_end,
              cancel_at_period_end: stripeSubscription.cancel_at_period_end,
            }
          : {}),
      },
    })
  } catch (error: any) {
    console.error("Subscription fetch error:", error)
    return NextResponse.json({ error: error.message || "Failed to fetch subscription" }, { status: 500 })
  }
}


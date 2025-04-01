import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import stripe from "@/lib/stripe"

export async function POST(request: NextRequest) {
  try {
    const { successUrl, cancelUrl, priceId, tier } = await request.json()

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
    const userEmail = userData.email

    // Determine which price ID to use
    const selectedPriceId = priceId || process.env.STRIPE_PREMIUM_PRICE_ID

    if (!selectedPriceId) {
      return NextResponse.json({ error: "Price ID not configured" }, { status: 500 })
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      billing_address_collection: "auto",
      customer_email: userEmail,
      line_items: [
        {
          price: selectedPriceId,
          quantity: 1,
        },
      ],
      mode: "payment", // Changed from subscription to one-time payment
      success_url: successUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: cancelUrl || `${process.env.NEXT_PUBLIC_APP_URL}/payment/canceled`,
      metadata: {
        userId,
        tier: tier || "premium",
      },
    })

    return NextResponse.json({ sessionId: session.id, url: session.url })
  } catch (error: any) {
    console.error("Stripe checkout error:", error)
    return NextResponse.json({ error: error.message || "Failed to create checkout session" }, { status: 500 })
  }
}


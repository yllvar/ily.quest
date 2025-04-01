import { type NextRequest, NextResponse } from "next/server"
import { headers } from "next/headers"
import stripe from "@/lib/stripe"
import { supabaseAdmin } from "@/lib/supabase"

// This is needed for Stripe webhook signature verification
async function buffer(readable: ReadableStream) {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk)
  }
  return Buffer.concat(chunks)
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = headers().get("stripe-signature")

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Missing signature or webhook secret" }, { status: 400 })
  }

  try {
    // Verify webhook signature
    const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET)

    // Handle the event
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object
        await handleCheckoutSessionCompleted(session)
        break
      }
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object
        await handlePaymentSucceeded(paymentIntent)
        break
      }
      // Add more event handlers as needed
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Stripe webhook error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

async function handleCheckoutSessionCompleted(session: any) {
  // Extract customer info
  const userId = session.metadata.userId
  const tier = session.metadata.tier || "premium"

  if (!userId) {
    console.error("No user ID in session metadata")
    return
  }

  try {
    // Get user from database
    const { data: user } = await supabaseAdmin.from("users").select("id").eq("id", userId).single()

    if (!user) {
      console.error(`User ${userId} not found`)
      return
    }

    // Check if subscription exists
    const { data: existingSubscription } = await supabaseAdmin
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("payment_provider", "stripe")
      .single()

    // Calculate period end (4 hours from now)
    const now = new Date()
    const periodEnd = new Date(now.getTime() + 4 * 60 * 60 * 1000) // 4 hours

    // Set usage limits based on tier
    let usageLimit = 1 // Default for non-subscribers

    if (tier === "Eroge") {
      usageLimit = 4
    } else if (tier === "Shibari") {
      usageLimit = 40
    } else if (tier === "Futanari") {
      usageLimit = 999999 // Unlimited
    }

    if (existingSubscription) {
      // Update existing subscription
      await supabaseAdmin
        .from("subscriptions")
        .update({
          status: "active",
          tier: tier.toLowerCase(),
          provider_customer_id: session.customer,
          provider_subscription_id: session.subscription || session.id,
          current_period_start: now.toISOString(),
          current_period_end: periodEnd.toISOString(),
          updated_at: now.toISOString(),
        })
        .eq("id", existingSubscription.id)
    } else {
      // Create new subscription
      await supabaseAdmin.from("subscriptions").insert({
        user_id: userId,
        status: "active",
        tier: tier.toLowerCase(),
        payment_provider: "stripe",
        provider_customer_id: session.customer,
        provider_subscription_id: session.subscription || session.id,
        current_period_start: now.toISOString(),
        current_period_end: periodEnd.toISOString(),
      })
    }

    // Record payment in history
    await supabaseAdmin.from("payment_history").insert({
      user_id: userId,
      subscription_id: existingSubscription?.id,
      payment_provider: "stripe",
      provider_payment_id: session.payment_intent,
      amount: session.amount_total / 100, // Convert from cents
      currency: session.currency,
      status: "completed",
      payment_method: "card",
    })
  } catch (error) {
    console.error("Error updating subscription:", error)
  }
}

async function handlePaymentSucceeded(paymentIntent: any) {
  // Additional payment handling if needed
  console.log("Payment succeeded:", paymentIntent.id)
}

// This is needed for Next.js to handle the raw body
export const config = {
  api: {
    bodyParser: false,
  },
}


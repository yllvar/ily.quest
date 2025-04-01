import Stripe from "stripe"

// Ensure we have the required environment variables
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error("Missing required STRIPE_SECRET_KEY environment variable")
}

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16", // Use the latest API version
  appInfo: {
    name: "DeepSite",
    version: "1.0.0",
  },
})

export default stripe


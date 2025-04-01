export const config = {
  // App
  appName: "iLy.quest",
  appUrl: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // Authentication
  oauth: {
    clientId: process.env.OAUTH_CLIENT_ID,
    clientSecret: process.env.OAUTH_CLIENT_SECRET,
    redirectUri: process.env.REDIRECT_URI || "http://localhost:3000/api/auth/callback",
  },

  // API Keys
  deepseek: {
    apiKey: process.env.DEEPSEEK_API_KEY,
    defaultToken: process.env.DEFAULT_HF_TOKEN,
  },

  // Supabase
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
  },

  // Stripe
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    premiumPriceId: process.env.STRIPE_PREMIUM_PRICE_ID,
  },

  // Deployment
  isProduction: process.env.NODE_ENV === "production",
}


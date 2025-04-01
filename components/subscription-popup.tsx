"use client"

import { useState, useEffect } from "react"
import { X, Check, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { toast } from "react-toastify"

interface SubscriptionPopupProps {
  isOpen: boolean
  onClose: () => void
  userId?: string
}

export default function SubscriptionPopup({ isOpen, onClose, userId }: SubscriptionPopupProps) {
  const [isLoading, setIsLoading] = useState<Record<string, boolean>>({
    eroge: false,
    shibari: false,
    futanari: false,
  })
  const router = useRouter()

  // Close popup when pressing Escape key
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose()
      }
    }

    window.addEventListener("keydown", handleEscKey)
    return () => window.removeEventListener("keydown", handleEscKey)
  }, [isOpen, onClose])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "auto"
    }
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [isOpen])

  const handleSubscribe = async (tier: string, priceId: string) => {
    if (!userId) {
      toast.error("Please log in to subscribe")
      return
    }

    setIsLoading({ ...isLoading, [tier.toLowerCase()]: true })

    try {
      const response = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          successUrl: window.location.href,
          tier,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create checkout session")
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (error: any) {
      console.error("Subscription error:", error)
      toast.error(error.message || "Failed to process subscription")
    } finally {
      setIsLoading({ ...isLoading, [tier.toLowerCase()]: false })
    }
  }

  const plans = [
    {
      name: "Eroge",
      price: "$1",
      description: "Basic access for casual users",
      features: ["4 uses every 4 hours", "Basic features", "Standard support"],
      priceId: process.env.NEXT_PUBLIC_STRIPE_EROGE_PRICE_ID || "",
      color: "bg-blue-50 border-blue-200",
      buttonVariant: "outline" as const,
    },
    {
      name: "Shibari",
      price: "$9",
      description: "Perfect for regular users",
      features: ["40 uses every 4 hours", "All basic features", "Priority support"],
      priceId: process.env.NEXT_PUBLIC_STRIPE_SHIBARI_PRICE_ID || "",
      color: "bg-pink-50 border-pink-200",
      buttonVariant: "default" as const,
      recommended: true,
    },
    {
      name: "Futanari",
      price: "$142",
      description: "For power users and professionals",
      features: ["Unlimited usage", "All premium features", "24/7 VIP support"],
      priceId: process.env.NEXT_PUBLIC_STRIPE_FUTANARI_PRICE_ID || "",
      color: "bg-purple-50 border-purple-200",
      buttonVariant: "outline" as const,
    },
  ]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/50"
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-4xl bg-white rounded-xl shadow-2xl overflow-hidden"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors z-10"
              aria-label="Close popup"
            >
              <X className="h-5 w-5 text-gray-600" />
            </button>

            {/* Header */}
            <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-6 text-white text-center">
              <h2 className="text-2xl font-bold mb-2">Upgrade Your Experience</h2>
              <p className="opacity-90">Choose the plan that works best for you</p>
            </div>

            {/* Plans */}
            <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`relative border-2 transition-all duration-300 ${
                    plan.recommended ? "border-pink-500 shadow-lg md:scale-105 z-10" : "hover:border-gray-300"
                  } ${plan.color}`}
                >
                  {plan.recommended && (
                    <div className="absolute -top-3 left-0 right-0 mx-auto w-max">
                      <Badge className="bg-pink-500 hover:bg-pink-600 px-3 py-1 flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        MOST POPULAR
                      </Badge>
                    </div>
                  )}

                  <CardHeader>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                    <div className="mt-2">
                      <span className="text-3xl font-bold">{plan.price}</span>
                      <span className="text-gray-500 ml-1 text-sm">one-time</span>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <ul className="space-y-2">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>

                  <CardFooter>
                    <Button
                      variant={plan.buttonVariant}
                      className={`w-full ${plan.recommended ? "bg-pink-500 hover:bg-pink-600" : ""}`}
                      onClick={() => handleSubscribe(plan.name, plan.priceId)}
                      disabled={isLoading[plan.name.toLowerCase()]}
                    >
                      {isLoading[plan.name.toLowerCase()] ? "Processing..." : `Get ${plan.name}`}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>

            {/* Footer */}
            <div className="p-4 text-center text-sm text-gray-500 border-t">
              <p>All plans are one-time payments. Need help? Contact our support team.</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}


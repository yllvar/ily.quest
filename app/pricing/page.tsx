"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import SubscriptionButton from "@/components/subscription-button"
import { useAuth } from "@/hooks/use-auth" // Assume you have an auth hook

export default function PricingPage() {
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month")
  const { user, subscription } = useAuth()

  const plans = [
    {
      name: "Free",
      description: "Basic features for hobbyists",
      price: {
        month: "$0",
        year: "$0",
      },
      features: ["Basic HTML editing", "Limited AI assistance", "Public deployments", "5 projects"],
      buttonText: "Current Plan",
      disabled: true,
    },
    {
      name: "Premium",
      description: "Everything you need for professional development",
      price: {
        month: "$9.99",
        year: "$99.99",
      },
      features: [
        "Advanced HTML, CSS, JS editing",
        "Unlimited AI assistance",
        "Private deployments",
        "Unlimited projects",
        "Custom domains",
        "Priority support",
      ],
      buttonText: subscription?.tier === "premium" ? "Current Plan" : "Upgrade Now",
      disabled: subscription?.tier === "premium",
    },
  ]

  return (
    <div className="py-10 container">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Choose the plan that's right for you and start building amazing websites with AI assistance.
        </p>

        <div className="flex justify-center mt-6">
          <div className="bg-gray-100 p-1 rounded-full">
            <button
              onClick={() => setBillingInterval("month")}
              className={`px-4 py-2 rounded-full ${billingInterval === "month" ? "bg-white shadow-sm" : ""}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingInterval("year")}
              className={`px-4 py-2 rounded-full ${billingInterval === "year" ? "bg-white shadow-sm" : ""}`}
            >
              Yearly <span className="text-green-500 text-xs">Save 16%</span>
            </button>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
        {plans.map((plan) => (
          <Card key={plan.name} className={plan.name === "Premium" ? "border-pink-500 shadow-lg" : ""}>
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
              <div className="mt-4">
                <span className="text-4xl font-bold">{plan.price[billingInterval]}</span>
                {plan.name !== "Free" && <span className="text-gray-500 ml-2">/{billingInterval}</span>}
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-2" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              {plan.name === "Premium" ? (
                <SubscriptionButton
                  userId={user?.id}
                  isSubscribed={subscription?.tier === "premium"}
                  className="w-full"
                />
              ) : (
                <Button disabled={plan.disabled} variant="outline" className="w-full">
                  {plan.buttonText}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  )
}


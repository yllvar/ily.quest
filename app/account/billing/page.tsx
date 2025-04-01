"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "react-toastify"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"

export default function BillingPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [subscription, setSubscription] = useState<any>(null)
  const [isLoadingPortal, setIsLoadingPortal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchSubscription = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/user/subscription")
        if (!response.ok) {
          throw new Error("Failed to fetch subscription")
        }
        const data = await response.json()
        setSubscription(data.subscription)
      } catch (error) {
        console.error("Error fetching subscription:", error)
        toast.error("Failed to load subscription details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSubscription()
  }, [])

  const openCustomerPortal = async () => {
    setIsLoadingPortal(true)
    try {
      const response = await fetch("/api/stripe/create-portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          returnUrl: window.location.href,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create portal session")
      }

      // Redirect to Stripe Customer Portal
      if (data.url) {
        window.location.href = data.url
      }
    } catch (error: any) {
      console.error("Portal error:", error)
      toast.error(error.message || "Failed to open billing portal")
    } finally {
      setIsLoadingPortal(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="text-3xl font-bold mb-6">Billing & Subscription</h1>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Subscription</CardTitle>
          <CardDescription>Manage your subscription and billing details</CardDescription>
        </CardHeader>
        <CardContent>
          {subscription ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Plan</p>
                  <p className="font-medium">{subscription.tier === "premium" ? "Premium" : "Free"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="font-medium capitalize">{subscription.status}</p>
                </div>
                {subscription.current_period_end && (
                  <div>
                    <p className="text-sm text-gray-500">Next billing date</p>
                    <p className="font-medium">
                      {new Date(subscription.current_period_end * 1000).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <p>You are currently on the free plan.</p>
          )}
        </CardContent>
        <CardFooter>
          {subscription?.status === "active" ? (
            <Button onClick={openCustomerPortal} disabled={isLoadingPortal}>
              {isLoadingPortal ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading...
                </>
              ) : (
                "Manage Subscription"
              )}
            </Button>
          ) : (
            <Button onClick={() => router.push("/pricing")}>Upgrade to Premium</Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}


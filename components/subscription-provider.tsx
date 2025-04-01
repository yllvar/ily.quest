"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { SubscriptionPopupProvider, useSubscriptionPopup } from "@/hooks/use-subscription-popup"
import SubscriptionPopup from "@/components/subscription-popup"

export default function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | undefined>(undefined)

  useEffect(() => {
    // Fetch user info
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/auth/me")
        if (res.ok) {
          const data = await res.json()
          setUserId(data.sub || data.preferred_username)
        }
      } catch (error) {
        console.error("Failed to fetch user:", error)
      }
    }

    fetchUser()
  }, [])

  return (
    <SubscriptionPopupProvider>
      {children}
      <SubscriptionPopupConsumer userId={userId} />
    </SubscriptionPopupProvider>
  )
}

function SubscriptionPopupConsumer({ userId }: { userId?: string }) {
  const { isOpen, closePopup } = useSubscriptionPopup()

  return <SubscriptionPopup isOpen={isOpen} onClose={closePopup} userId={userId} />
}


"use client"

import { useState, useEffect } from "react"
import { useSubscriptionPopup } from "@/hooks/use-subscription-popup"
import { Sparkles } from "lucide-react"

export default function UsageTracker() {
  const [usage, setUsage] = useState({
    used: 0,
    limit: 1,
    tier: "free",
    timeRemaining: "",
  })
  const { openPopup } = useSubscriptionPopup()

  useEffect(() => {
    const fetchUsage = async () => {
      try {
        const res = await fetch("/api/user/usage")
        if (res.ok) {
          const data = await res.json()
          setUsage({
            used: data.used || 0,
            limit: data.limit || 1,
            tier: data.tier || "free",
            timeRemaining: formatTimeRemaining(data.resetAt),
          })
        }
      } catch (error) {
        console.error("Failed to fetch usage:", error)
      }
    }

    fetchUsage()
    const interval = setInterval(fetchUsage, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [])

  function formatTimeRemaining(resetAt: string | null) {
    if (!resetAt) return "N/A"

    const reset = new Date(resetAt)
    const now = new Date()
    const diff = reset.getTime() - now.getTime()

    if (diff <= 0) return "Resetting soon"

    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    return `${hours}h ${minutes}m`
  }

  const percentage = Math.min(100, Math.round((usage.used / usage.limit) * 100))

  return (
    <div className="flex items-center gap-3">
      <div className="hidden sm:block">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="text-gray-300">
            {usage.used}/{usage.limit} uses
          </span>
          <span className="text-gray-400 text-[10px]">Resets in {usage.timeRemaining}</span>
        </div>
        <div className="w-32 h-1.5 bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${percentage > 90 ? "bg-red-500" : percentage > 70 ? "bg-yellow-500" : "bg-green-500"}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      <button
        onClick={openPopup}
        className="flex items-center gap-1 text-xs bg-gradient-to-r from-pink-500 to-purple-600 text-white px-2 py-1 rounded-full hover:brightness-110 transition-all"
      >
        <Sparkles className="h-3 w-3" />
        <span className="hidden sm:inline">Upgrade</span>
      </button>
    </div>
  )
}


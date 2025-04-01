"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { useSubscriptionPopup } from "@/hooks/use-subscription-popup"
import { Sparkles } from "lucide-react"

interface UpgradeButtonProps {
  variant?: "default" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
  children?: React.ReactNode
}

export default function UpgradeButton({
  variant = "default",
  size = "default",
  className = "",
  children,
}: UpgradeButtonProps) {
  const { openPopup } = useSubscriptionPopup()

  return (
    <Button onClick={openPopup} variant={variant} size={size} className={className}>
      {children || (
        <>
          <Sparkles className="mr-2 h-4 w-4" />
          Upgrade Now
        </>
      )}
    </Button>
  )
}


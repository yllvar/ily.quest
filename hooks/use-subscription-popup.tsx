"use client"

import type React from "react"

import { useState, useCallback, createContext, useContext } from "react"

interface SubscriptionPopupContextType {
  isOpen: boolean
  openPopup: () => void
  closePopup: () => void
}

const SubscriptionPopupContext = createContext<SubscriptionPopupContextType | undefined>(undefined)

export function SubscriptionPopupProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openPopup = useCallback(() => setIsOpen(true), [])
  const closePopup = useCallback(() => setIsOpen(false), [])

  return (
    <SubscriptionPopupContext.Provider value={{ isOpen, openPopup, closePopup }}>
      {children}
    </SubscriptionPopupContext.Provider>
  )
}

export function useSubscriptionPopup() {
  const context = useContext(SubscriptionPopupContext)
  if (context === undefined) {
    throw new Error("useSubscriptionPopup must be used within a SubscriptionPopupProvider")
  }
  return context
}


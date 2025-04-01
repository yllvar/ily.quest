"use client"

import { useState, useEffect } from "react"

export const useAuth = () => {
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAuthData = async () => {
      setIsLoading(true)
      try {
        const hf_token = document.cookie.replace(/(?:(?:^|.*;\s*)hf_token\s*=\s*([^;]*).*$)|^.*$/, "$1")

        if (hf_token) {
          const userResponse = await fetch("https://huggingface.co/oauth/userinfo", {
            headers: { Authorization: `Bearer ${hf_token}` },
          })

          if (userResponse.ok) {
            const userData = await userResponse.json()
            setUser({
              id: userData.sub || userData.preferred_username,
              email: userData.email,
              name: userData.name,
              picture: userData.picture,
              preferred_username: userData.preferred_username,
              sub: userData.sub,
            })
          } else {
            setUser(null)
          }

          const subscriptionResponse = await fetch("/api/user/subscription")
          if (subscriptionResponse.ok) {
            const subscriptionData = await subscriptionResponse.json()
            setSubscription(subscriptionData.subscription)
          } else {
            setSubscription(null)
          }
        } else {
          setUser(null)
          setSubscription(null)
        }
      } catch (error) {
        console.error("Failed to fetch auth data:", error)
        setUser(null)
        setSubscription(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAuthData()
  }, [])

  return { user, subscription, isLoading }
}


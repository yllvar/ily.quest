"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

interface ErrorBoundaryProps {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="max-w-md">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h2>
        <p className="text-gray-700 mb-6">{error.message || "An unexpected error occurred. Please try again later."}</p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} variant="outline">
            Try again
          </Button>
          <Button onClick={() => (window.location.href = "/")}>Go to homepage</Button>
        </div>
      </div>
    </div>
  )
}


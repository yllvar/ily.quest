"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense } from "react"
import dynamic from "next/dynamic"

// Loading component for better user experience
const LoadingIndicator = () => (
  <div className="h-screen bg-gray-950 font-sans flex items-center justify-center">
    <div className="flex flex-col items-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500 mb-4"></div>
      <p className="text-white text-xl">Loading editor...</p>
    </div>
  </div>
)

// Dynamically import the App component with improved loading
const AppComponent = dynamic(() => import("@/components/app"), {
  ssr: false,
  loading: () => <LoadingIndicator />,
})

export default function Home() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const remix = searchParams.get("remix")

  useEffect(() => {
    // Handle remix parameter if present
    if (remix) {
      // We'll handle the remix in the App component
      // Just keep the URL clean here
      const url = new URL(window.location.href)
      url.searchParams.delete("remix")
      window.history.replaceState({}, document.title, url.toString())
    }

    // Preload the Monaco editor when the page is idle
    if ("requestIdleCallback" in window) {
      window.requestIdleCallback(() => {
        import("monaco-editor")
      })
    }
  }, [remix, router])

  return (
    <Suspense fallback={<LoadingIndicator />}>
      <AppComponent remixId={remix} />
    </Suspense>
  )
}


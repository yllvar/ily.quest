import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="max-w-md">
        <h2 className="text-4xl font-bold text-gray-900 mb-2">404</h2>
        <h3 className="text-2xl font-semibold text-gray-700 mb-4">Page Not Found</h3>
        <p className="text-gray-600 mb-6">The page you are looking for doesn't exist or has been moved.</p>
        <Button asChild>
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  )
}


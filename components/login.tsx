"use client"

import type { ReactNode } from "react"
import { SiHuggingface } from "react-icons/si"
import { useLocalStorage } from "react-use"
import Image from "next/image"

interface LoginProps {
  html: string
  children?: ReactNode
}

export default function Login({ html, children }: LoginProps) {
  const [, setHtmlStorage] = useLocalStorage("html_content")

  const handleLogin = () => {
    // Save current HTML to local storage before redirecting
    if (html) {
      setHtmlStorage(html)
    }
    window.location.href = "/api/auth/login"
  }

  return (
    <div className="p-4">
      <div className="flex items-center justify-center mb-2">
        <Image src="/mascot.png" alt="iLy" width={64} height={64} className="object-cover rounded-full" />
        <h3 className="text-lg font-semibold text-gray-800 ml-2">Login Required</h3>
      </div>
      {children}
      <button
        onClick={handleLogin}
        className="w-full bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-md flex items-center justify-center gap-2"
      >
        <SiHuggingface className="text-lg" />
        Login with Hugging Face
      </button>
    </div>
  )
}


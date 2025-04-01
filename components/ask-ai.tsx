"use client"

import type React from "react"

import { useState } from "react"
import { GrSend } from "react-icons/gr"
import classNames from "classnames"
import { toast } from "react-toastify"
import { useLocalStorage } from "react-use"
import { MdPreview } from "react-icons/md"
import Image from "next/image"

import Login from "./login"
import { defaultHTML } from "@/lib/constants"
import Settings from "./settings"

interface AskAIProps {
  html: string
  setHtml: (html: string) => void
  onScrollToBottom: () => void
  isAiWorking: boolean
  setIsAiWorking: React.Dispatch<React.SetStateAction<boolean>>
  setView: React.Dispatch<React.SetStateAction<"editor" | "preview">>
}

export default function AskAI({ html, setHtml, onScrollToBottom, isAiWorking, setIsAiWorking, setView }: AskAIProps) {
  const [open, setOpen] = useState(false)
  const [prompt, setPrompt] = useState("")
  const [hasAsked, setHasAsked] = useState(false)
  const [previousPrompt, setPreviousPrompt] = useState("")
  const [provider, setProvider] = useLocalStorage("provider", "auto")
  const [openProvider, setOpenProvider] = useState(false)
  const [providerError, setProviderError] = useState("")

  // Create audio element for success sound
  const playSuccessSound = () => {
    const audio = new Audio("/success.mp3")
    audio.volume = 0.5
    audio.play().catch((err) => console.error("Failed to play sound:", err))
  }

  const callAi = async () => {
    if (isAiWorking || !prompt.trim()) return
    setIsAiWorking(true)
    setProviderError("")

    let contentResponse = ""
    let lastRenderTime = 0
    try {
      const request = await fetch("/api/ask-ai", {
        method: "POST",
        body: JSON.stringify({
          prompt,
          provider,
          ...(html === defaultHTML ? {} : { html }),
          ...(previousPrompt ? { previousPrompt } : {}),
        }),
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (request && request.body) {
        if (!request.ok) {
          const res = await request.json()
          if (res.openLogin) {
            setOpen(true)
          } else if (res.openSelectProvider) {
            setOpenProvider(true)
            setProviderError(res.message)
          } else {
            toast.error(res.message)
          }
          setIsAiWorking(false)
          return
        }

        const reader = request.body.getReader()
        const decoder = new TextDecoder("utf-8")

        const read = async () => {
          const { done, value } = await reader.read()
          if (done) {
            toast.success("iLy responded successfully")
            setPrompt("")
            setPreviousPrompt(prompt)
            setIsAiWorking(false)
            setHasAsked(true)
            playSuccessSound()
            setView("preview")

            // Now we have the complete HTML including </html>, so set it to be sure
            const finalDoc = contentResponse.match(/<!DOCTYPE html>[\s\S]*<\/html>/)?.[0]
            if (finalDoc) {
              setHtml(finalDoc)
            }

            return
          }

          const chunk = decoder.decode(value, { stream: true })
          contentResponse += chunk
          const newHtml = contentResponse.match(/<!DOCTYPE html>[\s\S]*/)?.[0]
          if (newHtml) {
            // Force-close the HTML tag so the iframe doesn't render half-finished markup
            let partialDoc = newHtml
            if (!partialDoc.includes("</html>")) {
              partialDoc += "\n</html>"
            }

            // Throttle the re-renders to avoid flashing/flicker
            const now = Date.now()
            if (now - lastRenderTime > 300) {
              setHtml(partialDoc)
              lastRenderTime = now
            }

            if (partialDoc.length > 200) {
              onScrollToBottom()
            }
          }
          read()
        }

        read()
      }
    } catch (error: any) {
      setIsAiWorking(false)
      toast.error(error.message || "An error occurred while processing your request")
      if (error.openLogin) {
        setOpen(true)
      }
    }
  }

  return (
    <div
      className={`bg-gray-950 rounded-xl py-2 lg:py-2.5 pl-3.5 lg:pl-4 pr-2 lg:pr-2.5 absolute lg:sticky bottom-3 left-3 lg:bottom-4 lg:left-4 w-[calc(100%-1.5rem)] lg:w-[calc(100%-2rem)] z-10 group ${
        isAiWorking ? "animate-pulse" : ""
      } max-lg:max-w-[calc(100%-24px)] max-lg:mx-auto max-lg:left-0 max-lg:right-0`}
    >
      {defaultHTML !== html && (
        <button
          className="bg-white lg:hidden -translate-y-[calc(100%+8px)] absolute left-0 top-0 shadow-md text-gray-950 text-xs font-medium py-2 px-3 lg:px-4 rounded-lg flex items-center gap-2 border border-gray-100 hover:brightness-150 transition-all duration-100 cursor-pointer"
          onClick={() => setView("preview")}
        >
          <MdPreview />
          Back to Preview
        </button>
      )}
      <div className="w-full relative flex items-center justify-between">
        <div className="flex items-center">
          <div className="relative w-6 h-6 overflow-hidden rounded-full mr-2">
            <Image src="/mascot.png" alt="iLy" width={24} height={24} className="object-cover" />
          </div>
          <span className="text-pink-400 text-sm font-medium">iLy</span>
        </div>
        <input
          type="text"
          disabled={isAiWorking}
          className="w-full bg-transparent max-lg:text-sm outline-none px-3 text-white placeholder:text-gray-500 font-code"
          placeholder={hasAsked ? "What do you want to ask iLy next?" : "Ask iLy anything..."}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              callAi()
            }
          }}
        />
        <div className="flex items-center justify-end gap-2">
          <Settings
            provider={provider as string}
            onChange={setProvider}
            open={openProvider}
            error={providerError}
            onClose={setOpenProvider}
          />
          <button
            disabled={isAiWorking}
            className="relative overflow-hidden cursor-pointer flex-none flex items-center justify-center rounded-full text-sm font-semibold size-8 text-center bg-pink-500 hover:bg-pink-400 text-white shadow-sm dark:shadow-highlight/20 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed disabled:hover:bg-gray-300"
            onClick={callAi}
          >
            <GrSend className="-translate-x-[1px]" />
          </button>
        </div>
      </div>
      <div
        className={classNames("h-screen w-screen bg-black/20 fixed left-0 top-0 z-10", {
          "opacity-0 pointer-events-none": !open,
        })}
        onClick={() => setOpen(false)}
      ></div>
      <div
        className={classNames(
          "absolute top-0 -translate-y-[calc(100%+8px)] right-0 z-10 w-80 bg-white border border-gray-200 rounded-lg shadow-lg transition-all duration-75 overflow-hidden",
          {
            "opacity-0 pointer-events-none": !open,
          },
        )}
      >
        <Login html={html}>
          <p className="text-gray-500 text-sm mb-3">
            You reached the limit of free AI usage. Please login to continue.
          </p>
        </Login>
      </div>
    </div>
  )
}


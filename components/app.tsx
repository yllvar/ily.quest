"use client"

import { useRef, useState, useEffect } from "react"
import classNames from "classnames"
import { useLocalStorage } from "react-use"
import { toast } from "react-toastify"
import dynamic from "next/dynamic"
import { RiSparkling2Fill } from "react-icons/ri"

import Header from "./header"
import DeployButton from "./deploy-button"
import { defaultHTML } from "@/lib/constants"
import Tabs from "./tabs"
import AskAI from "./ask-ai"
import type { Auth } from "@/lib/types"
import Preview from "./preview"
import ViewToggle from "./view-toggle"
import { registerServiceWorker } from "@/app/sw"

// Import the skeleton components
import { EditorSkeleton } from "@/components/skeleton-loader"

interface AppProps {
  remixId?: string | null
}

const AIAssistantComponent = dynamic(
  () => import("@/components/ai-assistant").then((mod) => ({ default: mod.default })),
  {
    ssr: false,
    loading: () => <div className="p-4 text-center">Loading AI Assistant...</div>,
  },
)

const MonacoEditor = dynamic(() => import("@monaco-editor/react").then((mod) => ({ default: mod.default })), {
  ssr: false,
  loading: () => <EditorSkeleton />,
})

export default function App({ remixId }: AppProps) {
  const [htmlStorage, setHtmlStorage, removeHtmlStorage] = useLocalStorage("html_content")

  const preview = useRef<HTMLDivElement>(null)
  const editor = useRef<HTMLDivElement>(null)
  const resizer = useRef<HTMLDivElement>(null)
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null)

  const [isResizing, setIsResizing] = useState(false)
  const [error, setError] = useState(false)
  const [html, setHtml] = useState((htmlStorage as string) ?? defaultHTML)
  const [isAiWorking, setIsAiWorking] = useState(false)
  const [auth, setAuth] = useState<Auth | undefined>(undefined)
  const [currentView, setCurrentView] = useState<"editor" | "preview">(window.innerWidth < 1024 ? "preview" : "editor")
  const [showAIAssistant, setShowAIAssistant] = useState(false)

  const fetchMe = async () => {
    try {
      const res = await fetch("/api/auth/me")
      if (res.ok) {
        const data = await res.json()
        setAuth(data)
      } else {
        setAuth(undefined)
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error)
      setAuth(undefined)
    }
  }

  const fetchRemix = async (id: string) => {
    try {
      const res = await fetch(`/api/remix/${id}`)
      if (res.ok) {
        const data = await res.json()
        if (data.html) {
          setHtml(data.html)
          toast.success("Remix content loaded successfully.")
        }
      } else {
        toast.error("Failed to load remix content.")
      }
    } catch (error) {
      console.error("Failed to fetch remix:", error)
      toast.error("Failed to load remix content.")
    }
  }

  const handleApplySolution = (newHtml: string) => {
    setHtml(newHtml)
    setError(false)
    setHtmlStorage(newHtml)
    toast.success("AI solution applied successfully!")
  }

  const handleSaveFeedback = async (feedback: string, solution: string) => {
    try {
      await fetch("/api/ai-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ feedback, solution, prompt: html }),
      })
    } catch (error) {
      console.error("Failed to save feedback:", error)
    }
  }

  /**
   * Resets the layout based on screen size
   * - For desktop: Sets editor to 1/3 width and preview to 2/3
   * - For mobile: Removes inline styles to let CSS handle it
   */
  const resetLayout = () => {
    if (!editor.current || !preview.current) return

    // lg breakpoint is 1024px based on useBreakpoint definition and Tailwind defaults
    if (window.innerWidth >= 1024) {
      // Set initial 1/3 - 2/3 sizes for large screens, accounting for resizer width
      const resizerWidth = resizer.current?.offsetWidth ?? 8 // w-2 = 0.5rem = 8px
      const availableWidth = window.innerWidth - resizerWidth
      const initialEditorWidth = availableWidth / 3 // Editor takes 1/3 of space
      const initialPreviewWidth = availableWidth - initialEditorWidth // Preview takes 2/3
      editor.current.style.width = `${initialEditorWidth}px`
      preview.current.style.width = `${initialPreviewWidth}px`
    } else {
      // Remove inline styles for smaller screens, let CSS flex-col handle it
      editor.current.style.width = ""
      preview.current.style.width = ""
    }
  }

  /**
   * Handles resizing when the user drags the resizer
   * Ensures minimum widths are maintained for both panels
   */
  const handleResize = (e: MouseEvent) => {
    if (!editor.current || !preview.current || !resizer.current) return

    const resizerWidth = resizer.current.offsetWidth
    const minWidth = 100 // Minimum width for editor/preview
    const maxWidth = window.innerWidth - resizerWidth - minWidth

    const editorWidth = e.clientX
    const clampedEditorWidth = Math.max(minWidth, Math.min(editorWidth, maxWidth))
    const calculatedPreviewWidth = window.innerWidth - clampedEditorWidth - resizerWidth

    editor.current.style.width = `${clampedEditorWidth}px`
    preview.current.style.width = `${calculatedPreviewWidth}px`
  }

  const handleMouseDown = () => {
    setIsResizing(true)
    document.addEventListener("mousemove", handleResize)
    document.addEventListener("mouseup", handleMouseUp)
  }

  const handleMouseUp = () => {
    setIsResizing(false)
    document.removeEventListener("mousemove", handleResize)
    document.removeEventListener("mouseup", handleMouseUp)
  }

  // Initialize component on mount
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setCurrentView("preview")
    }
  }, [])

  useEffect(() => {
    // Register service worker for asset caching
    registerServiceWorker()

    // Fetch user data
    fetchMe()

    // Fetch remix if ID is provided
    if (remixId) {
      fetchRemix(remixId)
    }

    // Restore content from storage if available
    if (htmlStorage) {
      removeHtmlStorage()
      toast.warn("Previous HTML content restored from local storage.")
    }

    // Set initial layout based on window size
    resetLayout()

    // Attach event listeners
    if (resizer.current) {
      resizer.current.addEventListener("mousedown", handleMouseDown)
    }
    window.addEventListener("resize", resetLayout)

    // Prevent accidental navigation away when AI is working or content has changed
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isAiWorking || html !== defaultHTML) {
        e.preventDefault()
        e.returnValue = ""
        return ""
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload)

    // Clean up event listeners on unmount
    return () => {
      document.removeEventListener("mousemove", handleResize)
      document.removeEventListener("mouseup", handleMouseUp)
      if (resizer.current) {
        resizer.current.removeEventListener("mousedown", handleMouseDown)
      }
      window.removeEventListener("resize", resetLayout)
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [htmlStorage, removeHtmlStorage, isAiWorking, html, remixId])

  return (
    <div className="h-screen bg-gray-950 font-sans overflow-hidden">
      <Header
        onReset={() => {
          if (isAiWorking) {
            toast.warn("Please wait for the AI to finish working.")
            return
          }
          if (window.confirm("You're about to reset the editor. Are you sure?")) {
            setHtml(defaultHTML)
            setError(false)
            removeHtmlStorage()
            editorRef.current?.revealLine(editorRef.current?.getModel()?.getLineCount() ?? 0)
          }
        }}
      >
        <DeployButton html={html} error={error} auth={auth} />
        <button
          onClick={() => setShowAIAssistant((prev) => !prev)}
          className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-1.5 text-sm"
        >
          <RiSparkling2Fill className="text-base" />
          <span className="hidden sm:inline">{showAIAssistant ? "Hide AI" : "AI Assistant"}</span>
        </button>
      </Header>
      <main className="max-lg:flex-col flex w-full">
        <div
          ref={editor}
          className={classNames(
            "w-full h-[calc(100dvh-49px)] lg:h-[calc(100dvh-54px)] relative overflow-hidden max-lg:transition-all max-lg:duration-200",
            {
              "max-lg:h-0": currentView === "preview",
            },
          )}
        >
          <Tabs />
          <div
            onClick={(e) => {
              if (isAiWorking) {
                e.preventDefault()
                e.stopPropagation()
                toast.warn("Please wait for the AI to finish working.")
              }
            }}
          >
            <MonacoEditor
              language="html"
              theme="vs-dark"
              className={classNames("h-[calc(100dvh-90px)] lg:h-[calc(100dvh-96px)]", {
                "pointer-events-none": isAiWorking,
              })}
              value={html}
              onValidate={(markers) => {
                if (markers?.length > 0) {
                  setError(true)
                }
              }}
              onChange={(value) => {
                const newValue = value ?? ""
                setHtml(newValue)
                setError(false)
                // Save to local storage for recovery
                setHtmlStorage(newValue)
              }}
              onMount={(editor) => {
                editorRef.current = editor

                // Optimize editor settings for performance
                editor.updateOptions({
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  folding: true,
                  automaticLayout: true,
                  wordWrap: "on",
                  formatOnPaste: true,
                  renderWhitespace: "none",
                  renderControlCharacters: false,
                  renderIndentGuides: false,
                  // Reduce editor features for better performance
                  quickSuggestions: false,
                  suggestOnTriggerCharacters: false,
                  hover: { enabled: false },
                  parameterHints: { enabled: false },
                  lightbulb: { enabled: false },
                })
              }}
            />
          </div>
          <AskAI
            html={html}
            setHtml={setHtml}
            isAiWorking={isAiWorking}
            setIsAiWorking={setIsAiWorking}
            setView={setCurrentView}
            onScrollToBottom={() => {
              editorRef.current?.revealLine(editorRef.current?.getModel()?.getLineCount() ?? 0)
            }}
          />
        </div>
        <div
          ref={resizer}
          className="bg-gray-700 hover:bg-blue-500 w-2 cursor-col-resize h-[calc(100dvh-53px)] max-lg:hidden"
        />
        <Preview html={html} isResizing={isResizing} isAiWorking={isAiWorking} ref={preview} setView={setCurrentView} />
        {showAIAssistant && (
          <div className="fixed bottom-20 right-4 z-20 w-96 max-w-[calc(100vw-2rem)]">
            <AIAssistantComponent
              html={html}
              onApplySolution={handleApplySolution}
              onSaveFeedback={handleSaveFeedback}
            />
          </div>
        )}
        <ViewToggle currentView={currentView} setView={setCurrentView} />
      </main>
    </div>
  )
}


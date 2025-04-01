"use client"

import { useState, lazy, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "react-toastify"
import Image from "next/image"

// Lazy load ReactMarkdown which is a heavy component
const ReactMarkdown = lazy(() => import("react-markdown"))

interface AIAssistantProps {
  html: string
  onApplySolution: (newHtml: string) => void
  onSaveFeedback: (feedback: string, solution: string) => void
}

export default function AIAssistant({ html, onApplySolution, onSaveFeedback }: AIAssistantProps) {
  const [prompt, setPrompt] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [solution, setSolution] = useState("")
  const [feedback, setFeedback] = useState("")
  const [history, setHistory] = useState<Array<{ prompt: string; solution: string; feedback?: string }>>([])
  const [activeTab, setActiveTab] = useState("current")
  const [codeToApply, setCodeToApply] = useState("")

  const handleSubmit = async () => {
    if (!prompt.trim() || isLoading) return

    setIsLoading(true)
    setSolution("") // Clear previous solution
    let fullResponse = ""

    try {
      const response = await fetch("/api/ai-assistant", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt,
          html,
          ...(history.length > 0 && history[history.length - 1].feedback
            ? {
                feedback: history[history.length - 1].feedback,
                previousSolution: history[history.length - 1].solution,
              }
            : {}),
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to generate solution")
      }

      // Handle streaming response
      if (response.body) {
        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        setActiveTab("solution")

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          fullResponse += chunk
          setSolution(fullResponse)
        }

        // Process the complete response to extract code blocks
        const codeBlockRegex = /```(?:html)?\s*([\s\S]*?)```/g
        const matches = [...fullResponse.matchAll(codeBlockRegex)]
        if (matches.length > 0) {
          const largestCodeBlock = matches.reduce((largest, current) =>
            current[1].length > largest[1].length ? current : largest,
          )
          setCodeToApply(largestCodeBlock[1].trim())
        } else {
          setCodeToApply("")
        }

        // Add to history
        setHistory((prev) => [...prev, { prompt, solution: fullResponse }])
      }
    } catch (error: any) {
      console.error("Error generating solution:", error)
      toast.error(error.message || "Failed to generate solution. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplySolution = () => {
    if (codeToApply) {
      onApplySolution(codeToApply)
      toast.success("Solution applied successfully!")
    } else {
      toast.warn("No applicable code found in the solution")
    }
  }

  const handleSaveFeedback = () => {
    if (!feedback.trim()) {
      toast.warn("Please provide feedback before saving")
      return
    }

    onSaveFeedback(feedback, solution)
    setHistory((prev) => {
      const updated = [...prev]
      updated[updated.length - 1].feedback = feedback
      return updated
    })
    setFeedback("")
    toast.success("Feedback saved! This will help improve future suggestions.")
  }

  // Render markdown only when solution tab is active for better performance
  const renderMarkdown = activeTab === "solution" && solution

  return (
    <Card className="w-full border-pink-200">
      <CardHeader className="bg-gradient-to-r from-pink-50 to-white">
        <CardTitle className="flex items-center gap-2">
          <div className="relative w-8 h-8 overflow-hidden rounded-full">
            <Image src="/mascot.png" alt="iLy" width={32} height={32} className="object-cover" priority />
          </div>
          iLy Assistant
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="current">Request</TabsTrigger>
            <TabsTrigger value="solution">Response</TabsTrigger>
            <TabsTrigger value="feedback">Feedback</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <TabsContent value="current">
            <div className="space-y-4">
              <Textarea
                placeholder="Ask iLy for guidance, suggestions, or help with your code..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[150px]"
              />
              <Button onClick={handleSubmit} disabled={isLoading || !prompt.trim()} className="w-full">
                {isLoading ? "Thinking..." : "Get Guidance"}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="solution">
            {solution ? (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-md overflow-auto max-h-[min(400px,60vh)] prose prose-sm">
                  <Suspense fallback={<div className="animate-pulse">Loading response...</div>}>
                    {renderMarkdown && (
                      <ReactMarkdown
                        components={{
                          pre: ({ node, ...props }) => (
                            <div className="relative">
                              <pre className="overflow-x-auto text-xs sm:text-sm p-2 max-w-full" {...props} />
                            </div>
                          ),
                          code: ({ node, className, children, ...props }) => (
                            <code
                              className={`${className} text-xs sm:text-sm max-w-full break-words whitespace-pre-wrap`}
                              {...props}
                            >
                              {children}
                            </code>
                          ),
                        }}
                      >
                        {solution}
                      </ReactMarkdown>
                    )}
                  </Suspense>
                </div>
                <div className="flex gap-2">
                  {codeToApply && (
                    <Button onClick={handleApplySolution} variant="default">
                      Apply Code Changes
                    </Button>
                  )}
                  <Button onClick={() => setActiveTab("feedback")} variant="outline">
                    Provide Feedback
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-gray-500">No response yet. Submit a request first.</p>
            )}
          </TabsContent>

          <TabsContent value="feedback">
            <div className="space-y-4">
              <Textarea
                placeholder="What was helpful? What could be improved? Any other thoughts on the guidance?"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="min-h-[150px]"
              />
              <Button onClick={handleSaveFeedback} disabled={!feedback.trim()}>
                Save Feedback
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="history">
            {history.length > 0 ? (
              <div className="space-y-4 max-h-[400px] overflow-auto">
                {history.map((item, index) => (
                  <div key={index} className="border rounded-md p-4">
                    <h4 className="font-medium mb-2">Request {index + 1}</h4>
                    <p className="text-sm mb-2">{item.prompt}</p>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSolution(item.solution)
                          setActiveTab("solution")

                          // Re-extract code blocks when viewing history
                          const codeBlockRegex = /```(?:html)?\s*([\s\S]*?)```/g
                          const matches = [...item.solution.matchAll(codeBlockRegex)]
                          if (matches.length > 0) {
                            const largestCodeBlock = matches.reduce((largest, current) =>
                              current[1].length > largest[1].length ? current : largest,
                            )
                            setCodeToApply(largestCodeBlock[1].trim())
                          } else {
                            setCodeToApply("")
                          }
                        }}
                      >
                        View Response
                      </Button>
                      {item.feedback && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => {
                            setFeedback(item.feedback || "")
                            setActiveTab("feedback")
                          }}
                        >
                          View Feedback
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No history yet. Start by submitting a request.</p>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}


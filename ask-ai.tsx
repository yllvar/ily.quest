"use client"

import { useState } from "react"

const AskAI = () => {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setAnswer("") // Clear previous answer

    try {
      const response = await fetch("/api/ask-ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      setAnswer(data.answer || "No answer received.")
    } catch (error) {
      console.error("Error asking AI:", error)
      setAnswer("Error fetching answer. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 w-full max-w-md">
        <h2 className="text-2xl font-bold">Ask iLy anything...</h2>
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="question">
              Your Question:
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="question"
              rows={4}
              placeholder="Enter your question here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
              disabled={loading}
            >
              {loading ? "Asking..." : "Ask iLy"}
            </button>
          </div>
        </form>
        {answer && (
          <div className="mt-4">
            <p className="text-gray-700 font-bold">Answer:</p>
            <p className="text-gray-800">{answer}</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default AskAI


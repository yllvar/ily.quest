"use client"

import { useState } from "react"
import { toast } from "react-toastify"
import { FaRocket } from "react-icons/fa6"
import type { Auth } from "@/lib/types"

interface DeployButtonProps {
  html: string
  error: boolean
  auth: Auth | undefined
}

export default function DeployButton({ html, error, auth }: DeployButtonProps) {
  const [isDeploying, setIsDeploying] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [title, setTitle] = useState("")
  const [path, setPath] = useState("")

  const handleDeploy = async () => {
    if (!auth) {
      toast.error("Please login to deploy your site")
      return
    }

    if (error) {
      toast.error("Please fix the errors in your code before deploying")
      return
    }

    if (!title.trim()) {
      toast.error("Please enter a title for your site")
      return
    }

    setIsDeploying(true)
    try {
      const res = await fetch("/api/deploy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          html,
          title,
          path,
        }),
      })

      const data = await res.json()
      if (data.ok) {
        toast.success("Site deployed successfully!")
        setShowModal(false)
        // Open the deployed site in a new tab
        window.open(`https://huggingface.co/spaces/${data.path}`, "_blank")
      } else {
        toast.error(data.message || "Failed to deploy site")
      }
    } catch (error) {
      toast.error("An error occurred while deploying your site")
    } finally {
      setIsDeploying(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-blue-500 hover:bg-blue-600 text-white text-xs lg:text-sm font-medium py-1.5 px-3 lg:px-4 rounded-lg flex items-center gap-1.5 transition-colors duration-200"
        disabled={isDeploying}
      >
        <FaRocket />
        <span>{isDeploying ? "Deploying..." : "Deploy"}</span>
      </button>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <div className="p-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800">Deploy to Hugging Face Spaces</h3>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Site Title *
                </label>
                <input
                  type="text"
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="My Awesome Site"
                  required
                />
              </div>
              <div>
                <label htmlFor="path" className="block text-sm font-medium text-gray-700 mb-1">
                  Custom Path (optional)
                </label>
                <input
                  type="text"
                  id="path"
                  value={path}
                  onChange={(e) => setPath(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="username/repo-name"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to create a new space. Use format "username/repo-name" to update an existing space.
                </p>
              </div>
            </div>
            <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                disabled={isDeploying}
              >
                Cancel
              </button>
              <button
                onClick={handleDeploy}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md hover:bg-blue-600 disabled:bg-blue-300"
                disabled={isDeploying || !title.trim()}
              >
                {isDeploying ? "Deploying..." : "Deploy"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}


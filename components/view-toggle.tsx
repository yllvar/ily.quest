"use client"

import { FaLaptopCode } from "react-icons/fa6"
import { MdPreview } from "react-icons/md"

interface ViewToggleProps {
  currentView: "editor" | "preview"
  setView: (view: "editor" | "preview") => void
}

export default function ViewToggle({ currentView, setView }: ViewToggleProps) {
  return (
    <div className="fixed bottom-20 right-4 z-20 lg:hidden">
      <div className="bg-gray-950 rounded-full shadow-lg p-1 flex">
        <button
          className={`rounded-full p-2.5 ${currentView === "editor" ? "bg-blue-500 text-white" : "text-gray-400"}`}
          onClick={() => setView("editor")}
          aria-label="Switch to editor"
        >
          <FaLaptopCode className="text-lg" />
        </button>
        <button
          className={`rounded-full p-2.5 ${currentView === "preview" ? "bg-blue-500 text-white" : "text-gray-400"}`}
          onClick={() => setView("preview")}
          aria-label="Switch to preview"
        >
          <MdPreview className="text-lg" />
        </button>
      </div>
    </div>
  )
}


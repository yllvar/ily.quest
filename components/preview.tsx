"use client"

import type React from "react"

import { forwardRef, useRef } from "react"
import classNames from "classnames"
import { toast } from "react-toastify"
import { TbReload } from "react-icons/tb"
import { FaLaptopCode } from "react-icons/fa6"

interface PreviewProps {
  html: string
  isResizing: boolean
  isAiWorking: boolean
  setView: React.Dispatch<React.SetStateAction<"editor" | "preview">>
}

const Preview = forwardRef<HTMLDivElement, PreviewProps>(function Preview(
  { html, isResizing, isAiWorking, setView },
  ref,
) {
  const iframeRef = useRef<HTMLIFrameElement | null>(null)

  const handleRefreshIframe = () => {
    if (iframeRef.current) {
      const iframe = iframeRef.current
      const content = iframe.srcdoc
      iframe.srcdoc = ""
      setTimeout(() => {
        iframe.srcdoc = content
      }, 10)
    }
  }

  return (
    <div
      ref={ref}
      className="w-full border-l border-gray-900 bg-white h-[calc(100dvh-49px)] lg:h-[calc(100dvh-53px)] relative"
      onClick={(e) => {
        if (isAiWorking) {
          e.preventDefault()
          e.stopPropagation()
          toast.warn("Please wait for the AI to finish working.")
        }
      }}
    >
      <iframe
        ref={iframeRef}
        title="output"
        className={classNames("w-full h-full select-none", {
          "pointer-events-none": isResizing || isAiWorking,
        })}
        srcDoc={html}
        sandbox="allow-scripts allow-same-origin"
      />
      <div className="flex items-center justify-start gap-3 absolute bottom-3 lg:bottom-5 max-lg:left-3 lg:right-5">
        <button
          className="lg:hidden bg-gray-950 shadow-md text-white text-xs font-medium py-2.5 px-4 rounded-lg flex items-center gap-2 border border-gray-900 hover:brightness-150 transition-all duration-100 cursor-pointer fixed top-16 right-4 z-10"
          onClick={() => setView("editor")}
        >
          <FaLaptopCode />
          Edit Code
        </button>
        <button
          className="bg-white lg:bg-gray-950 shadow-md text-gray-950 lg:text-white text-xs lg:text-sm font-medium py-2 px-3 lg:px-4 rounded-lg flex items-center gap-2 border border-gray-100 lg:border-gray-900 hover:brightness-150 transition-all duration-100 cursor-pointer"
          onClick={handleRefreshIframe}
        >
          <TbReload />
          Refresh Preview
        </button>
      </div>
    </div>
  )
})

export default Preview


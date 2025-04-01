import type React from "react"
import Image from "next/image"

interface TabsProps {
  children?: React.ReactNode
}

export default function Tabs({ children }: TabsProps) {
  return (
    <div className="border-b border-gray-800 pl-4 lg:pl-7 pr-3 flex items-center justify-between">
      <div className="space-x-6">
        <button className="rounded-md text-sm cursor-pointer transition-all duration-100 font-medium relative py-2.5 text-white">
          index.html
          <span className="absolute bottom-0 left-0 h-0.5 w-full transition-all duration-100 bg-white" />
        </button>
      </div>
      <div className="flex items-center justify-end gap-3">
        <a
          href="https://huggingface.co/deepseek-ai/DeepSeek-V3-0324"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[12px] text-gray-300 hover:brightness-120 flex items-center gap-1 font-code"
        >
          Powered by
          <Image src="/deepseek-color.svg" alt="DeepSeek Logo" width={20} height={20} className="size-5" />
          Deepseek
        </a>
        {children}
      </div>
    </div>
  )
}


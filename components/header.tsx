"use client"

import type { ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"
import { FaGithub } from "react-icons/fa"
import { TbRefresh } from "react-icons/tb"
import UsageTracker from "./usage-tracker"

interface HeaderProps {
  onReset: () => void
  children?: ReactNode
}

export default function Header({ onReset, children }: HeaderProps) {
  return (
    <header className="bg-gray-900 border-b border-gray-800 h-[49px] lg:h-[54px] flex items-center justify-between px-4 lg:px-6">
      <div className="flex items-center gap-4">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.svg" alt="iLy.quest Logo" width={24} height={24} className="w-6 h-6" />
          <span className="text-white font-semibold text-lg hidden sm:block">iLy.quest</span>
        </Link>
        <button
          onClick={onReset}
          className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-1.5 text-sm"
        >
          <TbRefresh className="text-base" />
          <span className="hidden sm:inline">Reset</span>
        </button>
      </div>
      <div className="flex items-center gap-3">
        <UsageTracker />
        {children}
        <Link
          href="https://github.com/yourusername/ilyquest"
          target="_blank"
          rel="noopener noreferrer"
          className="text-gray-400 hover:text-white transition-colors duration-200"
        >
          <FaGithub className="text-xl" />
        </Link>
      </div>
    </header>
  )
}


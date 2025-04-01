import Link from "next/link"
import Image from "next/image"

export default function Header() {
  return (
    <header className="bg-background border-b">
      <div className="container flex h-16 items-center">
        <Link href="/" className="flex items-center justify-between">
          <div className="flex items-center">
            <Image alt="iLy.quest" height="32" src="/iLy.svg" width="32" />
            <span className="ml-2 font-semibold text-foreground">iLy.quest</span>
          </div>
        </Link>
        <nav className="ml-auto">{/* Add navigation links here */}</nav>
      </div>
    </header>
  )
}


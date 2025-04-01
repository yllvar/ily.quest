import type React from "react"
import "./globals.css"

export const metadata = {
  title: "iLy.quest",
  icons: [{ rel: "icon", url: "/iLy.svg" }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}


import type React from "react"
import type { Metadata } from "next"
import { Noto_Sans, Source_Code_Pro } from "next/font/google"
import { ToastContainer } from "react-toastify"
import "react-toastify/dist/ReactToastify.css"
import "./globals.css"
import { config } from "@/lib/config"
import Script from "next/script"
import SubscriptionProvider from "@/components/subscription-provider"

// Optimize font loading with display swap
const noto = Noto_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["400", "500", "600", "700"], // Only load needed weights
  display: "swap",
})

const sourceCode = Source_Code_Pro({
  subsets: ["latin"],
  variable: "--font-code",
  weight: ["400", "500", "600", "700"], // Only load needed weights
  display: "swap",
})

export const metadata: Metadata = {
  title: "iLy.quest | Build with AI ✨",
  description:
    "iLy.quest is a web development tool that helps you build websites with AI, no code required. Let's deploy your website with iLy.quest and enjoy the magic of AI.",
  metadataBase: new URL(config.appUrl),
  openGraph: {
    title: "iLy.quest | Build with AI ✨",
    description: "Build websites with AI, no code required.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "iLy.quest",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "iLy.quest | Build with AI ✨",
    description: "Build websites with AI, no code required.",
    images: ["/og-image.png"],
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${noto.variable} ${sourceCode.variable}`}>
      <head>
        <link rel="icon" href="/iLy.svg" type="image/svg+xml" />

        {/* Preload critical assets */}
        <link rel="preload" href="/mascot.png" as="image" />
        <link rel="preload" href="/logo.svg" as="image" />

        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://huggingface.co" />
        <link rel="dns-prefetch" href="https://huggingface.co" />
      </head>
      <body className="font-sans">
        <SubscriptionProvider>{children}</SubscriptionProvider>
        <ToastContainer
          position="bottom-right"
          limit={3}
          autoClose={3000}
          hideProgressBar={true}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss={false}
          draggable
          pauseOnHover
        />

        {/* Defer non-critical scripts */}
        <Script src="https://cdn.tailwindcss.com" strategy="lazyOnload" />
      </body>
    </html>
  )
}



import './globals.css'
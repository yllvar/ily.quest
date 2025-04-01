import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "iLy.quest",
    short_name: "iLy",
    description: "Build websites with AI, no code required.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#EC4899",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/iLy.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
    ],
  }
}


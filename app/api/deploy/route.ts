import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { createRepo, uploadFiles, whoAmI } from "@huggingface/hub"

// Helper function to generate the attribution tag
const getPTag = (repoId: string) => {
  return `<p style="border-radius: 8px; text-align: center; font-size: 12px; color: #fff; margin-top: 16px;position: fixed; left: 8px; bottom: 8px; z-index: 10; background: rgba(0, 0, 0, 0.8); padding: 4px 8px;">Made with <img src="https://ily.quest/logo.svg" alt="iLy.quest Logo" style="width: 16px; height: 16px; vertical-align: middle;display:inline-block;margin-right:3px;filter:brightness(0) invert(1);"><a href="https://ily.quest" style="color: #fff;text-decoration: underline;" target="_blank" >iLy.quest</a> - <a href="https://ily.quest?remix=${repoId}" style="color: #fff;text-decoration: underline;" target="_blank" >🧬 Remix</a></p>`
}

export async function POST(request: NextRequest) {
  try {
    const { html, title, path } = await request.json()

    if (!html || !title) {
      return NextResponse.json({ ok: false, message: "Missing required fields" }, { status: 400 })
    }

    const hf_token = cookies().get("hf_token")?.value

    if (!hf_token) {
      return NextResponse.json({ ok: false, message: "Authentication required" }, { status: 401 })
    }

    const repo = {
      type: "space",
      name: path ?? "",
    }

    let readme
    let newHtml = html

    if (!path || path === "") {
      const { name: username } = await whoAmI({ accessToken: hf_token })
      const newTitle = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .split("-")
        .filter(Boolean)
        .join("-")
        .slice(0, 96)

      const repoId = `${username}/${newTitle}`
      repo.name = repoId

      newHtml = html.replace(/<\/body>/, `${getPTag(repoId)}</body>`)

      await createRepo({
        repo,
        accessToken: hf_token,
      })

      readme = `---
title: ${newTitle}
emoji: 🐱
colorFrom: pink
colorTo: purple
sdk: static
pinned: false
tags:
  - ilyquest
---

Check out the configuration reference at https://huggingface.co/docs/hub/spaces-config-reference`
    }

    // Create files to upload
    const files = []

    // Add HTML file
    const htmlFile = new Blob([newHtml], { type: "text/html" })
    files.push({
      path: "index.html",
      content: htmlFile,
    })

    // Add README if needed
    if (readme) {
      const readmeFile = new Blob([readme], { type: "text/markdown" })
      files.push({
        path: "README.md",
        content: readmeFile,
      })
    }

    // Upload files to Hugging Face
    await uploadFiles({
      repo,
      files,
      accessToken: hf_token,
    })

    return NextResponse.json({ ok: true, path: repo.name })
  } catch (error: any) {
    console.error("Deploy error:", error)
    return NextResponse.json({ ok: false, message: error.message || "Failed to deploy" }, { status: 500 })
  }
}


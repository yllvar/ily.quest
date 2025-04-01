import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { spaceInfo } from "@huggingface/hub"

// Helper function to generate the attribution tag
const getPTag = (repoId: string) => {
  return `<p style="border-radius: 8px; text-align: center; font-size: 12px; color: #fff; margin-top: 16px;position: fixed; left: 8px; bottom: 8px; z-index: 10; background: rgba(0, 0, 0, 0.8); padding: 4px 8px;">Made with <img src="https://ily.quest/logo.svg" alt="iLy.quest Logo" style="width: 16px; height: 16px; vertical-align: middle;display:inline-block;margin-right:3px;filter:brightness(0) invert(1);"><a href="https://ily.quest" style="color: #fff;text-decoration: underline;" target="_blank" >iLy.quest</a> - <a href="https://ily.quest?remix=${repoId}" style="color: #fff;text-decoration: underline;" target="_blank" >🧬 Remix</a></p>`
}

export async function GET(request: NextRequest, { params }: { params: { slug: string[] } }) {
  try {
    const slug = params.slug

    if (slug.length < 2) {
      return NextResponse.json({ ok: false, message: "Invalid remix path" }, { status: 400 })
    }

    const username = slug[0]
    const repo = slug[1]
    const repoId = `${username}/${repo}`

    const hf_token = cookies().get("hf_token")?.value || process.env.DEFAULT_HF_TOKEN

    // Get space info
    const space = await spaceInfo({
      name: repoId,
    })

    if (!space || space.sdk !== "static" || space.private) {
      return NextResponse.json({ ok: false, message: "Space not found" }, { status: 404 })
    }

    // Fetch the HTML content
    const url = `https://huggingface.co/spaces/${repoId}/raw/main/index.html`
    const response = await fetch(url)

    if (!response.ok) {
      return NextResponse.json({ ok: false, message: "Space content not found" }, { status: 404 })
    }

    let html = await response.text()

    // Remove the attribution tag
    html = html.replace(getPTag(repoId), "")

    return NextResponse.json({
      ok: true,
      html,
    })
  } catch (error) {
    console.error("Remix error:", error)
    return NextResponse.json({ ok: false, message: "Failed to load remix content" }, { status: 500 })
  }
}


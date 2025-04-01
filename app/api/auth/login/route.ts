import { type NextRequest, NextResponse } from "next/server"
import { config } from "@/lib/config"

export async function GET(request: NextRequest) {
  if (!config.oauth.clientId) {
    return NextResponse.json({ error: "OAuth client ID not configured" }, { status: 500 })
  }

  return NextResponse.redirect(
    `https://huggingface.co/oauth/authorize?client_id=${config.oauth.clientId}&redirect_uri=${config.oauth.redirectUri}&response_type=code&scope=openid%20profile%20write-repos%20manage-repos%20inference-api&prompt=consent&state=1234567890`,
  )
}


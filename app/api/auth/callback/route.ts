import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { config } from "@/lib/config"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")

  if (!code) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  if (!config.oauth.clientId || !config.oauth.clientSecret) {
    console.error("OAuth credentials not configured")
    return NextResponse.redirect(new URL("/?error=oauth_config", request.url))
  }

  const Authorization = `Basic ${Buffer.from(`${config.oauth.clientId}:${config.oauth.clientSecret}`).toString("base64")}`

  try {
    const request_auth = await fetch("https://huggingface.co/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization,
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code: code,
        redirect_uri: config.oauth.redirectUri,
      }),
    })

    const response = await request_auth.json()

    if (!response.access_token) {
      console.error("No access token received:", response)
      return NextResponse.redirect(new URL("/?error=no_token", request.url))
    }

    // Set cookie
    cookies().set({
      name: "hf_token",
      value: response.access_token,
      httpOnly: true,
      secure: config.isProduction,
      sameSite: "lax",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: "/",
    })

    return NextResponse.redirect(new URL("/", request.url))
  } catch (error) {
    console.error("Auth error:", error)
    return NextResponse.redirect(new URL("/?error=auth_failed", request.url))
  }
}


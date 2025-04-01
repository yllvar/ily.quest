import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import { InferenceClient } from "@huggingface/inference"
import { PROVIDERS } from "@/lib/providers"
import { config } from "@/lib/config"

// Constants
const MODEL_ID = "deepseek-ai/DeepSeek-V3-0324"
const MAX_REQUESTS_PER_IP = 4

// In-memory storage for rate limiting
// Note: This will reset on server restart. For production, use Redis or similar
const ipAddresses = new Map<string, number>()

export async function POST(request: NextRequest) {
  try {
    const { prompt, html, previousPrompt, provider } = await request.json()

    if (!prompt) {
      return NextResponse.json({ ok: false, message: "Missing required fields" }, { status: 400 })
    }

    // Get auth token
    const hf_token = cookies().get("hf_token")?.value
    let token = hf_token

    // Get client IP for rate limiting
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0] || request.headers.get("x-real-ip") || "0.0.0.0"

    // Rate limiting for unauthenticated users
    if (!hf_token) {
      const currentCount = ipAddresses.get(ip) || 0
      ipAddresses.set(ip, currentCount + 1)

      if (ipAddresses.get(ip)! > MAX_REQUESTS_PER_IP) {
        return NextResponse.json(
          { ok: false, openLogin: true, message: "Log In to continue using the service" },
          { status: 429 },
        )
      }

      // Use default token for unauthenticated users
      token = config.deepseek.defaultToken!

      if (!token) {
        return NextResponse.json({ error: "Default HF token not configured" }, { status: 500 })
      }
    }

    // Calculate token usage
    let TOKENS_USED = prompt?.length || 0
    if (previousPrompt) TOKENS_USED += previousPrompt.length
    if (html) TOKENS_USED += html.length

    // Select provider
    const DEFAULT_PROVIDER = PROVIDERS["fireworks-ai"]
    const selectedProvider =
      provider === "auto"
        ? TOKENS_USED < PROVIDERS.sambanova.max_tokens
          ? PROVIDERS.sambanova
          : DEFAULT_PROVIDER
        : (PROVIDERS[provider] ?? DEFAULT_PROVIDER)

    // Check if context is too long for selected provider
    if (provider !== "auto" && TOKENS_USED >= selectedProvider.max_tokens) {
      return NextResponse.json(
        {
          ok: false,
          openSelectProvider: true,
          message: `Context is too long. ${selectedProvider.name} allow ${selectedProvider.max_tokens} max tokens.`,
        },
        { status: 400 },
      )
    }

    // Create a new ReadableStream for streaming the response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const client = new InferenceClient(token)

          const chatCompletion = client.chatCompletionStream({
            model: MODEL_ID,
            provider: selectedProvider.id,
            messages: [
              {
                role: "system",
                content: `ONLY USE HTML, CSS AND JAVASCRIPT. If you want to use ICON make sure to import the library first. Try to create the best UI possible by using only HTML, CSS and JAVASCRIPT. Use as much as you can TailwindCSS for the CSS, if you can't do something with TailwindCSS, then use custom CSS (make sure to import <script src="https://cdn.tailwindcss.com"></script> in the head). Also, try to ellaborate as much as you can, to create something unique. ALWAYS GIVE THE RESPONSE INTO A SINGLE HTML FILE`,
              },
              ...(previousPrompt
                ? [
                    {
                      role: "user",
                      content: previousPrompt,
                    },
                  ]
                : []),
              ...(html
                ? [
                    {
                      role: "assistant",
                      content: `The current code is: ${html}.`,
                    },
                  ]
                : []),
              {
                role: "user",
                content: prompt,
              },
            ],
            ...(selectedProvider.id !== "sambanova"
              ? {
                  max_tokens: selectedProvider.max_tokens,
                }
              : {}),
          })

          let completeResponse = ""

          while (true) {
            const { done, value } = await chatCompletion.next()
            if (done) break

            const chunk = value.choices[0]?.delta?.content
            if (chunk) {
              if (provider !== "sambanova") {
                controller.enqueue(new TextEncoder().encode(chunk))
                completeResponse += chunk

                if (completeResponse.includes("</html>")) {
                  break
                }
              } else {
                let newChunk = chunk
                if (chunk.includes("</html>")) {
                  // Replace everything after the last </html> tag with an empty string
                  newChunk = newChunk.replace(/<\/html>[\s\S]*/, "</html>")
                }
                completeResponse += newChunk
                controller.enqueue(new TextEncoder().encode(newChunk))
                if (newChunk.includes("</html>")) {
                  break
                }
              }
            }
          }

          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    // Return the stream as the response
    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Error in ask-ai route:", error)
    return NextResponse.json(
      {
        ok: false,
        message: "An error occurred while processing your request",
      },
      { status: 500 },
    )
  }
}


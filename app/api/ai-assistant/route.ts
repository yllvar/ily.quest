import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { deepseek } from "@ai-sdk/deepseek"
import { config } from "@/lib/config"

export async function POST(request: NextRequest) {
  try {
    const { prompt, html, feedback, previousSolution } = await request.json()

    if (!prompt || !html) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    let systemPrompt = `You are an expert web development coach and mentor specializing in HTML, CSS, and JavaScript.
Your role is to guide developers by providing helpful explanations, suggestions, and best practices.
Always respond in a conversational, supportive tone. Structure your responses like this:

1. First, acknowledge the developer's request and provide context about what you'll help with
2. Explain your suggested approach and why it's beneficial
3. Provide code examples when relevant, but always explain what the code does
4. Offer additional tips or alternatives when appropriate
5. End with an encouraging note or question to continue the conversation

Remember to focus on teaching and explaining rather than just providing code solutions.`

    // If there's feedback from a previous interaction, include it
    if (feedback && previousSolution) {
      systemPrompt += `
The developer previously received this solution:
\`\`\`
${previousSolution}
\`\`\`

And provided this feedback:
"${feedback}"

Please take this feedback into account when generating your new response.`
    }

    // Use the DeepSeek API key from environment variables
    const apiKey = config.deepseek.apiKey

    if (!apiKey) {
      return NextResponse.json({ error: "DeepSeek API key not configured" }, { status: 500 })
    }

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const textStream = await generateText({
            model: deepseek("deepseek-chat"),
            system: systemPrompt,
            prompt: `Current HTML code:
\`\`\`html
${html}
\`\`\`

Developer's request: ${prompt}

Provide a helpful, conversational response that guides the developer. Include explanations, suggestions, and code examples where appropriate.`,
            stream: true,
          })

          for await (const chunk of textStream) {
            controller.enqueue(new TextEncoder().encode(chunk))
          }

          controller.close()
        } catch (error) {
          controller.error(error)
        }
      },
    })

    // Return the stream
    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error: any) {
    console.error("AI Assistant error:", error)
    return NextResponse.json({ error: error.message || "Failed to generate solution" }, { status: 500 })
  }
}


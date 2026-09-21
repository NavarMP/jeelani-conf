import { GoogleGenAI } from "@google/genai";
import { getAgentContext, buildSystemInstruction } from "./actions";

export const dynamic = "force-dynamic";

interface ChatMessage {
  role: "user" | "model";
  text: string;
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        { error: "GEMINI_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { messages, locale = "en" } = body as {
      messages: ChatMessage[];
      locale?: string;
    };

    if (!messages || messages.length === 0) {
      return Response.json(
        { error: "Messages array is required" },
        { status: 400 }
      );
    }

    // Fetch conference context
    const context = await getAgentContext();
    const systemInstruction = buildSystemInstruction(context, locale);

    // Initialize Gemini
    const ai = new GoogleGenAI({ apiKey });

    // Build contents array for Gemini
    const contents = messages.map((msg) => ({
      role: msg.role === "user" ? ("user" as const) : ("model" as const),
      parts: [{ text: msg.text }],
    }));

    // Create a streaming response using TransformStream + SSE
    const encoder = new TextEncoder();
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();

    // Start streaming in the background
    (async () => {
      try {
        const response = await ai.models.generateContentStream({
          model: "gemini-3.6-flash",
          contents,
          config: {
            systemInstruction,
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 4096,
          },
        });

        for await (const chunk of response) {
          const text = chunk.text;
          if (text) {
            // Send as SSE event
            await writer.write(
              encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
            );
          }
        }

        // Send done signal
        await writer.write(encoder.encode(`data: [DONE]\n\n`));
      } catch (error: any) {
        console.error("Gemini streaming error:", error);
        const errorMsg =
          error?.message || "An error occurred while generating the response";
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({ error: errorMsg })}\n\n`
          )
        );
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
      },
    });
  } catch (error: any) {
    console.error("Agent API error:", error);
    return Response.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

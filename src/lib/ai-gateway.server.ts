/**
 * Single provider boundary for all AI calls.
 *
 * Swapping AI provider later means changing ONLY this file: every feature
 * calls `runStructuredPrompt` / `runChatPrompt` and never talks to a vendor
 * SDK directly. The API key is read from the environment at call time and is
 * never sent to the browser.
 */

const GATEWAY_URL = "https://ai.gateway.lovable.dev/v1/chat/completions";
const DEFAULT_MODEL = "google/gemini-3.7-flash";

export class AIServiceError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.name = "AIServiceError";
    this.status = status;
  }
}

export type ChatTurn = { role: "system" | "user" | "assistant"; content: string };

function friendlyError(status: number): string {
  if (status === 429)
    return "The AI service is busy right now. Please wait a moment and try again.";
  if (status === 402)
    return "The AI workspace has run out of credits. Please top up to keep using AI features.";
  if (status === 403) return "AI access is currently disabled for this workspace.";
  if (status === 401)
    return "The AI service is not configured correctly. Please contact the administrator.";
  if (status === 400) return "That request could not be processed by the AI service.";
  return "The AI service is temporarily unavailable. Please try again shortly.";
}

async function callGateway(messages: ChatTurn[], opts: { model?: string; json?: boolean }) {
  const apiKey = process.env["LOVABLE_API_KEY"];
  if (!apiKey) {
    // The AI key is configured as a server-side secret. Nothing is hardcoded.
    throw new AIServiceError(
      "AI is not configured yet. Add the AI provider key to the project secrets.",
      401,
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 90_000);

  let response: Response;
  try {
    response = await fetch(GATEWAY_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: opts.model ?? DEFAULT_MODEL,
        messages,
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      }),
    });
  } catch (error) {
    clearTimeout(timeout);
    if (error instanceof Error && error.name === "AbortError") {
      throw new AIServiceError("The AI request took too long. Please try a shorter input.", 504);
    }
    throw new AIServiceError("Could not reach the AI service. Check your connection.", 503);
  }
  clearTimeout(timeout);

  if (!response.ok) {
    console.error("AI gateway error", response.status, await response.text().catch(() => ""));
    throw new AIServiceError(friendlyError(response.status), response.status);
  }

  const payload = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
  };
  const content = payload.choices?.[0]?.message?.content;
  if (!content || typeof content !== "string") {
    throw new AIServiceError("The AI returned an unexpected response. Please try again.", 502);
  }
  return content;
}

/** Plain text / conversational completion. */
export async function runChatPrompt(messages: ChatTurn[], model?: string): Promise<string> {
  return callGateway(messages, { model: model ?? undefined });
}

function extractJson(raw: string): unknown {
  const cleaned = raw
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf("{");
    const end = cleaned.lastIndexOf("}");
    if (start !== -1 && end > start) {
      try {
        return JSON.parse(cleaned.slice(start, end + 1));
      } catch {
        /* fall through */
      }
    }
    throw new AIServiceError(
      "The AI returned a response we could not read. Please try generating again.",
      502,
    );
  }
}

/** Structured JSON completion, validated by the caller's parser. */
export async function runStructuredPrompt<T>(
  system: string,
  user: string,
  validate: (value: unknown) => T,
  model?: string,
): Promise<T> {
  const raw = await callGateway(
    [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
    { json: true, model: model ?? undefined },
  );
  const parsed = extractJson(raw);
  try {
    return validate(parsed);
  } catch (error) {
    console.error("AI response validation failed", error);
    throw new AIServiceError(
      "The AI response was incomplete. Please try generating again.",
      502,
    );
  }
}

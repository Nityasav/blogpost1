import { getEnv } from "@/lib/env";

const CLAUDE_API_URL = "https://api.anthropic.com/v1/messages";

interface ClaudeTextBlock {
  type: "text";
  text: string;
}

export interface ClaudeMessage {
  role: "user" | "assistant" | "system";
  content: ClaudeTextBlock[];
}

export interface ClaudeMessageRequest {
  messages: ClaudeMessage[];
  maxOutputTokens?: number;
  temperature?: number;
  system?: string;
}

export interface ClaudeMessageResponse {
  id: string;
  model: string;
  role: "assistant";
  content: ClaudeTextBlock[];
  stop_reason?: string;
}

interface ClaudeErrorResponse {
  error: {
    type: string;
    message: string;
    metadata?: Record<string, unknown>;
  };
}

export async function sendClaudeMessage(
  payload: ClaudeMessageRequest,
): Promise<ClaudeMessageResponse> {
  const env = getEnv();

  const response = await fetch(CLAUDE_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": env.CLAUDE_API_KEY,
      Authorization: `Bearer ${env.CLAUDE_API_KEY}`,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: env.CLAUDE_MODEL,
      messages: payload.messages,
      max_tokens: payload.maxOutputTokens ?? 4096,
      temperature: payload.temperature ?? 0.6,
      system: payload.system,
    }),
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(async () => ({
      error: {
        type: "unknown",
        message: await response.text(),
      },
    }))) as ClaudeErrorResponse;
    const reason = errorBody?.error?.message ?? response.statusText;
    const meta = errorBody?.error?.metadata
      ? ` | metadata: ${JSON.stringify(errorBody.error.metadata)}`
      : "";
    throw new Error(`Claude API error (${response.status} - ${errorBody?.error?.type}): ${reason}${meta}`);
  }

  const data = (await response.json()) as ClaudeMessageResponse;

  return data;
}

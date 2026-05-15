import { AiMode } from "./types";

const DEFAULT_OPENAI_MODEL = "gpt-4.1-mini";
const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";

type OpenAIResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
  error?: {
    message?: string;
  };
};

export async function generateTextWithOpenAI(prompt: string, mode: AiMode): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY is not set for the Cloud Functions runtime.");
  }

  const response = await fetch(OPENAI_RESPONSES_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // Change the model, system instructions, and response format here.
      model: process.env.OPENAI_MODEL || DEFAULT_OPENAI_MODEL,
      instructions: buildInstructions(mode),
      input: prompt,
      max_output_tokens: getMaxOutputTokens(mode),
    }),
  });

  const data = (await response.json()) as OpenAIResponse;
  if (!response.ok) {
    throw new Error(data.error?.message || `OpenAI request failed: ${response.status}`);
  }

  const text = extractOutputText(data).trim();
  if (!text) {
    throw new Error("OpenAI response did not include text.");
  }

  return text;
}

function buildInstructions(mode: AiMode): string {
  switch (mode) {
    case "short":
      return "Answer briefly, clearly, and practically. Use at most 4 sentences.";
    case "creative":
      return "Answer creatively, but stay useful and accurate. Do not invent facts.";
    case "default":
      return "You are a helpful assistant for a hackathon app. Answer clearly and concisely.";
  }
}

function getMaxOutputTokens(mode: AiMode): number {
  switch (mode) {
    case "short":
      return 220;
    case "creative":
      return 900;
    case "default":
      return 600;
  }
}

function extractOutputText(response: OpenAIResponse): string {
  if (typeof response.output_text === "string") {
    return response.output_text;
  }

  return response.output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text ?? "")
    .filter(Boolean)
    .join("\n") ?? "";
}

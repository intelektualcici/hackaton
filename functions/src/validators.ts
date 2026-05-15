import { CallableRequest, HttpsError } from "firebase-functions/v2/https";
import { AI_MODES, AiMode, GenerateAiTextRequest } from "./types";

const MAX_PROMPT_LENGTH = 2000;

export function getAuthenticatedUid(request: CallableRequest): string {
  const uid = request.auth?.uid;
  if (!uid) {
    throw new HttpsError("unauthenticated", "You must be signed in.");
  }
  return uid;
}

export function validateGenerateAiTextData(data: unknown): GenerateAiTextRequest {
  if (!isRecord(data)) {
    throw new HttpsError("invalid-argument", "Payload must be an object.");
  }

  const prompt = data.prompt;
  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    throw new HttpsError("invalid-argument", "prompt must be a non-empty string.");
  }

  const trimmedPrompt = prompt.trim();
  if (trimmedPrompt.length > MAX_PROMPT_LENGTH) {
    throw new HttpsError("invalid-argument", `prompt can have at most ${MAX_PROMPT_LENGTH} characters.`);
  }

  const mode = data.mode ?? "default";
  if (!isAiMode(mode)) {
    throw new HttpsError("invalid-argument", "mode must be default, short, or creative.");
  }

  return {
    prompt: trimmedPrompt,
    mode,
  };
}

export function validateOptionalDisplayName(data: unknown): string {
  if (!isRecord(data) || typeof data.displayName !== "string") {
    return "Anonymous";
  }
  return data.displayName.trim().slice(0, 80) || "Anonymous";
}

export function toPreview(value: string, maxLength: number): string {
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > maxLength ? `${normalized.slice(0, maxLength)}...` : normalized;
}

function isAiMode(value: unknown): value is AiMode {
  return typeof value === "string" && AI_MODES.includes(value as AiMode);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

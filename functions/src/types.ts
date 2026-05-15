export const AI_MODES = ["default", "short", "creative"] as const;

export type AiMode = (typeof AI_MODES)[number];

export type GenerateAiTextRequest = {
  prompt: string;
  mode: AiMode;
};

export type GenerateAiTextResponse = {
  text: string;
  createdAt: number;
};

export type UserProfile = {
  uid: string;
  displayName: string;
  createdAt: number;
  updatedAt: number;
};

export type AiLog = {
  promptPreview: string;
  responsePreview: string;
  createdAt: number;
  mode: AiMode;
};

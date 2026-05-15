import { httpsCallable } from "firebase/functions";
import { functions } from "./firebase";

type GenerateAiTextInput = {
  prompt: string;
  mode?: "default" | "short" | "creative";
};

type GenerateAiTextOutput = {
  text: string;
  createdAt: number;
};

export async function generateAiText(prompt: string): Promise<GenerateAiTextOutput> {
  const callable = httpsCallable<GenerateAiTextInput, GenerateAiTextOutput>(
    functions,
    "generateAiText"
  );
  const result = await callable({ prompt, mode: "default" });
  return result.data;
}

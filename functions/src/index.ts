import { onCall, HttpsError } from "firebase-functions/v2/https";
import * as logger from "firebase-functions/logger";
import { rtdb } from "./firebaseAdmin";
import { generateTextWithOpenAI } from "./openaiClient";
import { AiLog, GenerateAiTextResponse, UserProfile } from "./types";
import {
  getAuthenticatedUid,
  toPreview,
  validateGenerateAiTextData,
  validateOptionalDisplayName,
} from "./validators";

export const generateAiText = onCall(
  {
    timeoutSeconds: 60,
    memory: "512MiB",
    secrets: ["OPENAI_API_KEY"],
  },
  async (request): Promise<GenerateAiTextResponse> => {
    const uid = getAuthenticatedUid(request);
    const input = validateGenerateAiTextData(request.data);

    logger.info("generateAiText requested", {
      uid,
      mode: input.mode,
      promptLength: input.prompt.length,
    });

    try {
      const text = await generateTextWithOpenAI(input.prompt, input.mode);
      const createdAt = Date.now();
      const log: AiLog = {
        promptPreview: toPreview(input.prompt, 100),
        responsePreview: toPreview(text, 200),
        createdAt,
        mode: input.mode,
      };

      await rtdb.ref(`aiLogs/${uid}`).push(log);

      return {
        text,
        createdAt,
      };
    } catch (error) {
      logger.error("generateAiText failed", {
        uid,
        message: error instanceof Error ? error.message : "Unknown error",
      });
      throw new HttpsError("internal", "AI generation failed.");
    }
  }
);

export const createUserProfileIfMissing = onCall(
  async (request): Promise<UserProfile> => {
    const uid = getAuthenticatedUid(request);
    const displayName = validateOptionalDisplayName(request.data);
    const userRef = rtdb.ref(`users/${uid}`);
    const snapshot = await userRef.get();

    if (snapshot.exists()) {
      return snapshot.val() as UserProfile;
    }

    const now = Date.now();
    const profile: UserProfile = {
      uid,
      displayName,
      createdAt: now,
      updatedAt: now,
    };

    await userRef.set(profile);
    return profile;
  }
);

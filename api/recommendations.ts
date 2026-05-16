import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { PlannerCriteria, RecommendationApiResponse } from "../src/types/planner";
import {
  fallbackRecommendationResponse,
  getFilteredRecommendations,
  recommendationsResponseSchema,
  sanitizeRankings,
} from "./shared";

const model = process.env.OPENAI_MODEL ?? "gpt-5.4-mini";

export const createRecommendationRankings = async (
  criteria: PlannerCriteria,
): Promise<RecommendationApiResponse> => {
  const filteredRecommendations = getFilteredRecommendations(criteria);
  const fallback = fallbackRecommendationResponse(criteria);

  if (!process.env.OPENAI_API_KEY || filteredRecommendations.length === 0) {
    return { recommendations: fallback, source: "fallback" };
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.responses.parse({
      model,
      input: [
        {
          role: "system",
          content:
            "You are an AI travel assistant for Split, Croatia. Use only the provided local database items. Do not invent new locations, events or prices. Rank the best matches for the user's date, time window, budget, group type and interests. Return JSON only.",
        },
        {
          role: "user",
          content: JSON.stringify(
            {
              userCriteria: criteria,
              availableRecommendations: filteredRecommendations,
              returnShape: {
                recommendations: [
                  {
                    id: "string",
                    score: "number from 0 to 100",
                    reason: "short personalized reason",
                  },
                ],
              },
            },
            null,
            2,
          ),
        },
      ],
      text: {
        format: zodTextFormat(
          recommendationsResponseSchema,
          "visit_split_recommendations",
        ),
      },
    });

    const parsed = response.output_parsed;
    if (!parsed) {
      return { recommendations: fallback, source: "fallback" };
    }

    const recommendations = sanitizeRankings(
      parsed.recommendations,
      filteredRecommendations,
      fallback,
    );

    return {
      recommendations,
      source: recommendations.length > 0 ? "ai" : "fallback",
    };
  } catch (error) {
    console.warn("OpenAI recommendation ranking failed, using fallback.", error);
    return { recommendations: fallback, source: "fallback" };
  }
};

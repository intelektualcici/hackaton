import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type { ItineraryPlan, PlannerCriteria, SelectedRecommendation } from "../src/types/planner";
import { createFallbackPlan } from "../src/utils/rankFallback";
import { planResponseSchema } from "./shared";

const model = process.env.OPENAI_MODEL ?? "gpt-5.4-mini";

export const createItineraryPlan = async (
  criteria: PlannerCriteria,
  selectedRecommendations: SelectedRecommendation[],
): Promise<ItineraryPlan> => {
  const fallback = createFallbackPlan(criteria, selectedRecommendations);

  if (!process.env.OPENAI_API_KEY || selectedRecommendations.length === 0) {
    return fallback;
  }

  try {
    const selectedIds = new Set(selectedRecommendations.map((item) => item.id));
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.responses.parse({
      model,
      input: [
        {
          role: "system",
          content:
            "You are an AI itinerary planner for Split, Croatia. Create a realistic itinerary using only the selected recommendations. Respect the user's available time, budget, group type and interests. Order the recommendations logically. Do not add locations that are not selected. Return JSON only.",
        },
        {
          role: "user",
          content: JSON.stringify(
            {
              userCriteria: criteria,
              selectedRecommendations,
              returnShape: {
                title: "string",
                summary: "string",
                timeline: [
                  {
                    time: "string",
                    recommendationId: "string",
                    title: "string",
                    description: "string",
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
        format: zodTextFormat(planResponseSchema, "visit_split_itinerary"),
      },
    });

    const parsed = response.output_parsed;
    if (!parsed) {
      return fallback;
    }

    const timeline = parsed.timeline.filter((item) =>
      selectedIds.has(item.recommendationId),
    );

    if (timeline.length === 0) {
      return fallback;
    }

    return {
      title: parsed.title,
      summary: parsed.summary,
      timeline,
      source: "ai",
    };
  } catch (error) {
    console.warn("OpenAI itinerary creation failed, using fallback.", error);
    return fallback;
  }
};

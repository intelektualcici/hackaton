import OpenAI from "openai";
import { zodTextFormat } from "openai/helpers/zod";
import type {
  ItineraryPlan,
  PlannerCriteria,
  SelectedRecommendation,
  TimelineItem,
} from "../src/types/planner";
import { createFallbackPlan } from "../src/utils/rankFallback";
import { planResponseSchema } from "./shared";

const model = process.env.OPENAI_MODEL ?? "gpt-5.4-mini";

const timeToMinutes = (time: string): number => {
  const [hours = "0", minutes = "0"] = time.split(":");
  return Number(hours) * 60 + Number(minutes);
};

const formatTime = (minutes: number): string => {
  const normalized = minutes % (24 * 60);
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
};

const ensureTimelineRanges = (
  timeline: TimelineItem[],
  criteria: PlannerCriteria,
  selectedRecommendations: SelectedRecommendation[],
): TimelineItem[] => {
  const selectedById = new Map(selectedRecommendations.map((item) => [item.id, item]));
  const windowEnd = timeToMinutes(criteria.endTime);

  return timeline.map((item) => {
    if (item.time.includes("-")) return item;

    const match = item.time.match(/(\d{1,2}):(\d{2})/);
    const selected = selectedById.get(item.recommendationId);
    if (!match || !selected) return item;

    const start = Number(match[1]) * 60 + Number(match[2]);
    const end = Math.min(windowEnd, start + selected.durationMinutes);

    return {
      ...item,
      time: `${formatTime(start)} - ${formatTime(end)}`,
    };
  });
};

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
            "You are an AI itinerary planner for Split, Croatia. Create a realistic itinerary using only the selected recommendations. Respect the user's selected date, start time, end time, budget, group type and interests. Order the recommendations logically. Do not add locations that are not selected. Return JSON only.",
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
                    time: "HH:mm - HH:mm range inside the selected time window",
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

    const timeline = ensureTimelineRanges(
      parsed.timeline.filter((item) => selectedIds.has(item.recommendationId)),
      criteria,
      selectedRecommendations,
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

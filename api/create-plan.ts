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

const getAvailableMinutes = (criteria: PlannerCriteria): number => {
  return Math.max(0, timeToMinutes(criteria.endTime) - timeToMinutes(criteria.startTime));
};

const getZone = (item: SelectedRecommendation): "center" | "east" | "west" => {
  if (item.lng < 16.431) return "west";
  if (item.lng > 16.454) return "east";
  return "center";
};

const getTravelBuffer = (
  previous: SelectedRecommendation | null,
  next: SelectedRecommendation,
): number => {
  if (!previous) return 0;
  return getZone(previous) === getZone(next) ? 5 : 10;
};

const coffeeIds = new Set(["coffee-on-riva"]);
const lunchIds = new Set([
  "pazar-snack-stop",
  "local-food-experience",
  "green-market",
  "fish-market",
]);
const afternoonIds = new Set([
  "kasjuni-beach",
  "bacvice-beach",
  "bene-beach",
  "znjan-beach",
  "marjan-hill",
  "mestrovic-gallery",
  "nature-walk",
]);
const sunsetIds = new Set([
  "vidilica",
  "sunset-viewpoint",
  "west-coast-promenade",
  "sustipan",
]);
const eveningIds = new Set([
  "dalmatian-wine-tasting",
  "fabrique-pub",
  "matejuska",
]);

const anchorTimeIfPossible = (
  cursor: number,
  target: number,
  selected: SelectedRecommendation,
  windowEnd: number,
): number => {
  if (target <= cursor) return cursor;
  return target + Math.min(selected.durationMinutes, 30) <= windowEnd ? target : cursor;
};

const getAnchoredStart = (
  cursor: number,
  selected: SelectedRecommendation,
  criteria: PlannerCriteria,
): number => {
  if (getAvailableMinutes(criteria) < 420) return cursor;

  const windowEnd = timeToMinutes(criteria.endTime);

  if (coffeeIds.has(selected.id)) {
    return anchorTimeIfPossible(cursor, 9 * 60 + 45, selected, windowEnd);
  }

  if (lunchIds.has(selected.id)) {
    return anchorTimeIfPossible(cursor, 12 * 60, selected, windowEnd);
  }

  if (afternoonIds.has(selected.id)) {
    return anchorTimeIfPossible(cursor, 14 * 60, selected, windowEnd);
  }

  if (sunsetIds.has(selected.id)) {
    return anchorTimeIfPossible(cursor, 17 * 60 + 30, selected, windowEnd);
  }

  if (eveningIds.has(selected.id)) {
    return anchorTimeIfPossible(cursor, 19 * 60, selected, windowEnd);
  }

  return cursor;
};

const createLocalGuidePrompt = (criteria: PlannerCriteria): string => {
  const basePrompt = `You are a knowledgeable local guide building a day itinerary for Split, Croatia.

ORDERING RULES
- Order stops geographically to minimize walking. Split has 3 zones: Old Town/Palace
  (center), Marjan peninsula (west), Beaches (east). Cluster nearby stops; avoid zigzagging.
- Start time: 09:00 for Full day, 14:00 for a 3h afternoon plan, 10:00 for 1h.
- Each stop's durationMinutes is provided — use it to calculate the next clock time.
  Add a 10-min travel buffer when moving between zones, 5 min within the same zone.
- The \`time\` field must be a clock string like "09:30" or "14:00". Never output
  times like "midnight" or vague strings like "morning".
- For 6h+ plans, create a real day rhythm when selectedRecommendations allow it:
  Old Town/Riva/coffee in the morning, food around lunch, beach/Marjan or another
  outdoor activity in the afternoon, then sunset or dinner/nightlife later.
- Do not keep every stop in the palace core unless selectedRecommendations only include
  palace-core items.

MEAL LOGIC
- Coffee/breakfast stops: 08:30–10:00 only.
- Lunch food stops: 12:00–14:00 only.
- Dinner / nightlife stops: 19:00 or later — only include if time budget allows.
- Do not schedule a restaurant or bar as the first stop of the day unless it's breakfast.

BUDGET
- User budget: €${criteria.budgetMin}–€${criteria.budgetMax} for the group.
- Sum the priceMax of selected stops. If the total exceeds budgetMax, add one sentence
  to the summary warning them and suggest which stop to skip or do on a budget.

DESCRIPTIONS
- Each stop description (1–2 sentences) must be practical, locally-flavoured guidance:
  what to do there, what to order, what to watch for — not a repeat of the place name.

OUTPUT RULES
- Use ONLY the recommendationIds from selectedRecommendations.
- Plan title: specific and evocative for this group, e.g. "A Golden Afternoon in Split
  for Two" — not a generic "Split Itinerary".
- Summary: one sentence setting the mood and pace. Max 200 chars.`;

  const additionalDetails = criteria.additionalDetails?.trim();

  if (!additionalDetails) {
    return basePrompt;
  }

  return `${basePrompt}

ADDITIONAL USER DETAILS
${additionalDetails}`;
};

const scheduleTimeline = (
  timeline: TimelineItem[],
  criteria: PlannerCriteria,
  selectedRecommendations: SelectedRecommendation[],
): TimelineItem[] => {
  const selectedById = new Map(selectedRecommendations.map((item) => [item.id, item]));
  const windowEnd = timeToMinutes(criteria.endTime);
  let cursor = timeToMinutes(criteria.startTime);
  let previous: SelectedRecommendation | null = null;

  return timeline.flatMap((item) => {
    const selected = selectedById.get(item.recommendationId);
    if (!selected) return [];

    cursor += getTravelBuffer(previous, selected);
    cursor = getAnchoredStart(cursor, selected, criteria);
    if (cursor >= windowEnd) return [];

    const start = cursor;
    const end = Math.min(windowEnd, start + selected.durationMinutes);
    if (end - start < 15) return [];

    cursor = end;
    previous = selected;

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
          content: createLocalGuidePrompt(criteria),
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

    const selectedOrder = new Map(
      selectedRecommendations.map((item, index) => [item.id, index]),
    );
    const orderedTimeline = parsed.timeline
      .filter((item) => selectedIds.has(item.recommendationId))
      .sort(
        (a, b) =>
          (selectedOrder.get(a.recommendationId) ?? 999) -
          (selectedOrder.get(b.recommendationId) ?? 999),
      );
    const timeline = scheduleTimeline(
      orderedTimeline,
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

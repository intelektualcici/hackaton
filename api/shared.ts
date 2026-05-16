import { readFileSync } from "node:fs";
import path from "node:path";
import { z } from "zod";
import { filterRecommendations } from "../src/utils/filterRecommendations";
import { rankFallback } from "../src/utils/rankFallback";
import type { PlannerCriteria, RankedRecommendation } from "../src/types/planner";
import type { Recommendation } from "../src/types/recommendation";

export const criteriaSchema = z.object({
  time: z.enum(["1h", "3h", "Full day"]),
  budgetMin: z.number().min(0),
  budgetMax: z.number().min(0),
  group: z.enum(["solo", "couple", "friends", "family"]),
  interests: z.array(
    z.enum(["food", "beaches", "history", "nightlife", "events", "nature"]),
  ),
});

export const selectedRecommendationSchema = z.object({
  id: z.string(),
  title: z.string(),
  lat: z.number(),
  lng: z.number(),
  durationMinutes: z.number().positive(),
  googleMapsUrl: z.string().optional(),
  category: z.enum(["food", "beaches", "history", "nightlife", "events", "nature"]),
  address: z.string(),
  priceMin: z.number().min(0),
  priceMax: z.number().min(0),
});

export const rankedRecommendationSchema = z.object({
  id: z.string(),
  score: z.number().min(0).max(100),
  reason: z.string().min(1).max(220),
});

export const recommendationsResponseSchema = z.object({
  recommendations: z.array(rankedRecommendationSchema),
});

export const timelineItemSchema = z.object({
  time: z.string().min(1).max(40),
  recommendationId: z.string(),
  title: z.string().min(1).max(120),
  description: z.string().min(1).max(260),
});

export const planResponseSchema = z.object({
  title: z.string().min(1).max(120),
  summary: z.string().min(1).max(240),
  timeline: z.array(timelineItemSchema),
});

let cachedRecommendations: Recommendation[] | undefined;

export const loadRecommendations = (): Recommendation[] => {
  if (!cachedRecommendations) {
    const dataPath = path.join(process.cwd(), "src/data/recommendations.json");
    cachedRecommendations = JSON.parse(
      readFileSync(dataPath, "utf8"),
    ) as Recommendation[];
  }

  return cachedRecommendations;
};

export const getFilteredRecommendations = (
  criteria: PlannerCriteria,
): Recommendation[] => {
  return filterRecommendations(loadRecommendations(), criteria);
};

export const fallbackRecommendationResponse = (
  criteria: PlannerCriteria,
  limit = 12,
): RankedRecommendation[] => {
  const filtered = getFilteredRecommendations(criteria);
  const source = filtered.length > 0 ? filtered : loadRecommendations();

  return rankFallback(source, criteria).slice(0, limit);
};

export const sanitizeRankings = (
  rankings: RankedRecommendation[],
  allowedRecommendations: Recommendation[],
  fallback: RankedRecommendation[],
  limit = 12,
): RankedRecommendation[] => {
  const allowedIds = new Set(allowedRecommendations.map((item) => item.id));
  const seen = new Set<string>();
  const sanitized = rankings
    .filter((item) => allowedIds.has(item.id))
    .filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    })
    .map((item) => ({
      id: item.id,
      score: Math.round(Math.max(0, Math.min(100, item.score))),
      reason: item.reason,
    }));

  for (const item of fallback) {
    if (!seen.has(item.id) && allowedIds.has(item.id)) {
      sanitized.push(item);
      seen.add(item.id);
    }
  }

  return sanitized.slice(0, limit);
};

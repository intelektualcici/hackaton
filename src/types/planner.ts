import type { GroupType, Recommendation, RecommendationCategory } from "./recommendation";

export type TimeOption = "1h" | "3h" | "Full day";

export interface PlannerCriteria {
  time: TimeOption;
  budgetMin: number;
  budgetMax: number;
  group: GroupType;
  interests: RecommendationCategory[];
}

export interface RankedRecommendation {
  id: string;
  score: number;
  reason: string;
}

export interface DisplayRecommendation {
  recommendation: Recommendation;
  score: number;
  reason: string;
}

export interface SelectedRecommendation {
  id: Recommendation["id"];
  title: Recommendation["title"];
  lat: Recommendation["lat"];
  lng: Recommendation["lng"];
  durationMinutes: Recommendation["durationMinutes"];
  googleMapsUrl?: Recommendation["googleMapsUrl"];
  category: Recommendation["category"];
  address: Recommendation["address"];
  priceMin: Recommendation["priceMin"];
  priceMax: Recommendation["priceMax"];
}

export interface TimelineItem {
  time: string;
  recommendationId: string;
  title: string;
  description: string;
}

export interface ItineraryPlan {
  title: string;
  summary: string;
  timeline: TimelineItem[];
  source?: "ai" | "fallback";
}

export interface RecommendationApiResponse {
  recommendations: RankedRecommendation[];
  source: "ai" | "fallback";
}

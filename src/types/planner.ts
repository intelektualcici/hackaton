import type { GroupType, Recommendation, RecommendationCategory } from "./recommendation";

export interface PlannerCriteria {
  date: string;
  startTime: string;
  endTime: string;
  budgetMin: number;
  budgetMax: number;
  group: GroupType;
  interests: RecommendationCategory[];
  additionalDetails?: string;
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

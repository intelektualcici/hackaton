export type RecommendationCategory =
  | "food"
  | "beaches"
  | "history"
  | "nightlife"
  | "events"
  | "nature";

export type RecommendationType = "location" | "experience" | "event";

export type GroupType = "solo" | "couple" | "friends" | "family";

export interface Recommendation {
  id: string;
  title: string;
  type: RecommendationType;
  category: RecommendationCategory;
  description: string;
  lat: number;
  lng: number;
  address: string;
  priceMin: number;
  priceMax: number;
  durationMinutes: number;
  suitableFor: GroupType[];
  interests: RecommendationCategory[];
  tags: string[];
  imageUrl: string;
  googleMapsUrl: string;
}

export const categoryMeta: Record<
  RecommendationCategory,
  { label: string; emoji: string; color: string; marker: string }
> = {
  food: {
    label: "Food",
    emoji: "🍽️",
    color: "bg-sun-100 text-sun-700 ring-sun-200",
    marker: "#f59e32",
  },
  beaches: {
    label: "Beaches",
    emoji: "🏖️",
    color: "bg-cyan-100 text-sea-700 ring-cyan-200",
    marker: "#0e8fb4",
  },
  history: {
    label: "History",
    emoji: "🏛️",
    color: "bg-indigo-100 text-indigo-700 ring-indigo-200",
    marker: "#6366f1",
  },
  nightlife: {
    label: "Nightlife",
    emoji: "🌙",
    color: "bg-violet-100 text-violet-700 ring-violet-200",
    marker: "#7c3aed",
  },
  events: {
    label: "Events",
    emoji: "🎟️",
    color: "bg-rose-100 text-rose-700 ring-rose-200",
    marker: "#f43f5e",
  },
  nature: {
    label: "Nature",
    emoji: "🌿",
    color: "bg-emerald-100 text-emerald-700 ring-emerald-200",
    marker: "#10b981",
  },
};

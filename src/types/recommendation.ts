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
    marker: "#F4B24A",
  },
  beaches: {
    label: "Beaches",
    emoji: "🏖️",
    color: "bg-sea-100 text-sea-700 ring-sea-500/20",
    marker: "#2F8FA3",
  },
  history: {
    label: "History",
    emoji: "🏛️",
    color: "bg-sand-100 text-navy-900 ring-navy-900/15",
    marker: "#111512",
  },
  nightlife: {
    label: "Nightlife",
    emoji: "🌙",
    color: "bg-navy-900 text-sand-50 ring-navy-900/20",
    marker: "#111512",
  },
  events: {
    label: "Events",
    emoji: "🎟️",
    color: "bg-sun-200 text-navy-900 ring-sun-500/30",
    marker: "#F4B24A",
  },
  nature: {
    label: "Nature",
    emoji: "🌿",
    color: "bg-sea-50 text-sea-700 ring-sea-500/20",
    marker: "#2F8FA3",
  },
};

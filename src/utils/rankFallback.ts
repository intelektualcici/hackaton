import type {
  ItineraryPlan,
  PlannerCriteria,
  RankedRecommendation,
  SelectedRecommendation,
} from "../types/planner";
import type { Recommendation } from "../types/recommendation";
import {
  formatTimeWindow,
  getAvailableMinutes,
  timeStringToMinutes,
} from "./filterRecommendations";

const cityCenterTags = new Set(["city-center", "walkable", "old-town", "riva"]);

const getTimeOfDayBoost = (
  item: Recommendation,
  criteria: PlannerCriteria,
): number => {
  const start = timeStringToMinutes(criteria.startTime);

  if (start >= 18 * 60) {
    if (item.category === "nightlife" || item.category === "events") return 14;
    if (item.category === "food") return 8;
    return 0;
  }

  if (start >= 12 * 60) {
    if (item.category === "beaches" || item.category === "nature") return 10;
    if (item.category === "food") return 6;
    return 0;
  }

  if (item.category === "history" || item.category === "nature") return 8;
  if (item.category === "food") return 4;
  return 0;
};

const getAdditionalDetailsBoost = (
  item: Recommendation,
  criteria: PlannerCriteria,
): number => {
  const details = criteria.additionalDetails?.toLowerCase() ?? "";
  if (!details) return 0;

  const categoryHints: Record<Recommendation["category"], string[]> = {
    food: ["food", "lunch", "dinner", "restaurant", "eat", "ručak", "rucak", "večera", "vecera"],
    beaches: ["beach", "swim", "sea", "plaža", "plaza", "more", "kupanje"],
    history: ["history", "historic", "old town", "palace", "povijest", "povijes", "znamenit"],
    nightlife: ["night", "bar", "drink", "cocktail", "party", "noć", "noc", "izlazak"],
    events: ["event", "music", "concert", "show", "theatre", "događaj", "dogadaj", "koncert"],
    nature: ["nature", "walk", "view", "sunset", "park", "priroda", "šetnja", "setnja"],
  };

  return categoryHints[item.category].some((hint) => details.includes(hint)) ? 12 : 0;
};

export const rankFallback = (
  recommendations: Recommendation[],
  criteria: PlannerCriteria,
): RankedRecommendation[] => {
  const availableMinutes = getAvailableMinutes(criteria);

  return recommendations
    .map((item) => {
      const interestHits = item.interests.filter((interest) =>
        criteria.interests.includes(interest),
      ).length;
      const tagBoost = item.tags.some((tag) => cityCenterTags.has(tag)) ? 8 : 0;
      const groupBoost = item.suitableFor.includes(criteria.group) ? 16 : 0;
      const budgetBoost =
        item.priceMin <= criteria.budgetMax && item.priceMax >= criteria.budgetMin
          ? 20
          : 0;
      const durationBoost =
        item.durationMinutes <= availableMinutes
          ? Math.max(4, 16 - Math.floor(item.durationMinutes / 30))
          : 0;
      const interestBoost = interestHits * 20;
      const timeOfDayBoost = getTimeOfDayBoost(item, criteria);
      const additionalDetailsBoost = getAdditionalDetailsBoost(item, criteria);

      return {
        id: item.id,
        score: Math.min(
          99,
          38 +
            interestBoost +
            groupBoost +
            budgetBoost +
            durationBoost +
            tagBoost +
            timeOfDayBoost +
            additionalDetailsBoost,
        ),
        reason:
          "This matches your selected interests, budget, group type and time window.",
      };
    })
    .sort((a, b) => b.score - a.score);
};

const minutesToRange = (start: number, duration: number): string => {
  const format = (minutes: number) => {
    const normalized = minutes % (24 * 60);
    const hours = Math.floor(normalized / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  };

  return `${format(start)} - ${format(start + duration)}`;
};

const fallbackSummary = (criteria: PlannerCriteria): string => {
  const interests = criteria.interests.join(", ");
  const details = criteria.additionalDetails
    ? ` Extra guidance: ${criteria.additionalDetails}`
    : "";
  const groupLabel =
    criteria.group === "family"
      ? "family"
      : criteria.group === "friends"
        ? "friends"
        : criteria.group === "couple"
          ? "two"
          : "solo traveler";

  return `A walkable ${formatTimeWindow(criteria)} Split plan for ${groupLabel}, tuned around ${interests || "local highlights"}.${details}`;
};

export const createFallbackPlan = (
  criteria: PlannerCriteria,
  selectedRecommendations: SelectedRecommendation[],
): ItineraryPlan => {
  const maxMinutes = getAvailableMinutes(criteria);
  const startMinutes = timeStringToMinutes(criteria.startTime);
  const totalSelectedMinutes = selectedRecommendations.reduce(
    (sum, item) => sum + item.durationMinutes,
    0,
  );
  let elapsed = 0;

  const timeline = selectedRecommendations.map((item, index) => {
    const remainingItems = selectedRecommendations.length - index;
    const remainingMinutes = Math.max(20 * remainingItems, maxMinutes - elapsed);
    const suggestedDuration =
      totalSelectedMinutes > maxMinutes
        ? Math.max(20, Math.round((remainingMinutes / remainingItems) / 5) * 5)
        : item.durationMinutes;
    const duration =
      index === selectedRecommendations.length - 1
        ? Math.max(20, maxMinutes - elapsed)
        : Math.min(suggestedDuration, Math.max(20, maxMinutes - elapsed - 20));
    const time = minutesToRange(startMinutes + elapsed, duration);
    elapsed += duration;

    return {
      time,
      recommendationId: item.id,
      title: item.title,
      description:
        index === 0
          ? `Start with ${item.title}, a strong match for your Split preferences.`
          : `Continue to ${item.title} and keep the plan relaxed, walkable and demo-friendly.`,
    };
  });

  const groupLabel =
    criteria.group === "couple"
      ? "for two"
      : criteria.group === "family"
        ? "for the family"
        : criteria.group === "friends"
          ? "with friends"
          : "solo";

  return {
    title: `A relaxed ${formatTimeWindow(criteria)} Split plan ${groupLabel}`,
    summary: fallbackSummary(criteria),
    timeline,
    source: "fallback",
  };
};

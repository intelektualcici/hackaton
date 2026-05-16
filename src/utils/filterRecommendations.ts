import type { PlannerCriteria, TimeOption } from "../types/planner";
import type { Recommendation } from "../types/recommendation";

export const timeToMinutes = (time: TimeOption): number => {
  if (time === "1h") return 60;
  if (time === "3h") return 180;
  return 480;
};

export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;
  return remainder === 0 ? `${hours}h` : `${hours}h ${remainder}m`;
};

export const formatPriceRange = (min: number, max: number): string => {
  if (min === 0 && max === 0) return "Free";
  if (min === max) return `€${min}`;
  return `€${min}–${max}`;
};

export const filterRecommendations = (
  recommendations: Recommendation[],
  criteria: PlannerCriteria,
): Recommendation[] => {
  const availableMinutes = timeToMinutes(criteria.time);

  return recommendations.filter((item) => {
    const budgetMatches =
      item.priceMin <= criteria.budgetMax && item.priceMax >= criteria.budgetMin;
    const groupMatches = item.suitableFor.includes(criteria.group);
    const interestMatches =
      criteria.interests.length === 0 ||
      item.interests.some((interest) => criteria.interests.includes(interest));
    const durationMatches = item.durationMinutes <= availableMinutes;

    return budgetMatches && groupMatches && interestMatches && durationMatches;
  });
};

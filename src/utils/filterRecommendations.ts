import type { PlannerCriteria } from "../types/planner";
import type { Recommendation } from "../types/recommendation";

export const timeStringToMinutes = (time: string): number => {
  const [hours = "0", minutes = "0"] = time.split(":");
  return Number(hours) * 60 + Number(minutes);
};

export const getAvailableMinutes = (criteria: PlannerCriteria): number => {
  const start = timeStringToMinutes(criteria.startTime);
  const end = timeStringToMinutes(criteria.endTime);
  return Math.max(0, end - start);
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

export const formatTimeWindow = (criteria: PlannerCriteria): string => {
  if (!criteria.date) return `${criteria.startTime} - ${criteria.endTime}`;

  const date = new Date(`${criteria.date}T00:00:00`);
  const dateLabel = new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
  }).format(date);

  return `${dateLabel}, ${criteria.startTime} - ${criteria.endTime}`;
};

export const filterRecommendations = (
  recommendations: Recommendation[],
  criteria: PlannerCriteria,
): Recommendation[] => {
  const availableMinutes = getAvailableMinutes(criteria);

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

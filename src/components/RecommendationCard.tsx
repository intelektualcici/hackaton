import { Check, Clock3, Euro, MapPin } from "lucide-react";
import { motion } from "motion/react";
import type { DisplayRecommendation } from "../types/planner";
import { categoryMeta } from "../types/recommendation";
import { formatDuration, formatPriceRange } from "../utils/filterRecommendations";

interface RecommendationCardProps {
  item: DisplayRecommendation;
  isSelected: boolean;
  isActive: boolean;
  onToggle: (id: string) => void;
  onFocus: (id: string) => void;
  onHover: (id: string | null) => void;
}

const RecommendationCard = ({
  item,
  isSelected,
  isActive,
  onToggle,
  onFocus,
  onHover,
}: RecommendationCardProps) => {
  const recommendation = item.recommendation;
  const meta = categoryMeta[recommendation.category];

  return (
    <motion.article
      layout
      whileHover={{ y: -4 }}
      onMouseEnter={() => onHover(recommendation.id)}
      onMouseLeave={() => onHover(null)}
      onClick={() => onFocus(recommendation.id)}
      className={`cursor-pointer rounded-lg border bg-white p-4 shadow-sm transition ${
        isSelected
          ? "border-sun-500 shadow-lift"
          : isActive
            ? "border-sea-500 shadow-lift"
            : "border-navy-900/10 hover:border-sea-500/40 hover:shadow-card"
      }`}
    >
      <div className="flex items-start gap-4">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onToggle(recommendation.id);
          }}
          className={`mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border transition focus:outline-none focus:ring-4 focus:ring-sun-500/25 ${
            isSelected
              ? "border-sun-500 bg-sun-500 text-navy-900"
              : "border-navy-900/20 bg-white text-transparent"
          }`}
          aria-label={`${isSelected ? "Deselect" : "Select"} ${recommendation.title}`}
          aria-pressed={isSelected}
        >
          <Check className="h-4 w-4" aria-hidden="true" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-heading text-lg font-extrabold text-navy-900">
              {recommendation.title}
            </h3>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-extrabold ring-1 ${meta.color}`}
            >
              <span aria-hidden="true">{meta.emoji}</span>
              {meta.label}
            </span>
          </div>

          <div className="mt-3 flex flex-wrap gap-3 text-sm font-bold text-navy-700">
            <span className="inline-flex items-center gap-1.5">
              <Clock3 className="h-4 w-4 text-sea-600" aria-hidden="true" />
              {formatDuration(recommendation.durationMinutes)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Euro className="h-4 w-4 text-sea-600" aria-hidden="true" />
              {formatPriceRange(recommendation.priceMin, recommendation.priceMax)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-sea-600" aria-hidden="true" />
              {recommendation.address}
            </span>
          </div>

          <p className="mt-3 text-sm leading-6 text-navy-700">
            {recommendation.description}
          </p>

          <div className="mt-4 rounded-lg bg-sand-50 p-3">
            <p className="text-xs font-extrabold uppercase text-sea-700">
              Why this fits
            </p>
            <p className="mt-1 text-sm leading-6 text-navy-800">{item.reason}</p>
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default RecommendationCard;

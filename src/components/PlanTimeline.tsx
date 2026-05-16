import { Clock3, Euro, MapPin, MapPinned } from "lucide-react";
import { motion } from "motion/react";
import type {
  DisplayRecommendation,
  ItineraryPlan,
  SelectedRecommendation,
} from "../types/planner";
import { categoryMeta } from "../types/recommendation";
import { formatDuration, formatPriceRange } from "../utils/filterRecommendations";
import SplitMap from "./SplitMap";

interface PlanTimelineProps {
  plan: ItineraryPlan | null;
  items: DisplayRecommendation[];
  selectedRecommendations: SelectedRecommendation[];
  activeId: string | null;
  onFocus: (id: string) => void;
  onHover: (id: string | null) => void;
}

const PlanTimeline = ({
  plan,
  items,
  selectedRecommendations,
  activeId,
  onFocus,
  onHover,
}: PlanTimelineProps) => {
  if (!plan) return null;

  const selectedById = new Map(
    selectedRecommendations.map((item) => [item.id, item]),
  );
  const reasonById = new Map(
    items.map((item) => [item.recommendation.id, item.reason]),
  );
  const itemById = new Map(items.map((item) => [item.recommendation.id, item]));
  const roadmapItems = plan.timeline
    .map((item) => itemById.get(item.recommendationId))
    .filter((item): item is DisplayRecommendation => Boolean(item));
  const selectedIds = new Set(selectedRecommendations.map((item) => item.id));

  return (
    <section id="final-plan" className="px-5 pb-20 pt-10 sm:px-8 lg:px-12">
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="mx-auto max-w-7xl"
      >
        <p className="text-sm font-bold uppercase text-sea-600">Your Plan</p>
        <h2 className="mt-2 font-heading text-3xl font-extrabold text-navy-900 sm:text-4xl">
          {plan.title}
        </h2>
        <p className="mt-4 text-lg leading-8 text-navy-700">{plan.summary}</p>

        <div className="mt-9 grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="lg:sticky lg:top-6 lg:self-start">
            <SplitMap
              items={roadmapItems}
              selectedIds={selectedIds}
              activeId={activeId}
              onMarkerFocus={onFocus}
            />
          </div>

          <div className="rounded-lg bg-sand-50 p-5 shadow-card sm:p-8">
            <div className="relative space-y-6 before:absolute before:left-[17px] before:top-4 before:h-[calc(100%-2rem)] before:w-px before:bg-sea-500/25">
              {plan.timeline.map((item, index) => {
                const selected = selectedById.get(item.recommendationId);
                const meta = selected ? categoryMeta[selected.category] : null;
                const reason = reasonById.get(item.recommendationId);
                const isActive = activeId === item.recommendationId;

                return (
                  <motion.div
                    key={`${item.recommendationId}-${item.time}`}
                    initial={{ opacity: 0, x: -18 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: "-80px" }}
                    transition={{ delay: index * 0.08, duration: 0.45 }}
                    className="relative grid grid-cols-[36px_1fr] gap-4"
                    onMouseEnter={() => onHover(item.recommendationId)}
                    onMouseLeave={() => onHover(null)}
                    onClick={() => onFocus(item.recommendationId)}
                  >
                    <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-sea-600 text-sand-50 shadow-card">
                      <MapPinned className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <article
                      className={`cursor-pointer rounded-lg border bg-sand-50 p-4 transition ${
                        isActive
                          ? "border-sea-500 shadow-lift"
                          : "border-navy-900/10 hover:border-sea-500/40 hover:shadow-card"
                      }`}
                    >
                      <p className="text-sm font-extrabold text-sea-700">
                        {item.time}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3">
                        <h3 className="font-heading text-xl font-extrabold text-navy-900">
                          {item.title}
                        </h3>
                        {meta && (
                          <span
                            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-extrabold ring-1 ${meta.color}`}
                          >
                            <span aria-hidden="true">{meta.emoji}</span>
                            {meta.label}
                          </span>
                        )}
                      </div>
                      {selected && (
                        <div className="mt-4 flex flex-wrap gap-4 text-sm font-extrabold text-navy-700">
                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 className="h-4 w-4 text-sea-600" aria-hidden="true" />
                            {formatDuration(selected.durationMinutes)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <Euro className="h-4 w-4 text-sea-600" aria-hidden="true" />
                            {formatPriceRange(selected.priceMin, selected.priceMax)}
                          </span>
                          <span className="inline-flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 text-sea-600" aria-hidden="true" />
                            {selected.address}
                          </span>
                        </div>
                      )}
                      <p className="mt-3 text-sm leading-6 text-navy-700">
                        {item.description}
                      </p>
                      {reason && (
                        <div className="mt-4 rounded-lg bg-sea-50 p-3">
                          <p className="text-xs font-extrabold uppercase tracking-wide text-sea-700">
                            Why this fits
                          </p>
                          <p className="mt-1 text-sm font-semibold leading-6 text-navy-800">
                            {reason}
                          </p>
                        </div>
                      )}
                    </article>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default PlanTimeline;

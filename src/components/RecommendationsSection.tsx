import { AnimatePresence, motion } from "motion/react";
import type { DisplayRecommendation } from "../types/planner";
import LoadingState from "./LoadingState";
import RecommendationCard from "./RecommendationCard";
import SplitMap from "./SplitMap";

interface RecommendationsSectionProps {
  items: DisplayRecommendation[];
  selectedIds: Set<string>;
  activeId: string | null;
  isLoading: boolean;
  isCreatingPlan: boolean;
  onToggle: (id: string) => void;
  onFocus: (id: string) => void;
  onHover: (id: string | null) => void;
  onCreatePlan: () => void;
}

const RecommendationsSection = ({
  items,
  selectedIds,
  activeId,
  isLoading,
  isCreatingPlan,
  onToggle,
  onFocus,
  onHover,
  onCreatePlan,
}: RecommendationsSectionProps) => {
  if (isLoading) {
    return (
      <section className="px-5 py-8 sm:px-8 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <LoadingState text="Finding the best Split experiences for you..." />
        </div>
      </section>
    );
  }

  if (items.length === 0) return null;

  const selectedCount = selectedIds.size;

  return (
    <section id="recommendations" className="px-5 py-12 sm:px-8 lg:px-12">
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-7xl"
      >
        <div className="mb-7 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <h2 className="font-heading text-3xl font-extrabold text-navy-900 sm:text-4xl">
              Recommended for you
            </h2>
          </div>
          <div className="max-w-xl rounded-lg border border-sea-500/20 bg-sea-50 px-5 py-4 shadow-sm">
            <p className="text-sm font-extrabold uppercase tracking-wide text-sea-700">
              Your picks control the plan
            </p>
            <p className="mt-2 text-base font-bold leading-7 text-navy-900">
              Select the experiences you like. Visit Split will only use your
              picks when it creates the final itinerary.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="order-2 lg:order-1">
            <SplitMap
              items={items}
              selectedIds={selectedIds}
              activeId={activeId}
              onMarkerFocus={onFocus}
            />
          </div>

          <div className="order-1 flex flex-col gap-4 lg:order-2">
            <div className="visit-scrollbar max-h-[680px] space-y-4 overflow-y-auto pr-1">
              <AnimatePresence>
                {items.map((item) => (
                  <RecommendationCard
                    key={item.recommendation.id}
                    item={item}
                    isSelected={selectedIds.has(item.recommendation.id)}
                    isActive={activeId === item.recommendation.id}
                    onToggle={onToggle}
                    onFocus={onFocus}
                    onHover={onHover}
                  />
                ))}
              </AnimatePresence>
            </div>

            <AnimatePresence>
              {selectedCount > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 14 }}
                  className="rounded-lg border border-sun-500/30 bg-sand-50 p-4 shadow-card"
                >
                  <button
                    type="button"
                    onClick={onCreatePlan}
                    disabled={isCreatingPlan}
                    className="flex w-full items-center justify-center gap-3 rounded-lg bg-sun-500 px-5 py-4 text-base font-extrabold text-navy-900 transition hover:-translate-y-0.5 hover:bg-sun-400 focus:outline-none focus:ring-4 focus:ring-sun-500/25 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {isCreatingPlan
                      ? "Creating your personalized Split plan..."
                      : `Create my plan with ${selectedCount} selected`}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </section>
  );
};

export default RecommendationsSection;

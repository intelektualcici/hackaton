import { ExternalLink, Flag, MapPinned } from "lucide-react";
import { motion } from "motion/react";
import type { ItineraryPlan, SelectedRecommendation } from "../types/planner";

interface PlanTimelineProps {
  plan: ItineraryPlan | null;
  selectedRecommendations: SelectedRecommendation[];
}

const PlanTimeline = ({ plan, selectedRecommendations }: PlanTimelineProps) => {
  if (!plan) return null;

  const selectedById = new Map(
    selectedRecommendations.map((item) => [item.id, item]),
  );

  return (
    <section id="final-plan" className="px-5 pb-20 pt-10 sm:px-8 lg:px-12">
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55 }}
        className="mx-auto max-w-4xl"
      >
        <p className="text-sm font-bold uppercase text-sea-600">Your Split Plan</p>
        <h2 className="mt-2 font-heading text-3xl font-extrabold text-navy-900 sm:text-4xl">
          {plan.title}
        </h2>
        <p className="mt-4 text-lg leading-8 text-navy-700">{plan.summary}</p>

        <div className="mt-9 rounded-lg bg-white p-5 shadow-card sm:p-8">
          <div className="relative space-y-6 before:absolute before:left-[17px] before:top-4 before:h-[calc(100%-2rem)] before:w-px before:bg-sea-500/25">
            {plan.timeline.map((item, index) => {
              const selected = selectedById.get(item.recommendationId);
              return (
                <motion.div
                  key={`${item.recommendationId}-${item.time}`}
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ delay: index * 0.08, duration: 0.45 }}
                  className="relative grid grid-cols-[36px_1fr] gap-4"
                >
                  <div className="relative z-10 flex h-9 w-9 items-center justify-center rounded-full bg-sea-600 text-white shadow-card">
                    <MapPinned className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <div className="rounded-lg border border-navy-900/10 bg-sand-50 p-4">
                    <p className="text-sm font-extrabold text-sea-700">
                      {item.time}
                    </p>
                    <h3 className="mt-1 font-heading text-xl font-extrabold text-navy-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-navy-700">
                      {item.description}
                    </p>
                    {selected?.googleMapsUrl && (
                      <a
                        href={selected.googleMapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-white px-3 py-2 text-sm font-extrabold text-sea-700 ring-1 ring-sea-500/20 transition hover:bg-sea-50"
                      >
                        Open in Google Maps
                        <ExternalLink className="h-4 w-4" aria-hidden="true" />
                      </a>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 flex items-center justify-center gap-3 rounded-lg bg-navy-900 px-5 py-5 text-center text-white shadow-card"
        >
          <Flag className="h-5 w-5 text-sun-400" aria-hidden="true" />
          <p className="font-heading text-lg font-extrabold">
            Visit Split — AI-powered local planning for tourists
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
};

export default PlanTimeline;

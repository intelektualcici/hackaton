import { useRef, useState } from "react";
import Hero from "./components/Hero";
import LoadingState from "./components/LoadingState";
import PlannerForm from "./components/PlannerForm";
import PlanTimeline from "./components/PlanTimeline";
import recommendationsJson from "./data/recommendations.json";
import type {
  DisplayRecommendation,
  ItineraryPlan,
  PlannerCriteria,
  RecommendationApiResponse,
  RankedRecommendation,
  SelectedRecommendation,
} from "./types/planner";
import type { Recommendation } from "./types/recommendation";
import {
  filterRecommendations,
  getAvailableMinutes,
} from "./utils/filterRecommendations";
import { createFallbackPlan, rankFallback } from "./utils/rankFallback";

const allRecommendations = recommendationsJson as Recommendation[];

const joinRankings = (
  rankings: RankedRecommendation[],
  source: Recommendation[],
): DisplayRecommendation[] => {
  const byId = new Map(source.map((item) => [item.id, item]));

  return rankings
    .map((ranking) => {
      const recommendation = byId.get(ranking.id);
      if (!recommendation) return null;
      return {
        recommendation,
        score: ranking.score,
        reason: ranking.reason,
      };
    })
    .filter((item): item is DisplayRecommendation => Boolean(item));
};

const requestRecommendations = async (
  criteria: PlannerCriteria,
): Promise<RecommendationApiResponse> => {
  const response = await fetch("/api/recommendations", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(criteria),
  });

  if (!response.ok) {
    throw new Error("Recommendation request failed");
  }

  return (await response.json()) as RecommendationApiResponse;
};

const requestPlan = async (
  criteria: PlannerCriteria,
  selectedRecommendations: SelectedRecommendation[],
): Promise<ItineraryPlan> => {
  const response = await fetch("/api/create-plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ criteria, selectedRecommendations }),
  });

  if (!response.ok) {
    throw new Error("Plan request failed");
  }

  return (await response.json()) as ItineraryPlan;
};

const toSelectedRecommendation = (
  recommendation: Recommendation,
): SelectedRecommendation => ({
  id: recommendation.id,
  title: recommendation.title,
  lat: recommendation.lat,
  lng: recommendation.lng,
  durationMinutes: recommendation.durationMinutes,
  category: recommendation.category,
  address: recommendation.address,
  priceMin: recommendation.priceMin,
  priceMax: recommendation.priceMax,
});

const choosePlanRecommendations = (
  items: DisplayRecommendation[],
  criteria: PlannerCriteria,
): DisplayRecommendation[] => {
  const availableMinutes = getAvailableMinutes(criteria);
  const selected: DisplayRecommendation[] = [];
  let usedMinutes = 0;

  for (const item of items) {
    if (selected.length >= 5) break;

    const nextDuration = item.recommendation.durationMinutes;
    const fitsWindow = usedMinutes + nextDuration <= availableMinutes;
    const needsMinimumPlan = selected.length < 2 && nextDuration <= availableMinutes;

    if (fitsWindow || needsMinimumPlan) {
      selected.push(item);
      usedMinutes += nextDuration;
    }

    if (selected.length >= 2 && usedMinutes >= availableMinutes * 0.82) break;
  }

  return selected.length > 0 ? selected : items.slice(0, 3);
};

const App = () => {
  const planRef = useRef<HTMLDivElement | null>(null);

  const [planRecommendations, setPlanRecommendations] = useState<
    DisplayRecommendation[]
  >([]);
  const [selectedRecommendations, setSelectedRecommendations] = useState<
    SelectedRecommendation[]
  >([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [plan, setPlan] = useState<ItineraryPlan | null>(null);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);

  const handleCreatePlanFromCriteria = async (nextCriteria: PlannerCriteria) => {
    setIsCreatingPlan(true);
    setPlan(null);
    setPlanRecommendations([]);
    setSelectedRecommendations([]);
    setActiveId(null);

    const locallyFiltered = filterRecommendations(allRecommendations, nextCriteria);
    const source = locallyFiltered.length > 0 ? locallyFiltered : allRecommendations;

    let rankedRecommendations: DisplayRecommendation[];

    try {
      const result = await requestRecommendations(nextCriteria);
      const joined = joinRankings(result.recommendations, allRecommendations);
      rankedRecommendations =
        joined.length > 0
          ? joined
          : joinRankings(rankFallback(source, nextCriteria).slice(0, 12), source);
    } catch {
      rankedRecommendations = joinRankings(
        rankFallback(source, nextCriteria).slice(0, 12),
        source,
      );
    }

    const chosenRecommendations = choosePlanRecommendations(
      rankedRecommendations,
      nextCriteria,
    );
    const selected = chosenRecommendations.map(({ recommendation }) =>
      toSelectedRecommendation(recommendation),
    );

    setPlanRecommendations(chosenRecommendations);
    setSelectedRecommendations(selected);

    try {
      const result = await requestPlan(nextCriteria, selected);
      setPlan(result);
    } catch {
      setPlan(createFallbackPlan(nextCriteria, selected));
    } finally {
      setIsCreatingPlan(false);
      window.setTimeout(() => {
        planRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    }
  };

  return (
    <main className="min-h-screen overflow-hidden text-navy-900">
      <header className="fixed left-5 top-5 z-50 sm:left-8 sm:top-6 lg:left-12">
        <img
          src="/images/visit-split-logo.png"
          alt="Visit Split"
          className="h-16 w-16 object-cover shadow-card sm:h-20 sm:w-20 lg:h-24 lg:w-24"
        />
      </header>

      <Hero />

      <PlannerForm
        isLoading={isCreatingPlan}
        onSubmit={handleCreatePlanFromCriteria}
      />

      {isCreatingPlan && (
        <section className="px-5 py-6 sm:px-8 lg:px-12">
          <div className="mx-auto max-w-5xl">
            <LoadingState text="Creating your personalized Split plan..." />
          </div>
        </section>
      )}

      <div ref={planRef}>
        <PlanTimeline
          plan={plan}
          items={planRecommendations}
          selectedRecommendations={selectedRecommendations}
          activeId={activeId}
          onFocus={setActiveId}
          onHover={setActiveId}
        />
      </div>
    </main>
  );
};

export default App;

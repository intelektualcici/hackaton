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

const getDisplayItem = (
  recommendation: Recommendation,
  rankedById: Map<string, DisplayRecommendation>,
  reason: string,
): DisplayRecommendation => {
  const ranked = rankedById.get(recommendation.id);

  return (
    ranked ?? {
      recommendation,
      score: 72,
      reason,
    }
  );
};

const fitsDayBasics = (
  recommendation: Recommendation,
  criteria: PlannerCriteria,
): boolean => {
  return (
    recommendation.suitableFor.includes(criteria.group) &&
    recommendation.priceMin <= criteria.budgetMax &&
    recommendation.durationMinutes <= getAvailableMinutes(criteria)
  );
};

const fullDaySlots = [
  {
    ids: [
      "diocletian-palace",
      "split-old-town",
      "peristyle-square",
      "veli-varos",
    ],
    reason:
      "Starts the day with Split's historic core before the streets get busiest.",
  },
  {
    ids: ["coffee-on-riva", "riva-promenade", "pjaca"],
    reason:
      "Adds an easy Riva pause so the morning feels local, scenic and unhurried.",
  },
  {
    ids: ["pazar-snack-stop", "local-food-experience", "green-market", "fish-market"],
    reason:
      "Creates a natural lunch or snack moment instead of rushing through sights.",
  },
  {
    ids: [
      "kasjuni-beach",
      "bacvice-beach",
      "bene-beach",
      "marjan-hill",
      "mestrovic-gallery",
      "znjan-beach",
    ],
    reason:
      "Moves the plan beyond the city center with a beach, Marjan or sea-view stop.",
  },
  {
    ids: ["vidilica", "sunset-viewpoint", "west-coast-promenade", "sustipan"],
    reason:
      "Builds in a scenic late-day viewpoint before returning toward dinner.",
  },
  {
    ids: ["dalmatian-wine-tasting", "matejuska", "fabrique-pub", "local-food-experience"],
    reason:
      "Gives the day a relaxed evening finish with food, wine or a local harbor mood.",
  },
];

const chooseFromSlot = (
  ids: string[],
  recommendations: Recommendation[],
  rankedById: Map<string, DisplayRecommendation>,
  criteria: PlannerCriteria,
  selectedIds: Set<string>,
  usedMinutes: number,
): Recommendation | null => {
  const availableMinutes = getAvailableMinutes(criteria);
  const remainingMinutes = availableMinutes - usedMinutes;

  return (
    ids
      .map((id, index) => {
        const recommendation = recommendations.find((item) => item.id === id);
        if (!recommendation || selectedIds.has(recommendation.id)) return null;
        if (!fitsDayBasics(recommendation, criteria)) return null;
        if (recommendation.durationMinutes > remainingMinutes) return null;

        const interestMatch = recommendation.interests.some((interest) =>
          criteria.interests.includes(interest),
        );
        const rankedScore = rankedById.get(recommendation.id)?.score ?? 58;
        const pricePenalty = Math.min(18, Math.floor(recommendation.priceMax / 5));

        return {
          recommendation,
          score:
            rankedScore * 0.25 +
            (interestMatch ? 14 : 0) +
            (ids.length - index) * 20 -
            pricePenalty,
        };
      })
      .filter((item): item is { recommendation: Recommendation; score: number } =>
        Boolean(item),
      )
      .sort((a, b) => b.score - a.score)[0]?.recommendation ?? null
  );
};

const chooseFullDayRecommendations = (
  rankedItems: DisplayRecommendation[],
  criteria: PlannerCriteria,
): DisplayRecommendation[] => {
  const rankedById = new Map(
    rankedItems.map((item) => [item.recommendation.id, item]),
  );
  const selectedIds = new Set<string>();
  const selected: DisplayRecommendation[] = [];
  let usedMinutes = 0;
  const maxStops = getAvailableMinutes(criteria) >= 600 ? 6 : 5;

  for (const slot of fullDaySlots) {
    if (selected.length >= maxStops) break;

    const recommendation = chooseFromSlot(
      slot.ids,
      allRecommendations,
      rankedById,
      criteria,
      selectedIds,
      usedMinutes,
    );

    if (!recommendation) continue;

    selected.push(getDisplayItem(recommendation, rankedById, slot.reason));
    selectedIds.add(recommendation.id);
    usedMinutes += recommendation.durationMinutes + 10;
  }

  for (const item of rankedItems) {
    if (selected.length >= maxStops) break;
    if (selectedIds.has(item.recommendation.id)) continue;
    if (usedMinutes + item.recommendation.durationMinutes > getAvailableMinutes(criteria)) {
      continue;
    }

    selected.push(item);
    selectedIds.add(item.recommendation.id);
    usedMinutes += item.recommendation.durationMinutes + 5;
  }

  return selected;
};

const choosePlanRecommendations = (
  items: DisplayRecommendation[],
  criteria: PlannerCriteria,
): DisplayRecommendation[] => {
  const availableMinutes = getAvailableMinutes(criteria);

  if (availableMinutes >= 420) {
    const fullDaySelection = chooseFullDayRecommendations(items, criteria);
    if (fullDaySelection.length >= 3) {
      return fullDaySelection;
    }
  }

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
    <main className="min-h-screen text-navy-900">
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

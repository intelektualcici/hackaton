import { useMemo, useRef, useState } from "react";
import Hero from "./components/Hero";
import LoadingState from "./components/LoadingState";
import PlannerForm from "./components/PlannerForm";
import PlanTimeline from "./components/PlanTimeline";
import RecommendationsSection from "./components/RecommendationsSection";
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
import { filterRecommendations } from "./utils/filterRecommendations";
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

const App = () => {
  const formRef = useRef<HTMLDivElement | null>(null);
  const recommendationsRef = useRef<HTMLDivElement | null>(null);
  const planRef = useRef<HTMLDivElement | null>(null);

  const [criteria, setCriteria] = useState<PlannerCriteria | null>(null);
  const [displayRecommendations, setDisplayRecommendations] = useState<
    DisplayRecommendation[]
  >([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeId, setActiveId] = useState<string | null>(null);
  const [plan, setPlan] = useState<ItineraryPlan | null>(null);
  const [isFinding, setIsFinding] = useState(false);
  const [isCreatingPlan, setIsCreatingPlan] = useState(false);

  const selectedRecommendations = useMemo<SelectedRecommendation[]>(() => {
    return displayRecommendations
      .filter((item) => selectedIds.has(item.recommendation.id))
      .map(({ recommendation }) => ({
        id: recommendation.id,
        title: recommendation.title,
        lat: recommendation.lat,
        lng: recommendation.lng,
        durationMinutes: recommendation.durationMinutes,
        googleMapsUrl: recommendation.googleMapsUrl,
        category: recommendation.category,
        address: recommendation.address,
        priceMin: recommendation.priceMin,
        priceMax: recommendation.priceMax,
      }));
  }, [displayRecommendations, selectedIds]);

  const handleFindRecommendations = async (nextCriteria: PlannerCriteria) => {
    setCriteria(nextCriteria);
    setIsFinding(true);
    setPlan(null);
    setSelectedIds(new Set());
    setActiveId(null);

    const locallyFiltered = filterRecommendations(allRecommendations, nextCriteria);
    const source = locallyFiltered.length > 0 ? locallyFiltered : allRecommendations;

    try {
      const result = await requestRecommendations(nextCriteria);
      const joined = joinRankings(result.recommendations, allRecommendations);
      setDisplayRecommendations(
        joined.length > 0
          ? joined
          : joinRankings(rankFallback(source, nextCriteria).slice(0, 12), source),
      );
    } catch {
      setDisplayRecommendations(
        joinRankings(rankFallback(source, nextCriteria).slice(0, 12), source),
      );
    } finally {
      setIsFinding(false);
      window.setTimeout(() => {
        recommendationsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 120);
    }
  };

  const handleToggleRecommendation = (id: string) => {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleCreatePlan = async () => {
    if (!criteria || selectedRecommendations.length === 0) return;

    setIsCreatingPlan(true);
    setPlan(null);

    try {
      const result = await requestPlan(criteria, selectedRecommendations);
      setPlan(result);
    } catch {
      setPlan(createFallbackPlan(criteria, selectedRecommendations));
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

      <div ref={formRef}>
        <PlannerForm
          isLoading={isFinding}
          onSubmit={handleFindRecommendations}
        />
      </div>

      <div ref={recommendationsRef}>
        <RecommendationsSection
          items={displayRecommendations}
          selectedIds={selectedIds}
          activeId={activeId}
          isLoading={isFinding}
          isCreatingPlan={isCreatingPlan}
          onToggle={handleToggleRecommendation}
          onFocus={setActiveId}
          onHover={setActiveId}
          onCreatePlan={handleCreatePlan}
        />
      </div>

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
          selectedRecommendations={selectedRecommendations}
        />
      </div>
    </main>
  );
};

export default App;

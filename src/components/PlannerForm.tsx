import { Euro, Search, Users } from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";
import type { PlannerCriteria, TimeOption } from "../types/planner";
import type { GroupType, RecommendationCategory } from "../types/recommendation";
import { categoryMeta } from "../types/recommendation";

interface PlannerFormProps {
  isLoading: boolean;
  onSubmit: (criteria: PlannerCriteria) => void;
}

const timeOptions: TimeOption[] = ["1h", "3h", "Full day"];
const groupOptions: { value: GroupType; label: string }[] = [
  { value: "solo", label: "Solo" },
  { value: "couple", label: "Couple" },
  { value: "friends", label: "Friends" },
  { value: "family", label: "Family" },
];
const interestOptions: RecommendationCategory[] = [
  "food",
  "beaches",
  "history",
  "nightlife",
  "events",
  "nature",
];

const chipBase =
  "rounded-lg border px-4 py-2 text-sm font-bold transition focus:outline-none focus:ring-4 focus:ring-sea-500/20";

const PlannerForm = ({ isLoading, onSubmit }: PlannerFormProps) => {
  const [time, setTime] = useState<TimeOption | "">("");
  const [budgetMin, setBudgetMin] = useState(0);
  const [budgetMax, setBudgetMax] = useState(50);
  const [group, setGroup] = useState<GroupType | "">("");
  const [interests, setInterests] = useState<RecommendationCategory[]>([]);

  const toggleInterest = (interest: RecommendationCategory) => {
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
  };

  const canSubmit = Boolean(time && group && interests.length > 0 && budgetMax >= budgetMin);

  return (
    <section id="planner-form" className="px-5 py-16 sm:px-8 lg:px-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.5 }}
        className="mx-auto max-w-5xl rounded-lg bg-white p-5 shadow-card sm:p-8"
      >
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase text-sea-600">
              Personalize your plan
            </p>
            <h2 className="mt-2 font-heading text-3xl font-extrabold text-navy-900 sm:text-4xl">
              Tell us your Split style
            </h2>
          </div>
          <div className="inline-flex w-fit items-center gap-2 rounded-lg bg-sea-500/10 px-3 py-2 text-sm font-bold text-sea-700">
            <Users className="h-4 w-4" aria-hidden="true" />
            Demo-ready in one minute
          </div>
        </div>

        <form
          className="grid gap-7"
          onSubmit={(event) => {
            event.preventDefault();
            if (!canSubmit || !time || !group) return;
            onSubmit({ time, budgetMin, budgetMax, group, interests });
          }}
        >
          <div>
            <label className="mb-3 block text-sm font-extrabold text-navy-900">
              Time available
            </label>
            <div className="flex flex-wrap gap-3">
              {timeOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => setTime(option)}
                  className={`${chipBase} ${
                    time === option
                      ? "border-sea-500 bg-sea-500 text-white"
                      : "border-navy-900/10 bg-sand-50 text-navy-800 hover:border-sea-500/40"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-extrabold text-navy-900">
              Budget per person
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex items-center gap-3 rounded-lg border border-navy-900/10 bg-sand-50 px-4 py-3">
                <Euro className="h-5 w-5 text-sea-600" aria-hidden="true" />
                <span className="text-sm font-bold text-navy-700">From</span>
                <input
                  type="number"
                  min="0"
                  value={budgetMin}
                  onChange={(event) => setBudgetMin(Number(event.target.value))}
                  className="w-full bg-transparent text-right text-lg font-extrabold text-navy-900 outline-none"
                  aria-label="Budget from euros"
                />
              </label>
              <label className="flex items-center gap-3 rounded-lg border border-navy-900/10 bg-sand-50 px-4 py-3">
                <Euro className="h-5 w-5 text-sea-600" aria-hidden="true" />
                <span className="text-sm font-bold text-navy-700">To</span>
                <input
                  type="number"
                  min="0"
                  value={budgetMax}
                  onChange={(event) => setBudgetMax(Number(event.target.value))}
                  className="w-full bg-transparent text-right text-lg font-extrabold text-navy-900 outline-none"
                  aria-label="Budget to euros"
                />
              </label>
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-extrabold text-navy-900">
              Group type
            </label>
            <div className="flex flex-wrap gap-3">
              {groupOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setGroup(option.value)}
                  className={`${chipBase} ${
                    group === option.value
                      ? "border-sea-500 bg-sea-500 text-white"
                      : "border-navy-900/10 bg-sand-50 text-navy-800 hover:border-sea-500/40"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-extrabold text-navy-900">
              Interests
            </label>
            <div className="flex flex-wrap gap-3">
              {interestOptions.map((interest) => {
                const selected = interests.includes(interest);
                const meta = categoryMeta[interest];
                return (
                  <button
                    key={interest}
                    type="button"
                    onClick={() => toggleInterest(interest)}
                    className={`${chipBase} ${
                      selected
                        ? "border-sun-500 bg-sun-500 text-navy-900"
                        : "border-navy-900/10 bg-sand-50 text-navy-800 hover:border-sun-500/45"
                    }`}
                  >
                    <span aria-hidden="true">{meta.emoji}</span> {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          <button
            type="submit"
            disabled={!canSubmit || isLoading}
            className="inline-flex items-center justify-center gap-3 rounded-lg bg-navy-900 px-6 py-4 text-base font-extrabold text-white shadow-card transition hover:-translate-y-0.5 hover:bg-navy-800 focus:outline-none focus:ring-4 focus:ring-navy-900/20 disabled:cursor-not-allowed disabled:opacity-55"
          >
            <Search className="h-5 w-5" aria-hidden="true" />
            {isLoading ? "Finding recommendations..." : "Find recommendations"}
          </button>
        </form>
      </motion.div>
    </section>
  );
};

export default PlannerForm;

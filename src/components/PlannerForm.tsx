import {
  CalendarDays,
  Euro,
  MessageSquareText,
  Tags,
  UsersRound,
} from "lucide-react";
import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { useState } from "react";
import type { PlannerCriteria } from "../types/planner";
import type { GroupType, RecommendationCategory } from "../types/recommendation";
import { categoryMeta } from "../types/recommendation";

interface PlannerFormProps {
  isLoading: boolean;
  onSubmit: (criteria: PlannerCriteria) => void;
}

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

const hourOptions = Array.from({ length: 17 }, (_, index) => {
  const hour = index + 7;
  return {
    label: `${String(hour).padStart(2, "0")} h`,
    value: `${String(hour).padStart(2, "0")}:00`,
  };
});

const getTodayInputValue = () => {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
};

const nextHourValue = (value: string) => {
  const currentIndex = hourOptions.findIndex((option) => option.value === value);
  const nextIndex = Math.min(hourOptions.length - 1, Math.max(0, currentIndex + 1));
  return hourOptions[nextIndex].value;
};

const FieldLabel = ({
  icon: Icon,
  children,
}: {
  icon: LucideIcon;
  children: string;
}) => (
  <label className="mb-3 flex items-center gap-2 text-sm font-extrabold text-navy-900">
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-sea-500/10 text-sea-700">
      <Icon className="h-4 w-4" aria-hidden="true" />
    </span>
    {children}
  </label>
);

const PlannerForm = ({ isLoading, onSubmit }: PlannerFormProps) => {
  const [date, setDate] = useState(getTodayInputValue);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("12:00");
  const [budgetMin, setBudgetMin] = useState(0);
  const [budgetMax, setBudgetMax] = useState(50);
  const [group, setGroup] = useState<GroupType | "">("");
  const [interests, setInterests] = useState<RecommendationCategory[]>([]);
  const [additionalDetails, setAdditionalDetails] = useState("");

  const handleStartTimeChange = (nextStartTime: string) => {
    setStartTime(nextStartTime);
    if (endTime <= nextStartTime) {
      setEndTime(nextHourValue(nextStartTime));
    }
  };

  const toggleInterest = (interest: RecommendationCategory) => {
    setInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest],
    );
  };

  const canSubmit = Boolean(
    date &&
      startTime &&
      endTime &&
      endTime > startTime &&
      group &&
      interests.length > 0 &&
      budgetMax >= budgetMin,
  );

  return (
    <section id="planner-form" className="min-h-screen bg-sand-50 px-5 py-20 sm:px-8 lg:px-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-120px" }}
        transition={{ duration: 0.5 }}
        className="mx-auto w-full"
      >
        <div className="mb-12 grid gap-8 rounded-lg bg-navy-900 p-6 text-sand-50 shadow-card sm:p-9 lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:p-12">
          <h2 className="font-heading text-5xl font-extrabold leading-none text-sand-50 sm:text-7xl lg:text-8xl">
            <span className="block">Personalize</span>
            <span className="block">your plan</span>
          </h2>
          <div className="max-w-3xl lg:justify-self-end">
            <p className="text-base leading-8 text-sand-50/90 sm:text-lg">
              Tell us your date, time window, budget and interests — Visit
              Split recommends places, events and experiences, then turns your
              picks into a personalized plan.
            </p>
            <a
              href="#planner-fields"
              className="mt-8 inline-flex rounded-lg bg-sun-400 px-5 py-3 text-sm font-extrabold uppercase text-navy-900 transition hover:-translate-y-0.5 hover:bg-sun-500 focus:outline-none focus:ring-4 focus:ring-sun-400/35"
            >
              Personalize ↓
            </a>
          </div>
        </div>

        <div className="sr-only">
          <h2>
              Personalize your plan
          </h2>
        </div>

        <form
          id="planner-fields"
          className="mx-auto grid w-full max-w-5xl scroll-mt-28 gap-7 rounded-lg bg-sand-100 p-5 shadow-card sm:p-8"
          onSubmit={(event) => {
            event.preventDefault();
            if (!canSubmit || !group) return;
            onSubmit({
              date,
              startTime,
              endTime,
              budgetMin,
              budgetMax,
              group,
              interests,
              additionalDetails: additionalDetails.trim() || undefined,
            });
          }}
        >
          <div>
            <FieldLabel icon={CalendarDays}>Date and time</FieldLabel>
            <div className="grid max-w-2xl gap-3 sm:grid-cols-[1.4fr_0.8fr_0.8fr]">
              <label className="grid max-w-[280px] gap-1 rounded-lg border border-navy-900/10 bg-sand-50 px-4 py-3">
                <span className="text-xs font-extrabold uppercase tracking-wide text-navy-700">
                  Date
                </span>
                <input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  onInput={(event) => setDate(event.currentTarget.value)}
                  className="w-full bg-transparent text-base font-extrabold text-navy-900 outline-none"
                  aria-label="Plan date"
                />
              </label>
              <label className="grid max-w-[160px] gap-1 rounded-lg border border-navy-900/10 bg-sand-50 px-4 py-3">
                <span className="text-xs font-extrabold uppercase tracking-wide text-navy-700">
                  From
                </span>
                <select
                  value={startTime}
                  onChange={(event) => handleStartTimeChange(event.target.value)}
                  className="w-full appearance-none bg-transparent text-base font-extrabold text-navy-900 outline-none"
                  aria-label="Plan start time"
                >
                  {hourOptions.slice(0, -1).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid max-w-[160px] gap-1 rounded-lg border border-navy-900/10 bg-sand-50 px-4 py-3">
                <span className="text-xs font-extrabold uppercase tracking-wide text-navy-700">
                  To
                </span>
                <select
                  value={endTime}
                  onChange={(event) => setEndTime(event.target.value)}
                  className="w-full appearance-none bg-transparent text-base font-extrabold text-navy-900 outline-none"
                  aria-label="Plan end time"
                >
                  {hourOptions.slice(1).map((option) => (
                    <option
                      key={option.value}
                      value={option.value}
                      disabled={option.value <= startTime}
                    >
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div>
            <FieldLabel icon={Euro}>Budget per person</FieldLabel>
            <div className="grid max-w-xl gap-3 sm:grid-cols-2">
              <label className="flex max-w-[260px] items-center gap-3 rounded-lg border border-navy-900/10 bg-sand-50 px-4 py-3">
                <Euro className="h-5 w-5 text-sea-600" aria-hidden="true" />
                <span className="text-sm font-bold text-navy-700">From</span>
                <input
                  type="number"
                  min="0"
                  value={budgetMin}
                  onChange={(event) => setBudgetMin(Number(event.target.value))}
                  className="w-20 bg-transparent text-right text-lg font-extrabold text-navy-900 outline-none"
                  aria-label="Budget from euros"
                />
              </label>
              <label className="flex max-w-[260px] items-center gap-3 rounded-lg border border-navy-900/10 bg-sand-50 px-4 py-3">
                <Euro className="h-5 w-5 text-sea-600" aria-hidden="true" />
                <span className="text-sm font-bold text-navy-700">To</span>
                <input
                  type="number"
                  min="0"
                  value={budgetMax}
                  onChange={(event) => setBudgetMax(Number(event.target.value))}
                  className="w-20 bg-transparent text-right text-lg font-extrabold text-navy-900 outline-none"
                  aria-label="Budget to euros"
                />
              </label>
            </div>
          </div>

          <div>
            <FieldLabel icon={UsersRound}>Group type</FieldLabel>
            <div className="flex flex-wrap gap-3">
              {groupOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setGroup(option.value)}
                  className={`${chipBase} ${
                    group === option.value
                      ? "border-sea-500 bg-sea-500 text-sand-50"
                      : "border-navy-900/10 bg-sand-50 text-navy-800 hover:border-sea-500/40"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <FieldLabel icon={Tags}>Interests</FieldLabel>
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
                    {meta.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <FieldLabel icon={MessageSquareText}>Additional details:</FieldLabel>
            <textarea
              value={additionalDetails}
              onChange={(event) => setAdditionalDetails(event.target.value)}
              rows={3}
              className="w-full max-w-2xl resize-none rounded-lg border border-navy-900/10 bg-sand-50 px-4 py-3 text-sm font-semibold leading-6 text-navy-900 outline-none transition placeholder:text-navy-700/55 focus:border-sea-500 focus:ring-4 focus:ring-sea-500/20"
              placeholder="Example: main historic sights, lunch nearby, relaxed pace."
              aria-label="Additional planning details"
            />
          </div>

          <button
            type="submit"
            disabled={!canSubmit || isLoading}
            className="inline-flex items-center justify-center gap-3 justify-self-start rounded-lg bg-navy-900 px-5 py-3 text-sm font-extrabold text-sand-50 shadow-card transition hover:-translate-y-0.5 hover:bg-navy-800 focus:outline-none focus:ring-4 focus:ring-navy-900/20 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {isLoading ? "Creating your personalized Split plan..." : "Create plan"}
          </button>
        </form>
      </motion.div>
    </section>
  );
};

export default PlannerForm;

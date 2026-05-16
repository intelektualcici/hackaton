import { ArrowRight, MapPinned, Route, Sparkles, WandSparkles } from "lucide-react";
import { motion } from "motion/react";

interface HeroProps {
  onStart: () => void;
}

const heroImage =
  "https://commons.wikimedia.org/wiki/Special:Redirect/file/Split%20-%20Riva%20002.jpg?width=1800";

const badges = [
  { label: "AI-powered recommendations", icon: WandSparkles },
  { label: "Local Split experiences", icon: Sparkles },
  { label: "Map-based planning", icon: MapPinned },
  { label: "Personalized itinerary", icon: Route },
];

const Hero = ({ onStart }: HeroProps) => {
  return (
    <section
      className="relative isolate flex min-h-[88vh] overflow-hidden bg-navy-900 px-5 py-8 text-white sm:px-8 lg:px-12"
      style={{
        backgroundImage: `linear-gradient(90deg, rgba(16, 32, 51, 0.9), rgba(16, 32, 51, 0.56) 46%, rgba(16, 32, 51, 0.18)), url("${heroImage}")`,
        backgroundPosition: "center",
        backgroundSize: "cover",
      }}
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col justify-end pb-10 pt-16">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="max-w-3xl"
        >
          <p className="mb-5 inline-flex rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur">
            Visit Split
          </p>
          <h1 className="font-heading text-5xl font-extrabold leading-tight sm:text-6xl lg:text-7xl">
            Plan your perfect Split day in seconds.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/88 sm:text-xl">
            Tell us your time, budget and interests — Visit Split recommends
            places, events and experiences, then turns your picks into a
            personalized plan.
          </p>
          <button
            type="button"
            onClick={onStart}
            className="mt-8 inline-flex items-center gap-3 rounded-lg bg-sun-500 px-6 py-4 text-base font-bold text-navy-900 shadow-card transition hover:-translate-y-0.5 hover:bg-sun-400 focus:outline-none focus:ring-4 focus:ring-sun-400/45"
          >
            Start planning
            <ArrowRight className="h-5 w-5" aria-hidden="true" />
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.55 }}
          className="mt-12 grid gap-3 sm:grid-cols-2 lg:max-w-4xl lg:grid-cols-4"
        >
          {badges.map((badge) => {
            const Icon = badge.icon;
            return (
              <div
                key={badge.label}
                className="rounded-lg border border-white/18 bg-white/12 p-4 backdrop-blur-md"
              >
                <Icon className="mb-4 h-5 w-5 text-sun-400" aria-hidden="true" />
                <p className="text-sm font-semibold text-white">{badge.label}</p>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

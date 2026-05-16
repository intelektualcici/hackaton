import { motion } from "motion/react";

const Hero = () => {
  return (
    <section className="relative isolate min-h-[88vh] overflow-hidden bg-sand-50">
      <div className="absolute inset-y-0 right-0 w-full lg:w-[72%]">
        <video
          className="h-full w-full object-cover"
          src="/videos/panorama-grada.mp4"
          autoPlay
          loop
          muted
          playsInline
          aria-label="Panorama video of Split"
        />
        <div className="absolute inset-0 bg-navy-900/8" />
      </div>

      <svg
        className="absolute inset-y-0 left-0 z-10 hidden h-full w-[47%] text-white lg:block"
        viewBox="0 0 900 900"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M0 0H755C704 43 702 91 748 139C806 199 805 282 739 349C681 408 682 483 743 543C812 611 812 701 740 771C697 813 694 860 734 900H0V0Z"
        />
      </svg>

      <div className="relative z-20 flex min-h-[88vh] items-center px-5 py-16 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, ease: "easeOut" }}
          className="max-w-md rounded-lg bg-white/92 p-6 shadow-card backdrop-blur-sm lg:bg-transparent lg:p-0 lg:pl-2 lg:pt-20 lg:shadow-none lg:backdrop-blur-none"
        >
          <h1 className="font-heading text-4xl font-extrabold leading-tight text-navy-900 sm:text-5xl lg:text-6xl">
            Plan your perfect Split day in seconds.
          </h1>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;

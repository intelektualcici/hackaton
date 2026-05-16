import { motion } from "motion/react";

interface LoadingStateProps {
  text: string;
}

const LoadingState = ({ text }: LoadingStateProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-4 rounded-lg border border-sea-500/15 bg-sand-50/90 p-5 shadow-card"
    >
      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-sea-500/10">
        <motion.span
          className="h-5 w-5 rounded-full border-2 border-sea-500 border-t-transparent"
          animate={{ rotate: 360 }}
          transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
        />
      </div>
      <p className="text-sm font-semibold text-navy-800">{text}</p>
    </motion.div>
  );
};

export default LoadingState;

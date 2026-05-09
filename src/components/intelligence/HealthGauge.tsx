import { motion } from "framer-motion";

export const HealthGauge = ({ value = 88 }: { value?: number }) => {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;

  return (
    <div className="relative size-32 flex items-center justify-center">
      <svg className="size-full -rotate-90">
        <circle
          cx="64"
          cy="64"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          className="text-white/5"
        />
        <motion.circle
          cx="64"
          cy="64"
          r={radius}
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="text-primary"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-black text-white tracking-tighter">{value}</span>
        <span className="text-[8px] font-black uppercase text-primary tracking-widest">Score</span>
      </div>
      
      {/* Decorative Glow */}
      <div className="absolute inset-0 bg-primary/20 rounded-full blur-2xl opacity-20" />
    </div>
  );
};
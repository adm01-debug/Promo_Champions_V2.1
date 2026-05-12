import { motion } from "framer-motion";

export const NeuralSoundwave = ({ active = true, color = "bg-primary" }: { active?: boolean; color?: string }) => {
  return (
    <div className="flex items-center gap-0.5 h-12">
      {Array.from({ length: 12 }).map((_, i) => (
        <motion.div
          key={i}
          className={`${color} w-1 rounded-full opacity-60`}
          animate={active ? {
            height: [8, Math.random() * 32 + 8, 8],
          } : {
            height: 8,
          }}
          transition={{
            duration: 0.5 + Math.random() * 0.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import React from "react";

interface HexFrameProps {
  children: React.ReactNode;
  glowColor: string;
  size: string;
  isChampion?: boolean;
}

export const HexFrame = React.memo(function HexFrame({ children, glowColor, size, isChampion }: HexFrameProps) {
  return (
    <div className={cn("relative", size)}>
      <motion.div
        className="absolute -inset-2 rounded-2xl"
        style={{
          background: `linear-gradient(135deg, ${glowColor}, transparent, ${glowColor})`,
          opacity: 0.6,
          clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
        }}
        animate={isChampion ? { opacity: [0.4, 0.8, 0.4], scale: [1, 1.05, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <div
        className="relative w-full h-full overflow-hidden"
        style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }}
      >
        <div className="absolute inset-0 pointer-events-none z-10 opacity-20" 
             style={{ backgroundImage: `repeating-linear-gradient(0deg, #fff, #fff 1px, transparent 1px, transparent 3px)` }} 
        />
        {children}
      </div>
      {isChampion && (
        <motion.div
          className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3"
          style={{ background: glowColor, clipPath: "polygon(50% 0%, 100% 100%, 0% 100%)" }}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      )}
    </div>
  );
});

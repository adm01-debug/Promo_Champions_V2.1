import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";

export const CyberArenaBackground = React.memo(() => {
  const { theme } = useDashboardTheme();

  const particles = useMemo(() => Array.from({ length: 20 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 2 + 1,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
    hue: Math.random() > 0.5 ? "#22d3ee" : Math.random() > 0.5 ? "#a855f7" : "#ec4899",
  })), []);

  if (theme !== "cyber") return null;

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[-1] bg-[#05060f]">
      {/* Background neon grid */}
      <div className="absolute inset-0 opacity-20" style={{
        backgroundImage:
          "linear-gradient(rgba(34,211,238,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.1) 1px, transparent 1px)",
        backgroundSize: "80px 80px",
        maskImage: "radial-gradient(ellipse at center, black 20%, transparent 90%)",
      }} />

      {/* Animated orbs */}
      <motion.div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[140px] opacity-20"
        style={{ background: "radial-gradient(circle, #22d3ee, transparent)" }}
        animate={{ 
          scale: [1, 1.1, 1], 
          x: [0, 30, 0], 
          y: [0, 20, 0] 
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full blur-[160px] opacity-20"
        style={{ background: "radial-gradient(circle, #a855f7, transparent)" }}
        animate={{ 
          scale: [1.1, 1, 1.1], 
          x: [0, -30, 0], 
          y: [0, -20, 0] 
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            background: p.hue,
            boxShadow: `0 0 ${p.size * 5}px ${p.hue}`,
          }}
          animate={{ 
            y: [0, -100, 0], 
            opacity: [0, 0.8, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: p.duration, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
        />
      ))}

      {/* Scanlines */}
      <div className="absolute inset-0 opacity-[0.02]" style={{
        backgroundImage: "repeating-linear-gradient(0deg, #fff, #fff 1px, transparent 1px, transparent 4px)"
      }} />
    </div>
  );
});

CyberArenaBackground.displayName = "CyberArenaBackground";

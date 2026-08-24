import React, { useMemo } from "react";
import { motion } from "framer-motion";

export const AuthBackground = React.memo(function AuthBackground() {
  const particles = useMemo(() => Array.from({ length: 28 }).map((_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 8 + 6,
    delay: Math.random() * 4,
    hue: Math.random() > 0.5 ? "#22d3ee" : Math.random() > 0.5 ? "#a855f7" : "#ec4899",
  })), []);

  return (
    <>
      {/* Background neon grid */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage:
          "linear-gradient(rgba(34,211,238,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(168,85,247,0.07) 1px, transparent 1px)",
        backgroundSize: "60px 60px",
        maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)",
      }} />

      {/* Animated orbs */}
      <motion.div
        className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full blur-[120px] opacity-40"
        style={{ background: "radial-gradient(circle, #22d3ee, transparent)" }}
        animate={{ scale: [1, 1.2], x: [0, 60], y: [0, 40] }}
        transition={{ duration: 12, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full blur-[140px] opacity-40"
        style={{ background: "radial-gradient(circle, #a855f7, transparent)" }}
        animate={{ scale: [1.1, 1], x: [0, -50], y: [0, -30] }}
        transition={{ duration: 14, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      />
      <motion.div
        className="absolute top-1/3 right-1/4 w-[400px] h-[400px] rounded-full blur-[120px] opacity-30"
        style={{ background: "radial-gradient(circle, #ec4899, transparent)" }}
        animate={{ scale: [1, 1.3] }}
        transition={{ duration: 10, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
      />

      {/* Floating particles */}
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`, top: `${p.y}%`,
            width: p.size, height: p.size,
            background: p.hue,
            boxShadow: `0 0 ${p.size * 4}px ${p.hue}`,
          }}
          animate={{ y: [0, -80], opacity: [0, 1] }}
          transition={{ duration: p.duration, repeat: Infinity, repeatType: "reverse", delay: p.delay, ease: "easeInOut" }}
        />
      ))}

      {/* Scanlines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{
        backgroundImage: "repeating-linear-gradient(0deg, #fff, #fff 1px, transparent 1px, transparent 3px)"
      }} />
    </>
  );
});

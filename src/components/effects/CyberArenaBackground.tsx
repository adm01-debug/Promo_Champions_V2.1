import React, { useMemo, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { useDashboardTheme } from "@/contexts/DashboardThemeContext";

export const CyberArenaBackground = React.memo(() => {
  const { theme } = useDashboardTheme();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (theme !== "cyber" || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    const particles: any[] = Array.from({ length: 40 }).map(() => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      speedY: -(Math.random() * 0.5 + 0.2),
      opacity: Math.random() * 0.5 + 0.2,
      color: Math.random() > 0.5 ? "34, 211, 238" : Math.random() > 0.5 ? "168, 85, 247" : "236, 72, 153",
    }));

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      particles.forEach(p => {
        p.y += p.speedY;
        if (p.y < -10) p.y = height + 10;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color}, ${p.opacity})`;
        ctx.shadowBlur = p.size * 4;
        ctx.shadowColor = `rgb(${p.color})`;
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);
    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [theme]);

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

      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full"
      />

      {/* Animated orbs - optimized with static blur if possible, but keeping motion for premium feel with lower frequency */}
      <motion.div
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full blur-[140px] opacity-15 will-change-transform"
        style={{ background: "radial-gradient(circle, #22d3ee, transparent)" }}
        animate={{ 
          scale: [1, 1.05, 1], 
          x: [0, 20, 0], 
          y: [0, 15, 0] 
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-40 -right-40 w-[700px] h-[700px] rounded-full blur-[160px] opacity-15 will-change-transform"
        style={{ background: "radial-gradient(circle, #a855f7, transparent)" }}
        animate={{ 
          scale: [1.05, 1, 1.05], 
          x: [0, -20, 0], 
          y: [0, -15, 0] 
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
      />

      {/* Scanlines */}
      <div className="absolute inset-0 opacity-[0.015] pointer-events-none" style={{
        backgroundImage: "repeating-linear-gradient(0deg, #fff, #fff 1px, transparent 1px, transparent 4px)"
      }} />
    </div>
  );
});

CyberArenaBackground.displayName = "CyberArenaBackground";

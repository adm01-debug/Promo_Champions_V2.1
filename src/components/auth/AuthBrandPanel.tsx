import React from "react";
import { motion } from "framer-motion";
import { Crown, Trophy, Target, Flame, Sparkles } from "lucide-react";

export const AuthBrandPanel = React.memo(function AuthBrandPanel() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -40 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="hidden lg:flex flex-col gap-8 p-8"
    >
      <div className="flex items-center gap-3">
        <motion.div
          className="relative p-3 rounded-2xl bg-gradient-to-br from-cyan-400 to-purple-600"
          animate={{ boxShadow: ["0 0 20px #22d3ee", "0 0 40px #a855f7"] }}
          transition={{ duration: 3, repeat: Infinity, repeatType: "reverse" }}
        >
          <Crown className="h-7 w-7 text-white" />
        </motion.div>
        <div>
          <h1 className="text-2xl font-black tracking-wider" style={{ textShadow: "0 0 12px rgba(34,211,238,0.6)" }}>
            PROMO CHAMPIONS
          </h1>
          <p className="text-[10px] tracking-[0.3em] text-cyan-300/70 font-semibold">CIRCUITO DE VENCEDORES</p>
        </div>
      </div>

      <div className="space-y-6">
        <motion.h2
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-5xl xl:text-6xl font-black leading-[1.05]"
        >
          Entre no{" "}
          <span className="bg-gradient-to-r from-cyan-300 via-purple-400 to-pink-400 bg-clip-text text-transparent" style={{ filter: "drop-shadow(0 0 24px rgba(168,85,247,0.4))" }}>
            Circuito
          </span>
          .<br />
          Domine o{" "}
          <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-300 bg-clip-text text-transparent">
            pódio
          </span>
          .
        </motion.h2>

        <p className="text-lg text-white/60 max-w-md leading-relaxed">
          Onde vendedores viram <span className="text-cyan-300 font-semibold">lendas</span>.
          Gamificação real, ranking ao vivo e XP em cada deal fechado.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Trophy, label: "TOP CLOSERS", value: "2.8k", color: "#22d3ee" },
          { icon: Flame, label: "DEALS HOJE", value: "+47", color: "#ec4899" },
          { icon: Target, label: "CONVERSÃO", value: "+34%", color: "#a855f7" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            whileHover={{ y: -4, scale: 1.03 }}
            className="relative p-4 rounded-xl border bg-white/[0.02] backdrop-blur-sm overflow-hidden group"
            style={{ borderColor: `${s.color}40` }}
          >
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
              style={{ background: `radial-gradient(circle at top, ${s.color}20, transparent 70%)` }} />
            <s.icon className="h-4 w-4 mb-2" style={{ color: s.color, filter: `drop-shadow(0 0 6px ${s.color})` }} />
            <div className="text-2xl font-black" style={{ color: s.color, textShadow: `0 0 12px ${s.color}80` }}>
              {s.value}
            </div>
            <div className="text-[9px] tracking-[0.2em] text-white/40 font-semibold mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="flex items-center gap-3 pt-2">
        {[
          { label: "LENDA", color: "#fbbf24" },
          { label: "ELITE", color: "#22d3ee" },
          { label: "VETERANO", color: "#fb923c" },
        ].map((t, i) => (
          <motion.div
            key={t.label}
            initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.8 + i * 0.1, type: "spring" }}
            className="flex items-center gap-2"
          >
            <div className="relative w-10 h-10 rounded-full flex items-center justify-center"
              style={{ background: `radial-gradient(circle, ${t.color}, ${t.color}40)`, boxShadow: `0 0 16px ${t.color}80` }}>
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-[10px] font-bold tracking-[0.2em]" style={{ color: t.color }}>{t.label}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
});

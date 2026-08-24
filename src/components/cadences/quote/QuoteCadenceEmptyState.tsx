import { motion } from "framer-motion";

export function QuoteCadenceEmptyState() {
  return (
    <div
      role="status"
      aria-label="Nenhum follow-up encontrado"
      className="text-center py-16 border border-dashed border-border/50 rounded-xl bg-gradient-to-b from-muted/5 to-muted/15"
    >
      <motion.svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        className="mx-auto mb-4"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="qc-env" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.9" />
            <stop offset="100%" stopColor="hsl(var(--accent))" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        {/* Circular orbit */}
        <motion.circle
          cx="60"
          cy="60"
          r="48"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeOpacity="0.2"
          strokeWidth="1.5"
          strokeDasharray="4 6"
          animate={{ rotate: 360 }}
          transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "60px 60px" }}
        />

        {/* Envelope */}
        <motion.g
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <rect
            x="34"
            y="44"
            width="52"
            height="36"
            rx="6"
            fill="url(#qc-env)"
          />
          <path
            d="M34 50 L60 66 L86 50"
            fill="none"
            stroke="hsl(var(--background))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.g>

        {/* Orbiting arrow dots */}
        <motion.g
          animate={{ rotate: 360 }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
          style={{ transformOrigin: "60px 60px" }}
        >
          <circle cx="60" cy="12" r="3" fill="hsl(var(--primary))" />
          <circle cx="108" cy="60" r="2.5" fill="hsl(var(--accent))" />
          <circle cx="60" cy="108" r="2" fill="hsl(var(--primary))" opacity="0.6" />
        </motion.g>
      </motion.svg>

      <p className="font-display font-semibold text-base">Nenhum follow-up encontrado</p>
      <p className="text-sm text-muted-foreground mt-1.5 max-w-sm mx-auto">
        Envie um orçamento para iniciar uma cadência automática de follow-up e acompanhar a conversão.
      </p>
    </div>
  );
}

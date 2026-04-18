import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Gauge, Target, Activity } from 'lucide-react';

interface Props {
  /** Velocidade média (deals/dia da week atual). */
  avgDealsPerDay: number;
  /** Best lap pessoal (melhor week histórica em $ ou unidades). */
  bestLap: number;
  /** Delta vs ghost car em pp (positive = à frente). */
  ghostDeltaPp: number;
  /** Fadiga dos pneus (0=novo, 1=gasto) — baseado em dias sem venda. */
  tireFatigue: number;
  /** Próximo objetivo textual + percentual. */
  nextGoalLabel?: string;
  nextGoalPercent?: number;
}

function formatCompact(n: number): string {
  if (!n || !Number.isFinite(n)) return '—';
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return n.toFixed(n < 10 ? 1 : 0);
}

/**
 * Card colapsável com telemetria pessoal do piloto logado.
 * Posicionado à direita, abaixo do timing tower.
 */
export function MyTelemetryPanel({
  avgDealsPerDay,
  bestLap,
  ghostDeltaPp,
  tireFatigue,
  nextGoalLabel,
  nextGoalPercent,
}: Props) {
  const [open, setOpen] = useState(true);

  const fatigueClamped = Math.max(0, Math.min(1, tireFatigue));
  const fatigueColor =
    fatigueClamped < 0.34
      ? 'hsl(142 76% 38%)'
      : fatigueClamped < 0.67
        ? 'hsl(45 95% 55%)'
        : 'hsl(0 84% 60%)';
  const fatigueLabel =
    fatigueClamped < 0.34 ? 'Novos' : fatigueClamped < 0.67 ? 'Médios' : 'Gastos';

  const ghostColor =
    ghostDeltaPp > 0.5
      ? 'text-emerald-500'
      : ghostDeltaPp < -0.5
        ? 'text-destructive'
        : 'text-muted-foreground';
  const ghostIcon = ghostDeltaPp > 0.5 ? '▲' : ghostDeltaPp < -0.5 ? '▼' : '–';

  return (
    <div
      className="absolute right-3 top-[180px] z-20 w-[200px] rounded-xl border border-border/50 backdrop-blur-md shadow-lg overflow-hidden"
      style={{ background: 'hsl(var(--background) / 0.82)' }}
      aria-label="Telemetria do piloto"
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-3 py-1.5 hover:bg-muted/40 transition-colors"
      >
        <span className="flex items-center gap-1.5 text-[9px] font-black uppercase tracking-[0.18em] text-muted-foreground">
          <Gauge className="h-3 w-3" />
          Telemetria
        </span>
        <ChevronDown
          className={`h-3 w-3 text-muted-foreground transition-transform ${open ? '' : '-rotate-90'}`}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="space-y-2 px-3 pb-2.5 pt-0.5">
              {/* Velocidade média */}
              <div className="flex items-baseline justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                  Veloc. méd.
                </span>
                <span
                  className="text-[12px] font-black tabular-nums text-foreground"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                >
                  {avgDealsPerDay.toFixed(1)}<span className="text-[8px] text-muted-foreground"> deals/d</span>
                </span>
              </div>
              {/* Best lap */}
              <div className="flex items-baseline justify-between">
                <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                  Best lap
                </span>
                <span
                  className="text-[12px] font-black tabular-nums text-primary"
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                >
                  {formatCompact(bestLap)}
                </span>
              </div>
              {/* Delta vs ghost */}
              <div className="flex items-baseline justify-between">
                <span className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                  <Activity className="h-2.5 w-2.5" />
                  vs Ghost
                </span>
                <span
                  className={`text-[11px] font-black tabular-nums ${ghostColor}`}
                  style={{ fontFamily: 'JetBrains Mono, monospace' }}
                >
                  {ghostIcon} {Math.abs(ghostDeltaPp).toFixed(1)}pp
                </span>
              </div>
              {/* Tire fatigue */}
              <div>
                <div className="flex items-baseline justify-between mb-0.5">
                  <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
                    Pneus
                  </span>
                  <span className="text-[9px] font-black uppercase tracking-wider" style={{ color: fatigueColor }}>
                    {fatigueLabel}
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${(1 - fatigueClamped) * 100}%`,
                      background: fatigueColor,
                    }}
                  />
                </div>
              </div>
              {/* Próximo objetivo */}
              {nextGoalLabel && (
                <div className="border-t border-border/40 pt-1.5">
                  <div className="flex items-center gap-1 mb-0.5">
                    <Target className="h-2.5 w-2.5 text-muted-foreground" />
                    <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground truncate">
                      {nextGoalLabel}
                    </span>
                  </div>
                  {typeof nextGoalPercent === 'number' && (
                    <div className="h-1 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all duration-500"
                        style={{ width: `${Math.max(0, Math.min(100, nextGoalPercent))}%` }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

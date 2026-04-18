import { useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ArrowUpRight, ArrowDownRight, Zap, X } from 'lucide-react';
import type { OvertakeEvent } from '@/hooks/race/useOvertakeDetector';
import { triggerHaptic } from '@/lib/haptics';

interface Props {
  overtakes: OvertakeEvent[];
  onDismiss: (id: string) => void;
  currentUserSalespersonId?: string;
}

function initials(name: string): string {
  return name.split(' ').slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('');
}

export function OvertakeHighlight({ overtakes, onDismiss, currentUserSalespersonId }: Props) {
  const reduceMotion = useReducedMotion();
  const latestId = overtakes[0]?.id;
  const latestInvolvesMe = !!latestId && !!currentUserSalespersonId && (
    overtakes[0].overtaker.salesperson_id === currentUserSalespersonId ||
    overtakes[0].overtaken.salesperson_id === currentUserSalespersonId
  );
  const userIsOvertaker = !!latestId && overtakes[0].overtaker.salesperson_id === currentUserSalespersonId;

  // Haptic feedback ao detectar nova ultrapassagem
  useEffect(() => {
    if (!latestId) return;
    if (latestInvolvesMe) {
      triggerHaptic(userIsOvertaker ? 'success' : 'error');
    } else {
      triggerHaptic('light');
    }
  }, [latestId, latestInvolvesMe, userIsOvertaker]);

  return (
    <>
      {/* Flash de tela ao acontecer ultrapassagem (especialmente envolvendo o usuário) */}
      <AnimatePresence>
        {latestId && !reduceMotion && (
          <motion.div
            key={latestId}
            aria-hidden
            className="fixed inset-0 pointer-events-none z-[55]"
            initial={{ opacity: 0 }}
            animate={{ opacity: latestInvolvesMe ? [0, 0.35, 0] : [0, 0.15, 0] }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, times: [0, 0.2, 1] }}
            style={{
              background: latestInvolvesMe
                ? userIsOvertaker
                  ? 'radial-gradient(circle at center, hsl(var(--primary) / 0.6), transparent 70%)'
                  : 'radial-gradient(circle at center, hsl(var(--destructive) / 0.5), transparent 70%)'
                : 'radial-gradient(circle at center, hsl(var(--warning) / 0.4), transparent 70%)',
            }}
          />
        )}
      </AnimatePresence>

      <div
        className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-3 pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >
        <AnimatePresence>
          {overtakes.map((o) => {
            const involvesMe = !!currentUserSalespersonId && (
              o.overtaker.salesperson_id === currentUserSalespersonId ||
              o.overtaken.salesperson_id === currentUserSalespersonId
            );
            const meIsOvertaker = o.overtaker.salesperson_id === currentUserSalespersonId;
            return (
              <motion.div
                key={o.id}
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -40, scale: 0.85 }}
                animate={
                  reduceMotion
                    ? { opacity: 1 }
                    : involvesMe
                      ? { opacity: 1, y: 0, scale: [0.85, 1.08, 1] }
                      : { opacity: 1, y: 0, scale: 1 }
                }
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -20, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 260, damping: 22, scale: { duration: 0.5 } }}
                className="pointer-events-auto"
              >
                <div
                  className={`relative flex items-center gap-3 px-5 py-3 rounded-2xl border bg-card/95 backdrop-blur-xl shadow-2xl max-w-md ${
                    involvesMe
                      ? meIsOvertaker
                        ? 'border-primary shadow-primary/50'
                        : 'border-destructive shadow-destructive/40'
                      : 'border-primary/40 shadow-primary/30'
                  }`}
                  role="alert"
                >
                  <motion.div
                    aria-hidden
                    className="absolute inset-0 rounded-2xl pointer-events-none"
                    initial={{ boxShadow: '0 0 0 0 hsl(var(--primary) / 0.5)' }}
                    animate={reduceMotion ? {} : {
                      boxShadow: [
                        `0 0 0 0 hsl(var(--${involvesMe && !meIsOvertaker ? 'destructive' : 'primary'}) / 0.6)`,
                        `0 0 0 16px hsl(var(--${involvesMe && !meIsOvertaker ? 'destructive' : 'primary'}) / 0)`,
                      ],
                    }}
                    transition={{ duration: 1.2, repeat: 2 }}
                  />

                  {/* Overtaker */}
                  <motion.div
                    className="relative flex flex-col items-center gap-1"
                    initial={reduceMotion ? {} : { x: 30 }}
                    animate={{ x: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  >
                    <Avatar
                      className="w-12 h-12 ring-2 ring-offset-2 ring-offset-card"
                      style={{ boxShadow: `0 0 0 2px ${o.overtaker.primary_color}` }}
                    >
                      {o.overtaker.avatar_url && <AvatarImage src={o.overtaker.avatar_url} alt={o.overtaker.salesperson_name} />}
                      <AvatarFallback className="text-xs font-bold">{initials(o.overtaker.salesperson_name)}</AvatarFallback>
                    </Avatar>
                    <ArrowUpRight className="absolute -top-1 -right-1 w-4 h-4 text-success bg-card rounded-full p-0.5" />
                  </motion.div>

                  <Zap className="w-5 h-5 text-warning shrink-0 animate-pulse" aria-hidden />

                  {/* Overtaken */}
                  <motion.div
                    className="relative flex flex-col items-center gap-1"
                    initial={reduceMotion ? {} : { x: -30 }}
                    animate={{ x: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                  >
                    <Avatar
                      className="w-12 h-12 opacity-70"
                      style={{ boxShadow: `0 0 0 2px ${o.overtaken.primary_color}` }}
                    >
                      {o.overtaken.avatar_url && <AvatarImage src={o.overtaken.avatar_url} alt={o.overtaken.salesperson_name} />}
                      <AvatarFallback className="text-xs font-bold">{initials(o.overtaken.salesperson_name)}</AvatarFallback>
                    </Avatar>
                    <ArrowDownRight className="absolute -top-1 -right-1 w-4 h-4 text-destructive bg-card rounded-full p-0.5" />
                  </motion.div>

                  <div className="flex flex-col min-w-0 pr-6">
                    <p className="font-display font-black text-sm leading-tight uppercase tracking-tight">
                      <span className={meIsOvertaker ? 'text-primary' : 'text-foreground'}>
                        {meIsOvertaker ? 'VOCÊ' : o.overtaker.salesperson_name.split(' ')[0]}
                      </span>
                      <span className="text-muted-foreground"> ultrapassou </span>
                      <span className={!meIsOvertaker && involvesMe ? 'text-destructive' : 'text-foreground'}>
                        {!meIsOvertaker && involvesMe ? 'VOCÊ' : o.overtaken.salesperson_name.split(' ')[0]}
                      </span>!
                    </p>
                    <p className="text-[11px] text-muted-foreground tabular-nums mt-0.5">
                      P{o.overtakerNewRank} ← P{o.overtakerOldRank}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => onDismiss(o.id)}
                    aria-label="Fechar notificação de ultrapassagem"
                    className="absolute top-1.5 right-1.5 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </>
  );
}

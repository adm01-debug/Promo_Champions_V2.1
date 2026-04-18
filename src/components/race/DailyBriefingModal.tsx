import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, Trophy, Clock, Flame, Rocket, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import type { BriefingData } from '@/hooks/race/useDailyBriefing';

interface Props {
  open: boolean;
  data: BriefingData | null;
  onDismiss: () => void;
  /** Auto-dismiss em ms. Default 5500. */
  autoDismissMs?: number;
}

function flameClass(streak: number) {
  if (streak >= 30) return 'text-cyan-400';
  if (streak >= 7) return 'text-destructive';
  if (streak >= 3) return 'text-orange-500';
  return 'text-muted-foreground';
}

const SLIDE_DURATION = 1400;

/**
 * Daily Briefing: 4 slides cinemáticos (saudação → posição → streak → CTA),
 * auto-dismiss em ~5.5s, skip disponível, mostrado 1x/dia.
 */
export function DailyBriefingModal({ open, data, onDismiss, autoDismissMs = 5500 }: Props) {
  const reduced = useReducedMotion();
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    if (!open) { setSlide(0); return; }
    const total = 4;
    const stepMs = autoDismissMs / total;
    const id = window.setInterval(() => {
      setSlide((s) => {
        if (s + 1 >= total) {
          window.clearInterval(id);
          window.setTimeout(onDismiss, 400);
          return s;
        }
        return s + 1;
      });
    }, stepMs);
    return () => window.clearInterval(id);
  }, [open, autoDismissMs, onDismiss]);

  if (!data) return null;

  const slides = [
    {
      icon: Flag,
      title: `${data.greeting}, ${data.pilotFirstName}`,
      subtitle: 'Sua corrida começa agora.',
      tone: 'text-primary',
    },
    {
      icon: Trophy,
      title: data.rank ? `Você está em P${data.rank}` : 'Bem-vindo à pista',
      subtitle: data.gapToLeaderPercent !== null
        ? `${data.gapToLeaderPercent.toFixed(1)}% atrás do líder`
        : data.rank === 1 ? 'Liderança em suas mãos' : `Entre os ${data.totalPilots} pilotos`,
      tone: 'text-foreground',
    },
    {
      icon: Flame,
      title: data.streakDays > 0 ? `🔥 ${data.streakDays} ${data.streakDays === 1 ? 'dia' : 'dias'}` : 'Acenda o motor',
      subtitle: data.streakDays > 0
        ? 'Você acendeu o motor em sequência'
        : 'Comece sua sequência hoje',
      tone: flameClass(data.streakDays),
    },
    {
      icon: Rocket,
      title: data.cta,
      subtitle: `Janela ouro: ${data.goldenWindow}`,
      tone: 'text-success',
    },
  ];

  const current = slides[slide];
  const Icon = current.icon;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md"
          style={{ background: 'hsl(var(--background) / 0.85)' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
          role="dialog"
          aria-label="Daily Briefing"
        >
          <Button
            variant="ghost"
            size="sm"
            onClick={onDismiss}
            className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
            aria-label="Pular briefing"
          >
            <X className="h-4 w-4 mr-1" /> Skip
          </Button>

          <div className="relative max-w-md w-full px-6 text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={slide}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.96 }}
                animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -16, scale: 0.98 }}
                transition={{ duration: reduced ? 0.2 : 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-4"
              >
                <div className={`inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-card ring-1 ring-border shadow-lg ${current.tone}`}>
                  <Icon className="h-8 w-8" strokeWidth={2.2} />
                </div>
                <h2 className={`text-3xl md:text-4xl font-black font-display tracking-tight ${current.tone}`}>
                  {current.title}
                </h2>
                <p className="text-base text-muted-foreground">{current.subtitle}</p>
              </motion.div>
            </AnimatePresence>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-1.5 mt-8">
              {slides.map((_, i) => (
                <span
                  key={i}
                  className={`h-1 rounded-full transition-all duration-500 ${
                    i === slide ? 'w-8 bg-primary' : i < slide ? 'w-4 bg-primary/50' : 'w-4 bg-muted'
                  }`}
                  style={{ transitionDuration: `${SLIDE_DURATION}ms` }}
                />
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

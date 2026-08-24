import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Mic, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import type { CommentaryItem } from '@/hooks/race/useRaceCommentary';
import { formatDistanceToNowStrict } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Props {
  items: CommentaryItem[];
  isGenerating: boolean;
  onRegenerate: () => void;
}

const CONTEXT_LABEL: Record<string, string> = {
  leader_change: 'Mudança na liderança',
  overtake: 'Ultrapassagem',
  checkpoint: 'Checkpoint',
  periodic: 'Pista ao vivo',
};

export function RaceCommentaryPanel({ items, isGenerating, onRegenerate }: Props) {
  const reduce = useReducedMotion();
  const latest = items[0];

  return (
    <Card className="border-primary/30 bg-gradient-to-br from-card via-card to-primary/5 overflow-hidden">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Mic className="w-4 h-4 text-primary" />
              {isGenerating && (
                <motion.div
                  className="absolute inset-0 rounded-full bg-primary/40"
                  animate={reduce ? {} : { scale: [1, 1.8], opacity: [0.6, 0] }}
                  transition={{ duration: 1, repeat: Infinity }}
                />
              )}
            </div>
            <span className="text-xs font-display font-black uppercase tracking-wider text-foreground">
              Narração ao vivo
            </span>
            <Sparkles className="w-3 h-3 text-warning" aria-hidden />
          </div>
          <Button
            size="sm"
            variant="ghost"
            onClick={onRegenerate}
            disabled={isGenerating}
            aria-label="Gerar nova narração"
            className="h-7 px-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          </Button>
        </div>

        <div className="min-h-[60px]" aria-live="polite" aria-atomic="true">
          {!latest && isGenerating ? (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : !latest ? (
            <p className="text-xs text-muted-foreground italic">
              Aguardando o primeiro lance da pista...
            </p>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={latest.id}
                initial={reduce ? { opacity: 0 } : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, y: -4 }}
                transition={{ duration: 0.4 }}
              >
                <p className="text-sm leading-snug text-foreground font-medium">
                  &ldquo;{latest.text}&rdquo;
                </p>
                <p className="text-[10px] text-muted-foreground mt-1.5 uppercase tracking-wider">
                  {CONTEXT_LABEL[latest.context] ?? latest.context} ·{' '}
                  {formatDistanceToNowStrict(new Date(latest.generated_at), { locale: ptBR, addSuffix: true })}
                </p>
              </motion.div>
            </AnimatePresence>
          )}
        </div>

        {items.length > 1 && (
          <details className="group">
            <summary className="text-[10px] uppercase tracking-wider text-muted-foreground cursor-pointer hover:text-foreground transition-colors list-none flex items-center gap-1">
              <span>Histórico ({items.length - 1})</span>
              <span className="group-open:rotate-90 transition-transform">▸</span>
            </summary>
            <ul className="mt-2 space-y-1.5 max-h-40 overflow-y-auto pr-1">
              {items.slice(1).map(it => (
                <li key={it.id} className="text-xs text-muted-foreground border-l-2 border-border pl-2">
                  &ldquo;{it.text}&rdquo;
                </li>
              ))}
            </ul>
          </details>
        )}
      </CardContent>
    </Card>
  );
}

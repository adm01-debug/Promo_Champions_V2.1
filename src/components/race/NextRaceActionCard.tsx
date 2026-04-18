import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Target, ArrowRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNextBestActionQuery } from '@/hooks/useNextBestAction';

interface Props {
  salespersonId?: string;
}

/**
 * Card sticky no topo do Hub: a próxima jogada sugerida pela IA.
 * Compacto, dispensável, link direto para Tarefas.
 */
export function NextRaceActionCard({ salespersonId }: Props) {
  const { data, isLoading } = useNextBestActionQuery(salespersonId);
  const [dismissed, setDismissed] = useState(false);

  if (!salespersonId || isLoading || dismissed) return null;
  const action = data?.actions?.[0];
  if (!action) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.35 }}
        className="relative rounded-xl border-2 border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-3 shadow-lg backdrop-blur-sm"
      >
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/20 text-primary">
            <Target className="h-4 w-4" strokeWidth={2.5} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-primary">
                Próxima jogada
              </span>
            </div>
            <p className="text-sm font-bold text-foreground truncate mt-0.5">{action.title}</p>
            <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{action.description}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <Button asChild size="sm" className="h-8">
              <Link to="/tarefas">
                Trabalhar <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground"
              onClick={() => setDismissed(true)}
              aria-label="Dispensar"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, ChevronUp, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChecklistItem {
  id: string;
  label: string;
  done: boolean;
  action?: () => void;
}

interface Props {
  items: ChecklistItem[];
  onDismiss?: () => void;
  storageKey?: string;
}

const COLLAPSE_KEY = 'race_onboarding_collapsed';
const DISMISS_KEY = 'race_onboarding_dismissed';

/**
 * Checklist flutuante de onboarding. Aparece no canto inferior-direito.
 * Some quando 100% completo OU usuário dispensa explicitamente.
 */
export function RaceOnboardingChecklist({ items, onDismiss }: Props) {
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem(COLLAPSE_KEY) === '1');
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(DISMISS_KEY) === '1');

  const completed = items.filter((i) => i.done).length;
  const total = items.length;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
  const allDone = completed === total && total > 0;

  useEffect(() => {
    localStorage.setItem(COLLAPSE_KEY, collapsed ? '1' : '0');
  }, [collapsed]);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem(DISMISS_KEY, '1');
    onDismiss?.();
  };

  if (dismissed || allDone) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        className="fixed bottom-4 right-4 z-40 w-72"
        role="region"
        aria-label="Checklist de onboarding da Race Arena"
      >
        <Card className="shadow-xl border-primary/20">
          <CardHeader className="py-2 px-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-xs font-semibold flex items-center gap-2">
              <span>🏁 Entre na corrida</span>
              <span className="text-[10px] font-normal text-muted-foreground">{completed}/{total}</span>
            </CardTitle>
            <div className="flex gap-0.5">
              <button
                onClick={() => setCollapsed((c) => !c)}
                className="p-1 rounded hover:bg-muted text-muted-foreground"
                aria-label={collapsed ? 'Expandir' : 'Recolher'}
              >
                {collapsed ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={handleDismiss}
                className="p-1 rounded hover:bg-muted text-muted-foreground"
                aria-label="Dispensar"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </CardHeader>
          {!collapsed && (
            <CardContent className="pt-0 pb-3 px-3 space-y-2">
              {/* Barra de progresso */}
              <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                <motion.div
                  className="h-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                />
              </div>
              <ul className="space-y-1">
                {items.map((item) => (
                  <li key={item.id}>
                    <button
                      onClick={item.action}
                      disabled={item.done || !item.action}
                      className={cn(
                        'w-full flex items-center gap-2 text-xs px-2 py-1.5 rounded-md text-left transition-colors',
                        item.done
                          ? 'text-muted-foreground line-through'
                          : 'hover:bg-muted text-foreground',
                        !item.action && 'cursor-default',
                      )}
                    >
                      <span
                        className={cn(
                          'w-4 h-4 rounded-full border flex items-center justify-center flex-shrink-0',
                          item.done
                            ? 'bg-success border-success text-success-foreground'
                            : 'border-muted-foreground/40',
                        )}
                      >
                        {item.done && <Check className="w-2.5 h-2.5" />}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </CardContent>
          )}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}

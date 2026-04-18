import { Target, Eye, Trophy, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { RaceViewMode } from '@/hooks/race/useRaceViewMode';

interface Props {
  mode: RaceViewMode;
  onChange: (mode: RaceViewMode) => void;
}

const OPTIONS: Array<{ value: RaceViewMode; label: string; icon: typeof Eye; hint: string }> = [
  { value: 'focus', label: 'Foco', icon: Target, hint: 'Pista + top-5 + 1 KPI (default)' },
  { value: 'immersive', label: 'Imersivo', icon: Eye, hint: 'Só pista, zero HUD lateral' },
  { value: 'competitive', label: 'Competitivo', icon: Trophy, hint: 'Pista + comentários + broadcast' },
  { value: 'analysis', label: 'Análise', icon: BarChart3, hint: 'Tudo + métricas detalhadas' },
];

/**
 * Toggle inset com 3 modos de visualização da Race Arena.
 * Persistência via useRaceViewMode.
 */
export function RaceViewModeToggle({ mode, onChange }: Props) {
  return (
    <div
      role="tablist"
      aria-label="Modo de visualização"
      className="inline-flex items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5 shadow-sm"
    >
      {OPTIONS.map((opt) => {
        const Icon = opt.icon;
        const active = opt.value === mode;
        return (
          <button
            key={opt.value}
            role="tab"
            aria-selected={active}
            title={opt.hint}
            onClick={() => onChange(opt.value)}
            className={cn(
              'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
              active
                ? 'bg-background text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground hover:bg-background/60',
            )}
          >
            <Icon className="w-3.5 h-3.5" aria-hidden />
            <span className="hidden sm:inline">{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}

import { RaceCar } from './RaceCar';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';
import type { RaceCarPreset } from './raceColors';
import { cn } from '@/lib/utils';

interface CarPresetCardProps {
  preset: RaceCarPreset;
  selected: boolean;
  carNumber: number;
  onSelect: (id: string) => void;
}

/**
 * Card de seleção de preset com mini-preview SVG do carro real.
 * Mostra emoji, nome e badge "Pride" para temas inclusivos.
 */
export function CarPresetCard({ preset, selected, carNumber, onSelect }: CarPresetCardProps) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={() => onSelect(preset.id)}
      aria-label={`Selecionar carro ${preset.name}`}
      className={cn(
        'group relative flex flex-col items-center gap-1 rounded-lg border-2 p-2 transition-all',
        'hover:scale-[1.04] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
        selected
          ? 'border-primary bg-primary/10 shadow-lg ring-2 ring-primary/40'
          : 'border-border bg-card hover:border-primary/40',
      )}
    >
      {selected && (
        <div className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground shadow">
          <Check className="h-3 w-3" />
        </div>
      )}

      <div className="flex h-14 w-full items-center justify-center overflow-hidden rounded-md bg-gradient-to-b from-sky-100 to-sky-50 dark:from-slate-800 dark:to-slate-900">
        <svg viewBox="-40 -22 80 44" className="h-12 w-20" aria-hidden>
          <RaceCar
            number={carNumber}
            primaryColor={preset.primary}
            secondaryColor={preset.secondary}
            style={preset.style}
            scale={0.9}
            livery={preset.pattern}
            liveryAccent={preset.accent}
            liveryUid={`preset-${preset.id}`}
          />
        </svg>
      </div>

      <div className="flex w-full items-center justify-center gap-1">
        <span className="text-xs">{preset.emoji}</span>
        <span className="truncate text-[10px] font-semibold leading-tight">{preset.name}</span>
      </div>

    </button>
  );
}

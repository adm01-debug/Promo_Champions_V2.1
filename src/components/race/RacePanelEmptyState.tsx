import { type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Variant = 'no-cars' | 'no-rival' | 'no-history' | 'no-data';

interface Props {
  variant: Variant;
  title?: string;
  description?: string;
  action?: { label: string; onClick: () => void } | { label: string; href: string };
  className?: string;
  children?: ReactNode;
}

const PRESETS: Record<Variant, { title: string; description: string; Illustration: () => JSX.Element }> = {
  'no-cars': {
    title: 'Grid vazio',
    description: 'Nenhum carro está na pista ainda. Configure pilotos no painel admin.',
    Illustration: EmptyTrack,
  },
  'no-rival': {
    title: 'Sem rival ativo',
    description: 'Quando outro piloto estiver perto da sua posição, ele aparecerá aqui.',
    Illustration: HelmetIcon,
  },
  'no-history': {
    title: 'Sem histórico',
    description: 'Complete sua primeira temporada para ver suas conquistas aqui.',
    Illustration: TrophySilhouette,
  },
  'no-data': {
    title: 'Sem dados ainda',
    description: 'As métricas aparecerão assim que houver atividade.',
    Illustration: EmptyTrack,
  },
};

/**
 * Empty state genérico para painéis internos da Race Arena.
 * Para o empty state da Arena inteira (sem season), use `RaceEmptyState`.
 */
export function RacePanelEmptyState({ variant, title, description, action, className, children }: Props) {
  const preset = PRESETS[variant];
  const Illustration = preset.Illustration;
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'flex flex-col items-center justify-center text-center gap-3 py-8 px-4',
        className,
      )}
    >
      <div className="w-20 h-20 opacity-60" aria-hidden="true">
        <Illustration />
      </div>
      <div className="space-y-1">
        <p className="text-sm font-bold">{title ?? preset.title}</p>
        <p className="text-xs text-muted-foreground max-w-xs">{description ?? preset.description}</p>
      </div>
      {action && (
        'href' in action ? (
          <Button asChild size="sm" variant="outline"><a href={action.href}>{action.label}</a></Button>
        ) : (
          <Button onClick={action.onClick} size="sm" variant="outline">{action.label}</Button>
        )
      )}
      {children}
    </div>
  );
}

function EmptyTrack() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <ellipse cx="32" cy="32" rx="26" ry="18" stroke="hsl(var(--muted-foreground) / 0.4)" strokeWidth="2" strokeDasharray="3 3" />
      <ellipse cx="32" cy="32" rx="14" ry="8" stroke="hsl(var(--muted-foreground) / 0.3)" strokeWidth="1.5" strokeDasharray="2 2" />
      <path d="M28 14h8v4h-8z M28 46h8v4h-8z" fill="hsl(var(--border))" />
    </svg>
  );
}

function HelmetIcon() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path d="M16 36c0-10 7-18 16-18s16 8 16 18v6H16v-6z" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="1.5" />
      <rect x="20" y="28" width="24" height="8" rx="2" fill="hsl(var(--muted-foreground) / 0.2)" />
      <rect x="14" y="42" width="36" height="4" rx="1" fill="hsl(var(--border))" />
    </svg>
  );
}

function TrophySilhouette() {
  return (
    <svg viewBox="0 0 64 64" fill="none" className="w-full h-full">
      <path d="M22 12h20v18a10 10 0 01-20 0V12z" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="1.5" />
      <path d="M14 16h8M42 16h8" stroke="hsl(var(--border))" strokeWidth="2" strokeLinecap="round" />
      <rect x="26" y="42" width="12" height="6" fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="1.5" />
      <rect x="20" y="48" width="24" height="4" rx="1" fill="hsl(var(--border))" />
    </svg>
  );
}

import { Volume2, VolumeX } from 'lucide-react';

interface Props {
  muted: boolean;
  onToggle: () => void;
}

/**
 * Botão flutuante 🔊/🔇 alinhado ao RaceCountdownBadge (canto inferior direito).
 * Posicionado um pouco mais à esquerda para não colidir.
 */
export function RaceMuteToggle({ muted, onToggle }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={muted ? 'Ativar sons da corrida' : 'Mutar sons da corrida'}
      className="absolute bottom-3 right-[120px] z-20 flex h-8 w-8 items-center justify-center rounded-xl border border-border/50 backdrop-blur-md shadow-lg transition-all hover:scale-110"
      style={{ background: 'hsl(var(--background) / 0.78)' }}
    >
      {muted ? (
        <VolumeX className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={2.4} />
      ) : (
        <Volume2 className="h-3.5 w-3.5 text-primary" strokeWidth={2.4} />
      )}
    </button>
  );
}

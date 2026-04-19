import { Fireworks } from './Fireworks';
import { useEffect, useState } from 'react';
import { getCelebrationIntensity, type CelebrationInput } from '@/lib/race/getCelebrationIntensity';
import { useRaceCalm } from '@/contexts/RaceCalmContext';

interface Props {
  /** Disparado quando há um feito a celebrar; null = nenhum. */
  event: CelebrationInput | null;
  /** Callback opcional para que o pai dispare som/shake correspondente. */
  onIntensity?: (intensity: ReturnType<typeof getCelebrationIntensity>) => void;
}

/**
 * Adapter sobre Fireworks que:
 *  - Calcula intensidade proporcional ao feito.
 *  - Suprime fireworks em Calm Mode (apenas chama callback para som leve).
 *  - Notifica o pai (que decide shake/som) via onIntensity.
 *
 * Garante que celebrações triviais (P15→P14) não disparem o show completo.
 */
export function ProportionalFireworks({ event, onIntensity }: Props) {
  const { calm } = useRaceCalm();
  const [active, setActive] = useState(false);

  useEffect(() => {
    if (!event) return;
    const intensity = getCelebrationIntensity(event);
    onIntensity?.(intensity);
    if (calm || intensity.fireworks === 0) return;
    setActive(true);
    const t = window.setTimeout(() => setActive(false), intensity.duration + 100);
    return () => window.clearTimeout(t);
  }, [event, calm, onIntensity]);

  return <Fireworks active={active} />;
}

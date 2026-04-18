import { Button } from '@/components/ui/button';
import { Volume2, VolumeX } from 'lucide-react';

interface Props {
  muted: boolean;
  onToggle: () => void;
}

export function RaceSoundToggle({ muted, onToggle }: Props) {
  return (
    <Button variant="outline" size="icon" onClick={onToggle} title={muted ? 'Ativar som' : 'Mutar'}>
      {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
    </Button>
  );
}

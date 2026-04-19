import { useRef, useState } from 'react';
import { Crown, Download, Share2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { fmtCompact } from './raceFormatters';

interface Props {
  championName: string;
  avatarUrl?: string | null;
  seasonName: string;
  rank: number;
  totalSales: number;
  takeovers?: number;
  streakDays?: number;
}

/**
 * Card visual exportável para compartilhamento de fim de season.
 * Renderiza para PNG via html-to-image (lazy import).
 */
export function SeasonRecapCard({
  championName,
  avatarUrl,
  seasonName,
  rank,
  totalSales,
  takeovers = 0,
  streakDays = 0,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const initials = championName
    .split(' ')
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

  async function exportPng(action: 'download' | 'copy') {
    if (!ref.current) return;
    setBusy(true);
    try {
      const { toPng, toBlob } = await import('html-to-image');
      if (action === 'download') {
        const url = await toPng(ref.current, { pixelRatio: 2, cacheBust: true });
        const a = document.createElement('a');
        a.href = url;
        a.download = `race-recap-${seasonName.toLowerCase().replace(/\s+/g, '-')}.png`;
        a.click();
        toast.success('🏁 Card baixado!');
      } else {
        const blob = await toBlob(ref.current, { pixelRatio: 2, cacheBust: true });
        if (blob && navigator.clipboard && 'write' in navigator.clipboard) {
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
          toast.success('📋 Copiado para área de transferência!');
        } else {
          toast.error('Cópia para clipboard não suportada neste navegador.');
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao gerar imagem';
      toast.error(msg);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div
        ref={ref}
        className="rounded-xl p-6 bg-gradient-to-br from-warning/30 via-primary/10 to-background border-2 border-warning/40 shadow-2xl"
        aria-label={`Resumo da temporada ${seasonName}`}
      >
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <Avatar className="w-16 h-16 ring-4 ring-warning shadow-xl">
              {avatarUrl && <AvatarImage src={avatarUrl} alt={championName} />}
              <AvatarFallback className="text-lg font-black">{initials}</AvatarFallback>
            </Avatar>
            <Crown className="absolute -top-3 -right-1 w-6 h-6 text-warning fill-warning drop-shadow" aria-hidden />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">
              Race Arena · {seasonName}
            </p>
            <p className="text-2xl font-display font-black truncate leading-tight">{championName}</p>
            <p className="text-sm font-semibold text-warning">P{rank} · {fmtCompact(totalSales)} pts</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-warning/20">
          <Stat label="Pontos" value={fmtCompact(totalSales)} />
          <Stat label="Takeovers" value={String(takeovers)} />
          <Stat label="Streak" value={`${streakDays}d`} />
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={() => exportPng('download')} disabled={busy} size="sm" className="flex-1">
          <Download className="w-4 h-4 mr-2" /> Baixar PNG
        </Button>
        <Button
          onClick={() => exportPng('copy')}
          disabled={busy}
          size="sm"
          variant="outline"
          className="flex-1"
        >
          <Share2 className="w-4 h-4 mr-2" /> Copiar
        </Button>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <div className="text-lg font-display font-black tabular-nums">{value}</div>
      <div className="text-[9px] uppercase tracking-wide text-muted-foreground">{label}</div>
    </div>
  );
}

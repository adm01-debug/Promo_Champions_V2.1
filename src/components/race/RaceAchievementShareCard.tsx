import { useRef, useState } from 'react';
import { Trophy, Share2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { fmtCompact } from './raceFormatters';

export type AchievementType = 'overtake_top3' | 'race_win' | 'personal_record' | 'streak_milestone';

interface Props {
  type: AchievementType;
  pilotName: string;
  avatarUrl?: string | null;
  detail: string;
  value?: string;
  seasonName?: string;
}

const TYPE_META: Record<AchievementType, { title: string; emoji: string; gradient: string }> = {
  overtake_top3:    { title: 'Subiu ao TOP 3',     emoji: '🚀', gradient: 'from-primary/30 via-primary/10 to-background' },
  race_win:         { title: 'Vitória na Corrida', emoji: '🏆', gradient: 'from-warning/30 via-warning/10 to-background' },
  personal_record:  { title: 'Recorde Pessoal',    emoji: '⚡', gradient: 'from-success/30 via-success/10 to-background' },
  streak_milestone: { title: 'Streak Marcante',    emoji: '🔥', gradient: 'from-destructive/30 via-destructive/10 to-background' },
};

/** Cartão exportável de conquista. PNG + Web Share API com fallback download. */
export function RaceAchievementShareCard({ type, pilotName, avatarUrl, detail, value, seasonName }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const meta = TYPE_META[type];
  const initials = pilotName.split(' ').slice(0, 2).map((p) => p[0]).join('').toUpperCase();

  async function generateBlob(): Promise<Blob | null> {
    if (!ref.current) return null;
    const { toBlob } = await import('html-to-image');
    return toBlob(ref.current, { pixelRatio: 2, cacheBust: true });
  }

  async function handleShare() {
    setBusy(true);
    try {
      const blob = await generateBlob();
      if (!blob) throw new Error('Falha ao gerar imagem');
      const file = new File([blob], `race-${type}.png`, { type: 'image/png' });
      const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean; share?: (d: ShareData) => Promise<void> };
      if (nav.share && nav.canShare?.({ files: [file] })) {
        await nav.share({ files: [file], title: meta.title, text: `${meta.emoji} ${detail}` });
        toast.success('Compartilhado!');
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `race-${type}.png`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success('🏁 Card baixado!');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao compartilhar');
    } finally {
      setBusy(false);
    }
  }

  async function handleDownload() {
    setBusy(true);
    try {
      const blob = await generateBlob();
      if (!blob) throw new Error('Falha ao gerar imagem');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `race-${type}.png`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('🏁 Card baixado!');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div
        ref={ref}
        className={`rounded-xl p-6 bg-gradient-to-br ${meta.gradient} border-2 border-primary/40 shadow-2xl`}
        aria-label={meta.title}
      >
        <div className="flex items-center gap-4">
          <Avatar className="w-16 h-16 ring-4 ring-primary shadow-xl shrink-0">
            {avatarUrl && <AvatarImage src={avatarUrl} alt={pilotName} />}
            <AvatarFallback className="text-lg font-black">{initials}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold flex items-center gap-1">
              <Trophy className="w-3 h-3" /> Race Arena {seasonName && `· ${seasonName}`}
            </p>
            <p className="text-2xl font-display font-black truncate leading-tight">
              {meta.emoji} {meta.title}
            </p>
            <p className="text-sm font-semibold text-primary truncate">{pilotName}</p>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-primary/20 text-center">
          <p className="text-sm text-muted-foreground">{detail}</p>
          {value && <p className="text-3xl font-display font-black tabular-nums mt-1">{value}</p>}
        </div>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleShare} disabled={busy} size="sm" className="flex-1">
          <Share2 className="w-4 h-4 mr-2" /> Compartilhar
        </Button>
        <Button onClick={handleDownload} disabled={busy} size="sm" variant="outline" className="flex-1">
          <Download className="w-4 h-4 mr-2" /> Baixar
        </Button>
      </div>
    </div>
  );
}

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LEAD_CATEGORY_CONFIG, ScoreRing } from './scoring-ui';

interface LeadScoringKpisProps {
  avgScore: number;
  hotCount: number;
  warmCount: number;
  coldCount: number;
}

export function LeadScoringKpis({
  avgScore,
  hotCount,
  warmCount,
  coldCount,
}: LeadScoringKpisProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 border-none shadow-2xl backdrop-blur-md">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="relative group">
            <ScoreRing score={avgScore} size={64} />
            <div className="absolute inset-0 bg-primary/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none">
              Global Index
            </p>
            <div className="flex items-baseline gap-1.5">
              <span className="font-display font-black text-3xl tracking-tighter">
                {avgScore}
              </span>
              <span className="text-[10px] font-bold text-primary italic">PCT</span>
            </div>
          </div>
        </CardContent>
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent opacity-20" />
      </Card>

      {[
        { cat: 'Hot' as const, count: hotCount },
        { cat: 'Warm' as const, count: warmCount },
        { cat: 'Cold' as const, count: coldCount },
      ].map(({ cat, count }) => {
        const cfg = LEAD_CATEGORY_CONFIG[cat];
        const Icon = cfg.icon;
        return (
          <Card
            key={cat}
            className={cn(
              'relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 border-none shadow-xl backdrop-blur-md transition-all hover:scale-[1.02]'
            )}
          >
            <CardContent className="p-6 flex items-center gap-5">
              <div
                className={cn('p-4 rounded-2xl ring-1 ring-white/5 shadow-inner', cfg.bg)}
              >
                <Icon className={cn('h-6 w-6', cfg.color)} />
              </div>
              <div className="space-y-1">
                <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none">
                  {cfg.label}
                </p>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-display font-black text-3xl tracking-tighter">
                    {count}
                  </span>
                  <span className="text-[10px] font-bold text-muted-foreground">
                    UNIT
                  </span>
                </div>
              </div>
            </CardContent>
            <div
              className={cn(
                'absolute bottom-0 left-0 w-1/2 h-0.5 opacity-40',
                cfg.bg.split(' ')[0]
              )}
            />
          </Card>
        );
      })}
    </div>
  );
}

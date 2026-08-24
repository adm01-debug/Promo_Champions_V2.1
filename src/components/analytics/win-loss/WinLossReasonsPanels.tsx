import { FC, memo, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, XCircle } from 'lucide-react';

interface Reason {
  reason: string;
  count: number;
}

interface PanelProps {
  title: string;
  reasons: Reason[];
  total: number;
  tone: 'success' | 'destructive';
}

const ReasonPanel: FC<PanelProps> = memo(({ title, reasons, total, tone }) => {
  const Icon = tone === 'success' ? Trophy : XCircle;
  const rows = useMemo(
    () =>
      reasons.map((r) => ({
        ...r,
        pct: total > 0 ? (r.count / total) * 100 : 0,
      })),
    [reasons, total],
  );
  return (
    <Card className="glass border-border/40">
      <CardHeader className="pb-2">
        <CardTitle
          className={`text-section-title text-xs text-${tone} flex items-center gap-2 uppercase tracking-widest`}
        >
          <Icon className="h-3.5 w-3.5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {rows.map((r, i) => (
          <div key={i} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="truncate font-medium">{r.reason}</span>
              <span className="font-bold">{r.count}</span>
            </div>
            <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden">
              <div
                className={`h-full bg-${tone}/60 rounded-full`}
                style={{ width: `${r.pct}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
});
ReasonPanel.displayName = 'ReasonPanel';

interface Props {
  topWinReasons: Reason[];
  topLossReasons: Reason[];
  totalWins: number;
  totalLosses: number;
}

const WinLossReasonsPanelsBase: FC<Props> = ({ topWinReasons, topLossReasons, totalWins, totalLosses }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
    <ReasonPanel title="Por que Ganhamos" reasons={topWinReasons} total={totalWins} tone="success" />
    <ReasonPanel title="Por que Perdemos" reasons={topLossReasons} total={totalLosses} tone="destructive" />
  </div>
);

export const WinLossReasonsPanels = memo(WinLossReasonsPanelsBase);

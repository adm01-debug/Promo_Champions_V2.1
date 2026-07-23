import { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Trophy, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useChurnOverdueBySeller } from '@/hooks/bi/useChurnOverdueBySeller';
import { cn } from '@/lib/utils';

interface Props {
  className?: string;
  days?: number;
  limit?: number;
}

export const ChurnOverdueRankingCard = memo(
  ({ className, days = 30, limit = 5 }: Props) => {
    const navigate = useNavigate();
    const { data, isLoading } = useChurnOverdueBySeller(days, limit);
    const max = data?.[0]?.overdue ?? 0;

    return (
      <Card className={cn('border-border/60', className)}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="h-4 w-4 text-amber-500" />
            Ranking — Churn atrasado por vendedor
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <Skeleton className="h-32 w-full" />
          ) : !data || data.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nenhuma tarefa de churn atrasada no período.
            </p>
          ) : (
            data.map((row, i) => {
              const pct = max > 0 ? (row.overdue / max) * 100 : 0;
              return (
                <button
                  key={row.salesperson_id}
                  onClick={() =>
                    navigate(
                      `/tarefas?churn=1&status=overdue&salesperson_id=${row.salesperson_id}`,
                    )
                  }
                  className="group w-full text-left space-y-1 rounded-md border border-border/40 bg-muted/20 p-2 transition-colors hover:bg-muted/40"
                  aria-label={`Ver ${row.overdue} tarefas atrasadas de ${row.name}`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-2 font-medium">
                      <span className="tabular-nums text-muted-foreground">
                        #{i + 1}
                      </span>
                      <span className="truncate">{row.name}</span>
                    </span>
                    <span className="flex items-center gap-2 tabular-nums">
                      <span className="text-destructive font-semibold">
                        {row.overdue}
                      </span>
                      <span className="text-muted-foreground">
                        / {row.total}
                      </span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-destructive/70 transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </button>
              );
            })
          )}
          {data && data.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => navigate('/tarefas?churn=1&status=overdue')}
            >
              Ver todas as tarefas atrasadas
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          )}
        </CardContent>
      </Card>
    );
  },
);

ChurnOverdueRankingCard.displayName = 'ChurnOverdueRankingCard';

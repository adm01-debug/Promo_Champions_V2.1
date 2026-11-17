import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MoveRight, TrendingDown, TrendingUp } from 'lucide-react';

interface ABCItem {
  name: string;
  revenue: number;
  percentage: number;
  cumulativePercentage: number;
  classification: 'A' | 'B' | 'C';
}

export interface AbcMatrixShift {
  name: string;
  from: 'A' | 'B' | 'C';
  to: 'A' | 'B' | 'C';
  /** Variacao percentual da receita do cliente entre as duas janelas. */
  changePct: number;
  /** Frase com os dois valores medidos. Nada aqui e estimado. */
  reason: string;
}

const brl = (n: number) =>
  n.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  });

/**
 * Deriva as mudancas de classe ABC entre duas janelas ja classificadas. Funcao
 * pura: so entra cliente presente nas DUAS janelas (sem as duas nao existe
 * comparacao) e cuja classe mudou. Cada item cita a receita das duas janelas,
 * de onde a variacao saiu. Lista vazia -> a secao nao aparece.
 */
export function buildAbcMatrixShifts(
  recent: ABCItem[],
  previous: ABCItem[]
): AbcMatrixShift[] {
  if (!recent.length || !previous.length) return [];

  const before = new Map(previous.map(i => [i.name, i]));

  return recent
    .reduce<AbcMatrixShift[]>((out, now) => {
      const was = before.get(now.name);
      if (!was || was.classification === now.classification) return out;

      const changePct =
        was.revenue > 0 ? ((now.revenue - was.revenue) / was.revenue) * 100 : 100;

      out.push({
        name: now.name,
        from: was.classification,
        to: now.classification,
        changePct,
        reason: `receita de ${brl(was.revenue)} para ${brl(now.revenue)} entre as janelas`,
      });
      return out;
    }, [])
    .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct));
}

/** 'A' e melhor que 'C': subir de classe é ir de C para A. */
function isPromotion(from: string, to: string) {
  return to < from;
}

interface ABCMatrixShiftProps {
  shifts: AbcMatrixShift[];
  /** Rotulo das janelas comparadas, vindo do dado (nunca fixo no codigo). */
  windowLabel: string;
}

export function ABCMatrixShift({ shifts, windowLabel }: ABCMatrixShiftProps) {
  return (
    <Card className="glass border-border/40 overflow-hidden">
      <CardHeader className="border-b border-border/10 bg-muted/5">
        <CardTitle className="text-section-title flex items-center gap-2">
          <MoveRight className="h-4 w-4 text-primary" />
          Mudança de classe ABC
          <Badge
            variant="outline"
            className="ml-auto text-[10px] border-primary/30 text-primary"
          >
            {windowLabel}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {shifts.length === 0 ? (
          <p className="p-4 text-xs text-muted-foreground">
            Nenhum cliente mudou de classe entre as duas janelas comparadas.
          </p>
        ) : (
          <div className="divide-y divide-border/10">
            {shifts.map(shift => {
              const promoted = isPromotion(shift.from, shift.to);
              return (
                <div
                  key={shift.name}
                  className="p-4 flex items-center justify-between gap-4"
                >
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="text-sm font-semibold truncate">{shift.name}</span>
                    <span className="text-[11px] text-muted-foreground">
                      {shift.reason}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-mono text-muted-foreground">
                      {shift.from} → {shift.to}
                    </span>
                    <span
                      className={`flex items-center gap-1 text-xs font-bold ${
                        promoted ? 'text-status-success' : 'text-status-error'
                      }`}
                    >
                      {promoted ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      {shift.changePct > 0 ? '+' : ''}
                      {shift.changePct.toFixed(0)}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

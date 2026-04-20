import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { CalendarClock, User, FileText, TrendingUp, MoreVertical, Pause, Play, XCircle } from "lucide-react";
import { differenceInDays, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { QuoteCadenceRow } from "@/hooks/cadences/useQuoteCadences";
import {
  usePauseQuoteCadence,
  useResumeQuoteCadence,
  useCancelQuoteCadence,
} from "@/hooks/cadences/useQuoteCadenceMutations";

interface Props {
  row: QuoteCadenceRow;
  totalSteps?: number;
}

const statusVariant: Record<string, string> = {
  active: "bg-emerald-500/15 text-emerald-500 border-emerald-500/30",
  paused: "bg-amber-500/15 text-amber-500 border-amber-500/30",
  completed: "bg-primary/15 text-primary border-primary/30",
  cancelled: "bg-destructive/15 text-destructive border-destructive/30",
};

export function QuoteCadenceCard({ row, totalSteps = 5 }: Props) {
  const q = row.quote;
  const daysSinceSent = q?.sent_at ? differenceInDays(new Date(), parseISO(q.sent_at)) : null;
  const progress = Math.min((row.current_step / totalSteps) * 100, 100);
  const formatted = q?.total_value
    ? new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(q.total_value)
    : "—";

  return (
    <Card className="glass border-border/50 hover:border-primary/50 transition-colors">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
              <FileText className="h-3 w-3" />
              <span>{q?.quote_number ?? "Orçamento"}</span>
            </div>
            <h3 className="font-display font-semibold truncate">{q?.client_name ?? "Cliente"}</h3>
            <p className="text-sm text-muted-foreground mt-0.5">{formatted}</p>
          </div>
          <Badge variant="outline" className={statusVariant[row.status] ?? ""}>
            {row.status}
          </Badge>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Etapa {row.current_step} de {totalSteps}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        <div className="flex items-center justify-between text-xs text-muted-foreground pt-1 border-t border-border/30">
          <div className="flex items-center gap-1.5">
            <User className="h-3 w-3" />
            <span className="truncate max-w-[120px]">{q?.seller_name ?? "—"}</span>
          </div>
          {row.next_action_date && (
            <div className="flex items-center gap-1.5">
              <CalendarClock className="h-3 w-3" />
              <span>{format(parseISO(row.next_action_date), "dd MMM", { locale: ptBR })}</span>
            </div>
          )}
          {daysSinceSent !== null && (
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3 w-3" />
              <span>{daysSinceSent}d</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

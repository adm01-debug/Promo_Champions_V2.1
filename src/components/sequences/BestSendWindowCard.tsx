import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, TrendingUp } from "lucide-react";
import { useContactSendProfile } from "@/hooks/sequences/useSendTimeOptimization";
import { formatWindow, normalizeScore } from "./sendTimeHelpers";

interface Props {
  contactId: string;
  contactType: "lead" | "client";
}

export function BestSendWindowCard({ contactId, contactType }: Props) {
  const { data, isLoading } = useContactSendProfile(contactId, contactType);

  if (isLoading) {
    return <Skeleton className="h-24 w-full" />;
  }

  if (!data || data.length === 0) {
    return (
      <Card className="p-3 text-center">
        <Clock className="h-4 w-4 mx-auto text-muted-foreground/40 mb-1" />
        <p className="text-xs text-muted-foreground">Sem dados de engajamento ainda</p>
      </Card>
    );
  }

  const max = Math.max(...data.map((w) => Number(w.score)));

  return (
    <Card className="p-3 space-y-2">
      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        <TrendingUp className="h-3 w-3" />
        Melhores janelas
      </div>
      <div className="space-y-1.5">
        {data.map((w) => {
          const pct = normalizeScore(Number(w.score), max);
          return (
            <div key={`${w.day_of_week}-${w.hour_of_day}`} className="space-y-0.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-mono">{formatWindow(w.day_of_week, w.hour_of_day)}</span>
                <span className="text-muted-foreground">{w.opens}o · {w.clicks}c · {w.replies}r</span>
              </div>
              <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

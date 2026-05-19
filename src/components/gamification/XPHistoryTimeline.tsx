import { useXPHistory } from "@/hooks/gamification/useSalespersonXP";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap, Target, Flame, Trophy, Star, Gift, TrendingUp, Clock } from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { XPTimelineItem } from "./XPTimelineItem";

interface XPHistoryTimelineProps {
  salespersonId: string;
  salespersonName?: string;
  compact?: boolean;
  maxItems?: number;
}

const SOURCE_CONFIG: Record<string, { icon: React.ElementType; color: string; label: string }> = {
  achievement: { icon: Target, color: "text-success", label: "Meta Diária" },
  streak: { icon: Flame, color: "text-streak", label: "Sequência" },
  bonus: { icon: Trophy, color: "text-coins", label: "Bônus" },
  sale: { icon: TrendingUp, color: "text-primary", label: "Venda" },
  test: { icon: Gift, color: "text-info", label: "Teste" },
  default: { icon: Star, color: "text-xp", label: "XP" },
};

function getSourceConfig(sourceType: string) {
  return SOURCE_CONFIG[sourceType] || SOURCE_CONFIG.default;
}

export function XPHistoryTimeline({ salespersonId, salespersonName, compact = false, maxItems = 50 }: XPHistoryTimelineProps) {
  const { data: history, isLoading, error } = useXPHistory(salespersonId);

  if (isLoading) {
    return (
      <Card className="glass-card border-border/40">
        <CardHeader className="pb-3"><CardTitle className="text-base font-display flex items-center gap-2"><Clock className="h-4 w-4 text-xp" />Histórico de XP</CardTitle></CardHeader>
        <CardContent><div className="space-y-3">{[1, 2, 3, 4, 5].map((i) => (<div key={i} className="flex items-center gap-3"><Skeleton className="h-8 w-8 rounded-full" /><div className="flex-1 space-y-1"><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-1/2" /></div><Skeleton className="h-6 w-16" /></div>))}</div></CardContent>
      </Card>
    );
  }

  if (error) return <Card className="glass-card border-border/40"><CardContent className="py-8 text-center text-muted-foreground">Erro ao carregar histórico de XP</CardContent></Card>;

  const displayHistory = history?.slice(0, maxItems) || [];

  if (displayHistory.length === 0) {
    return (
      <Card className="glass-card border-border/40">
        <CardHeader className="pb-3"><CardTitle className="text-base font-display flex items-center gap-2"><Clock className="h-4 w-4 text-xp" />Histórico de XP{salespersonName && <span className="text-muted-foreground font-normal text-sm">• {salespersonName}</span>}</CardTitle></CardHeader>
        <CardContent className="py-8 text-center"><Zap className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" /><p className="text-muted-foreground text-sm">Nenhum XP registrado ainda</p><p className="text-xs text-muted-foreground/70 mt-1">Bata metas e ganhe XP!</p></CardContent>
      </Card>
    );
  }

  const groupedByDate = displayHistory.reduce((acc, item) => {
    const date = format(new Date(item.created_at), "yyyy-MM-dd");
    if (!acc[date]) acc[date] = [];
    acc[date].push(item);
    return acc;
  }, {} as Record<string, typeof displayHistory>);

  const totalXPToday = displayHistory.filter(item => format(new Date(item.created_at), "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd")).reduce((sum, item) => sum + item.xp_amount, 0);

  return (
    <Card className="glass-card border-border/40">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-display flex items-center gap-2"><Clock className="h-4 w-4 text-xp" />Histórico de XP{salespersonName && <span className="text-muted-foreground font-normal text-sm">• {salespersonName}</span>}</CardTitle>
          {totalXPToday > 0 && <Badge variant="secondary" className="bg-xp/10 text-xp border-xp/20"><Zap className="h-3 w-3 mr-1" />+{totalXPToday} hoje</Badge>}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className={compact ? "h-[300px]" : "h-[400px]"}>
          <div className="p-4 pt-0 space-y-4">
            <AnimatePresence>
              {Object.entries(groupedByDate).map(([date, items], groupIndex) => {
                const isToday = date === format(new Date(), "yyyy-MM-dd");
                const dateLabel = isToday ? "Hoje" : format(new Date(date), "dd 'de' MMMM", { locale: ptBR });
                const totalDayXP = items.reduce((sum, item) => sum + item.xp_amount, 0);
                return (
                  <motion.div key={date} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: groupIndex * 0.05 }} className="space-y-2">
                    <div className="flex items-center justify-between sticky top-0 bg-card/95 backdrop-blur-sm py-1 z-10">
                      <span className={cn("text-xs font-medium", isToday ? "text-primary" : "text-muted-foreground")}>{dateLabel}</span>
                      <span className="text-xs text-xp font-medium">+{totalDayXP} XP</span>
                    </div>
                    <div className="relative pl-6 space-y-2">
                      <div className="absolute left-[9px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-xp/30 via-primary/20 to-transparent" />
                      {items.map((item, itemIndex) => {
                        const config = getSourceConfig(item.source_type);
                        return (
                          <XPTimelineItem
                            key={item.id}
                            id={item.id}
                            xp_amount={item.xp_amount}
                            source_type={item.source_type}
                            description={item.description}
                            created_at={item.created_at}
                            icon={config.icon}
                            iconColor={config.color}
                            label={config.label}
                            timeAgo={formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: ptBR })}
                            groupIndex={groupIndex}
                            itemIndex={itemIndex}
                          />
                        );
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

export function XPHistoryCompact({ salespersonId }: { salespersonId: string }) {
  const { data: history, isLoading } = useXPHistory(salespersonId);
  if (isLoading) return <div className="space-y-2">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-8 w-full" />)}</div>;
  const recentHistory = history?.slice(0, 5) || [];
  if (recentHistory.length === 0) return <div className="text-center py-4 text-muted-foreground text-sm">Nenhum XP registrado</div>;

  return (
    <div className="space-y-1.5">
      {recentHistory.map((item) => {
        const config = getSourceConfig(item.source_type);
        const Icon = config.icon;
        return (
          <div key={item.id} className="flex items-center justify-between py-1.5 px-2 rounded-md hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-2 min-w-0"><Icon className={cn("h-3.5 w-3.5 shrink-0", config.color)} /><span className="text-xs truncate">{item.description || config.label}</span></div>
            <span className="text-xs font-mono text-xp shrink-0">+{item.xp_amount}</span>
          </div>
        );
      })}
    </div>
  );
}

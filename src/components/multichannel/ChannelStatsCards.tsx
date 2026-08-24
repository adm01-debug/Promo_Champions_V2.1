import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, MessageCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Channel } from "@/hooks/useMultichannel";

interface ChannelStat {
  channel: Channel;
  total: number;
  outbound: number;
  inbound: number;
  replied: number;
  failed: number;
  responseRate: number;
}

interface Props {
  stats: ChannelStat[];
  channelConfig: Record<string, { label: string; icon: typeof MessageCircle; color: string }>;
}

export function ChannelStatsCards({ stats, channelConfig }: Props) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {stats.map(stat => {
        const cfg = channelConfig[stat.channel];
        if (!cfg) return null;
        const Icon = cfg.icon;

        return (
          <Card key={stat.channel} className="glass border-border/40 hover-lift transition-all">
            <CardContent className="pt-4 pb-3 space-y-2">
              <div className="flex items-center justify-between">
                <div className={cn("p-2 rounded-lg bg-muted/50")}>
                  <Icon className={cn("h-4 w-4", cfg.color)} />
                </div>
                {stat.responseRate > 0 && (
                  <span className={cn(
                    "text-xs font-medium flex items-center gap-0.5",
                    stat.responseRate >= 30 ? "text-status-success" : "text-status-warning"
                  )}>
                    {stat.responseRate >= 30 ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3" />
                    )}
                    {stat.responseRate}%
                  </span>
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{cfg.label}</p>
                <p className="font-display font-bold text-xl">{stat.total}</p>
              </div>
              <div className="flex gap-2 text-[10px] text-muted-foreground">
                <span>↑ {stat.outbound}</span>
                <span>↓ {stat.inbound}</span>
                {stat.failed > 0 && (
                  <span className="text-status-error">✕ {stat.failed}</span>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

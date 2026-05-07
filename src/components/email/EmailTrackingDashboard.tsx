import { useEmailTracking, useEmailTrackingStats } from "@/hooks/useEmailTracking";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  Mail,
  Eye,
  MousePointer2,
  Reply,
  AlertTriangle,
  Send,
  TrendingUp,
  Clock,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

const EVENT_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string; bg: string; badgeVariant: "default" | "secondary" | "destructive" | "outline" }> = {
  sent: { label: "DEPLOYED", icon: <Send className="h-3 w-3" />, color: "text-primary", bg: "bg-primary/10", badgeVariant: "default" },
  opened: { label: "ENGAGED", icon: <Eye className="h-3 w-3" />, color: "text-emerald-500", bg: "bg-emerald-500/10", badgeVariant: "secondary" },
  clicked: { label: "INTERACTED", icon: <MousePointer2 className="h-3 w-3" />, color: "text-blue-500", bg: "bg-blue-500/10", badgeVariant: "outline" },
  replied: { label: "RESPONDED", icon: <Reply className="h-3 w-3" />, color: "text-indigo-500", bg: "bg-indigo-500/10", badgeVariant: "secondary" },
  bounced: { label: "FAILED", icon: <AlertTriangle className="h-3 w-3" />, color: "text-rose-500", bg: "bg-rose-500/10", badgeVariant: "destructive" },
};


export function EmailTrackingDashboard() {
  const { data: events, isLoading: eventsLoading } = useEmailTracking();
  const { data: stats, isLoading: statsLoading } = useEmailTrackingStats();

  const isLoading = eventsLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6 p-4 lg:p-8">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4 lg:p-8">
      {/* Header with Command Style */}
      <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border/10">
        <div className="flex items-center gap-4">
          <div className="relative">
            <div className="p-3 rounded-2xl bg-primary/10 ring-1 ring-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]">
              <Mail className="h-7 w-7 text-primary animate-pulse" />
            </div>
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background" />
          </div>
          <div>
            <h1 className="font-display font-black text-3xl uppercase tracking-tighter italic">Comms Intel</h1>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none">Tracking System v1.2</span>
              <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
              <p className="text-[10px] text-primary font-bold uppercase tracking-wider">
                MONITORING {stats?.total_sent || 0} OUTBOUND SIGNALS
              </p>
            </div>
          </div>
        </div>
      </div>


      {/* Futuristic Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 border-none shadow-2xl backdrop-blur-md transition-all hover:scale-[1.02]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-primary/10 ring-1 ring-white/5">
              <Send className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none">Deployed</p>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display font-black text-3xl tracking-tighter">{stats?.total_sent || 0}</span>
                <span className="text-[10px] font-bold text-primary italic">TX</span>
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary/50 to-transparent opacity-20" />
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 border-none shadow-2xl backdrop-blur-md transition-all hover:scale-[1.02]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-emerald-500/10 ring-1 ring-white/5">
              <Eye className="h-6 w-6 text-emerald-500" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none">Engaged</p>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display font-black text-3xl tracking-tighter text-emerald-500">{stats?.open_rate || 0}</span>
                <span className="text-[10px] font-bold text-emerald-500 italic">%</span>
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/50 to-transparent opacity-20" />
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 border-none shadow-2xl backdrop-blur-md transition-all hover:scale-[1.02]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-blue-500/10 ring-1 ring-white/5">
              <MousePointer2 className="h-6 w-6 text-blue-500" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none">Interacted</p>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display font-black text-3xl tracking-tighter text-blue-500">{stats?.click_rate || 0}</span>
                <span className="text-[10px] font-bold text-blue-500 italic">%</span>
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/50 to-transparent opacity-20" />
        </Card>

        <Card className="relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 border-none shadow-2xl backdrop-blur-md transition-all hover:scale-[1.02]">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-indigo-500/10 ring-1 ring-white/5">
              <Reply className="h-6 w-6 text-indigo-500" />
            </div>
            <div className="space-y-1">
              <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest leading-none">Responded</p>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display font-black text-3xl tracking-tighter text-indigo-500">{stats?.reply_rate || 0}</span>
                <span className="text-[10px] font-bold text-indigo-500 italic">%</span>
              </div>
            </div>
          </CardContent>
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500/50 to-transparent opacity-20" />
        </Card>
      </div>


      {/* Performance Overview */}
      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-display flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Aberturas</span>
                  <span className="font-semibold text-status-success">{stats?.total_opened || 0}</span>
                </div>
                <Progress value={stats?.total_sent ? ((stats?.total_opened || 0) / stats.total_sent) * 100 : 0} className="h-2" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Cliques</span>
                  <span className="font-semibold text-status-info">{stats?.total_clicked || 0}</span>
                </div>
                <Progress value={stats?.total_sent ? ((stats?.total_clicked || 0) / stats.total_sent) * 100 : 0} className="h-2" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Respostas</span>
                  <span className="font-semibold">{stats?.total_replied || 0}</span>
                </div>
                <Progress value={stats?.total_sent ? ((stats?.total_replied || 0) / stats.total_sent) * 100 : 0} className="h-2" />
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Bounces</span>
                  <span className="font-semibold text-status-error">{stats?.total_bounced || 0}</span>
                </div>
                <Progress value={stats?.total_sent ? ((stats?.total_bounced || 0) / stats.total_sent) * 100 : 0} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Elite Event Log */}
        <Card className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-card/80 to-card/40 border border-border/20 shadow-2xl backdrop-blur-md rounded-2xl">
          <CardHeader className="p-6 border-b border-border/10">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-3 text-lg font-black uppercase tracking-tighter italic">
                <Clock className="h-5 w-5 text-primary" />
                Strategic Signal History
              </CardTitle>
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-accent/30 border border-white/5">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">LIVE DEPLOYMENT</span>
              </div>
            </div>
          </CardHeader>

          <CardContent>
            <ScrollArea className="max-h-[400px]">
              <div className="space-y-2">
                {events && events.length > 0 ? (
                  events.map(event => {
                    const config = EVENT_CONFIG[event.event_type] || EVENT_CONFIG.sent;
                    return (
                      <div key={event.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors border border-border/30">
                        <div className={cn(
                          "p-1.5 rounded-md",
                          event.event_type === 'sent' && "bg-primary/10",
                          event.event_type === 'opened' && "bg-success/10",
                          event.event_type === 'clicked' && "bg-info/10",
                          event.event_type === 'replied' && "bg-primary/10",
                          event.event_type === 'bounced' && "bg-destructive/10",
                          !['sent','opened','clicked','replied','bounced'].includes(event.event_type) && "bg-muted/10"
                        )}>
                          {config.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{event.subject}</p>
                          <p className="text-xs text-muted-foreground truncate">{event.recipient_email}</p>
                        </div>
                        <Badge variant={config.badgeVariant} className="text-[10px] shrink-0">
                          {config.label}
                        </Badge>
                        <span className="text-[10px] text-muted-foreground shrink-0">
                          {formatDistanceToNow(new Date(event.tracked_at), { addSuffix: true, locale: ptBR })}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12">
                    <Mail className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
                    <h3 className="font-display font-semibold text-lg mb-1">Nenhum evento rastreado</h3>
                    <p className="text-sm text-muted-foreground">
                      Eventos de abertura e clique aparecerão aqui quando emails forem rastreados
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

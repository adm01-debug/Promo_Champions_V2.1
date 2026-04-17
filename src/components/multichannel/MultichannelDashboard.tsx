import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useChannelStats,
  useChannelInteractions,
  useMessageTemplates,
  Channel,
} from "@/hooks/useMultichannel";
import { ChannelStatsCards } from "./ChannelStatsCards";
import { ChannelChart } from "./ChannelChart";
import { InteractionTimeline } from "./InteractionTimeline";
import { TemplateManager } from "./TemplateManager";
import { AIEmailComposerButton } from "@/components/email/AIEmailComposerButton";
import {
  MessageSquare,
  Mail,
  Linkedin,
  Phone,
  Smartphone,
  Search,
  FileText,
} from "lucide-react";
import { cn } from "@/lib/utils";

const CHANNEL_CONFIG: Record<Channel, { label: string; icon: typeof Mail; color: string }> = {
  whatsapp: { label: "WhatsApp", icon: MessageSquare, color: "text-success" },
  email: { label: "Email", icon: Mail, color: "text-primary" },
  linkedin: { label: "LinkedIn", icon: Linkedin, color: "text-info" },
  sms: { label: "SMS", icon: Smartphone, color: "text-status-warning" },
  phone: { label: "Telefone", icon: Phone, color: "text-status-info" },
};

export { CHANNEL_CONFIG };

export function MultichannelDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [channelFilter, setChannelFilter] = useState<Channel | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const { data: stats, isLoading: loadingStats } = useChannelStats(30);
  const { data: interactions, isLoading: loadingInteractions } = useChannelInteractions({
    channel: channelFilter,
    days: 30,
  });
  const { data: templates, isLoading: loadingTemplates } = useMessageTemplates();

  if (loadingStats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-6 w-6 text-primary" />
          <h1 className="font-display text-2xl font-bold">Multichannel</h1>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-80 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-primary/10">
            <MessageSquare className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-bold">Multichannel Engagement</h1>
            <p className="text-sm text-muted-foreground">
              {stats?.total || 0} interações nos últimos 30 dias
            </p>
          </div>
        </div>
        <AIEmailComposerButton variant="glow" size="default" label="Compor com IA" />
      </div>

      {/* Channel Filter Chips */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={!channelFilter ? "default" : "outline"}
          size="sm"
          onClick={() => setChannelFilter(undefined)}
        >
          Todos
        </Button>
        {(Object.entries(CHANNEL_CONFIG) as [Channel, typeof CHANNEL_CONFIG["whatsapp"]][]).map(
          ([ch, cfg]) => {
            const Icon = cfg.icon;
            return (
              <Button
                key={ch}
                variant={channelFilter === ch ? "default" : "outline"}
                size="sm"
                onClick={() => setChannelFilter(channelFilter === ch ? undefined : ch)}
                className="gap-1.5"
              >
                <Icon className={cn("h-3.5 w-3.5", channelFilter !== ch && cfg.color)} />
                {cfg.label}
                {stats?.stats.find(s => s.channel === ch)?.total ? (
                  <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                    {stats.stats.find(s => s.channel === ch)!.total}
                  </Badge>
                ) : null}
              </Button>
            );
          }
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview" className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="timeline" className="gap-1.5">
            <Phone className="h-3.5 w-3.5" />
            Timeline
          </TabsTrigger>
          <TabsTrigger value="templates" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" />
            Templates
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-4">
          {/* KPI Cards */}
          <ChannelStatsCards stats={stats?.stats || []} channelConfig={CHANNEL_CONFIG} />

          {/* Chart */}
          <ChannelChart data={stats?.byDay || []} />
        </TabsContent>

        <TabsContent value="timeline" className="space-y-4 mt-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por contato..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <InteractionTimeline
            interactions={interactions || []}
            isLoading={loadingInteractions}
            searchTerm={searchTerm}
            channelConfig={CHANNEL_CONFIG}
          />
        </TabsContent>

        <TabsContent value="templates" className="mt-4">
          <TemplateManager
            templates={templates || []}
            isLoading={loadingTemplates}
            channelConfig={CHANNEL_CONFIG}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState } from "react";
import { usePlaybooks } from "@/hooks/usePlaybooks";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Search, Users, Star, FileText, Handshake } from "lucide-react";
import { PlaybookCard } from "./PlaybookCard";
import { PlaybookAdherenceStats } from "./PlaybookAdherenceStats";

const stageConfig = {
  lead: { label: "Lead", icon: Users, color: "bg-muted-foreground" },
  qualified: { label: "Qualificado", icon: Star, color: "bg-status-info" },
  proposal: { label: "Proposta", icon: FileText, color: "bg-status-purple" },
  negotiation: { label: "Negociação", icon: Handshake, color: "bg-status-warning" },
};

const stages = ["lead", "qualified", "proposal", "negotiation"] as const;

export const PlaybooksManager = () => {
  const { data: playbooks, isLoading } = usePlaybooks();
  const [searchQuery, setSearchQuery] = useState("");

  if (isLoading) {
    return (
      <div className="space-y-4 animate-fade-in">
        <Skeleton className="h-10 w-48 animate-shimmer" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton
              key={i}
              className="h-48 animate-shimmer"
              style={{ animationDelay: `${i * 100}ms` }}
            />
          ))}
        </div>
      </div>
    );
  }

  const filteredPlaybooks = (playbooks || []).filter((pb) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      pb.title.toLowerCase().includes(q) ||
      pb.description?.toLowerCase().includes(q) ||
      pb.items?.some((item) => item.content.toLowerCase().includes(q))
    );
  });

  const groupedByStage = filteredPlaybooks.reduce(
    (acc, playbook) => {
      if (!acc[playbook.stage]) acc[playbook.stage] = [];
      acc[playbook.stage].push(playbook);
      return acc;
    },
    {} as Record<string, typeof playbooks>
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 group">
          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
            <BookOpen className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-2xl font-display font-bold gradient-text">Playbooks de Vendas</h2>
            <p className="text-muted-foreground text-sm">Guias e checklists para cada etapa do funil</p>
          </div>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar playbooks ou itens..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 border-border/40 focus:border-primary/50"
          />
        </div>
      </div>

      {/* Adherence Stats */}
      <PlaybookAdherenceStats />

      {/* Tabs */}
      <Tabs defaultValue="lead" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6 glass border border-border/40">
          {stages.map((stage) => {
            const config = stageConfig[stage];
            const Icon = config.icon;
            const count = groupedByStage[stage]?.length || 0;
            return (
              <TabsTrigger
                key={stage}
                value={stage}
                className="gap-2 transition-all duration-200 data-[state=active]:shadow-md"
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">{config.label}</span>
                {count > 0 && (
                  <span className="text-[10px] bg-primary/20 text-primary rounded-full px-1.5 py-0.5 font-semibold">
                    {count}
                  </span>
                )}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {stages.map((stage) => {
          const config = stageConfig[stage];
          const stagePlaybooks = groupedByStage[stage] || [];

          return (
            <TabsContent key={stage} value={stage} className="space-y-4">
              {stagePlaybooks.length === 0 ? (
                <Card variant="elevated" className="glass border-border/40 dark:border-glow">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <div className="p-4 rounded-full bg-gradient-to-br from-muted/50 to-muted/30 mb-4 shadow-inner">
                      <BookOpen className="h-12 w-12 text-muted-foreground opacity-50" />
                    </div>
                    <p className="text-muted-foreground font-medium">
                      {searchQuery
                        ? "Nenhum resultado para esta busca"
                        : "Nenhum playbook para esta etapa"}
                    </p>
                  </CardContent>
                </Card>
              ) : (
                stagePlaybooks.map((playbook, index) => (
                  <PlaybookCard
                    key={playbook.id}
                    playbook={playbook}
                    stageColor={config.color}
                    index={index}
                  />
                ))
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

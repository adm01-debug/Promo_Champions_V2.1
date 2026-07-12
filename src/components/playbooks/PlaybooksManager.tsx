import { useState } from "react";
import { motion } from "framer-motion";
import { usePlaybooks } from "@/hooks/usePlaybooks";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Search, Users, Star, FileText, Handshake } from "lucide-react";
import { cn } from "@/lib/utils";
import { PlaybookCard } from "./PlaybookCard";
import { PlaybookAdherenceStats } from "./PlaybookAdherenceStats";
import { PlaybookEmptyState } from "./PlaybookEmptyState";

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
      const stage = playbook.stage;
      if (!acc[stage]) acc[stage] = [];
      acc[stage]!.push(playbook);
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
            <h2 className="text-section-title gradient-text">Playbooks de Vendas</h2>
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
      <Tabs value={activeStage} onValueChange={(v) => setActiveStage(v as typeof stages[number])} className="w-full">
        {/* Hub strip: cards por stage, funcionam como navegação principal + contador */}
        <div
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4"
          role="tablist"
          aria-label="Etapas do funil"
        >
          {stages.map((stage, idx) => {
            const config = stageConfig[stage];
            const Icon = config.icon;
            const count = groupedByStage[stage]?.length || 0;
            const isActive = activeStage === stage;
            return (
              <motion.button
                key={stage}
                type="button"
                onClick={() => setActiveStage(stage)}
                aria-pressed={isActive}
                aria-label={`${config.label}: ${count} playbook${count === 1 ? "" : "s"}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "text-left rounded-xl border p-4 transition-all min-h-11",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  isActive
                    ? "border-primary/60 bg-primary/5 shadow-md shadow-primary/10"
                    : "border-border/40 bg-card/40 hover:border-border hover:bg-card/60"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={cn(
                      "p-2 rounded-lg",
                      isActive ? "bg-primary/20 text-primary" : "bg-muted/40 text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </div>
                  <span
                    className={cn(
                      "text-xl font-black tabular-nums",
                      isActive ? "text-primary" : "text-foreground"
                    )}
                  >
                    {count}
                  </span>
                </div>
                <p className={cn("text-sm font-semibold", isActive ? "text-primary" : "text-foreground")}>
                  {config.label}
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {count === 0 ? "Sem playbooks" : count === 1 ? "1 playbook" : `${count} playbooks`}
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* TabsList escondida — usada apenas para a11y (linkagem tab↔panel) */}
        <TabsList className="sr-only">
          {stages.map((stage) => (
            <TabsTrigger key={stage} value={stage}>
              {stageConfig[stage].label}
            </TabsTrigger>
          ))}
        </TabsList>

        {stages.map((stage) => {
          const config = stageConfig[stage];
          const stagePlaybooks = groupedByStage[stage] || [];

          return (
            <TabsContent key={stage} value={stage} className="space-y-4 mt-4">
              {stagePlaybooks.length === 0 ? (
                <PlaybookEmptyState
                  stageLabel={config.label}
                  isSearching={!!searchQuery.trim()}
                  onClearSearch={() => setSearchQuery("")}
                />
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

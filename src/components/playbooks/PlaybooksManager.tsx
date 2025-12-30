import { useState } from "react";
import { usePlaybooks, useCreatePlaybookItem, useDeletePlaybookItem } from "@/hooks/usePlaybooks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  BookOpen, 
  Plus, 
  Trash2, 
  Circle,
  Star,
  Users,
  FileText,
  Handshake
} from "lucide-react";
import { cn } from "@/lib/utils";

const stageConfig = {
  lead: { label: "Lead", icon: Users, color: "bg-muted-foreground" },
  qualified: { label: "Qualificado", icon: Star, color: "bg-status-info" },
  proposal: { label: "Proposta", icon: FileText, color: "bg-status-purple" },
  negotiation: { label: "Negociação", icon: Handshake, color: "bg-status-warning" },
};

export const PlaybooksManager = () => {
  const { data: playbooks, isLoading } = usePlaybooks();
  const createItem = useCreatePlaybookItem();
  const deleteItem = useDeletePlaybookItem();
  const [newItems, setNewItems] = useState<Record<string, string>>({});
  const [isRequired, setIsRequired] = useState<Record<string, boolean>>({});

  const handleAddItem = (playbookId: string, itemCount: number) => {
    const content = newItems[playbookId]?.trim();
    if (!content) return;

    createItem.mutate({
      playbook_id: playbookId,
      content,
      item_order: itemCount + 1,
      is_required: isRequired[playbookId] || false,
    });

    setNewItems((prev) => ({ ...prev, [playbookId]: "" }));
    setIsRequired((prev) => ({ ...prev, [playbookId]: false }));
  };

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

  const groupedByStage = (playbooks || []).reduce((acc, playbook) => {
    if (!acc[playbook.stage]) acc[playbook.stage] = [];
    acc[playbook.stage].push(playbook);
    return acc;
  }, {} as Record<string, typeof playbooks>);

  const stages = ["lead", "qualified", "proposal", "negotiation"];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 group">
        <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:shadow-xl">
          <BookOpen className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-display font-bold gradient-text">Playbooks de Vendas</h2>
          <p className="text-muted-foreground text-sm">
            Guias e checklists para cada etapa do funil
          </p>
        </div>
      </div>

      <Tabs defaultValue="lead" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6 glass border border-border/40">
          {stages.map((stage) => {
            const config = stageConfig[stage as keyof typeof stageConfig];
            const Icon = config.icon;
            return (
              <TabsTrigger key={stage} value={stage} className="gap-2 transition-all duration-200 data-[state=active]:shadow-md">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline font-medium">{config.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {stages.map((stage) => {
          const config = stageConfig[stage as keyof typeof stageConfig];
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
                      Nenhum playbook para esta etapa
                    </p>
                  </CardContent>
                </Card>
              ) : (
                stagePlaybooks.map((playbook, index) => (
                  <Card 
                    key={playbook.id} 
                    variant="elevated" 
                    className="glass border-border/40 dark:border-glow overflow-hidden card-elevated hover-lift transition-all duration-300 animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-1.5 h-full min-h-[2rem] rounded-full shadow-sm", config.color)} />
                        <div className="flex-1">
                          <CardTitle className="text-lg font-display">{playbook.title}</CardTitle>
                          {playbook.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {playbook.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="shrink-0 bg-gradient-to-r from-primary/10 to-accent/10 text-primary border-primary/30 shadow-sm">
                          {playbook.items?.length || 0} itens
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Checklist Items */}
                      <div className="space-y-2">
                        {playbook.items?.map((item, itemIndex) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 border border-border/20 group hover:border-primary/30 hover:bg-muted/50 transition-all duration-200 animate-fade-in"
                            style={{ animationDelay: `${itemIndex * 50}ms` }}
                          >
                            <Circle className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                            <span className="flex-1 text-sm group-hover:text-foreground transition-colors">{item.content}</span>
                            {item.is_required && (
                              <Badge variant="secondary" className="text-[10px] bg-status-warning/20 text-status-warning border border-status-warning/30 shadow-sm">
                                Obrigatório
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-destructive/10 hover:scale-110"
                              onClick={() => deleteItem.mutate(item.id)}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Add New Item */}
                      <div className="flex items-center gap-2 pt-3 border-t border-border/40">
                        <Input
                          placeholder="Adicionar novo item..."
                          value={newItems[playbook.id] || ""}
                          onChange={(e) =>
                            setNewItems((prev) => ({
                              ...prev,
                              [playbook.id]: e.target.value,
                            }))
                          }
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              handleAddItem(playbook.id, playbook.items?.length || 0);
                            }
                          }}
                          className="flex-1 border-border/40 focus:border-primary/50 transition-colors"
                        />
                        <div className="flex items-center gap-2">
                          <Checkbox
                            id={`required-${playbook.id}`}
                            checked={isRequired[playbook.id] || false}
                            onCheckedChange={(checked) =>
                              setIsRequired((prev) => ({
                                ...prev,
                                [playbook.id]: checked as boolean,
                              }))
                            }
                            className="border-border/50"
                          />
                          <label
                            htmlFor={`required-${playbook.id}`}
                            className="text-xs text-muted-foreground whitespace-nowrap"
                          >
                            Obrigatório
                          </label>
                        </div>
                        <Button
                          size="sm"
                          variant="glow"
                          onClick={() => handleAddItem(playbook.id, playbook.items?.length || 0)}
                          disabled={!newItems[playbook.id]?.trim()}
                          className="shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};

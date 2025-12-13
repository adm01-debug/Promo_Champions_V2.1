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
  CheckCircle2, 
  Circle,
  Star,
  Users,
  FileText,
  Handshake
} from "lucide-react";
import { cn } from "@/lib/utils";

const stageConfig = {
  lead: { label: "Lead", icon: Users, color: "bg-slate-500" },
  qualified: { label: "Qualificado", icon: Star, color: "bg-blue-500" },
  proposal: { label: "Proposta", icon: FileText, color: "bg-purple-500" },
  negotiation: { label: "Negociação", icon: Handshake, color: "bg-amber-500" },
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
      <div className="space-y-4">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-48" />
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
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-xl gradient-primary">
          <BookOpen className="h-6 w-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Playbooks de Vendas</h2>
          <p className="text-muted-foreground text-sm">
            Guias e checklists para cada etapa do funil
          </p>
        </div>
      </div>

      <Tabs defaultValue="lead" className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          {stages.map((stage) => {
            const config = stageConfig[stage as keyof typeof stageConfig];
            const Icon = config.icon;
            return (
              <TabsTrigger key={stage} value={stage} className="gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{config.label}</span>
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
                <Card className="glass">
                  <CardContent className="flex flex-col items-center justify-center py-12">
                    <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      Nenhum playbook para esta etapa
                    </p>
                  </CardContent>
                </Card>
              ) : (
                stagePlaybooks.map((playbook) => (
                  <Card key={playbook.id} className="glass overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-2 h-full min-h-[2rem] rounded-full", config.color)} />
                        <div className="flex-1">
                          <CardTitle className="text-lg">{playbook.title}</CardTitle>
                          {playbook.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {playbook.description}
                            </p>
                          )}
                        </div>
                        <Badge variant="outline" className="shrink-0">
                          {playbook.items?.length || 0} itens
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {/* Checklist Items */}
                      <div className="space-y-2">
                        {playbook.items?.map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 group"
                          >
                            <Circle className="h-4 w-4 text-muted-foreground" />
                            <span className="flex-1 text-sm">{item.content}</span>
                            {item.is_required && (
                              <Badge variant="secondary" className="text-[10px]">
                                Obrigatório
                              </Badge>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => deleteItem.mutate(item.id)}
                            >
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        ))}
                      </div>

                      {/* Add New Item */}
                      <div className="flex items-center gap-2 pt-2 border-t border-border/50">
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
                          className="flex-1"
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
                          onClick={() => handleAddItem(playbook.id, playbook.items?.length || 0)}
                          disabled={!newItems[playbook.id]?.trim()}
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

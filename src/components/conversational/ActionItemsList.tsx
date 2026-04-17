import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckSquare, ListTodo, Plus } from "lucide-react";
import { priorityMeta, type ActionItem } from "./meetingSummaryHelpers";
import { useCreateActivitiesFromSummary } from "@/hooks/conversational/useCreateActivitiesFromSummary";

interface Props {
  recordingId: string;
  items: ActionItem[];
}

export const ActionItemsList = ({ recordingId, items }: Props) => {
  const createMutation = useCreateActivitiesFromSummary();
  if (!items?.length) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <CardTitle className="text-base flex items-center gap-2">
            <ListTodo className="size-4 text-primary" />
            Action items ({items.length})
          </CardTitle>
          <Button
            size="sm"
            variant="outline"
            loading={createMutation.isPending}
            loadingText="Criando..."
            onClick={() => createMutation.mutate(recordingId)}
          >
            <Plus className="size-3.5" />
            Criar atividades
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {items.map((it, i) => {
          const meta = priorityMeta[it.priority] ?? priorityMeta["média"];
          return (
            <div
              key={i}
              className="flex items-start gap-3 p-3 rounded-lg border border-border/60 hover:border-primary/30 transition-colors"
            >
              <CheckSquare className="size-4 text-primary mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium leading-snug">{it.title}</p>
                <div className="flex flex-wrap items-center gap-2 mt-1.5">
                  <Badge variant="outline" className={meta.className + " text-xs"}>
                    {meta.label}
                  </Badge>
                  {it.due_hint && (
                    <span className="text-xs text-muted-foreground">⏱ {it.due_hint}</span>
                  )}
                  {it.owner_hint && (
                    <span className="text-xs text-muted-foreground">👤 {it.owner_hint}</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

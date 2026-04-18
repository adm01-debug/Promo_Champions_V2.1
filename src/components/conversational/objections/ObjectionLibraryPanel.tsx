import { useState } from "react">
import { BookOpen, Lightbulb, ExternalLink } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useObjectionLibrary } from "@/hooks/conversational/useObjectionAnalysis";
import { type ObjectionType, objectionTypeLabel, objectionTypeHsl } from "./objectionHelpers";

interface Props {
  onSelect?: (recordingId: string) => void;
}

const TYPE_TABS: Array<{ value: ObjectionType | "all"; label: string }> = [
  { value: "all", label: "Todas" },
  { value: "price", label: "Preço" },
  { value: "timing", label: "Timing" },
  { value: "authority", label: "Autoridade" },
  { value: "need", label: "Necessidade" },
  { value: "competition", label: "Concorrência" },
  { value: "trust", label: "Confiança" },
];

export function ObjectionLibraryPanel({ onSelect }: Props) {
  const [tab, setTab] = useState<ObjectionType | "all">("all");
  const { data, isLoading } = useObjectionLibrary({
    type: tab === "all" ? undefined : tab,
    limit: 10,
  });

  return (
    <Card variant="modern">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" />
          <CardTitle className="text-base">Biblioteca de objeções</CardTitle>
        </div>
        <p className="text-xs text-muted-foreground">
          Padrões mais frequentes detectados nas calls — clique para ver a melhor resposta.
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <Tabs value={tab} onValueChange={(v) => setTab(v as ObjectionType | "all")}>
          <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 bg-transparent p-0">
            {TYPE_TABS.map((t) => (
              <TabsTrigger
                key={t.value}
                value={t.value}
                className="h-7 text-xs data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
            <Skeleton className="h-14" />
          </div>
        ) : !data || data.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Nenhuma objeção registrada ainda.
          </div>
        ) : (
          <div className="space-y-2">
            {data.map((entry) => (
              <div
                key={entry.id}
                className="rounded-lg border bg-card/40 p-3 transition-colors hover:bg-card/70"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className="text-[10px]"
                        style={{
                          borderColor: objectionTypeHsl(entry.objection_type),
                          color: objectionTypeHsl(entry.objection_type),
                        }}
                      >
                        {objectionTypeLabel(entry.objection_type)}
                      </Badge>
                      <span className="text-xs font-medium">"{entry.pattern_text}"</span>
                      <Badge variant="secondary" className="ml-auto text-[10px]">
                        {entry.frequency_count}×
                      </Badge>
                    </div>
                    {entry.best_response_text ? (
                      <div className="flex gap-2 rounded-md bg-success/5 p-2 text-xs">
                        <Lightbulb
                          className="mt-0.5 h-3 w-3 shrink-0"
                          style={{ color: "hsl(var(--success, var(--primary)))" }}
                        />
                        <p className="text-muted-foreground">{entry.best_response_text}</p>
                      </div>
                    ) : (
                      <p className="text-xs italic text-muted-foreground">
                        Nenhuma resposta exemplar registrada ainda.
                      </p>
                    )}
                  </div>
                  {entry.best_response_recording_id && onSelect && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onSelect(entry.best_response_recording_id!)}
                      className="h-7 shrink-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

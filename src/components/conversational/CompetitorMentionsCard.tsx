import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Swords, ChevronDown, ChevronUp, Clock, RefreshCw } from "lucide-react";
import {
  useCompetitorMentions,
  useDetectCompetitors,
} from "@/hooks/conversational/useCompetitorMentions";
import { BattleCardSuggestion } from "./BattleCardSuggestion";

interface Props {
  recordingId: string;
  onSeek?: (seconds: number) => void;
}

function formatTimestamp(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function CompetitorMentionsCard({ recordingId, onSeek }: Props) {
  const { data: mentions, isLoading } = useCompetitorMentions(recordingId);
  const detect = useDetectCompetitors();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const grouped = (mentions ?? []).reduce<
    Record<string, { mentions: typeof mentions; battleCardId: string | null }>
  >((acc, m) => {
    const key = m.competitor_name;
    if (!acc[key]) acc[key] = { mentions: [], battleCardId: m.battle_card_id };
    acc[key].mentions!.push(m);
    return acc;
  }, {});

  const competitorNames = Object.keys(grouped);

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Swords className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Concorrentes mencionados</h3>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => detect.mutate(recordingId)}
          loading={detect.isPending}
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          Re-detectar
        </Button>
      </div>

      {isLoading && <p className="text-xs text-muted-foreground">Carregando…</p>}

      {!isLoading && competitorNames.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Nenhum concorrente detectado nesta call.
        </p>
      )}

      {competitorNames.map((name) => {
        const group = grouped[name];
        const isOpen = expanded[name];
        return (
          <div key={name} className="border border-border rounded-lg overflow-hidden">
            <button
              type="button"
              onClick={() => setExpanded((s) => ({ ...s, [name]: !s[name] }))}
              className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors text-left"
            >
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm">{name}</span>
                <Badge variant="secondary" className="text-[10px]">
                  {group.mentions!.length} menç{group.mentions!.length === 1 ? "ão" : "ões"}
                </Badge>
              </div>
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {isOpen && (
              <div className="p-3 pt-0 space-y-2">
                {group.battleCardId && (
                  <BattleCardSuggestion battleCardId={group.battleCardId} competitorName={name} />
                )}
                {group.mentions!.map((m) => (
                  <div
                    key={m.id}
                    className="text-xs bg-muted/30 rounded p-2 space-y-1 border border-border/50"
                  >
                    {m.timestamp_sec != null && (
                      <button
                        type="button"
                        onClick={() => onSeek?.(m.timestamp_sec!)}
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <Clock className="h-3 w-3" />
                        {formatTimestamp(m.timestamp_sec)}
                      </button>
                    )}
                    <p className="text-muted-foreground leading-relaxed">
                      {m.context_snippet}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </Card>
  );
}

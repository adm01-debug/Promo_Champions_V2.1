import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Check, X, Dumbbell, Play, Sparkles, Loader2, MessageSquarePlus } from "lucide-react";
import { useCoachingActions, useUpdateCoachingAction, useExtractCoaching } from "@/hooks/conversational/useCoachingActions";
import { useUserRole } from "@/hooks/useUserRole";
import {
  CATEGORY_ICONS,
  CATEGORY_LABELS,
  SEVERITY_BADGE,
  SEVERITY_LABELS,
  STATUS_LABELS,
  formatTimestamp,
  sortBySeverity,
  type CoachingAction,
} from "./coachingHelpers";
import { cn } from "@/lib/utils";

interface Props {
  recordingId: string;
  onSeek?: (sec: number) => void;
}

export const CoachingActionsList = ({ recordingId, onSeek }: Props) => {
  const { data, isLoading } = useCoachingActions(recordingId);
  const extract = useExtractCoaching();

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    );
  }

  const actions = sortBySeverity(data ?? []);

  return (
    <Card className="p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Coaching IA</h3>
          {actions.length > 0 && (
            <Badge variant="outline" className="text-xs">{actions.length}</Badge>
          )}
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={() => extract.mutate(recordingId)}
          disabled={extract.isPending}
        >
          {extract.isPending ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          <span className="ml-1.5">{actions.length > 0 ? "Regerar" : "Gerar"}</span>
        </Button>
      </div>

      {actions.length === 0 ? (
        <div className="text-center py-6 text-xs text-muted-foreground border border-dashed rounded-md">
          Nenhuma ação de coaching ainda. Clique em "Gerar".
        </div>
      ) : (
        <div className="space-y-2">
          {actions.map((a) => (
            <ActionRow key={a.id} action={a} onSeek={onSeek} />
          ))}
        </div>
      )}
    </Card>
  );
};

function ActionRow({ action, onSeek }: { action: CoachingAction; onSeek?: (s: number) => void }) {
  const update = useUpdateCoachingAction();
  const { isAdmin, isManager } = useUserRole();
  const canManage = isAdmin || isManager;
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState(action.manager_note ?? "");
  const Icon = CATEGORY_ICONS[action.category];

  const isResolved = action.status !== "pending";

  return (
    <div
      className={cn(
        "rounded-md border p-3 space-y-2 transition-colors",
        isResolved && "opacity-60 bg-muted/30",
      )}
    >
      <div className="flex items-start gap-2">
        <Icon className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="outline" className="text-[10px] h-5">
              {CATEGORY_LABELS[action.category]}
            </Badge>
            <Badge className={cn("text-[10px] h-5 border", SEVERITY_BADGE[action.severity])}>
              {SEVERITY_LABELS[action.severity]}
            </Badge>
            {action.timestamp_sec != null && onSeek && (
              <Button
                size="sm"
                variant="ghost"
                className="h-5 px-1.5 text-[10px] gap-1 text-primary hover:text-primary"
                onClick={() => onSeek(action.timestamp_sec!)}
              >
                <Play className="h-3 w-3" />
                {formatTimestamp(action.timestamp_sec)}
              </Button>
            )}
            {isResolved && (
              <Badge variant="secondary" className="text-[10px] h-5">
                {STATUS_LABELS[action.status]}
              </Badge>
            )}
          </div>
          <p className="text-sm text-foreground">{action.tip}</p>
          {action.quote && (
            <p className="text-xs italic text-muted-foreground border-l-2 border-muted pl-2">
              "{action.quote}"
            </p>
          )}
          {action.manager_note && (
            <p className="text-xs text-info bg-info/5 rounded px-2 py-1">
              <strong>Gestor:</strong> {action.manager_note}
            </p>
          )}
        </div>
      </div>

      {!isResolved && (
        <div className="flex items-center gap-1.5 pl-6">
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => update.mutate({ id: action.id, status: "accepted" })}>
            <Check className="h-3 w-3 mr-1" /> Aceitar
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs" onClick={() => update.mutate({ id: action.id, status: "practiced" })}>
            <Dumbbell className="h-3 w-3 mr-1" /> Pratiquei
          </Button>
          <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={() => update.mutate({ id: action.id, status: "dismissed" })}>
            <X className="h-3 w-3 mr-1" /> Dispensar
          </Button>
          {canManage && (
            <Button size="sm" variant="ghost" className="h-7 text-xs ml-auto" onClick={() => setNoteOpen((v) => !v)}>
              <MessageSquarePlus className="h-3 w-3 mr-1" /> Nota
            </Button>
          )}
        </div>
      )}

      {canManage && noteOpen && (
        <div className="pl-6 space-y-1.5">
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Comentário do gestor..."
            rows={2}
            className="text-xs"
          />
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs"
            onClick={() => {
              update.mutate({ id: action.id, manager_note: note || null });
              setNoteOpen(false);
            }}
          >
            Salvar nota
          </Button>
        </div>
      )}
    </div>
  );
}

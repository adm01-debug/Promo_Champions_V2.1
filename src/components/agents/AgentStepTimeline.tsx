import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertCircle, Clock, SkipForward } from "lucide-react";
import type { AgentAction } from "./agentHelpers";

const STATUS_ICON = {
  success: { icon: CheckCircle2, className: "text-success" },
  error: { icon: AlertCircle, className: "text-destructive" },
  pending_approval: { icon: Clock, className: "text-warning" },
  skipped: { icon: SkipForward, className: "text-muted-foreground" },
} as const;

interface Props {
  actions: AgentAction[];
}

export function AgentStepTimeline({ actions }: Props) {
  if (actions.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-6">
        Nenhuma ação registrada ainda.
      </p>
    );
  }

  return (
    <ol className="relative border-l border-border/60 ml-3 space-y-4">
      {actions.map((a) => {
        const meta = STATUS_ICON[a.status];
        const Icon = meta.icon;
        return (
          <li key={a.id} className="ml-4">
            <span className="absolute -left-[9px] flex h-4 w-4 items-center justify-center rounded-full bg-background border border-border">
              <Icon className={`h-3 w-3 ${meta.className}`} />
            </span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold">{a.tool_name}</span>
              <Badge variant="outline" className="text-[10px]">
                #{a.step_index} • {a.executed_by}
              </Badge>
            </div>
            {Object.keys(a.tool_input ?? {}).length > 0 && (
              <pre className="mt-1.5 text-xs bg-muted/40 rounded p-2 overflow-x-auto max-h-32">
                {JSON.stringify(a.tool_input, null, 2)}
              </pre>
            )}
            {a.tool_output && (
              <pre className="mt-1 text-xs bg-muted/20 rounded p-2 overflow-x-auto max-h-32 border-l-2 border-primary/40">
                {JSON.stringify(a.tool_output, null, 2)}
              </pre>
            )}
          </li>
        );
      })}
    </ol>
  );
}

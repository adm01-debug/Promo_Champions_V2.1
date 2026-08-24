import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AGENT_META, STATUS_META, type AgentRun } from "./agentHelpers";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ChevronRight } from "lucide-react";

interface Props {
  run: AgentRun;
  onOpen?: (run: AgentRun) => void;
}

export function AgentRunCard({ run, onOpen }: Props) {
  const meta = AGENT_META[run.agent_type];
  const status = STATUS_META[run.status];
  const Icon = meta.icon;
  const stepsDone = run.steps?.length ?? 0;

  return (
    <Card className="hover:border-primary/40 transition-colors">
      <CardContent className="p-4 flex items-center gap-4">
        <div className="rounded-lg bg-primary/10 p-2 text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold truncate">{meta.label}</h4>
            <Badge variant={status.variant as never} className="capitalize">
              {status.label}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground truncate mt-0.5">
            {run.goal || meta.description}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {stepsDone} passo{stepsDone === 1 ? "" : "s"} •{" "}
            {formatDistanceToNow(new Date(run.created_at), { addSuffix: true, locale: ptBR })}
          </p>
        </div>
        {onOpen && (
          <Button size="sm" variant="ghost" onClick={() => onOpen(run)}>
            Detalhes <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

import { useState } from "react";
import { ChevronDown, ChevronRight, MessageSquare, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import {
  type CallObjection,
  fmtTime,
  objectionTypeLabel,
  qualityLabel,
  statusBadgeVariant,
  statusLabel,
} from "./objectionHelpers";

interface Props {
  objections: CallObjection[];
}

export function ObjectionsList({ objections }: Props) {
  const [open, setOpen] = useState(false);

  if (!objections.length) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
        Sem objeções detectadas nesta gravação.
      </div>
    );
  }

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger asChild>
        <Button variant="ghost" size="sm" className="w-full justify-between">
          <span className="text-sm font-medium">
            {open ? "Ocultar" : "Ver"} objeções detalhadas ({objections.length})
          </span>
          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-3">
        {objections.map((o) => (
          <div key={o.id} className="rounded-lg border bg-card/40 p-3 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="text-[10px]">
                {fmtTime(o.start_estimate)}
              </Badge>
              <Badge variant="secondary" className="text-[10px]">
                {objectionTypeLabel(o.objection_type)}
              </Badge>
              <Badge variant={statusBadgeVariant(o.resolution_status)} className="text-[10px]">
                {statusLabel(o.resolution_status)}
              </Badge>
              <span className="ml-auto text-[10px] text-muted-foreground">
                {qualityLabel(o.response_quality)}
              </span>
            </div>

            <div className="flex gap-2 text-sm">
              <User className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <p className="text-foreground">{o.objection_text}</p>
            </div>

            {o.seller_response_text ? (
              <div className="flex gap-2 rounded-md bg-muted/50 p-2 text-sm">
                <MessageSquare className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                <p className="text-muted-foreground">{o.seller_response_text}</p>
              </div>
            ) : (
              <p className="text-xs italic text-destructive/80">Sem resposta do vendedor</p>
            )}
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Sparkles, Mail, Phone } from "lucide-react";
import { DMURoleBadge } from "./DMURoleBadge";
import { CommitteeExtractionBadge } from "./committee/CommitteeExtractionBadge";
import {
  influenceLabel, sentimentColor, sentimentLabel, initials,
} from "./committeeHelpers";
import type { DealStakeholder } from "@/hooks/deal-intelligence/useDealStakeholders";

interface Props {
  stakeholder: DealStakeholder;
  onEdit: (s: DealStakeholder) => void;
  onDelete: (id: string) => void;
}

export function StakeholderListItem({ stakeholder: s, onEdit, onDelete }: Props) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg glass border border-border/30 hover:border-border/60 transition-colors">
      <Avatar className="h-9 w-9 shrink-0">
        <AvatarFallback className="text-xs font-medium bg-primary/10 text-primary">
          {initials(s.name)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm truncate">{s.name}</span>
          {s.source === "ai_extracted" && (
            <Sparkles className="h-3 w-3 text-primary shrink-0" aria-label="Extraído por IA" />
          )}
          {s.source === "call" && (
            <CommitteeExtractionBadge evidenceQuote={s.evidence_quote} confidence={s.confidence} />
          )}
        </div>
        {s.role_title && <p className="text-xs text-muted-foreground truncate">{s.role_title}</p>}

        <div className="flex flex-wrap gap-1 mt-1.5">
          <DMURoleBadge role={s.dmu_role} size="xs" />
          <Badge variant="outline" className="text-[10px] px-1.5 py-0">
            Inf. {influenceLabel(s.influence_level)}
          </Badge>
          <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${sentimentColor(s.sentiment)}`}>
            {sentimentLabel(s.sentiment)}
          </Badge>
        </div>

        {(s.email || s.phone) && (
          <div className="flex items-center gap-3 mt-1.5 text-[10px] text-muted-foreground">
            {s.email && <span className="flex items-center gap-1 truncate"><Mail className="h-2.5 w-2.5" />{s.email}</span>}
            {s.phone && <span className="flex items-center gap-1"><Phone className="h-2.5 w-2.5" />{s.phone}</span>}
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1 shrink-0">
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onEdit(s)} aria-label="Editar">
          <Pencil className="h-3 w-3" />
        </Button>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => onDelete(s.id)} aria-label="Remover">
          <Trash2 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

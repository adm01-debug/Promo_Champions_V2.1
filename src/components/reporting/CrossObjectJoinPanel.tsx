import { memo, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Link2 } from "lucide-react";
import {
  JOIN_MAP,
  type CrossBaseEntity,
  type CrossJoinableEntity,
  type ReportJoin,
} from "@/hooks/reporting/reportBuilderHelpers";

interface Props {
  base: CrossBaseEntity;
  joins: ReportJoin[];
  onBaseChange: (b: CrossBaseEntity) => void;
  onJoinsChange: (j: ReportJoin[]) => void;
}

const BASE_LABELS: Record<CrossBaseEntity, string> = {
  sales: "Vendas",
  activities: "Atividades",
  leads: "Leads",
};

export const CrossObjectJoinPanel = memo(({ base, joins, onBaseChange, onJoinsChange }: Props) => {
  const available = useMemo(() => {
    const used = new Set(joins.map((j) => j.entity));
    return (JOIN_MAP[base] ?? []).filter((d) => !used.has(d.entity));
  }, [base, joins]);

  const addJoin = (entity: CrossJoinableEntity) => {
    onJoinsChange([...joins, { entity }]);
  };

  const removeJoin = (entity: CrossJoinableEntity) => {
    onJoinsChange(joins.filter((j) => j.entity !== entity));
  };

  const handleBaseChange = (b: CrossBaseEntity) => {
    onBaseChange(b);
    // Reset joins incompatíveis
    const validEntities = new Set((JOIN_MAP[b] ?? []).map((d) => d.entity));
    onJoinsChange(joins.filter((j) => validEntities.has(j.entity)));
  };

  return (
    <div className="space-y-3 rounded-md border border-border/40 p-3 bg-muted/20">
      <div className="flex items-center gap-2">
        <Link2 className="h-3.5 w-3.5 text-primary" />
        <span className="text-xs font-medium">Cross-object joins</span>
      </div>

      <div>
        <Label className="text-xs">Entidade base</Label>
        <Select value={base} onValueChange={(v) => handleBaseChange(v as CrossBaseEntity)}>
          <SelectTrigger className="h-9 mt-1"><SelectValue /></SelectTrigger>
          <SelectContent>
            {(Object.keys(BASE_LABELS) as CrossBaseEntity[]).map((b) => (
              <SelectItem key={b} value={b}>{BASE_LABELS[b]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label className="text-xs">Joins ativos ({joins.length}/3)</Label>
        <div className="flex flex-wrap gap-1.5 mt-1.5 min-h-[28px]">
          {joins.length === 0 && (
            <span className="text-xs text-muted-foreground italic">Nenhum join — adicione abaixo</span>
          )}
          {joins.map((j) => {
            const def = JOIN_MAP[base]?.find((d) => d.entity === j.entity);
            return (
              <Badge key={j.entity} variant="secondary" className="gap-1 pr-1">
                {def?.label ?? j.entity}
                <button
                  onClick={() => removeJoin(j.entity)}
                  className="hover:bg-destructive/20 rounded p-0.5"
                  aria-label="Remover join"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      </div>

      {available.length > 0 && joins.length < 3 && (
        <div className="flex flex-wrap gap-1.5">
          {available.map((d) => (
            <Button
              key={d.entity}
              variant="outline"
              size="sm"
              className="h-7 text-xs gap-1"
              onClick={() => addJoin(d.entity)}
            >
              <Plus className="h-3 w-3" /> {d.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
});
CrossObjectJoinPanel.displayName = "CrossObjectJoinPanel";

import { memo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import {
  ENTITY_FIELDS,
  FILTER_OP_LABELS,
  type ReportEntity,
  type ReportFilter,
  type FilterOp,
} from "@/hooks/reporting/reportBuilderHelpers";

interface Props {
  entity: ReportEntity;
  filters: ReportFilter[];
  onChange: (filters: ReportFilter[]) => void;
}

export const ReportFilterBuilder = memo(({ entity, filters, onChange }: Props) => {
  const fields = entity === "cross" ? [] : ENTITY_FIELDS[entity] ?? [];

  const addFilter = () => {
    const first = fields[0]?.key ?? "id";
    onChange([...filters, { field: first, op: "eq", value: "" }]);
  };

  const updateFilter = (i: number, patch: Partial<ReportFilter>) => {
    const next = [...filters];
    next[i] = { ...next[i], ...patch };
    onChange(next);
  };

  const removeFilter = (i: number) => {
    onChange(filters.filter((_, idx) => idx !== i));
  };

  return (
    <div className="space-y-2">
      {filters.map((f, i) => (
        <div key={i} className="flex gap-2 items-center">
          <Select value={f.field} onValueChange={(v) => updateFilter(i, { field: v })}>
            <SelectTrigger className="h-8 text-xs flex-1"><SelectValue /></SelectTrigger>
            <SelectContent>
              {fields.map((fld) => <SelectItem key={fld.key} value={fld.key}>{fld.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={f.op} onValueChange={(v) => updateFilter(i, { op: v as FilterOp })}>
            <SelectTrigger className="h-8 text-xs w-[140px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(Object.keys(FILTER_OP_LABELS) as FilterOp[]).map((op) => (
                <SelectItem key={op} value={op}>{FILTER_OP_LABELS[op]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input
            className="h-8 text-xs flex-1"
            placeholder="Valor"
            value={String(f.value ?? "")}
            onChange={(e) => updateFilter(i, { value: e.target.value })}
          />
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFilter(i)}>
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={addFilter} className="gap-2 w-full">
        <Plus className="h-3.5 w-3.5" /> Adicionar filtro
      </Button>
    </div>
  );
});
ReportFilterBuilder.displayName = "ReportFilterBuilder";

import { memo } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ENTITY_FIELDS, type ReportEntity } from "@/hooks/reporting/reportBuilderHelpers";

interface Props {
  entity: ReportEntity;
  selected: string[];
  onChange: (cols: string[]) => void;
}

export const ReportFieldPicker = memo(({ entity, selected, onChange }: Props) => {
  const fields = entity === "cross" ? [] : ENTITY_FIELDS[entity] ?? [];

  const toggle = (key: string) => {
    onChange(selected.includes(key) ? selected.filter((k) => k !== key) : [...selected, key]);
  };

  return (
    <ScrollArea className="h-[260px] rounded-md border border-border/40 p-3">
      <div className="space-y-2">
        {fields.map((f) => (
          <div key={f.key} className="flex items-center gap-2">
            <Checkbox
              id={`fld-${f.key}`}
              checked={selected.includes(f.key)}
              onCheckedChange={() => toggle(f.key)}
            />
            <Label htmlFor={`fld-${f.key}`} className="text-xs cursor-pointer flex-1">
              {f.label} <span className="text-muted-foreground">({f.type})</span>
            </Label>
          </div>
        ))}
        {fields.length === 0 && (
          <p className="text-xs text-muted-foreground">Nenhum campo disponível</p>
        )}
      </div>
    </ScrollArea>
  );
});
ReportFieldPicker.displayName = "ReportFieldPicker";

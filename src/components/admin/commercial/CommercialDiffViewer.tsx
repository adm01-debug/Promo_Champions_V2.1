import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, Minus, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface DiffValueProps {
  label: string;
  oldValue: any;
  newValue: any;
  formatter?: (val: any) => string;
}

export function CommercialDiffViewer({ label, oldValue, newValue, formatter = (v) => String(v) }: DiffValueProps) {
  const isDifferent = JSON.stringify(oldValue) !== JSON.stringify(newValue);
  
  if (!isDifferent) {
    return (
      <div className="flex items-center justify-between py-2 border-b border-border/10 last:border-0">
        <span className="text-[10px] font-bold uppercase text-muted-foreground">{label}</span>
        <span className="text-xs font-medium">{formatter(oldValue)}</span>
      </div>
    );
  }

  const isNumeric = typeof oldValue === 'number' && typeof newValue === 'number';
  const diff = isNumeric ? newValue - oldValue : null;

  return (
    <div className="flex flex-col gap-1 py-2 border-b border-border/10 last:border-0">
      <span className="text-[10px] font-bold uppercase text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1.5 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-md">
          <Minus className="h-3 w-3 text-red-500" />
          <span className="text-xs font-mono text-red-400 line-through">{formatter(oldValue)}</span>
        </div>
        <ArrowRight className="h-3 w-3 text-muted-foreground" />
        <div className="flex items-center gap-1.5 px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-md">
          <Plus className="h-3 w-3 text-green-500" />
          <span className="text-xs font-mono text-green-400 font-bold">{formatter(newValue)}</span>
        </div>
        {isNumeric && diff !== null && diff !== 0 && (
          <Badge variant={diff > 0 ? "default" : "destructive"} className="ml-auto text-[10px] h-5">
            {diff > 0 ? "+" : ""}{formatter(diff)}
          </Badge>
        )}
      </div>

    </div>
  );
}

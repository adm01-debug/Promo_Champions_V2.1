import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { SavedFiltersBar } from "@/components/filters/SavedFiltersBar";
import { Label } from "@/components/ui/label";

export interface QuoteCadenceFilterValues {
  search: string;
  seller: string;
  daysWithoutResponse: number;
  minValue: string;
  maxValue: string;
}

export const emptyQuoteCadenceFilters: QuoteCadenceFilterValues = {
  search: "",
  seller: "",
  daysWithoutResponse: 0,
  minValue: "",
  maxValue: "",
};

interface Props {
  values: QuoteCadenceFilterValues;
  onChange: (v: QuoteCadenceFilterValues) => void;
}

export function QuoteCadenceFilters({ values, onChange }: Props) {
  const [open, setOpen] = useState(false);

  const activeCount = [
    values.search.trim() !== "",
    values.seller.trim() !== "",
    values.daysWithoutResponse > 0,
    values.minValue !== "",
    values.maxValue !== "",
  ].filter(Boolean).length;

  const update = <K extends keyof QuoteCadenceFilterValues>(key: K, val: QuoteCadenceFilterValues[K]) =>
    onChange({ ...values, [key]: val });

  const clear = () => onChange(emptyQuoteCadenceFilters);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <Collapsible open={open} onOpenChange={setOpen} className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <CollapsibleTrigger asChild>
              <Button variant="outline" size="sm" className="gap-2 h-8">
                <Filter className="h-3.5 w-3.5" />
                Filtros avançados
                {activeCount > 0 && (
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                    {activeCount}
                  </Badge>
                )}
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
              </Button>
            </CollapsibleTrigger>

            {activeCount > 0 && (
              <Button variant="ghost" size="sm" onClick={clear} className="h-8 gap-1.5 text-muted-foreground">
                <X className="h-3.5 w-3.5" />
                Limpar
              </Button>
            )}

            <SavedFiltersBar
              entityType="quote_cadences"
              currentFilters={values as unknown as Record<string, unknown>}
              onApplyFilter={(f) => onChange({ ...emptyQuoteCadenceFilters, ...(f as Partial<QuoteCadenceFilterValues>) })}
            />
          </div>
        </Collapsible>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 rounded-xl border border-border/60 bg-card/30 backdrop-blur-sm">
              <div className="space-y-1.5">
                <Label className="text-xs">Cliente</Label>
                <Input
                  placeholder="Buscar cliente..."
                  value={values.search}
                  onChange={(e) => update("search", e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Vendedor</Label>
                <Input
                  placeholder="Nome do vendedor..."
                  value={values.seller}
                  onChange={(e) => update("seller", e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Valor mínimo (R$)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="0"
                  value={values.minValue}
                  onChange={(e) => update("minValue", e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Valor máximo (R$)</Label>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="∞"
                  value={values.maxValue}
                  onChange={(e) => update("maxValue", e.target.value)}
                  className="h-9"
                />
              </div>

              <div className="space-y-2 md:col-span-2 lg:col-span-4">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Dias sem resposta (mínimo)</Label>
                  <span className="text-xs font-medium text-primary tabular-nums">
                    {values.daysWithoutResponse} {values.daysWithoutResponse === 1 ? "dia" : "dias"}
                  </span>
                </div>
                <Slider
                  value={[values.daysWithoutResponse]}
                  min={0}
                  max={30}
                  step={1}
                  onValueChange={([v]) => update("daysWithoutResponse", v)}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

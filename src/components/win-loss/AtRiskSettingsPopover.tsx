import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import type { AtRiskSettings } from "@/hooks/win-loss/useAtRiskSettings";

interface Props {
  settings: AtRiskSettings;
  onUpdate: (partial: Partial<AtRiskSettings>) => void;
  onReset: () => void;
  totalAnalyzed: number;
  totalShown: number;
}

export function AtRiskSettingsPopover({ settings, onUpdate, onReset, totalAnalyzed, totalShown }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 gap-1"
          aria-label="Configurar filtros de risco"
          title="Ajustar score mínimo e limites"
        >
          <SlidersHorizontal className="h-3 w-3" />
          <span className="text-[10px] font-medium tabular-nums">≥{settings.threshold}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 space-y-4">
        <div>
          <h4 className="text-sm font-medium">Filtros de risco</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Threshold {settings.threshold} · mostrando {totalShown} de {totalAnalyzed} analisados
          </p>
        </div>

        <Separator />

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="at-risk-threshold" className="text-xs">Score mínimo</Label>
            <span className="text-xs tabular-nums font-medium">{settings.threshold}</span>
          </div>
          <Slider
            id="at-risk-threshold"
            value={[settings.threshold]}
            min={0}
            max={100}
            step={5}
            onValueChange={([v]) => onUpdate({ threshold: v })}
            aria-valuetext={`Score mínimo ${settings.threshold} de 100`}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="at-risk-limit" className="text-xs">Máximo analisado</Label>
            <span className="text-xs tabular-nums font-medium">{settings.limit}</span>
          </div>
          <Slider
            id="at-risk-limit"
            value={[settings.limit]}
            min={5}
            max={50}
            step={5}
            onValueChange={([v]) => onUpdate({ limit: v })}
            aria-valuetext={`Máximo ${settings.limit} deals`}
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="at-risk-visible" className="text-xs">Mostrar no painel</Label>
            <span className="text-xs tabular-nums font-medium">{settings.maxVisible}</span>
          </div>
          <Slider
            id="at-risk-visible"
            value={[settings.maxVisible]}
            min={3}
            max={20}
            step={1}
            onValueChange={([v]) => onUpdate({ maxVisible: v })}
            aria-valuetext={`Exibir ${settings.maxVisible} no painel`}
          />
        </div>

        <Separator />

        <Button
          variant="ghost"
          size="sm"
          className="w-full gap-1.5 h-7 text-xs"
          onClick={onReset}
        >
          <RotateCcw className="h-3 w-3" />
          Restaurar padrões
        </Button>
      </PopoverContent>
    </Popover>
  );
}

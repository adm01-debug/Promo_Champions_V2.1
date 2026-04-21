import { useDeferredValue, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, RotateCcw, Search, Bug, X } from "lucide-react";
import type { AtRiskSettings } from "@/hooks/win-loss/useAtRiskSettings";

interface Props {
  settings: AtRiskSettings;
  onUpdate: (partial: Partial<AtRiskSettings>) => void;
  onReset: () => void;
  onClearFilters: () => void;
  totalAnalyzed: number;
  totalShown: number;
  availableStages: string[];
}

export function AtRiskSettingsPopover({
  settings,
  onUpdate,
  onReset,
  onClearFilters,
  totalAnalyzed,
  totalShown,
  availableStages,
}: Props) {
  const [keyword, setKeyword] = useState(settings.keywordFilter);
  const debounced = useDeferredValue(keyword);

  // Sync local input → settings (debounced via deferred value)
  useEffect(() => {
    if (debounced !== settings.keywordFilter) {
      onUpdate({ keywordFilter: debounced });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  // External resets (e.g. clearFilters) should reflect in the input.
  useEffect(() => {
    if (settings.keywordFilter !== keyword) setKeyword(settings.keywordFilter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.keywordFilter]);

  const toggleStage = (stage: string) => {
    const next = settings.stageFilter.includes(stage)
      ? settings.stageFilter.filter((s) => s !== stage)
      : [...settings.stageFilter, stage];
    onUpdate({ stageFilter: next });
  };

  const filtersActive = settings.stageFilter.length > 0 || settings.keywordFilter.length > 0;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 px-2 gap-1"
          aria-label="Configurar filtros de risco"
          title="Ajustar score, filtros e debug"
        >
          <SlidersHorizontal className="h-3 w-3" />
          <span className="text-[10px] font-medium tabular-nums">≥{settings.threshold}</span>
          {filtersActive && (
            <span
              className="h-1.5 w-1.5 rounded-full bg-primary"
              aria-label="Filtros ativos"
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 space-y-4 max-h-[70vh] overflow-y-auto">
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

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label htmlFor="at-risk-debug" className="text-xs flex items-center gap-1.5">
              <Bug className="h-3 w-3" aria-hidden />
              Modo debug
            </Label>
            <Switch
              id="at-risk-debug"
              checked={settings.debug}
              onCheckedChange={(v) => onUpdate({ debug: v })}
              aria-label="Alternar painel de debug por deal"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">
              Estágios{" "}
              {settings.stageFilter.length > 0 && (
                <span className="text-muted-foreground">({settings.stageFilter.length} sel.)</span>
              )}
            </Label>
            {availableStages.length === 0 ? (
              <p className="text-[11px] text-muted-foreground italic">
                Nenhum estágio disponível nos deals atuais.
              </p>
            ) : (
              <div className="flex flex-wrap gap-1">
                {availableStages.map((stage) => {
                  const active = settings.stageFilter.includes(stage);
                  return (
                    <button
                      key={stage}
                      type="button"
                      onClick={() => toggleStage(stage)}
                      aria-pressed={active}
                      aria-label={`Filtro de estágio: ${stage} ${active ? "ativo" : "inativo"}`}
                      className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full"
                    >
                      <Badge
                        variant={active ? "default" : "outline"}
                        className="cursor-pointer text-[10px] px-2 py-0.5 capitalize"
                      >
                        {stage}
                      </Badge>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="at-risk-keyword" className="text-xs">Palavra-chave</Label>
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-muted-foreground" aria-hidden />
              <Input
                id="at-risk-keyword"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="cliente, padrão ou ação..."
                maxLength={100}
                className="h-8 pl-7 pr-7 text-xs"
                aria-label="Filtro por palavra-chave em cliente, padrão ou ação"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Limpar palavra-chave"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          </div>

          {filtersActive && (
            <Button
              variant="outline"
              size="sm"
              className="w-full gap-1.5 h-7 text-xs"
              onClick={onClearFilters}
            >
              <X className="h-3 w-3" />
              Limpar filtros (estágio + keyword)
            </Button>
          )}
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

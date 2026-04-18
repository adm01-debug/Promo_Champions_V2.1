import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ROLE_METRICS, METRIC_LABELS, type MetricCode, type ScoringRule } from '@/hooks/race/useRaceScoringRules';
import { Sparkles, Target, Scale } from 'lucide-react';

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  roleType: 'closer' | 'sdr';
  initialRules?: ScoringRule[];
  onConfirm: (rules: Array<Omit<ScoringRule, 'id' | 'season_id'>>) => void;
}

type RuleDraft = { metric_code: MetricCode; weight: number; points_per_unit: number; label: string };

const PRESETS: Record<'closer' | 'sdr', Record<string, Record<MetricCode, Partial<RuleDraft>>>> = {
  closer: {
    volume: {
      sales_value: { weight: 2.0, points_per_unit: 1 },
      markup_pct: { weight: 0.3, points_per_unit: 1 },
      new_clients_activated: { weight: 1.0, points_per_unit: 5000 },
      routine_compliance: { weight: 0.3, points_per_unit: 100 },
    } as Record<MetricCode, Partial<RuleDraft>>,
    qualidade: {
      sales_value: { weight: 0.5, points_per_unit: 1 },
      markup_pct: { weight: 2.0, points_per_unit: 1 },
      new_clients_activated: { weight: 2.0, points_per_unit: 5000 },
      routine_compliance: { weight: 1.0, points_per_unit: 100 },
    } as Record<MetricCode, Partial<RuleDraft>>,
    equilibrado: {
      sales_value: { weight: 1.0, points_per_unit: 1 },
      markup_pct: { weight: 0.8, points_per_unit: 1 },
      new_clients_activated: { weight: 1.5, points_per_unit: 5000 },
      routine_compliance: { weight: 0.5, points_per_unit: 100 },
    } as Record<MetricCode, Partial<RuleDraft>>,
  },
  sdr: {
    volume: {
      stakeholders_captured: { weight: 2.0, points_per_unit: 3000 },
      new_clients_activated: { weight: 1.0, points_per_unit: 4000 },
      conversations_initiated: { weight: 1.5, points_per_unit: 500 },
      sales_value_originated: { weight: 0.3, points_per_unit: 0.5 },
      routine_compliance: { weight: 0.3, points_per_unit: 100 },
    } as Record<MetricCode, Partial<RuleDraft>>,
    qualidade: {
      stakeholders_captured: { weight: 1.0, points_per_unit: 3000 },
      new_clients_activated: { weight: 2.0, points_per_unit: 4000 },
      conversations_initiated: { weight: 0.8, points_per_unit: 500 },
      sales_value_originated: { weight: 2.0, points_per_unit: 0.5 },
      routine_compliance: { weight: 1.0, points_per_unit: 100 },
    } as Record<MetricCode, Partial<RuleDraft>>,
    equilibrado: {
      stakeholders_captured: { weight: 1.5, points_per_unit: 3000 },
      new_clients_activated: { weight: 1.2, points_per_unit: 4000 },
      conversations_initiated: { weight: 1.0, points_per_unit: 500 },
      sales_value_originated: { weight: 0.8, points_per_unit: 0.5 },
      routine_compliance: { weight: 0.6, points_per_unit: 100 },
    } as Record<MetricCode, Partial<RuleDraft>>,
  },
};

function buildDefault(roleType: 'closer' | 'sdr'): RuleDraft[] {
  const preset = PRESETS[roleType].equilibrado;
  return ROLE_METRICS[roleType].map((mc) => ({
    metric_code: mc,
    weight: preset[mc]?.weight ?? 1,
    points_per_unit: preset[mc]?.points_per_unit ?? 1,
    label: METRIC_LABELS[mc].label,
  }));
}

export function ScoringRulesEditor({ open, onOpenChange, roleType, initialRules, onConfirm }: Props) {
  const [rules, setRules] = useState<RuleDraft[]>(() => {
    if (initialRules && initialRules.length > 0) {
      return initialRules.map((r) => ({
        metric_code: r.metric_code as MetricCode,
        weight: Number(r.weight),
        points_per_unit: Number(r.points_per_unit),
        label: r.label ?? METRIC_LABELS[r.metric_code as MetricCode].label,
      }));
    }
    return buildDefault(roleType);
  });

  const totalWeight = useMemo(() => rules.reduce((s, r) => s + r.weight, 0), [rules]);

  const applyPreset = (preset: 'volume' | 'qualidade' | 'equilibrado') => {
    const p = PRESETS[roleType][preset];
    setRules(ROLE_METRICS[roleType].map((mc) => ({
      metric_code: mc,
      weight: p[mc]?.weight ?? 1,
      points_per_unit: p[mc]?.points_per_unit ?? 1,
      label: METRIC_LABELS[mc].label,
    })));
  };

  const updateRule = (mc: MetricCode, patch: Partial<RuleDraft>) => {
    setRules((prev) => prev.map((r) => r.metric_code === mc ? { ...r, ...patch } : r));
  };

  const handleConfirm = () => {
    onConfirm(rules.map((r) => ({
      metric_code: r.metric_code,
      weight: r.weight,
      points_per_unit: r.points_per_unit,
      label: r.label,
    })));
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Sparkles className="w-5 h-5 text-primary" />
            Regras de Pontuação — {roleType === 'closer' ? 'Closer' : 'SDR'}
          </DialogTitle>
          <DialogDescription>
            Defina o peso e os pontos por unidade de cada métrica. O leaderboard será recalculado automaticamente em tempo real.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => applyPreset('volume')}>
            <Target className="w-3.5 h-3.5 mr-1" /> Foco em volume
          </Button>
          <Button size="sm" variant="outline" onClick={() => applyPreset('qualidade')}>
            <Sparkles className="w-3.5 h-3.5 mr-1" /> Foco em qualidade
          </Button>
          <Button size="sm" variant="outline" onClick={() => applyPreset('equilibrado')}>
            <Scale className="w-3.5 h-3.5 mr-1" /> Equilibrado
          </Button>
          <Badge variant="secondary" className="ml-auto">
            Peso total: {totalWeight.toFixed(1)}
          </Badge>
        </div>

        <div className="space-y-3">
          {rules.map((r) => {
            const meta = METRIC_LABELS[r.metric_code];
            const contributionPct = totalWeight > 0 ? (r.weight / totalWeight) * 100 : 0;
            return (
              <Card key={r.metric_code} className="border-border/60">
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{meta.icon}</span>
                      <div>
                        <div className="font-semibold text-sm">{meta.label}</div>
                        <div className="text-xs text-muted-foreground">por {meta.unit}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="font-mono">
                      {contributionPct.toFixed(0)}% do score
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Peso ({r.weight.toFixed(1)})</Label>
                      <Slider
                        value={[r.weight]}
                        min={0}
                        max={3}
                        step={0.1}
                        onValueChange={([v]) => updateRule(r.metric_code, { weight: v })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Pontos por unidade</Label>
                      <Input
                        type="number"
                        step="0.1"
                        min="0"
                        value={r.points_per_unit}
                        onChange={(e) => updateRule(r.metric_code, { points_per_unit: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleConfirm}>Aplicar regras</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

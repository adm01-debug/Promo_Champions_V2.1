import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PageTransition, itemVariants } from '@/components/transitions/PageTransition';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Save, RotateCcw, Timer } from 'lucide-react';

interface RuleRow {
  id: string;
  stage: string;
  label: string;
  mild_days: number;
  moderate_days: number;
  critical_days: number;
  enabled: boolean;
}

const DEFAULTS: Record<string, [number, number, number]> = {
  lead: [2, 3, 4],
  qualified: [3, 5, 6],
  proposal: [5, 8, 10],
  negotiation: [7, 11, 14],
  won: [15, 23, 30],
  lost: [30, 45, 60],
};

const AdminRegrasInatividade = () => {
  const qc = useQueryClient();
  const [draft, setDraft] = React.useState<Record<string, RuleRow>>({});

  const { data: rules, isLoading } = useQuery<RuleRow[]>({
    queryKey: ['stage-inactivity-rules-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stage_inactivity_rules')
        .select('id, stage, label, mild_days, moderate_days, critical_days, enabled')
        .order('mild_days', { ascending: true });
      if (error) throw error;
      return (data ?? []) as RuleRow[];
    },
  });

  React.useEffect(() => {
    if (rules) {
      const map: Record<string, RuleRow> = {};
      rules.forEach((r) => (map[r.id] = { ...r }));
      setDraft(map);
    }
  }, [rules]);

  const saveMutation = useMutation({
    mutationFn: async (row: RuleRow) => {
      if (row.mild_days <= 0) throw new Error('Dias (leve) deve ser positivo');
      if (row.moderate_days <= row.mild_days)
        throw new Error('Moderado deve ser maior que Leve');
      if (row.critical_days <= row.moderate_days)
        throw new Error('Crítico deve ser maior que Moderado');
      const { error } = await supabase
        .from('stage_inactivity_rules')
        .update({
          mild_days: row.mild_days,
          moderate_days: row.moderate_days,
          critical_days: row.critical_days,
          enabled: row.enabled,
        })
        .eq('id', row.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Regra atualizada');
      qc.invalidateQueries({ queryKey: ['stage-inactivity-rules-admin'] });
      qc.invalidateQueries({ queryKey: ['stage-inactivity-rules'] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const resetStage = (row: RuleRow) => {
    const def = DEFAULTS[row.stage];
    if (!def) return;
    setDraft((d) => ({
      ...d,
      [row.id]: { ...row, mild_days: def[0], moderate_days: def[1], critical_days: def[2] },
    }));
  };

  const update = (id: string, patch: Partial<RuleRow>) =>
    setDraft((d) => ({ ...d, [id]: { ...d[id], ...patch } }));

  const rows = Object.values(draft);

  return (
    <>
      <Helmet>
        <title>Regras de Inatividade | Promo Champions</title>
        <meta
          name="description"
          content="Configure limiares de recência (leve/moderado/crítico) por estágio do pipeline."
        />
      </Helmet>
      <PageTransition>
        <div className="container max-w-5xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
          <motion.div variants={itemVariants}>
            <h1 className="text-page-title font-display flex items-center gap-2">
              <Timer className="h-6 w-6 text-primary" /> Regras de Inatividade
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Defina, por estágio do pipeline, quantos dias sem atividade caracterizam alerta{' '}
              <Badge variant="outline" className="mx-1">leve</Badge>
              <Badge variant="outline" className="mx-1">moderado</Badge>
              <Badge variant="outline" className="mx-1">crítico</Badge>.
            </p>
          </motion.div>

          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          ) : (
            <motion.div variants={itemVariants} className="space-y-3">
              {rows.map((row) => (
                <Card key={row.id} className="p-4 md:p-5 glass border-border/40">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <span className="font-display font-semibold text-base">{row.label}</span>
                      <Badge variant="outline" className="text-[10px]">{row.stage}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`enabled-${row.id}`} className="text-xs text-muted-foreground">
                        Ativa
                      </Label>
                      <Switch
                        id={`enabled-${row.id}`}
                        checked={row.enabled}
                        onCheckedChange={(v) => update(row.id, { enabled: v })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Leve (dias)</Label>
                      <Input
                        type="number"
                        min={1}
                        value={row.mild_days}
                        onChange={(e) =>
                          update(row.id, { mild_days: parseInt(e.target.value || '0', 10) })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Moderado (dias)</Label>
                      <Input
                        type="number"
                        min={1}
                        value={row.moderate_days}
                        onChange={(e) =>
                          update(row.id, { moderate_days: parseInt(e.target.value || '0', 10) })
                        }
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Crítico (dias)</Label>
                      <Input
                        type="number"
                        min={1}
                        value={row.critical_days}
                        onChange={(e) =>
                          update(row.id, { critical_days: parseInt(e.target.value || '0', 10) })
                        }
                      />
                    </div>
                  </div>
                  <div className="flex flex-wrap justify-end gap-2 mt-4">
                    <Button variant="ghost" size="sm" onClick={() => resetStage(row)}>
                      <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Restaurar padrão
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => saveMutation.mutate(row)}
                      disabled={saveMutation.isPending}
                    >
                      <Save className="h-3.5 w-3.5 mr-1.5" /> Salvar
                    </Button>
                  </div>
                </Card>
              ))}
            </motion.div>
          )}
        </div>
      </PageTransition>
    </>
  );
};

export default AdminRegrasInatividade;

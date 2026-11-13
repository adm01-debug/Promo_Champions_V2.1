import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Clock, ShieldCheck, UserCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { Json } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type JsonObject = { [key: string]: Json | undefined };

function asObject(value: Json | null | undefined): JsonObject | null {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
    ? (value as JsonObject)
    : null;
}

export function ContactRulesDialog() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState({
    quiet_hours: { start: '20:00', end: '08:00' },
    max_calls_per_day: 3,
    prioritize_human: true,
  });

  const fetchRules = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { data: sp } = await supabase
      .from('salespeople')
      .select('id')
      .eq('auth_user_id', user.id)
      .maybeSingle();

    if (!sp) return;

    const { data: pref, error } = await supabase
      .from('salesperson_preferences')
      .select('contact_rules')
      .eq('salesperson_id', sp.id)
      .maybeSingle();

    if (error) {
      toast.error(`Erro ao carregar regras de contato: ${error.message}`);
      return;
    }

    if (pref?.contact_rules) {
      setRules(pref.contact_rules as typeof rules);
    }
  }, []);

  useEffect(() => {
    if (open) {
      void fetchRules();
    }
  }, [open, fetchRules]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { data: sp, error: spError } = await supabase
        .from('salespeople')
        .select('id')
        .eq('auth_user_id', user.id)
        .maybeSingle();

      if (spError) throw new Error(spError.message);
      if (!sp) throw new Error('Vendedor não encontrado');

      // Relê o jsonb atual para não apagar chaves gravadas por outra tela
      // (ex.: max_messages_per_day/min_interval_minutes das regras de frequência).
      const { data: current, error: readError } = await supabase
        .from('salesperson_preferences')
        .select('contact_rules')
        .eq('salesperson_id', sp.id)
        .maybeSingle();

      if (readError) throw new Error(readError.message);

      const base = asObject(current?.contact_rules) ?? {};
      const baseQuiet = asObject(base.quiet_hours ?? null) ?? {};

      // Upsert: vendedor sem linha em salesperson_preferences ganha a linha
      // (UNIQUE salesperson_id); antes o .update() não gravava nada e confirmava.
      const { error } = await supabase.from('salesperson_preferences').upsert(
        {
          salesperson_id: sp.id,
          contact_rules: {
            ...base,
            quiet_hours: { ...baseQuiet, ...rules.quiet_hours },
            max_calls_per_day: rules.max_calls_per_day,
            prioritize_human: rules.prioritize_human,
          },
        },
        { onConflict: 'salesperson_id' }
      );

      if (error) throw new Error(error.message);
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['contact-frequency-rules'] }),
        queryClient.invalidateQueries({ queryKey: ['salesperson-preferences'] }),
      ]);
      toast.success('Regras de contato salvas!');
      setOpen(false);
    } catch (e) {
      toast.error(`Erro: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 text-xs border-dashed">
          <ShieldCheck className="h-3.5 w-3.5" />
          Regras de Contato
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md glass border-border/50">
        <DialogHeader>
          <DialogTitle className="text-section-title flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Regras e Janelas de Contato
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  Horário de Silêncio
                </Label>
                <p className="text-[10px] text-muted-foreground">
                  Não enviar mensagens ou ligar nestes horários
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  className="w-24 h-8 text-xs"
                  value={rules.quiet_hours.start}
                  onChange={e =>
                    setRules({
                      ...rules,
                      quiet_hours: { ...rules.quiet_hours, start: e.target.value },
                    })
                  }
                />
                <span className="text-xs text-muted-foreground">às</span>
                <Input
                  type="time"
                  className="w-24 h-8 text-xs"
                  value={rules.quiet_hours.end}
                  onChange={e =>
                    setRules({
                      ...rules,
                      quiet_hours: { ...rules.quiet_hours, end: e.target.value },
                    })
                  }
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Máximo de ligações/dia</Label>
                <p className="text-[10px] text-muted-foreground">
                  Limite diário por lead para não ser invasivo
                </p>
              </div>
              <Input
                type="number"
                className="w-16 h-8 text-xs text-center"
                value={rules.max_calls_per_day}
                onChange={e =>
                  setRules({ ...rules, max_calls_per_day: parseInt(e.target.value) || 1 })
                }
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-primary" />
                  Priorizar Mensagem Humana
                </Label>
                <p className="text-[10px] text-muted-foreground">
                  IA prioriza templates humanos quando houver alto interesse
                </p>
              </div>
              <Switch
                checked={rules.prioritize_human}
                onCheckedChange={checked =>
                  setRules({ ...rules, prioritize_human: checked })
                }
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button variant="glow" size="sm" onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Regras'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

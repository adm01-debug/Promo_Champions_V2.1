import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Clock, ShieldCheck, UserCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function ContactRulesDialog() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rules, setRules] = useState({
    quiet_hours: { start: "20:00", end: "08:00" },
    max_calls_per_day: 3,
    prioritize_human: true,
  });

  useEffect(() => {
    if (open) {
      fetchRules();
    }
  }, [open]);

  const fetchRules = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: sp } = await supabase
      .from("salespeople")
      .select("id")
      .eq("auth_user_id", user.id)
      .maybeSingle();

    if (!sp) return;

    const { data: pref } = await supabase
      .from("salesperson_preferences")
      .select("contact_rules")
      .eq("salesperson_id", sp.id)
      .maybeSingle();

    if (pref?.contact_rules) {
      setRules(pref.contact_rules as any);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: sp } = await supabase
        .from("salespeople")
        .select("id")
        .eq("auth_user_id", user.id)
        .maybeSingle();

      if (!sp) throw new Error("Vendedor não encontrado");

      const { error } = await supabase
        .from("salesperson_preferences")
        .update({ contact_rules: rules })
        .eq("salesperson_id", sp.id);

      if (error) throw error;
      toast.success("Regras de contato salvas!");
      setOpen(false);
    } catch (e: any) {
      toast.error(`Erro: ${e.message}`);
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
          <DialogTitle className="flex items-center gap-2">
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
                <p className="text-[10px] text-muted-foreground">Não enviar mensagens ou ligar nestes horários</p>
              </div>
              <div className="flex items-center gap-2">
                <Input 
                  type="time" 
                  className="w-24 h-8 text-xs" 
                  value={rules.quiet_hours.start} 
                  onChange={(e) => setRules({...rules, quiet_hours: {...rules.quiet_hours, start: e.target.value}})}
                />
                <span className="text-xs text-muted-foreground">às</span>
                <Input 
                  type="time" 
                  className="w-24 h-8 text-xs" 
                  value={rules.quiet_hours.end}
                  onChange={(e) => setRules({...rules, quiet_hours: {...rules.quiet_hours, end: e.target.value}})}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Máximo de ligações/dia</Label>
                <p className="text-[10px] text-muted-foreground">Limite diário por lead para não ser invasivo</p>
              </div>
              <Input 
                type="number" 
                className="w-16 h-8 text-xs text-center" 
                value={rules.max_calls_per_day}
                onChange={(e) => setRules({...rules, max_calls_per_day: parseInt(e.target.value) || 1})}
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/5 border border-primary/10">
              <div className="space-y-0.5">
                <Label className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-primary" />
                  Priorizar Mensagem Humana
                </Label>
                <p className="text-[10px] text-muted-foreground">IA prioriza templates humanos quando houver alto interesse</p>
              </div>
              <Switch 
                checked={rules.prioritize_human}
                onCheckedChange={(checked) => setRules({...rules, prioritize_human: checked})}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button variant="glow" size="sm" onClick={handleSave} disabled={loading}>
            {loading ? "Salvando..." : "Salvar Regras"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
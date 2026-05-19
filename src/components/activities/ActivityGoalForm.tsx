import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useActivityGoals, useUpdateActivityGoals } from "@/hooks/activities/useActivities";
import { Target, Phone, Mail, Users, Linkedin, MessageCircle, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export function ActivityGoalForm() {
  const { data: currentUser } = useQuery({
    queryKey: ['current-user-sp'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase.from('salespeople').select('id').eq('auth_user_id', user.id).maybeSingle();
      return data;
    }
  });

  const { data: goals } = useActivityGoals(currentUser?.id);
  const updateGoals = useUpdateActivityGoals();

  const [form, setForm] = useState({
    calls: 0,
    emails: 0,
    meetings: 0,
    linkedin: 0,
    whatsapp: 0
  });

  useEffect(() => {
    if (goals) {
      setForm({
        calls: goals.calls_goal || 0,
        emails: goals.emails_goal || 0,
        meetings: goals.meetings_goal || 0,
        linkedin: goals.linkedin_goal || 0,
        whatsapp: goals.whatsapp_goal || 0
      });
    }
  }, [goals]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.id) return;
    updateGoals.mutate({
      salesperson_id: currentUser.id,
      calls_goal: form.calls,
      emails_goal: form.emails,
      meetings_goal: form.meetings,
      linkedin_goal: form.linkedin,
      whatsapp_goal: form.whatsapp
    });
  };

  return (
    <Card className="glass border-border/40 dark:border-glow">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-display font-medium flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" />
          Minhas Metas Diárias
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-2">
                <Phone className="h-3 w-3 text-status-info" /> Ligações
              </Label>
              <Input 
                type="number" 
                value={form.calls} 
                onChange={e => setForm(p => ({ ...p, calls: parseInt(e.target.value) || 0 }))}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-2">
                <Mail className="h-3 w-3 text-streak" /> E-mails
              </Label>
              <Input 
                type="number" 
                value={form.emails} 
                onChange={e => setForm(p => ({ ...p, emails: parseInt(e.target.value) || 0 }))}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-2">
                <Users className="h-3 w-3 text-accent" /> Reuniões
              </Label>
              <Input 
                type="number" 
                value={form.meetings} 
                onChange={e => setForm(p => ({ ...p, meetings: parseInt(e.target.value) || 0 }))}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-2">
                <Linkedin className="h-3 w-3 text-status-info" /> LinkedIn
              </Label>
              <Input 
                type="number" 
                value={form.linkedin} 
                onChange={e => setForm(p => ({ ...p, linkedin: parseInt(e.target.value) || 0 }))}
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs flex items-center gap-2">
                <MessageCircle className="h-3 w-3 text-status-success" /> WhatsApp
              </Label>
              <Input 
                type="number" 
                value={form.whatsapp} 
                onChange={e => setForm(p => ({ ...p, whatsapp: parseInt(e.target.value) || 0 }))}
                className="h-9 text-xs"
              />
            </div>
          </div>
          <Button type="submit" className="w-full h-9 text-xs gradient-primary gap-2" disabled={updateGoals.isPending}>
            <Save className="h-4 w-4" />
            Salvar Metas
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

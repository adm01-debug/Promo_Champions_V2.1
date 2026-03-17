import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RefreshCw, AlertTriangle, Clock, Mail, Phone, MessageCircle, 
  Zap, TrendingDown, Eye, CheckCircle2, XCircle, Send,
  ThermometerSun, Snowflake, Flame, Target
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { format, differenceInDays, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type LeadTemperature = 'hot' | 'warm' | 'cold' | 'frozen';

interface ColdLead {
  id: string;
  client_name: string;
  product_name: string;
  amount: number;
  status: string;
  updated_at: string;
  days_inactive: number;
  temperature: LeadTemperature;
  suggested_action: string;
  suggested_channel: string;
  last_activity?: string;
}

const temperatureConfig: Record<LeadTemperature, { label: string; icon: typeof Flame; color: string; bgColor: string }> = {
  hot: { label: 'Quente', icon: Flame, color: 'text-red-500', bgColor: 'bg-red-500/10' },
  warm: { label: 'Morno', icon: ThermometerSun, color: 'text-amber-500', bgColor: 'bg-amber-500/10' },
  cold: { label: 'Frio', icon: Snowflake, color: 'text-blue-400', bgColor: 'bg-blue-400/10' },
  frozen: { label: 'Congelado', icon: Snowflake, color: 'text-blue-700', bgColor: 'bg-blue-700/10' },
};

function getTemperature(daysInactive: number): LeadTemperature {
  if (daysInactive <= 3) return 'hot';
  if (daysInactive <= 7) return 'warm';
  if (daysInactive <= 14) return 'cold';
  return 'frozen';
}

function getSuggestedAction(temp: LeadTemperature, status: string): { action: string; channel: string } {
  const actions: Record<LeadTemperature, { action: string; channel: string }> = {
    hot: { action: 'Enviar proposta ou agendar reunião de fechamento', channel: 'call' },
    warm: { action: 'Check-in personalizado com valor agregado', channel: 'email' },
    cold: { action: 'Re-engajar com novo insight ou case de sucesso', channel: 'whatsapp' },
    frozen: { action: 'Campanha de reativação com oferta especial', channel: 'email' },
  };
  return actions[temp];
}

const FollowUpInteligente = () => {
  const { salesperson } = useAuth();
  const queryClient = useQueryClient();
  const [filterTemp, setFilterTemp] = useState<string>('all');
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());

  const { data: coldLeads = [], isLoading } = useQuery({
    queryKey: ['cold-leads', salesperson?.id],
    queryFn: async () => {
      const { data: deals, error } = await supabase
        .from('sales')
        .select('id, client_name, product_name, amount, status, updated_at, salesperson_id')
        .in('status', ['lead', 'qualified', 'proposal', 'negotiation', 'open'])
        .order('updated_at', { ascending: true });

      if (error) throw error;

      const now = new Date();
      return (deals || [])
        .map(deal => {
          const daysInactive = differenceInDays(now, new Date(deal.updated_at));
          const temp = getTemperature(daysInactive);
          const suggestion = getSuggestedAction(temp, deal.status);
          return {
            ...deal,
            days_inactive: daysInactive,
            temperature: temp,
            suggested_action: suggestion.action,
            suggested_channel: suggestion.channel,
          } as ColdLead;
        })
        .filter(lead => lead.days_inactive >= 3)
        .sort((a, b) => b.days_inactive - a.days_inactive);
    },
    staleTime: 2 * 60 * 1000,
  });

  const createFollowUpTask = useMutation({
    mutationFn: async (lead: ColdLead) => {
      const { error } = await supabase.from('tasks').insert({
        title: `Follow-up: ${lead.client_name}`,
        description: lead.suggested_action,
        task_type: lead.suggested_channel === 'call' ? 'call' : lead.suggested_channel === 'email' ? 'email' : 'follow_up',
        priority: lead.temperature === 'frozen' ? 'high' : lead.temperature === 'cold' ? 'medium' : 'low',
        due_date: new Date().toISOString().split('T')[0],
        sale_id: lead.id,
        assignee_id: salesperson?.id,
        created_by: salesperson?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Tarefa de follow-up criada!');
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: () => toast.error('Erro ao criar tarefa'),
  });

  const createBulkTasks = useMutation({
    mutationFn: async () => {
      const leadsToProcess = coldLeads.filter(l => selectedLeads.has(l.id));
      const tasks = leadsToProcess.map(lead => ({
        title: `Follow-up: ${lead.client_name}`,
        description: lead.suggested_action,
        task_type: lead.suggested_channel === 'call' ? 'call' as const : 'follow_up' as const,
        priority: lead.temperature === 'frozen' ? 'high' as const : 'medium' as const,
        due_date: new Date().toISOString().split('T')[0],
        sale_id: lead.id,
        assignee_id: salesperson?.id,
        created_by: salesperson?.id,
      }));
      const { error } = await supabase.from('tasks').insert(tasks);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success(`${selectedLeads.size} tarefas criadas!`);
      setSelectedLeads(new Set());
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: () => toast.error('Erro ao criar tarefas em lote'),
  });

  const filteredLeads = filterTemp === 'all' ? coldLeads : coldLeads.filter(l => l.temperature === filterTemp);

  const stats = {
    total: coldLeads.length,
    hot: coldLeads.filter(l => l.temperature === 'hot').length,
    warm: coldLeads.filter(l => l.temperature === 'warm').length,
    cold: coldLeads.filter(l => l.temperature === 'cold').length,
    frozen: coldLeads.filter(l => l.temperature === 'frozen').length,
    totalValue: coldLeads.reduce((sum, l) => sum + (l.amount || 0), 0),
  };

  const toggleLead = (id: string) => {
    setSelectedLeads(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const channelIcon: Record<string, typeof Mail> = {
    email: Mail, call: Phone, whatsapp: MessageCircle,
  };

  return (
    <>
      <Helmet><title>Follow-up Inteligente | Sales Arena</title></Helmet>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display font-bold gradient-text">🔄 Follow-up Inteligente</h1>
            <p className="text-muted-foreground mt-1">Detecção automática de leads esfriando + ações sugeridas por IA</p>
          </div>
          {selectedLeads.size > 0 && (
            <Button onClick={() => createBulkTasks.mutate()} disabled={createBulkTasks.isPending}>
              <Zap className="h-4 w-4 mr-2" />
              Criar {selectedLeads.size} tarefas
            </Button>
          )}
        </div>

        {/* Temperature Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { key: 'total', label: 'Total em Risco', value: stats.total, icon: AlertTriangle, color: 'text-foreground' },
            { key: 'hot', label: 'Quentes', value: stats.hot, icon: Flame, color: 'text-red-500' },
            { key: 'warm', label: 'Mornos', value: stats.warm, icon: ThermometerSun, color: 'text-amber-500' },
            { key: 'cold', label: 'Frios', value: stats.cold, icon: Snowflake, color: 'text-blue-400' },
            { key: 'frozen', label: 'Congelados', value: stats.frozen, icon: Snowflake, color: 'text-blue-700' },
          ].map(stat => (
            <motion.div key={stat.key} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="cursor-pointer hover:border-primary/50 transition-colors" onClick={() => setFilterTemp(stat.key === 'total' ? 'all' : stat.key)}>
                <CardContent className="p-4 text-center">
                  <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Value at risk */}
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-4">
            <TrendingDown className="h-8 w-8 text-destructive" />
            <div>
              <div className="text-sm text-muted-foreground">Valor em Risco (leads esfriando)</div>
              <div className="text-2xl font-bold text-destructive">
                R$ {stats.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
            </div>
            <div className="ml-auto">
              <Button variant="destructive" size="sm" onClick={() => {
                const allIds = new Set(coldLeads.filter(l => l.temperature === 'cold' || l.temperature === 'frozen').map(l => l.id));
                setSelectedLeads(allIds);
              }}>
                <Target className="h-4 w-4 mr-2" />
                Selecionar Críticos
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Leads List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Leads que precisam de atenção</h2>
            <Select value={filterTemp} onValueChange={setFilterTemp}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="hot">🔥 Quentes</SelectItem>
                <SelectItem value="warm">🌡️ Mornos</SelectItem>
                <SelectItem value="cold">❄️ Frios</SelectItem>
                <SelectItem value="frozen">🧊 Congelados</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Card key={i} className="animate-pulse"><CardContent className="h-24 p-4" /></Card>
              ))}
            </div>
          ) : filteredLeads.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500" />
                <h3 className="text-lg font-semibold">Tudo em dia! 🎉</h3>
                <p className="text-muted-foreground">Nenhum lead esfriando no momento.</p>
              </CardContent>
            </Card>
          ) : (
            <AnimatePresence>
              {filteredLeads.map((lead, i) => {
                const config = temperatureConfig[lead.temperature];
                const ChannelIcon = channelIcon[lead.suggested_channel] || Mail;
                const isSelected = selectedLeads.has(lead.id);

                return (
                  <motion.div
                    key={lead.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <Card className={`transition-all ${isSelected ? 'border-primary ring-2 ring-primary/20' : 'hover:border-muted-foreground/30'}`}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <button onClick={() => toggleLead(lead.id)} className="mt-1">
                            <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? 'bg-primary border-primary' : 'border-muted-foreground/40'}`}>
                              {isSelected && <CheckCircle2 className="h-3 w-3 text-primary-foreground" />}
                            </div>
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold truncate">{lead.client_name}</span>
                              <Badge variant="outline" className={`${config.bgColor} ${config.color} border-none`}>
                                <config.icon className="h-3 w-3 mr-1" />
                                {config.label}
                              </Badge>
                              <Badge variant="secondary" className="text-xs">{lead.status}</Badge>
                            </div>
                            <div className="text-sm text-muted-foreground mb-2">
                              {lead.product_name} · R$ {(lead.amount || 0).toLocaleString('pt-BR')}
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {lead.days_inactive} dias sem atividade
                              </span>
                              <span>Atualizado: {format(new Date(lead.updated_at), "dd/MM/yyyy", { locale: ptBR })}</span>
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <div className="flex items-center gap-1 text-xs bg-muted/50 px-2 py-1 rounded-full">
                              <ChannelIcon className="h-3 w-3" />
                              <span>{lead.suggested_channel}</span>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => createFollowUpTask.mutate(lead)}
                              disabled={createFollowUpTask.isPending}
                            >
                              <Send className="h-3 w-3 mr-1" />
                              Criar Tarefa
                            </Button>
                          </div>
                        </div>

                        <div className="mt-3 p-2 bg-muted/30 rounded-lg text-xs flex items-start gap-2">
                          <Zap className="h-3.5 w-3.5 text-amber-500 mt-0.5 shrink-0" />
                          <span className="text-muted-foreground"><strong>Sugestão IA:</strong> {lead.suggested_action}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>
      </div>
    </>
  );
};

export default FollowUpInteligente;

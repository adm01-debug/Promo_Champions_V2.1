import { useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { differenceInHours, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { SkeletonTransition } from '@/components/skeletons/SkeletonTransition';
import { PageTransition } from '@/components/transitions/PageTransition';
import { FollowUpHeader } from '@/components/follow-up/FollowUpHeader';
import { FollowUpStatsGrid } from '@/components/follow-up/FollowUpStatsGrid';
import { FollowUpValueAtRisk } from '@/components/follow-up/FollowUpValueAtRisk';
import { FollowUpLeadCard } from '@/components/follow-up/FollowUpLeadCard';
import { FollowUpEmptyState } from '@/components/follow-up/FollowUpEmptyState';
import { getTemperature, getSuggestedAction, type ColdLead } from '@/components/follow-up/types';
import { FollowUpLoadingSkeleton } from '@/components/skeletons/FollowUpLoadingSkeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { History, Zap } from 'lucide-react';

const FollowUpInteligente = () => {
  const { salesperson } = useAuth();
  const queryClient = useQueryClient();
  const [filterTemp, setFilterTemp] = useState('all');
  const [minDaysInactive, setMinDaysInactive] = useState(3);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [creatingLeadId, setCreatingLeadId] = useState<string | null>(null);
  const [selectedLeadForAudit, setSelectedLeadForAudit] = useState<ColdLead | null>(null);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [reactivateLead, setReactivateLead] = useState<ColdLead | null>(null);
  const [isReactivateModalOpen, setIsReactivateModalOpen] = useState(false);
  const [reactivationReason, setReactivationReason] = useState('');
  const [reactivationDate, setReactivationDate] = useState(new Date().toISOString().split('T')[0]);

  const { data: userRole } = useQuery({
    queryKey: ["user-role", salesperson?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", salesperson?.id || "")
        .maybeSingle();
      if (error) throw error;
      return data?.role;
    },
    enabled: !!salesperson?.id,
  });

  const isAdmin = userRole === "admin";

  const { data: followUpSettings } = useQuery({
    queryKey: ["follow-up-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("follow_up_settings")
        .select("*")
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: auditLogs = [] } = useQuery({
    queryKey: ['follow-up-audit-logs', selectedLeadForAudit?.id],
    queryFn: async () => {
      if (!selectedLeadForAudit?.id) return [];
      const { data, error } = await supabase
        .from('follow_up_audit_view' as any)
        .select('*')
        .eq('sale_id', selectedLeadForAudit.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!selectedLeadForAudit?.id,
  });

  const { data: coldLeads = [], isLoading } = useQuery({
    queryKey: ['cold-leads', salesperson?.id, minDaysInactive],
    queryFn: async () => {
      // Fetch deals
      const { data: deals, error: dealsError } = await supabase
        .from('sales')
        .select(`
          id, 
          client_name, 
          product_name, 
          amount, 
          status, 
          updated_at, 
          salesperson_id,
          lead_scores (score),
          deal_probability_scores (calibrated_probability)
        `)
        .in('status', ['lead', 'qualified', 'proposal', 'negotiation', 'open'])
        .order('updated_at', { ascending: true });

      if (dealsError) throw dealsError;

      // Fetch tasks (both pending and completed) to track cadence
      const { data: allTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('sale_id, status, completed_at')
        .order('completed_at', { ascending: false });

      if (tasksError) throw tasksError;

      const pendingTaskIds = new Set((allTasks || []).filter(t => t.status === 'pending').map(t => t.sale_id));
      const completedTasksMap = (allTasks || []).filter(t => t.status === 'completed').reduce((acc: Record<string, number>, t) => {
        if (t.sale_id) acc[t.sale_id] = (acc[t.sale_id] || 0) + 1;
        return acc;
      }, {});

      // Fetch last activity for each deal
      const { data: activities, error: activitiesError } = await supabase
        .from('activities')
        .select('sale_id, notes, created_at, activity_type')
        .order('created_at', { ascending: false });

      if (activitiesError) throw activitiesError;

      const activitiesMap = (activities || []).reduce((acc: Record<string, any>, act) => {
        if (act.sale_id && !acc[act.sale_id]) acc[act.sale_id] = act;
        return acc;
      }, {});

      const now = new Date();
      return (deals || [])
        .map(deal => {
          const hoursInactive = differenceInHours(now, new Date(deal.updated_at));
          const daysInactive = Math.floor(hoursInactive / 24);
          const temp = getTemperature(daysInactive);
          const suggestion = getSuggestedAction(temp);
          const lastActivity = activitiesMap[deal.id];
          const score = (deal.lead_scores as any)?.[0]?.score || 0;
          const probability = (deal.deal_probability_scores as any)?.[0]?.calibrated_probability || undefined;
          
          return {
            ...deal,
            days_inactive: daysInactive,
            temperature: temp,
            suggested_action: suggestion.action,
            suggested_channel: suggestion.channel,
            last_activity: lastActivity ? {
              notes: lastActivity.notes,
              created_at: lastActivity.created_at,
              type: lastActivity.activity_type
            } : undefined,
            score,
            probability,
            has_pending_task: pendingTaskIds.has(deal.id),
            follow_up_count: completedTasksMap[deal.id] || 0
          } as ColdLead;
        })
        .filter(lead => lead.days_inactive >= minDaysInactive)
        .sort((a, b) => b.days_inactive - a.days_inactive);
    },
    staleTime: 2 * 60 * 1000,
  });

  const createFollowUpTask = useMutation({
    mutationFn: async (lead: ColdLead) => {
      setCreatingLeadId(lead.id);
      
      // Prevenção de duplicidade
      if (lead.has_pending_task) {
        toast.info("Este lead já possui uma tarefa pendente.");
        return;
      }

      // Permissions check
      if (lead.temperature === 'frozen' && lead.score !== undefined && lead.score >= 80 && !isAdmin) {
        toast.error("Apenas administradores podem gerenciar leads Classe A congelados.");
        return;
      }

      const { error } = await supabase.from('tasks').insert({
        title: `Follow-up: ${lead.client_name}`,
        description: lead.suggested_action,
        task_type: lead.suggested_channel === 'call' ? 'call' : lead.suggested_channel === 'email' ? 'email' : 'follow_up',
        priority: lead.temperature === 'frozen' ? 'high' : lead.temperature === 'cold' ? 'medium' : 'low',
        due_date: new Date().toISOString().split('T')[0],
        sale_id: lead.id,
        salesperson_id: salesperson?.id,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Tarefa de follow-up criada!');
      queryClient.invalidateQueries({ queryKey: ['cold-leads'] });
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
    onError: () => toast.error('Erro ao criar tarefa'),
    onSettled: () => setCreatingLeadId(null),
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
        salesperson_id: salesperson?.id,
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

  const filteredLeads = useMemo(() => {
    let result = filterTemp === 'all' ? coldLeads : coldLeads.filter(l => l.temperature === filterTemp);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(l =>
        l.client_name?.toLowerCase().includes(q) ||
        l.product_name?.toLowerCase().includes(q)
      );
    }
    return result;
  }, [coldLeads, filterTemp, searchQuery]);

  const toggleLead = useCallback((id: string) => {
    setSelectedLeads(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }, []);

  const handleSelectCritical = useCallback(() => {
    const criticalIds = new Set(
      coldLeads.filter(l => l.temperature === 'cold' || l.temperature === 'frozen').map(l => l.id)
    );
    setSelectedLeads(criticalIds);
  }, [coldLeads]);

  const logAction = useMutation({
    mutationFn: async ({ saleId, actionType, details, status = 'success' }: { saleId: string, actionType: string, details: any, status?: string }) => {
      const { error } = await supabase
        .from('follow_up_audit_logs')
        .insert({
          sale_id: saleId,
          user_id: salesperson?.id,
          action_type: actionType,
          details,
          status
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['follow-up-audit-logs'] });
    }
  });

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentLeadForWA, setCurrentLeadForWA] = useState<ColdLead | null>(null);

  const handleWhatsAppClick = useCallback((lead: ColdLead) => {
    setCurrentLeadForWA(lead);
    setIsPreviewOpen(true);
  }, []);

  const sendWhatsApp = useCallback((lead: ColdLead) => {
    const template = followUpSettings?.whatsapp_template || 
      "Olá {{client_name}}! Sou o seu consultor na PROMO CHAMPIONS. Notei que nossa negociação sobre o {{product_name}} está na etapa de {{status}} e faz uns dias que não nos falamos. Como posso te ajudar a avançar hoje?";
    
    const message = template
      .replace("{{client_name}}", lead.client_name)
      .replace("{{product_name}}", lead.product_name || "produto")
      .replace("{{status}}", lead.status);

    logAction.mutate({
      saleId: lead.id,
      actionType: 'whatsapp_sent',
      details: { message_preview: message },
      status: 'sent'
    });

    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    setIsPreviewOpen(false);
  }, [followUpSettings, logAction]);

  const handleReactivate = useMutation({
    mutationFn: async () => {
      if (!reactivateLead) return;
      if (!isAdmin) throw new Error("Apenas administradores podem reativar leads Classe A.");

      // 1. Log the action
      await logAction.mutateAsync({
        saleId: reactivateLead.id,
        actionType: 'lead_reactivated',
        details: { reason: reactivationReason, next_follow_up: reactivationDate }
      });

      // 2. Create a task
      await supabase.from('tasks').insert({
        title: `Follow-up Reativação: ${reactivateLead.client_name}`,
        description: `Lead Classe A reativado. Motivo: ${reactivationReason}`,
        task_type: 'follow_up',
        priority: 'high',
        due_date: new Date(reactivationDate).toISOString(),
        sale_id: reactivateLead.id,
        salesperson_id: reactivateLead.salesperson_id || salesperson?.id
      });

      // 3. Update deal updated_at to reset inactivity
      await supabase.from('sales').update({ updated_at: new Date().toISOString() }).eq('id', reactivateLead.id);
    },
    onSuccess: () => {
      toast.success("Lead reativado com sucesso!");
      setIsReactivateModalOpen(false);
      setReactivationReason('');
      queryClient.invalidateQueries({ queryKey: ['cold-leads'] });
    },
    onError: (error: any) => {
      toast.error("Erro ao reativar: " + error.message);
    }
  });

  return (
    <>
      <Helmet>
        <title>Follow-up Inteligente | PROMO CHAMPIONS</title>
        <meta name="description" content="Detecção automática de leads esfriando com sugestões inteligentes de follow-up para maximizar conversões." />
      </Helmet>

      <SkeletonTransition isLoading={isLoading} skeleton={<FollowUpLoadingSkeleton />} duration={400}>
        <PageTransition>
          <div className="space-y-6">
            <FollowUpHeader
              selectedCount={selectedLeads.size}
              onBulkCreate={() => createBulkTasks.mutate()}
              isBulkCreating={createBulkTasks.isPending}
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              minDaysInactive={minDaysInactive}
              onMinDaysChange={setMinDaysInactive}
              isAdmin={isAdmin}
            />

            <FollowUpStatsGrid leads={coldLeads} onFilterChange={setFilterTemp} />

            <FollowUpValueAtRisk leads={coldLeads} onSelectCritical={handleSelectCritical} />

            {/* Leads List */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">
                  Leads que precisam de atenção
                  <span className="text-sm font-normal text-muted-foreground ml-2">
                    ({filteredLeads.length} de {coldLeads.length})
                  </span>
                </h2>
                <Select value={filterTemp} onValueChange={setFilterTemp}>
                  <SelectTrigger className="w-44">
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

              {filteredLeads.length === 0 ? (
                <FollowUpEmptyState isFiltered={filterTemp !== 'all' || searchQuery.trim().length > 0} />
              ) : (
                <AnimatePresence mode="popLayout">
                  {filteredLeads.map((lead, i) => (
                    <FollowUpLeadCard
                      key={lead.id}
                      lead={lead}
                      index={i}
                      isSelected={selectedLeads.has(lead.id)}
                      onToggle={toggleLead}
                      onCreateTask={l => createFollowUpTask.mutate(l)}
                      onWhatsAppClick={handleWhatsAppClick}
                      isCreating={creatingLeadId === lead.id}
                      onOpenAudit={(l) => { setSelectedLeadForAudit(l); setIsAuditModalOpen(true); }}
                      onReactivate={(l) => { setReactivateLead(l); setIsReactivateModalOpen(true); }}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </PageTransition>
      </SkeletonTransition>

      {/* Reativação de Lead Classe A Dialog */}
      <Dialog open={isReactivateModalOpen} onOpenChange={setIsReactivateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-amber-500" />
              Reativar Lead Classe A
            </DialogTitle>
            <DialogDescription>
              Este lead é prioritário. Registre o motivo e a nova data de acompanhamento.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Motivo da Reativação</Label>
              <Textarea 
                placeholder="Ex: Cliente demonstrou novo interesse após webinar..." 
                value={reactivationReason}
                onChange={(e) => setReactivationReason(e.target.value)}
                disabled={!isAdmin}
              />
            </div>
            <div className="space-y-2">
              <Label>Nova Data de Acompanhamento</Label>
              <Input 
                type="date" 
                value={reactivationDate}
                onChange={(e) => setReactivationDate(e.target.value)}
                disabled={!isAdmin}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReactivateModalOpen(false)}>Cancelar</Button>
            <Button 
              onClick={() => handleReactivate.mutate()} 
              disabled={handleReactivate.isPending || !isAdmin || !reactivationReason}
              className="gap-2"
            >
              {handleReactivate.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirmar Reativação
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Histórico Auditável Dialog */}
      <Dialog open={isAuditModalOpen} onOpenChange={setIsAuditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico de Follow-up: {selectedLeadForAudit?.client_name}
            </DialogTitle>
          </DialogHeader>
          <ScrollArea className="h-[400px] mt-4 pr-4">
            <div className="space-y-4">
              {auditLogs.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Nenhuma ação registrada para este lead.</p>
              )}
              {auditLogs.map((log: any) => (
                <div key={log.id} className="flex gap-3 border-l-2 border-primary/20 pl-4 py-1 relative">
                  <div className="absolute -left-1.5 top-2 w-3 h-3 rounded-full bg-primary" />
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-sm">
                        {log.action_type === 'whatsapp_sent' ? "WhatsApp Enviado" : 
                         log.action_type === 'task_created' ? "Tarefa Criada" : 
                         log.action_type === 'lead_reactivated' ? "Lead Reativado" : log.action_type}
                      </span>
                      <span className="text-[10px] text-muted-foreground uppercase font-black">
                        {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {typeof log.details === 'string' ? log.details : JSON.stringify(log.details)}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="h-4 w-4 rounded-full bg-muted flex items-center justify-center text-[8px] font-bold">
                        {log.user_name?.substring(0, 2).toUpperCase() || "UN"}
                      </div>
                      <span className="text-[10px] font-medium">{log.user_name || "Sistema"}</span>
                      {log.status && (
                        <Badge variant="outline" className="text-[8px] h-4 px-1 uppercase font-bold ml-auto">
                          {log.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
};
      {/* WhatsApp Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-500" />
              Revisar Mensagem
            </DialogTitle>
            <DialogDescription>
              Revise o conteúdo antes de gerar o link do WhatsApp para {currentLeadForWA?.client_name}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-6 px-4 bg-muted/30 rounded-lg border border-dashed border-primary/20 relative">
            <div className="absolute top-2 right-2">
              <Badge variant="outline" className="text-[10px] font-bold">WHATSAPP MOCKUP</Badge>
            </div>
            <div className="space-y-4">
              <div className="flex justify-start">
                <div className="bg-white dark:bg-zinc-800 p-3 rounded-2xl rounded-tl-none shadow-sm max-w-[85%] border border-border/50">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {currentLeadForWA && (followUpSettings?.whatsapp_template || "...")
                      .replace("{{client_name}}", currentLeadForWA.client_name)
                      .replace("{{product_name}}", currentLeadForWA.product_name || "produto")
                      .replace("{{status}}", currentLeadForWA.status)
                    }
                  </p>
                  <span className="text-[10px] text-muted-foreground mt-1 block text-right">Agora</span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPreviewOpen(false)}>Cancelar</Button>
            <Button 
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
              onClick={() => currentLeadForWA && sendWhatsApp(currentLeadForWA)}
            >
              <Send className="h-4 w-4" />
              Enviar para o WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

export default FollowUpInteligente;

import { useState, useMemo, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { differenceInDays } from 'date-fns';
import { SkeletonTransition } from '@/components/skeletons/SkeletonTransition';
import { PageTransition } from '@/components/transitions/PageTransition';
import { FollowUpHeader } from '@/components/follow-up/FollowUpHeader';
import { FollowUpStatsGrid } from '@/components/follow-up/FollowUpStatsGrid';
import { FollowUpValueAtRisk } from '@/components/follow-up/FollowUpValueAtRisk';
import { FollowUpLeadCard } from '@/components/follow-up/FollowUpLeadCard';
import { FollowUpEmptyState } from '@/components/follow-up/FollowUpEmptyState';
import { getTemperature, getSuggestedAction, type ColdLead } from '@/components/follow-up/types';
import { FollowUpLoadingSkeleton } from '@/components/skeletons/FollowUpLoadingSkeleton';

const FollowUpInteligente = () => {
  const { salesperson } = useAuth();
  const queryClient = useQueryClient();
  const [filterTemp, setFilterTemp] = useState('all');
  const [minDaysInactive, setMinDaysInactive] = useState(3);
  const [selectedLeads, setSelectedLeads] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

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
          lead_scores (score)
        `)
        .in('status', ['lead', 'qualified', 'proposal', 'negotiation', 'open'])
        .order('updated_at', { ascending: true });

      if (dealsError) throw dealsError;

      // Fetch pending tasks to prevent duplicates
      const { data: pendingTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('sale_id')
        .eq('status', 'pending');

      if (tasksError) throw tasksError;

      const pendingTaskIds = new Set((pendingTasks || []).map(t => t.sale_id));

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
          const daysInactive = differenceInDays(now, new Date(deal.updated_at));
          const temp = getTemperature(daysInactive);
          const suggestion = getSuggestedAction(temp);
          const lastActivity = activitiesMap[deal.id];
          const score = (deal.lead_scores as any)?.[0]?.score || 0;
          
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
            has_pending_task: pendingTaskIds.has(deal.id)
          } as ColdLead;
        })
        .filter(lead => lead.days_inactive >= minDaysInactive)
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
        salesperson_id: salesperson?.id,
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
                      isCreating={createFollowUpTask.isPending}
                    />
                  ))}
                </AnimatePresence>
              )}
            </div>
          </div>
        </PageTransition>
      </SkeletonTransition>
    </>
  );
};

export default FollowUpInteligente;

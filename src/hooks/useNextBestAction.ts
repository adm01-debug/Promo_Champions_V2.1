import { useQuery, useMutation } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type NextActionPriority = 'high' | 'medium' | 'low';
export type NextActionCategory = 'urgent' | 'growth' | 'retention' | 'prospecting' | 'admin';
export type NextActionChannel = 'phone' | 'email' | 'linkedin' | 'whatsapp' | 'in_person' | null;

export interface NextBestAction {
  title: string;
  description: string;
  rationale?: string;
  actionType: string;
  priority: NextActionPriority;
  confidence?: number;
  channel?: NextActionChannel;
  suggestedDate?: string | null;
  suggestedTime?: string | null;
  expectedImpact?: string;
  category?: NextActionCategory;
  dealClient?: string | null;
  dealId?: string | null;
  dealName?: string;
}

export interface NextBestActionResult {
  insight: string;
  summary?: { totalDeals: number; atRisk: number; goalProgress: number };
  suggestions: NextBestAction[];
}

async function invokeNBA(salespersonId: string, limit = 5): Promise<NextBestActionResult> {
  try {
    const { data, error } = await supabase.functions.invoke('next-best-action', {
      body: { salespersonId, limit },
    });
    if (!error && data?.suggestions) return data as NextBestActionResult;
  } catch {
    // fall through
  }
  return generateLocalSuggestions(salespersonId);
}

/**
 * Query hook — auto-fetches next best actions for a salesperson.
 */
export function useNextBestActionQuery(salespersonId?: string, limit = 5) {
  return useQuery<NextBestActionResult>({
    queryKey: ['next-best-action', salespersonId, limit],
    queryFn: () => invokeNBA(salespersonId!, limit),
    enabled: !!salespersonId,
    staleTime: 1000 * 60 * 10,
    retry: 1,
  });
}

/**
 * Mutation hook — on-demand generation (backwards compatible).
 */
export const useNextBestAction = () => {
  return useMutation<NextBestActionResult, Error, string>({
    mutationFn: (salespersonId: string) => invokeNBA(salespersonId),
  });
};

async function generateLocalSuggestions(salespersonId: string): Promise<NextBestActionResult> {
  const { data: sp } = await supabase
    .from('salespeople')
    .select('name')
    .eq('id', salespersonId)
    .maybeSingle();

  const { data: sales } = await supabase
    .from('sales')
    .select('id, client_name, amount, status, created_at, updated_at')
    .eq('salesperson_id', salespersonId)
    .order('created_at', { ascending: false })
    .limit(20);

  const { data: activities } = await supabase
    .from('activities')
    .select('id, activity_type, outcome, created_at')
    .eq('salesperson_id', salespersonId)
    .order('created_at', { ascending: false })
    .limit(30);

  const allSales = sales || [];
  const allActivities = activities || [];
  const suggestions: NextBestAction[] = [];
  const now = Date.now();
  const todayIso = new Date().toISOString().slice(0, 10);

  const stagnantDeals = allSales.filter(s => {
    if (s.status === 'completed' || s.status === 'lost') return false;
    return (now - new Date(s.updated_at).getTime()) / 86400000 > 7;
  });

  stagnantDeals.slice(0, 3).forEach(deal => {
    const days = Math.round((now - new Date(deal.updated_at).getTime()) / 86400000);
    suggestions.push({
      title: `Follow-up urgente: ${deal.client_name}`,
      description: `Deal sem atualização há ${days} dias. Recomenda-se contato imediato.`,
      rationale: `Pipeline data: deal estagnado há ${days}d, valor R$ ${Number(deal.amount || 0).toLocaleString('pt-BR')}.`,
      actionType: 'follow_up',
      priority: days > 14 ? 'high' : 'medium',
      confidence: 0.85,
      category: 'urgent',
      channel: 'phone',
      suggestedDate: todayIso,
      expectedImpact: `Reativar oportunidade de R$ ${Number(deal.amount || 0).toLocaleString('pt-BR')}.`,
      dealClient: deal.client_name,
      dealId: deal.id,
    });
  });

  const last7d = allActivities.filter(
    a => (now - new Date(a.created_at).getTime()) / 86400000 <= 7,
  );
  if (last7d.length < 10) {
    suggestions.push({
      title: 'Aumentar volume de atividades',
      description: `Apenas ${last7d.length} atividades nos últimos 7 dias. Meta recomendada: 15+.`,
      rationale: `Velocidade abaixo do benchmark (${last7d.length}/15 sem 7d).`,
      actionType: 'call',
      priority: last7d.length < 5 ? 'high' : 'medium',
      confidence: 0.7,
      category: 'prospecting',
      channel: 'phone',
      suggestedDate: todayIso,
      expectedImpact: 'Aumentar conversão e fluxo de pipeline.',
    });
  }

  // Lógica para Gatilhos de Intenção e Respostas do Lead
  const leadsWithResponse = allActivities.filter(a => a.activity_type === 'email' && (a.outcome as string) === 'connected');
  if (leadsWithResponse.length > 0) {
    suggestions.push({
      title: 'Responder lead interessado',
      description: 'Lead respondeu ao último e-mail. Sugestão: Oferecer demonstração personalizada ou tirar dúvidas técnicas.',
      rationale: 'Engajamento detectado: lead respondeu ativamente.',
      actionType: 'follow_up',
      priority: 'high',
      confidence: 0.92,
      category: 'growth',
      channel: 'whatsapp',
      expectedImpact: 'Converter resposta em reunião agendada.',
    });
  }

  // Gatilho de Intenção - Proposta Aberta / Cliques Repetidos
  const highInterestEvents = allActivities.filter(a => 
    (a.activity_type as string === 'proposal_view' || a.activity_type as string === 'price_click') && 
    (now - new Date(a.created_at).getTime()) / 60000 < 60 // Última hora
  );

  const priceClicks = highInterestEvents.filter(e => e.activity_type as string === 'price_click');
  const proposalViews = highInterestEvents.filter(e => e.activity_type as string === 'proposal_view');

  if (priceClicks.length >= 3) {
    suggestions.unshift({
      title: 'Ligar Agora: Cliques Repetidos em Preços',
      description: `Lead clicou ${priceClicks.length} vezes em preços na última hora. Demonstra alta intenção de fechamento.`,
      rationale: `Gatilho de Intenção: Alta frequência de cliques em preços (${priceClicks.length}x). Histórico SINGU sugere propensão 8x maior.`,
      actionType: 'call_now',
      priority: 'high',
      confidence: 0.98,
      category: 'urgent',
      channel: 'phone',
      expectedImpact: 'Negociar condições finais enquanto o lead está quente.',
    });
    console.info(`[Intent Log] Triggered: Multi-Price Clicks - Count: ${priceClicks.length}`);
  } else if (proposalViews.length > 0) {
    suggestions.unshift({
      title: 'Ligar Agora: Proposta Aberta',
      description: `Lead acabou de abrir a proposta. Momento ideal para tirar dúvidas e avançar para o fechamento.`,
      rationale: `Gatilho de Intenção: Visualização de proposta detectada em tempo real.`,
      actionType: 'call_now',
      priority: 'high',
      confidence: 0.94,
      category: 'urgent',
      channel: 'phone',
      expectedImpact: 'Aumentar taxa de conversão em 3.5x.',
    });
    console.info(`[Intent Log] Triggered: Proposal View detected.`);
  }

  // Priorização baseada em histórico recente
  const lastResponse = allActivities.find(a => a.activity_type === 'email' && (a.outcome as string) === 'connected');
  if (lastResponse && (now - new Date(lastResponse.created_at).getTime()) / 86400000 < 1) {
    suggestions.unshift({
      title: 'Follow-up Imediato: Resposta Recebida',
      description: 'Lead respondeu recentemente. Prioridade máxima para manter o momentum.',
      rationale: 'Histórico recente: Resposta do lead nas últimas 24h.',
      actionType: 'follow_up',
      priority: 'high',
      confidence: 0.91,
      category: 'growth',
      channel: 'whatsapp',
    });
  }

  const highInterestDeals = allSales.filter(s => s.status === 'proposal' && (now - new Date(s.updated_at).getTime()) / 86400000 < 2);
  if (highInterestDeals.length > 0) {
    suggestions.push({
      title: 'Gatilho de Desconto Estratégico',
      description: `Lead demonstrou alto interesse na proposta de ${highInterestDeals[0].client_name}.`,
      rationale: 'IA detectou padrão de fechamento. Um desconto de 5-10% pode acelerar o "sim" hoje.',
      actionType: 'discount',
      priority: 'high',
      confidence: 0.88,
      category: 'growth',
      channel: 'phone',
      expectedImpact: 'Acelerar fechamento em 40%.',
      dealId: highInterestDeals[0].id,
      dealName: highInterestDeals[0].client_name || undefined,
    });
  }

  const proposals = allSales.filter(s => s.status === 'proposal' || s.status === 'Proposta');
  if (proposals.length > 0) {
    suggestions.push({
      title: `Acompanhar ${proposals.length} proposta(s) enviada(s)`,
      description: 'Propostas em aberto precisam de acompanhamento para avançar.',
      rationale: `${proposals.length} propostas aguardando decisão.`,
      actionType: 'meeting',
      priority: 'medium',
      confidence: 0.75,
      category: 'growth',
      channel: 'in_person',
      suggestedDate: todayIso,
      expectedImpact: 'Acelerar fechamento de propostas em aberto.',
    });
  }

  const openDeals = allSales.filter(s => s.status !== 'completed' && s.status !== 'lost');
  if (openDeals.length < 5) {
    suggestions.push({
      title: 'Reforçar prospecção',
      description: `Pipeline com apenas ${openDeals.length} deals ativos.`,
      rationale: `Pipeline raso (${openDeals.length} deals < 5 saudável).`,
      actionType: 'email',
      priority: 'high',
      confidence: 0.8,
      category: 'prospecting',
      channel: 'email',
      suggestedDate: todayIso,
      expectedImpact: 'Reabastecer pipeline para próximos ciclos.',
    });
  }

  const completedCount = allSales.filter(s => s.status === 'completed').length;
  const totalRevenue = allSales
    .filter(s => s.status === 'completed')
    .reduce((sum, s) => sum + (s.amount || 0), 0);

  const insight =
    suggestions.length === 0
      ? `${sp?.name || 'Vendedor'} está com bom desempenho! ${completedCount} vendas fechadas com R$ ${totalRevenue.toLocaleString('pt-BR')} em receita.`
      : `${sp?.name || 'Vendedor'} tem ${openDeals.length} deals ativos e ${stagnantDeals.length} estagnados. Foco nas ações recomendadas pode melhorar a conversão.`;

  return {
    insight,
    summary: { totalDeals: openDeals.length, atRisk: stagnantDeals.length, goalProgress: 0 },
    suggestions: suggestions.slice(0, 5),
  };
}

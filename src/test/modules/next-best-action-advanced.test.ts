/**
 * Next Best Action - Advanced Logic Tests
 * Tests: local suggestion generation, proposal follow-up, pipeline health,
 * insight generation, suggestion capping, edge cases
 */
import { describe, it, expect } from 'vitest';

interface Sale {
  id: string;
  client_name: string;
  amount: number;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Activity {
  id: string;
  activity_type: string;
  outcome: string;
  created_at: string;
}

interface NextBestAction {
  title: string;
  description: string;
  actionType: string;
  priority: 'high' | 'medium' | 'low';
  dealClient?: string | null;
}

function generateLocalSuggestions(
  spName: string,
  sales: Sale[],
  activities: Activity[]
): { insight: string; suggestions: NextBestAction[] } {
  const suggestions: NextBestAction[] = [];
  const now = Date.now();

  // Stagnant deals
  const stagnantDeals = sales.filter(s => {
    if (s.status === 'completed' || s.status === 'lost') return false;
    return (now - new Date(s.updated_at).getTime()) / (1000 * 60 * 60 * 24) > 7;
  });

  stagnantDeals.slice(0, 3).forEach(deal => {
    const days = Math.round((now - new Date(deal.updated_at).getTime()) / (1000 * 60 * 60 * 24));
    suggestions.push({
      title: `Follow-up urgente: ${deal.client_name}`,
      description: `Deal sem atualização há ${days} dias.`,
      actionType: 'follow_up',
      priority: days > 14 ? 'high' : 'medium',
      dealClient: deal.client_name,
    });
  });

  // Activity volume
  const last7Days = activities.filter(a =>
    (now - new Date(a.created_at).getTime()) / (1000 * 60 * 60 * 24) <= 7
  );

  if (last7Days.length < 10) {
    suggestions.push({
      title: 'Aumentar volume de atividades',
      description: `Apenas ${last7Days.length} atividades nos últimos 7 dias.`,
      actionType: 'call',
      priority: last7Days.length < 5 ? 'high' : 'medium',
    });
  }

  // Proposal follow-up
  const proposalDeals = sales.filter(s => s.status === 'proposal' || s.status === 'Proposta');
  if (proposalDeals.length > 0) {
    suggestions.push({
      title: `Acompanhar ${proposalDeals.length} proposta(s) enviada(s)`,
      description: 'Propostas em aberto.',
      actionType: 'meeting',
      priority: 'medium',
    });
  }

  // Pipeline health
  const openDeals = sales.filter(s => s.status !== 'completed' && s.status !== 'lost');
  if (openDeals.length < 5) {
    suggestions.push({
      title: 'Reforçar prospecção',
      description: `Pipeline com apenas ${openDeals.length} deals ativos.`,
      actionType: 'email',
      priority: 'high',
    });
  }

  const completedCount = sales.filter(s => s.status === 'completed').length;
  const totalRevenue = sales
    .filter(s => s.status === 'completed')
    .reduce((sum, s) => sum + (s.amount || 0), 0);

  const insight =
    suggestions.length === 0
      ? `${spName} está com bom desempenho! ${completedCount} vendas fechadas com R$ ${totalRevenue.toLocaleString('pt-BR')} em receita.`
      : `${spName} tem ${openDeals.length} deals ativos e ${stagnantDeals.length} estagnados.`;

  return { insight, suggestions: suggestions.slice(0, 5) };
}

const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

describe('NBA Advanced - Stagnant Deals', () => {
  it('should limit stagnant deal suggestions to 3', () => {
    const sales: Sale[] = Array.from({ length: 10 }, (_, i) => ({
      id: `${i}`,
      client_name: `Client ${i}`,
      amount: 1000,
      status: 'pending',
      created_at: daysAgo(30),
      updated_at: daysAgo(20),
    }));
    const result = generateLocalSuggestions('Test', sales, []);
    const followUps = result.suggestions.filter(s => s.actionType === 'follow_up');
    expect(followUps.length).toBeLessThanOrEqual(3);
  });

  it('should set high priority for 15+ day old stagnant deals', () => {
    const sales: Sale[] = [
      { id: '1', client_name: 'Old', amount: 5000, status: 'pending', created_at: daysAgo(30), updated_at: daysAgo(20) },
    ];
    const result = generateLocalSuggestions('Test', sales, []);
    const followUp = result.suggestions.find(s => s.actionType === 'follow_up');
    expect(followUp?.priority).toBe('high');
  });

  it('should set medium priority for 8-14 day stagnant deals', () => {
    const sales: Sale[] = [
      { id: '1', client_name: 'Mid', amount: 5000, status: 'pending', created_at: daysAgo(15), updated_at: daysAgo(10) },
    ];
    const result = generateLocalSuggestions('Test', sales, []);
    const followUp = result.suggestions.find(s => s.actionType === 'follow_up');
    expect(followUp?.priority).toBe('medium');
  });
});

describe('NBA Advanced - Activity Volume', () => {
  it('should suggest increasing activities when < 10 in last 7 days', () => {
    const activities: Activity[] = Array.from({ length: 3 }, (_, i) => ({
      id: `${i}`,
      activity_type: 'call',
      outcome: 'completed',
      created_at: daysAgo(2),
    }));
    const result = generateLocalSuggestions('Test', [], activities);
    const actSuggestion = result.suggestions.find(s => s.actionType === 'call');
    expect(actSuggestion).toBeDefined();
  });

  it('should set high priority when < 5 activities', () => {
    const activities: Activity[] = [
      { id: '1', activity_type: 'call', outcome: 'done', created_at: daysAgo(1) },
    ];
    const result = generateLocalSuggestions('Test', [], activities);
    const actSuggestion = result.suggestions.find(s => s.actionType === 'call');
    expect(actSuggestion?.priority).toBe('high');
  });

  it('should not suggest when >= 10 activities', () => {
    const activities: Activity[] = Array.from({ length: 12 }, (_, i) => ({
      id: `${i}`,
      activity_type: 'call',
      outcome: 'done',
      created_at: daysAgo(3),
    }));
    const result = generateLocalSuggestions('Test', [], activities);
    const actSuggestion = result.suggestions.find(s => s.actionType === 'call');
    expect(actSuggestion).toBeUndefined();
  });

  it('should ignore activities older than 7 days', () => {
    const activities: Activity[] = Array.from({ length: 20 }, (_, i) => ({
      id: `${i}`,
      activity_type: 'call',
      outcome: 'done',
      created_at: daysAgo(10), // older than 7 days
    }));
    const result = generateLocalSuggestions('Test', [], activities);
    const actSuggestion = result.suggestions.find(s => s.actionType === 'call');
    expect(actSuggestion).toBeDefined(); // should still suggest because 0 in last 7d
  });
});

describe('NBA Advanced - Proposal Follow-up', () => {
  it('should detect proposals by status "proposal"', () => {
    const sales: Sale[] = [
      { id: '1', client_name: 'A', amount: 5000, status: 'proposal', created_at: daysAgo(5), updated_at: daysAgo(1) },
    ];
    const result = generateLocalSuggestions('Test', sales, []);
    const propSuggestion = result.suggestions.find(s => s.actionType === 'meeting');
    expect(propSuggestion).toBeDefined();
  });

  it('should also detect "Proposta" status (capitalized)', () => {
    const sales: Sale[] = [
      { id: '1', client_name: 'A', amount: 5000, status: 'Proposta', created_at: daysAgo(5), updated_at: daysAgo(1) },
    ];
    const result = generateLocalSuggestions('Test', sales, []);
    const propSuggestion = result.suggestions.find(s => s.actionType === 'meeting');
    expect(propSuggestion).toBeDefined();
  });

  it('should count multiple proposals in title', () => {
    const sales: Sale[] = [
      { id: '1', client_name: 'A', amount: 5000, status: 'proposal', created_at: daysAgo(5), updated_at: daysAgo(1) },
      { id: '2', client_name: 'B', amount: 8000, status: 'proposal', created_at: daysAgo(3), updated_at: daysAgo(1) },
    ];
    const result = generateLocalSuggestions('Test', sales, []);
    const propSuggestion = result.suggestions.find(s => s.actionType === 'meeting');
    expect(propSuggestion?.title).toContain('2');
  });
});

describe('NBA Advanced - Pipeline Health', () => {
  it('should suggest prospecting when < 5 open deals', () => {
    const sales: Sale[] = [
      { id: '1', client_name: 'A', amount: 5000, status: 'pending', created_at: daysAgo(5), updated_at: daysAgo(1) },
      { id: '2', client_name: 'B', amount: 5000, status: 'completed', created_at: daysAgo(10), updated_at: daysAgo(2) },
    ];
    const result = generateLocalSuggestions('Test', sales, []);
    const prospectSuggestion = result.suggestions.find(s => s.actionType === 'email');
    expect(prospectSuggestion).toBeDefined();
    expect(prospectSuggestion?.priority).toBe('high');
  });

  it('should not suggest prospecting when >= 5 open deals', () => {
    const sales: Sale[] = Array.from({ length: 6 }, (_, i) => ({
      id: `${i}`,
      client_name: `C${i}`,
      amount: 5000,
      status: 'pending',
      created_at: daysAgo(5),
      updated_at: daysAgo(1),
    }));
    const result = generateLocalSuggestions('Test', sales, []);
    const prospectSuggestion = result.suggestions.find(s => s.actionType === 'email');
    expect(prospectSuggestion).toBeUndefined();
  });
});

describe('NBA Advanced - Insight Generation', () => {
  it('should generate positive insight when no suggestions', () => {
    // Many activities + many open deals + no stagnant deals
    const sales: Sale[] = Array.from({ length: 6 }, (_, i) => ({
      id: `${i}`,
      client_name: `C${i}`,
      amount: 10000,
      status: 'pending',
      created_at: daysAgo(3),
      updated_at: daysAgo(1),
    }));
    const activities: Activity[] = Array.from({ length: 15 }, (_, i) => ({
      id: `${i}`,
      activity_type: 'call',
      outcome: 'done',
      created_at: daysAgo(2),
    }));
    const result = generateLocalSuggestions('João', sales, activities);
    expect(result.insight).toContain('João');
    expect(result.insight).toContain('bom desempenho');
  });

  it('should include revenue in positive insight', () => {
    const sales: Sale[] = [
      ...Array.from({ length: 6 }, (_, i) => ({
        id: `${i}`,
        client_name: `C${i}`,
        amount: 10000,
        status: 'pending' as string,
        created_at: daysAgo(3),
        updated_at: daysAgo(1),
      })),
      { id: '99', client_name: 'Won', amount: 50000, status: 'completed', created_at: daysAgo(5), updated_at: daysAgo(1) },
    ];
    const activities: Activity[] = Array.from({ length: 15 }, (_, i) => ({
      id: `${i}`,
      activity_type: 'call',
      outcome: 'done',
      created_at: daysAgo(2),
    }));
    const result = generateLocalSuggestions('Maria', sales, activities);
    expect(result.insight).toContain('1 vendas fechadas');
  });

  it('should cap suggestions at 5', () => {
    // Many stagnant deals + low activity + proposals + weak pipeline = many suggestions
    const sales: Sale[] = Array.from({ length: 4 }, (_, i) => ({
      id: `${i}`,
      client_name: `Stale${i}`,
      amount: 1000,
      status: i === 3 ? 'proposal' : 'pending',
      created_at: daysAgo(30),
      updated_at: daysAgo(20),
    }));
    const result = generateLocalSuggestions('Test', sales, []);
    expect(result.suggestions.length).toBeLessThanOrEqual(5);
  });
});

describe('NBA Advanced - Edge Cases', () => {
  it('should handle no sales and no activities', () => {
    const result = generateLocalSuggestions('Empty', [], []);
    expect(result.suggestions.length).toBeGreaterThan(0); // at least activity volume
    expect(result.insight).toBeDefined();
  });

  it('should handle all completed sales', () => {
    const sales: Sale[] = Array.from({ length: 3 }, (_, i) => ({
      id: `${i}`,
      client_name: `Done${i}`,
      amount: 10000,
      status: 'completed',
      created_at: daysAgo(10),
      updated_at: daysAgo(5),
    }));
    const activities: Activity[] = Array.from({ length: 15 }, (_, i) => ({
      id: `${i}`,
      activity_type: 'call',
      outcome: 'done',
      created_at: daysAgo(2),
    }));
    const result = generateLocalSuggestions('Top Seller', sales, activities);
    // No stagnant deals, enough activities, but pipeline is empty
    const prospectSuggestion = result.suggestions.find(s => s.actionType === 'email');
    expect(prospectSuggestion).toBeDefined();
  });

  it('should include dealClient in follow-up suggestions', () => {
    const sales: Sale[] = [
      { id: '1', client_name: 'ACME Corp', amount: 25000, status: 'pending', created_at: daysAgo(20), updated_at: daysAgo(15) },
    ];
    const result = generateLocalSuggestions('Test', sales, []);
    const followUp = result.suggestions.find(s => s.actionType === 'follow_up');
    expect(followUp?.dealClient).toBe('ACME Corp');
    expect(followUp?.title).toContain('ACME Corp');
  });
});

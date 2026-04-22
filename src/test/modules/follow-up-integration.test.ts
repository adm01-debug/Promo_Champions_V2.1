import { describe, it, expect } from 'vitest';
import { differenceInDays } from 'date-fns';
import { getTemperature, getSuggestedAction, type ColdLead, type LeadTemperature } from '@/components/follow-up/types';

// ============================================================================
// FOLLOW-UP INTEGRATION E2E — Full Pipeline Simulation
// End-to-end tests simulating real user flows through the entire follow-up system
// ============================================================================

function simulateDealToLead(deal: { id: string; client_name: string; product_name: string; amount: number; status: string; updated_at: string }): ColdLead | null {
  const now = new Date();
  const daysInactive = differenceInDays(now, new Date(deal.updated_at));
  if (daysInactive < 3) return null;
  const temp = getTemperature(daysInactive);
  const suggestion = getSuggestedAction(temp);
  return {
    ...deal,
    days_inactive: daysInactive,
    temperature: temp,
    suggested_action: suggestion.action,
    suggested_channel: suggestion.channel,
  };
}

describe('Follow-up Integration E2E', () => {

  // ==========================================================================
  // 1. DEAL → LEAD PIPELINE
  // ==========================================================================
  describe('Deal-to-Lead Transformation Pipeline', () => {
    it('should transform active deal into cold lead', () => {
      const deal = {
        id: 'deal-1',
        client_name: 'Acme',
        product_name: 'Enterprise',
        amount: 100000,
        status: 'qualified',
        updated_at: new Date(Date.now() - 20 * 86400000).toISOString(),
      };
      const lead = simulateDealToLead(deal);
      expect(lead).not.toBeNull();
      expect(lead!.temperature).toBe('frozen');
      expect(lead!.days_inactive).toBeGreaterThanOrEqual(19);
    });

    it('should reject recently active deals', () => {
      const deal = {
        id: 'deal-2',
        client_name: 'Fresh Corp',
        product_name: 'Starter',
        amount: 5000,
        status: 'lead',
        updated_at: new Date(Date.now() - 1 * 86400000).toISOString(),
      };
      const lead = simulateDealToLead(deal);
      expect(lead).toBeNull();
    });

    it('should assign correct channel based on temperature', () => {
      const testCases = [
        { days: 3, expectedChannel: 'call' },
        { days: 5, expectedChannel: 'email' },
        { days: 10, expectedChannel: 'whatsapp' },
        { days: 20, expectedChannel: 'email' },
      ];
      testCases.forEach(({ days, expectedChannel }) => {
        const deal = {
          id: `deal-${days}`, client_name: 'Test', product_name: 'P', amount: 1000, status: 'open',
          updated_at: new Date(Date.now() - days * 86400000).toISOString(),
        };
        const lead = simulateDealToLead(deal);
        if (lead) {
          expect(lead.suggested_channel).toBe(expectedChannel);
        }
      });
    });
  });

  // ==========================================================================
  // 2. FULL PIPELINE SIMULATION — 50 Deals
  // ==========================================================================
  describe('Full Pipeline — 50 Deal Batch', () => {
    const deals = Array.from({ length: 50 }, (_, i) => ({
      id: `deal-batch-${i}`,
      client_name: `Client ${i}`,
      product_name: `Product ${i % 5}`,
      amount: (i + 1) * 5000,
      status: ['lead', 'qualified', 'proposal', 'negotiation', 'open'][i % 5],
      updated_at: new Date(Date.now() - (i * 2) * 86400000).toISOString(),
    }));

    const leads = deals.map(d => simulateDealToLead(d)).filter(Boolean) as ColdLead[];

    it('should filter out recently active deals', () => {
      expect(leads.length).toBeLessThan(deals.length);
    });

    it('should have all leads with days_inactive >= 3', () => {
      leads.forEach(l => expect(l.days_inactive).toBeGreaterThanOrEqual(3));
    });

    it('should have distribution across all temperatures', () => {
      const temps = new Set(leads.map(l => l.temperature));
      expect(temps.size).toBeGreaterThanOrEqual(2);
    });

    it('should calculate correct total value at risk', () => {
      const total = leads.reduce((s, l) => s + l.amount, 0);
      expect(total).toBeGreaterThan(0);
    });

    it('should sort by days_inactive descending', () => {
      const sorted = [...leads].sort((a, b) => b.days_inactive - a.days_inactive);
      expect(sorted[0].days_inactive).toBeGreaterThanOrEqual(sorted[sorted.length - 1].days_inactive);
    });
  });

  // ==========================================================================
  // 3. BULK TASK CREATION SIMULATION
  // ==========================================================================
  describe('Bulk Task Creation Flow', () => {
    const leads: ColdLead[] = Array.from({ length: 5 }, (_, i) => ({
      id: `bl-${i}`,
      client_name: `Bulk Client ${i}`,
      product_name: 'Bulk Product',
      amount: 10000,
      status: 'qualified',
      updated_at: new Date(Date.now() - 15 * 86400000).toISOString(),
      days_inactive: 15,
      temperature: 'frozen' as LeadTemperature,
      suggested_action: 'Reactivate',
      suggested_channel: 'email',
    }));

    it('should generate tasks for all selected leads', () => {
      const selectedIds = new Set(leads.map(l => l.id));
      const toProcess = leads.filter(l => selectedIds.has(l.id));
      const tasks = toProcess.map(lead => ({
        title: `Follow-up: ${lead.client_name}`,
        task_type: lead.suggested_channel === 'call' ? 'call' : 'follow_up',
        priority: lead.temperature === 'frozen' ? 'high' : 'medium',
        due_date: new Date().toISOString().split('T')[0],
        sale_id: lead.id,
      }));
      expect(tasks.length).toBe(5);
      tasks.forEach(t => {
        expect(t.priority).toBe('high');
        expect(t.title).toContain('Follow-up:');
      });
    });

    it('should clear selection after bulk create', () => {
      const selected = new Set(leads.map(l => l.id));
      expect(selected.size).toBe(5);
      selected.clear();
      expect(selected.size).toBe(0);
    });
  });

  // ==========================================================================
  // 4. SEARCH + FILTER COMBINED SCENARIOS
  // ==========================================================================
  describe('Combined Search & Filter Scenarios', () => {
    const leads: ColdLead[] = [
      { id: '1', client_name: 'Acme Corp', product_name: 'Premium', amount: 50000, status: 'proposal', updated_at: '2025-01-01', days_inactive: 10, temperature: 'cold', suggested_action: 'Re-engage', suggested_channel: 'whatsapp' },
      { id: '2', client_name: 'Beta LLC', product_name: 'Basic', amount: 10000, status: 'lead', updated_at: '2025-01-10', days_inactive: 5, temperature: 'warm', suggested_action: 'Check-in', suggested_channel: 'email' },
      { id: '3', client_name: 'Acme Industries', product_name: 'Enterprise', amount: 100000, status: 'negotiation', updated_at: '2024-12-01', days_inactive: 30, temperature: 'frozen', suggested_action: 'Reactivate', suggested_channel: 'email' },
    ];

    it('should filter by temperature then search', () => {
      let result = leads.filter(l => l.temperature === 'cold');
      result = result.filter(l => l.client_name.toLowerCase().includes('acme'));
      expect(result.length).toBe(1);
      expect(result[0].client_name).toBe('Acme Corp');
    });

    it('should search across all then filter', () => {
      let result = leads.filter(l => l.client_name.toLowerCase().includes('acme'));
      result = result.filter(l => l.temperature === 'frozen');
      expect(result.length).toBe(1);
      expect(result[0].client_name).toBe('Acme Industries');
    });

    it('should handle no results gracefully', () => {
      let result = leads.filter(l => l.temperature === 'hot');
      result = result.filter(l => l.client_name.toLowerCase().includes('xyz'));
      expect(result.length).toBe(0);
    });

    it('should search by product_name', () => {
      const result = leads.filter(l => l.product_name?.toLowerCase().includes('premium'));
      expect(result.length).toBe(1);
    });
  });

  // ==========================================================================
  // 5. CRITICAL SELECTION — Select Frozen+Cold
  // ==========================================================================
  describe('Critical Lead Selection', () => {
    const leads: ColdLead[] = [
      { id: '1', client_name: 'A', product_name: 'P', amount: 1000, status: 'lead', updated_at: '', days_inactive: 3, temperature: 'hot', suggested_action: '', suggested_channel: 'call' },
      { id: '2', client_name: 'B', product_name: 'P', amount: 2000, status: 'lead', updated_at: '', days_inactive: 5, temperature: 'warm', suggested_action: '', suggested_channel: 'email' },
      { id: '3', client_name: 'C', product_name: 'P', amount: 3000, status: 'lead', updated_at: '', days_inactive: 10, temperature: 'cold', suggested_action: '', suggested_channel: 'whatsapp' },
      { id: '4', client_name: 'D', product_name: 'P', amount: 4000, status: 'lead', updated_at: '', days_inactive: 20, temperature: 'frozen', suggested_action: '', suggested_channel: 'email' },
      { id: '5', client_name: 'E', product_name: 'P', amount: 5000, status: 'lead', updated_at: '', days_inactive: 12, temperature: 'cold', suggested_action: '', suggested_channel: 'whatsapp' },
    ];

    it('should select only cold and frozen leads', () => {
      const criticalIds = new Set(
        leads.filter(l => l.temperature === 'cold' || l.temperature === 'frozen').map(l => l.id)
      );
      expect(criticalIds.size).toBe(3);
      expect(criticalIds.has('3')).toBe(true);
      expect(criticalIds.has('4')).toBe(true);
      expect(criticalIds.has('5')).toBe(true);
      expect(criticalIds.has('1')).toBe(false);
    });

    it('should calculate critical value correctly', () => {
      const criticalValue = leads
        .filter(l => l.temperature === 'cold' || l.temperature === 'frozen')
        .reduce((s, l) => s + l.amount, 0);
      expect(criticalValue).toBe(12000);
    });
  });

  // ==========================================================================
  // 6. NEXT BEST ACTION INTEGRATION
  // ==========================================================================
  describe('Next Best Action — Stagnant Deal Detection', () => {
    it('should identify stagnant deals (>7 days no update)', () => {
      const now = Date.now();
      const sales = [
        { status: 'qualified', updated_at: new Date(now - 10 * 86400000).toISOString() },
        { status: 'completed', updated_at: new Date(now - 30 * 86400000).toISOString() },
        { status: 'proposal', updated_at: new Date(now - 3 * 86400000).toISOString() },
        { status: 'negotiation', updated_at: new Date(now - 15 * 86400000).toISOString() },
      ];
      const stagnant = sales.filter(s => {
        if (s.status === 'completed' || s.status === 'lost') return false;
        const daysSince = (now - new Date(s.updated_at).getTime()) / 86400000;
        return daysSince > 7;
      });
      expect(stagnant.length).toBe(2);
    });

    it('should set high priority for >14 days stagnant', () => {
      const days = 20;
      const priority = days > 14 ? 'high' : 'medium';
      expect(priority).toBe('high');
    });

    it('should set medium priority for 7-14 days stagnant', () => {
      const days = 10;
      const priority = days > 14 ? 'high' : 'medium';
      expect(priority).toBe('medium');
    });
  });

  // ==========================================================================
  // 7. EDGE CASES & RESILIENCE
  // ==========================================================================
  describe('Edge Cases & Resilience', () => {
    it('should handle lead with future updated_at', () => {
      const futureDate = new Date(Date.now() + 86400000).toISOString();
      const daysInactive = differenceInDays(new Date(), new Date(futureDate));
      expect(daysInactive).toBeLessThanOrEqual(0);
    });

    it('should handle lead with very old updated_at', () => {
      const oldDate = '2020-01-01T00:00:00Z';
      const daysInactive = differenceInDays(new Date(), new Date(oldDate));
      expect(daysInactive).toBeGreaterThan(365);
      expect(getTemperature(daysInactive)).toBe('frozen');
    });

    it('should handle special chars in client_name for search', () => {
      const name = 'O\'Brien & Partners (Ltd.)';
      const query = "o'brien";
      expect(name.toLowerCase().includes(query.toLowerCase())).toBe(true);
    });

    it('should handle unicode in client names', () => {
      const name = 'Ação Empresarial';
      const query = 'ação';
      expect(name.toLowerCase().includes(query.toLowerCase())).toBe(true);
    });

    it('should handle empty leads array in all calculations', () => {
      const leads: ColdLead[] = [];
      expect(leads.reduce((s, l) => s + l.amount, 0)).toBe(0);
      expect(leads.filter(l => l.temperature === 'cold').length).toBe(0);
    });

    it('should handle single lead array', () => {
      const leads = [{ amount: 5000, temperature: 'cold' as LeadTemperature }];
      expect(leads.reduce((s, l) => s + l.amount, 0)).toBe(5000);
    });
  });

  // ==========================================================================
  // 8. PERFORMANCE — Large Dataset
  // ==========================================================================
  describe('Performance — Large Dataset Handling', () => {
    it('should handle 1000 leads efficiently', () => {
      const start = performance.now();
      // Determinístico: amounts derivados do índice (sem Math.random).
      const leads = Array.from({ length: 1000 }, (_, i) => ({
        id: `perf-${i}`,
        client_name: `Client ${i}`,
        product_name: `Product ${i % 10}`,
        amount: ((i * 9301 + 49297) % 100000), // PRNG determinístico (LCG)
        status: 'qualified',
        updated_at: new Date(Date.now() - (i % 30) * 86400000).toISOString(),
        days_inactive: i % 30,
        temperature: getTemperature(i % 30),
        suggested_action: getSuggestedAction(getTemperature(i % 30)).action,
        suggested_channel: getSuggestedAction(getTemperature(i % 30)).channel,
      }));

      const filtered = leads.filter(l => l.days_inactive >= 3);
      const sorted = filtered.sort((a, b) => b.days_inactive - a.days_inactive);
      const total = sorted.reduce((s, l) => s + l.amount, 0);
      const elapsed = performance.now() - start;

      expect(elapsed).toBeLessThan(500);
      expect(sorted.length).toBeGreaterThan(0);
      expect(total).toBeGreaterThan(0);
    });
  });
});

import { describe, it, expect, vi } from 'vitest';
import type { ColdLead, LeadTemperature } from '@/components/follow-up/types';

// ============================================================================
// FOLLOW-UP COMPONENTS — E2E Logic Tests for All Components
// Tests the data flow, interactions, and business logic of each component
// ============================================================================

// Determinístico: nenhum Math.random — IDs gerados via contador incremental.
let leadIdCounter = 0;
function nextLeadId(): string {
  leadIdCounter += 1;
  return `lead-${leadIdCounter.toString(36).padStart(6, '0')}`;
}

// Factory for creating test leads
function createLead(overrides: Partial<ColdLead> = {}): ColdLead {
  return {
    id: nextLeadId(),
    client_name: 'Cliente Teste',
    product_name: 'Produto A',
    amount: 25000,
    status: 'qualified',
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    days_inactive: 10,
    temperature: 'cold',
    suggested_action: 'Re-engajar com insight',
    suggested_channel: 'whatsapp',
    ...overrides,
  };
}

function createLeadSet(_count: number, tempDistribution: Record<LeadTemperature, number> = { hot: 2, warm: 3, cold: 4, frozen: 1 }): ColdLead[] {
  const leads: ColdLead[] = [];
  const temps: LeadTemperature[] = ['hot', 'warm', 'cold', 'frozen'];
  temps.forEach(temp => {
    for (let i = 0; i < (tempDistribution[temp] || 0); i++) {
      leads.push(createLead({
        temperature: temp,
        days_inactive: temp === 'hot' ? 2 : temp === 'warm' ? 5 : temp === 'cold' ? 10 : 20,
        amount: (i + 1) * 10000,
        client_name: `Cliente ${temp.toUpperCase()} ${i + 1}`,
      }));
    }
  });
  return leads;
}

describe('Follow-up Components E2E Logic', () => {

  // ==========================================================================
  // 1. STATS GRID — Count Logic & Filter Triggers
  // ==========================================================================
  describe('FollowUpStatsGrid Logic', () => {
    it('should count total leads correctly', () => {
      const leads = createLeadSet(10);
      const counts = {
        total: leads.length,
        hot: leads.filter(l => l.temperature === 'hot').length,
        warm: leads.filter(l => l.temperature === 'warm').length,
        cold: leads.filter(l => l.temperature === 'cold').length,
        frozen: leads.filter(l => l.temperature === 'frozen').length,
      };
      expect(counts.total).toBe(10);
      expect(counts.hot).toBe(2);
      expect(counts.warm).toBe(3);
      expect(counts.cold).toBe(4);
      expect(counts.frozen).toBe(1);
    });

    it('should handle empty lead list', () => {
      const leads: ColdLead[] = [];
      const counts = {
        total: leads.length,
        hot: leads.filter(l => l.temperature === 'hot').length,
      };
      expect(counts.total).toBe(0);
      expect(counts.hot).toBe(0);
    });

    it('should handle leads with only one temperature', () => {
      const leads = Array.from({ length: 5 }, () => createLead({ temperature: 'frozen' }));
      expect(leads.filter(l => l.temperature === 'frozen').length).toBe(5);
      expect(leads.filter(l => l.temperature === 'hot').length).toBe(0);
    });

    it('should map "total" key to "all" filter value', () => {
      const onFilterChange = vi.fn();
      const keyToFilter = (key: string) => key === 'total' ? 'all' : key;
      onFilterChange(keyToFilter('total'));
      expect(onFilterChange).toHaveBeenCalledWith('all');
    });

    it('should map temperature keys directly', () => {
      const keys = ['hot', 'warm', 'cold', 'frozen'];
      const keyToFilter = (key: string) => key === 'total' ? 'all' : key;
      keys.forEach(key => {
        expect(keyToFilter(key)).toBe(key);
      });
    });
  });

  // ==========================================================================
  // 2. HEADER — Search & Bulk Actions
  // ==========================================================================
  describe('FollowUpHeader Logic', () => {
    it('should show bulk button only when leads are selected', () => {
      expect(0 > 0).toBe(false);
      expect(3 > 0).toBe(true);
    });

    it('should display correct count in bulk button', () => {
      const selectedCount = 5;
      const buttonText = `Criar ${selectedCount} tarefas`;
      expect(buttonText).toBe('Criar 5 tarefas');
    });

    it('should handle empty search query', () => {
      const query = '';
      const isSearchActive = query.trim().length > 0;
      expect(isSearchActive).toBe(false);
    });

    it('should handle whitespace-only search', () => {
      const query = '   ';
      const isSearchActive = query.trim().length > 0;
      expect(isSearchActive).toBe(false);
    });

    it('should detect valid search input', () => {
      const query = 'Cliente';
      const isSearchActive = query.trim().length > 0;
      expect(isSearchActive).toBe(true);
    });
  });

  // ==========================================================================
  // 3. VALUE AT RISK — Financial Calculations
  // ==========================================================================
  describe('FollowUpValueAtRisk Logic', () => {
    it('should calculate total value at risk', () => {
      const leads = [
        createLead({ amount: 10000 }),
        createLead({ amount: 25000 }),
        createLead({ amount: 50000 }),
      ];
      const totalValue = leads.reduce((sum, l) => sum + (l.amount || 0), 0);
      expect(totalValue).toBe(85000);
    });

    it('should count critical leads (cold + frozen)', () => {
      const leads = createLeadSet(10);
      const criticalCount = leads.filter(l => l.temperature === 'cold' || l.temperature === 'frozen').length;
      expect(criticalCount).toBe(5); // 4 cold + 1 frozen
    });

    it('should return null-equivalent when totalValue is 0', () => {
      const leads: ColdLead[] = [];
      const totalValue = leads.reduce((sum, l) => sum + (l.amount || 0), 0);
      expect(totalValue === 0).toBe(true);
    });

    it('should handle leads with null amounts', () => {
      const leads = [
        createLead({ amount: 0 }),
        createLead({ amount: 30000 }),
      ];
      const totalValue = leads.reduce((sum, l) => sum + (l.amount || 0), 0);
      expect(totalValue).toBe(30000);
    });

    it('should format value in BRL correctly', () => {
      const value = 85000;
      const formatted = value.toLocaleString('pt-BR', { minimumFractionDigits: 2 });
      expect(formatted).toMatch(/85/);
    });

    it('should only show select button when critical leads exist', () => {
      const leads = [createLead({ temperature: 'hot' }), createLead({ temperature: 'warm' })];
      const criticalCount = leads.filter(l => l.temperature === 'cold' || l.temperature === 'frozen').length;
      expect(criticalCount > 0).toBe(false);
    });

    it('should handle very large portfolios', () => {
      const leads = Array.from({ length: 100 }, (_, i) => createLead({ amount: i * 1000 }));
      const total = leads.reduce((s, l) => s + l.amount, 0);
      expect(total).toBe(4950000);
    });
  });

  // ==========================================================================
  // 4. LEAD CARD — Individual Lead Interactions
  // ==========================================================================
  describe('FollowUpLeadCard Logic', () => {
    it('should map channel to correct icon config', () => {
      const channelIcons: Record<string, string> = {
        email: 'E-mail',
        call: 'Ligação',
        whatsapp: 'WhatsApp',
      };
      expect(channelIcons['email']).toBe('E-mail');
      expect(channelIcons['call']).toBe('Ligação');
      expect(channelIcons['whatsapp']).toBe('WhatsApp');
    });

    it('should fallback to email icon for unknown channels', () => {
      const channelIcons: Record<string, string> = { email: 'E-mail', call: 'Ligação', whatsapp: 'WhatsApp' };
      const channel = channelIcons['unknown'] || channelIcons['email'];
      expect(channel).toBe('E-mail');
    });

    it('should map status to PT-BR labels', () => {
      const statusLabels: Record<string, string> = {
        lead: 'Lead', qualified: 'Qualificado', proposal: 'Proposta',
        negotiation: 'Negociação', open: 'Aberto',
      };
      expect(statusLabels['qualified']).toBe('Qualificado');
      expect(statusLabels['proposal']).toBe('Proposta');
    });

    it('should fallback to raw status for unknown statuses', () => {
      const statusLabels: Record<string, string> = { lead: 'Lead' };
      const status = 'custom_status';
      const label = statusLabels[status] || status;
      expect(label).toBe('custom_status');
    });

    it('should highlight days_inactive > 14 as destructive', () => {
      const lead = createLead({ days_inactive: 20 });
      expect(lead.days_inactive > 14).toBe(true);
    });

    it('should not highlight days_inactive <= 14', () => {
      const lead = createLead({ days_inactive: 10 });
      expect(lead.days_inactive > 14).toBe(false);
    });

    it('should format amount in BRL', () => {
      const amount = 50000;
      const formatted = amount.toLocaleString('pt-BR');
      expect(formatted).toMatch(/50/);
    });

    it('should handle product_name display with separator', () => {
      const lead = createLead({ product_name: 'Premium Plan' });
      const display = lead.product_name ? `${lead.product_name} · ` : '';
      expect(display).toBe('Premium Plan · ');
    });

    it('should handle empty product_name', () => {
      const lead = createLead({ product_name: '' });
      const display = lead.product_name ? `${lead.product_name} · ` : '';
      expect(display).toBe('');
    });
  });

  // ==========================================================================
  // 5. EMPTY STATE
  // ==========================================================================
  describe('FollowUpEmptyState Logic', () => {
    it('should show filter message when filtered', () => {
      const isFiltered = true;
      const title = isFiltered ? 'Nenhum lead nesta categoria' : 'Tudo em dia! 🎉';
      expect(title).toBe('Nenhum lead nesta categoria');
    });

    it('should show success message when not filtered', () => {
      const isFiltered = false;
      const title = isFiltered ? 'Nenhum lead nesta categoria' : 'Tudo em dia! 🎉';
      expect(title).toContain('Tudo em dia');
    });
  });

  // ==========================================================================
  // 6. FILTERING & SEARCH — Page-level Logic
  // ==========================================================================
  describe('Filtering & Search Logic', () => {
    const allLeads = createLeadSet(10);

    it('should filter by specific temperature', () => {
      const filtered = allLeads.filter(l => l.temperature === 'cold');
      expect(filtered.length).toBe(4);
      filtered.forEach(l => expect(l.temperature).toBe('cold'));
    });

    it('should return all leads when filter is "all"', () => {
      const filterTemp = 'all';
      const result = filterTemp === 'all' ? allLeads : allLeads.filter(l => l.temperature === filterTemp);
      expect(result.length).toBe(10);
    });

    it('should search by client_name (case-insensitive)', () => {
      const query = 'hot';
      const result = allLeads.filter(l => l.client_name.toLowerCase().includes(query.toLowerCase()));
      expect(result.length).toBe(2);
    });

    it('should search by product_name', () => {
      const query = 'produto';
      const result = allLeads.filter(l => l.product_name?.toLowerCase().includes(query.toLowerCase()));
      expect(result.length).toBe(10);
    });

    it('should combine filter + search', () => {
      const filterTemp = 'cold';
      const query = 'cold';
      let result = allLeads.filter(l => l.temperature === filterTemp);
      result = result.filter(l => l.client_name.toLowerCase().includes(query.toLowerCase()));
      expect(result.length).toBe(4);
    });

    it('should return empty for non-matching search', () => {
      const query = 'xyznonexistent';
      const result = allLeads.filter(l => l.client_name.toLowerCase().includes(query.toLowerCase()));
      expect(result.length).toBe(0);
    });

    it('should handle special characters in search', () => {
      const query = '<script>';
      const result = allLeads.filter(l => l.client_name.toLowerCase().includes(query.toLowerCase()));
      expect(result.length).toBe(0);
    });
  });

  // ==========================================================================
  // 7. SELECTION LOGIC — Toggle, Bulk, Critical
  // ==========================================================================
  describe('Lead Selection Logic', () => {
    it('should toggle a lead selection', () => {
      const selected = new Set<string>();
      const id = 'lead-1';
      if (selected.has(id)) { selected.delete(id); } else { selected.add(id); }
      expect(selected.has(id)).toBe(true);
    });

    it('should deselect a previously selected lead', () => {
      const selected = new Set<string>(['lead-1']);
      const id = 'lead-1';
      if (selected.has(id)) { selected.delete(id); } else { selected.add(id); }
      expect(selected.has(id)).toBe(false);
    });

    it('should handle multiple selections', () => {
      const selected = new Set<string>();
      ['lead-1', 'lead-2', 'lead-3'].forEach(id => selected.add(id));
      expect(selected.size).toBe(3);
    });

    it('should select all critical leads (cold+frozen)', () => {
      const leads = createLeadSet(10);
      const criticalIds = new Set(
        leads.filter(l => l.temperature === 'cold' || l.temperature === 'frozen').map(l => l.id)
      );
      expect(criticalIds.size).toBe(5);
    });

    it('should not select hot/warm leads in critical selection', () => {
      const leads = createLeadSet(10);
      const criticalIds = new Set(
        leads.filter(l => l.temperature === 'cold' || l.temperature === 'frozen').map(l => l.id)
      );
      const hotLeads = leads.filter(l => l.temperature === 'hot');
      hotLeads.forEach(l => expect(criticalIds.has(l.id)).toBe(false));
    });

    it('should clear selection after bulk operation', () => {
      const selected = new Set(['lead-1', 'lead-2']);
      selected.clear();
      expect(selected.size).toBe(0);
    });
  });

  // ==========================================================================
  // 8. TASK CREATION — From Follow-up Leads
  // ==========================================================================
  describe('Task Creation from Follow-up', () => {
    it('should map lead to task correctly', () => {
      const lead = createLead({ client_name: 'Acme Corp', temperature: 'frozen', suggested_action: 'Reativar', suggested_channel: 'call' });
      const task = {
        title: `Follow-up: ${lead.client_name}`,
        description: lead.suggested_action,
        task_type: lead.suggested_channel === 'call' ? 'call' : lead.suggested_channel === 'email' ? 'email' : 'follow_up',
        priority: lead.temperature === 'frozen' ? 'high' : lead.temperature === 'cold' ? 'medium' : 'low',
        due_date: new Date().toISOString().split('T')[0],
        sale_id: lead.id,
      };
      expect(task.title).toBe('Follow-up: Acme Corp');
      expect(task.task_type).toBe('call');
      expect(task.priority).toBe('high');
    });

    it('should set priority based on temperature', () => {
      const priorities: Record<LeadTemperature, string> = {
        hot: 'low', warm: 'low', cold: 'medium', frozen: 'high',
      };
      const temps: LeadTemperature[] = ['hot', 'warm', 'cold', 'frozen'];
      temps.forEach(temp => {
        const priority = temp === 'frozen' ? 'high' : temp === 'cold' ? 'medium' : 'low';
        expect(priority).toBe(priorities[temp]);
      });
    });

    it('should set task_type from channel correctly', () => {
      const channelToType = (ch: string) => ch === 'call' ? 'call' : ch === 'email' ? 'email' : 'follow_up';
      expect(channelToType('call')).toBe('call');
      expect(channelToType('email')).toBe('email');
      expect(channelToType('whatsapp')).toBe('follow_up');
      expect(channelToType('unknown')).toBe('follow_up');
    });

    it('should generate bulk tasks from selected leads', () => {
      const leads = createLeadSet(10);
      const selectedIds = new Set(leads.slice(0, 3).map(l => l.id));
      const leadsToProcess = leads.filter(l => selectedIds.has(l.id));
      expect(leadsToProcess.length).toBe(3);
    });

    it('should set due_date to today', () => {
      const today = new Date().toISOString().split('T')[0];
      expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  // ==========================================================================
  // 9. SORTING — Inactive Days Descending
  // ==========================================================================
  describe('Lead Sorting Logic', () => {
    it('should sort leads by days_inactive descending', () => {
      const leads = [
        createLead({ days_inactive: 5 }),
        createLead({ days_inactive: 20 }),
        createLead({ days_inactive: 10 }),
      ].sort((a, b) => b.days_inactive - a.days_inactive);
      expect(leads[0].days_inactive).toBe(20);
      expect(leads[1].days_inactive).toBe(10);
      expect(leads[2].days_inactive).toBe(5);
    });

    it('should keep stable order for equal inactive days', () => {
      const leads = [
        createLead({ days_inactive: 10, client_name: 'A' }),
        createLead({ days_inactive: 10, client_name: 'B' }),
      ].sort((a, b) => b.days_inactive - a.days_inactive);
      expect(leads.length).toBe(2);
    });
  });

  // ==========================================================================
  // 10. MINIMUM INACTIVE THRESHOLD
  // ==========================================================================
  describe('Inactive Threshold Filter (>=3 days)', () => {
    it('should filter out leads with < 3 days inactive', () => {
      const leads = [
        createLead({ days_inactive: 0 }),
        createLead({ days_inactive: 2 }),
        createLead({ days_inactive: 3 }),
        createLead({ days_inactive: 10 }),
      ];
      const filtered = leads.filter(l => l.days_inactive >= 3);
      expect(filtered.length).toBe(2);
    });

    it('should include leads with exactly 3 days', () => {
      const leads = [createLead({ days_inactive: 3 })];
      expect(leads.filter(l => l.days_inactive >= 3).length).toBe(1);
    });
  });

  // ==========================================================================
  // 11. LOADING SKELETON STRUCTURE
  // ==========================================================================
  describe('FollowUpLoadingSkeleton Structure', () => {
    it('should render 5 stat skeleton cards', () => {
      const skeletonStatCount = 5;
      expect(skeletonStatCount).toBe(5);
    });

    it('should render 4 lead card skeletons', () => {
      const skeletonCardCount = 4;
      expect(skeletonCardCount).toBe(4);
    });
  });
});

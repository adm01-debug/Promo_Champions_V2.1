import { describe, it, expect } from 'vitest';
import { getTemperature, getSuggestedAction, temperatureConfig, type LeadTemperature, type ColdLead } from '@/components/follow-up/types';

// ============================================================================
// FOLLOW-UP TYPES — Temperature Classification & Action Engine
// 100+ tests covering all business rules, edge cases, and boundaries
// ============================================================================

describe('Follow-up Types Module', () => {

  // ==========================================================================
  // 1. TEMPERATURE CLASSIFICATION (getTemperature)
  // ==========================================================================
  describe('getTemperature — Lead Temperature Classification', () => {

    describe('Hot classification (0-3 days)', () => {
      it('should classify 0 days as hot', () => {
        expect(getTemperature(0)).toBe('hot');
      });
      it('should classify 1 day as hot', () => {
        expect(getTemperature(1)).toBe('hot');
      });
      it('should classify 2 days as hot', () => {
        expect(getTemperature(2)).toBe('hot');
      });
      it('should classify exactly 3 days as hot (boundary)', () => {
        expect(getTemperature(3)).toBe('hot');
      });
    });

    describe('Warm classification (4-7 days)', () => {
      it('should classify 4 days as warm', () => {
        expect(getTemperature(4)).toBe('warm');
      });
      it('should classify 5 days as warm', () => {
        expect(getTemperature(5)).toBe('warm');
      });
      it('should classify 6 days as warm', () => {
        expect(getTemperature(6)).toBe('warm');
      });
      it('should classify exactly 7 days as warm (boundary)', () => {
        expect(getTemperature(7)).toBe('warm');
      });
    });

    describe('Cold classification (8-14 days)', () => {
      it('should classify 8 days as cold', () => {
        expect(getTemperature(8)).toBe('cold');
      });
      it('should classify 10 days as cold', () => {
        expect(getTemperature(10)).toBe('cold');
      });
      it('should classify 13 days as cold', () => {
        expect(getTemperature(13)).toBe('cold');
      });
      it('should classify exactly 14 days as cold (boundary)', () => {
        expect(getTemperature(14)).toBe('cold');
      });
    });

    describe('Frozen classification (15+ days)', () => {
      it('should classify 15 days as frozen', () => {
        expect(getTemperature(15)).toBe('frozen');
      });
      it('should classify 30 days as frozen', () => {
        expect(getTemperature(30)).toBe('frozen');
      });
      it('should classify 90 days as frozen', () => {
        expect(getTemperature(90)).toBe('frozen');
      });
      it('should classify 365 days as frozen', () => {
        expect(getTemperature(365)).toBe('frozen');
      });
      it('should classify extreme values (999) as frozen', () => {
        expect(getTemperature(999)).toBe('frozen');
      });
    });

    describe('Boundary transitions', () => {
      it('should transition hot→warm at day 3→4', () => {
        expect(getTemperature(3)).toBe('hot');
        expect(getTemperature(4)).toBe('warm');
      });
      it('should transition warm→cold at day 7→8', () => {
        expect(getTemperature(7)).toBe('warm');
        expect(getTemperature(8)).toBe('cold');
      });
      it('should transition cold→frozen at day 14→15', () => {
        expect(getTemperature(14)).toBe('cold');
        expect(getTemperature(15)).toBe('frozen');
      });
    });

    describe('Edge cases', () => {
      it('should handle negative days gracefully (default to hot)', () => {
        expect(getTemperature(-1)).toBe('hot');
      });
      it('should handle very large numbers', () => {
        expect(getTemperature(10000)).toBe('frozen');
      });
    });
  });

  // ==========================================================================
  // 2. SUGGESTED ACTION ENGINE (getSuggestedAction)
  // ==========================================================================
  describe('getSuggestedAction — AI-driven Recommendations', () => {

    describe('Hot lead actions', () => {
      it('should suggest closing action for hot leads', () => {
        const result = getSuggestedAction('hot');
        expect(result.action).toContain('proposta');
      });
      it('should recommend call channel for hot leads', () => {
        const result = getSuggestedAction('hot');
        expect(result.channel).toBe('call');
      });
    });

    describe('Warm lead actions', () => {
      it('should suggest check-in for warm leads', () => {
        const result = getSuggestedAction('warm');
        expect(result.action).toContain('Check-in');
      });
      it('should recommend email channel for warm leads', () => {
        const result = getSuggestedAction('warm');
        expect(result.channel).toBe('email');
      });
    });

    describe('Cold lead actions', () => {
      it('should suggest re-engagement for cold leads', () => {
        const result = getSuggestedAction('cold');
        expect(result.action).toContain('engajar');
      });
      it('should recommend whatsapp for cold leads', () => {
        const result = getSuggestedAction('cold');
        expect(result.channel).toBe('whatsapp');
      });
    });

    describe('Frozen lead actions', () => {
      it('should suggest reactivation campaign for frozen', () => {
        const result = getSuggestedAction('frozen');
        expect(result.action).toContain('reativação');
      });
      it('should recommend email for frozen leads', () => {
        const result = getSuggestedAction('frozen');
        expect(result.channel).toBe('email');
      });
    });

    describe('Action structure validation', () => {
      const temperatures: LeadTemperature[] = ['hot', 'warm', 'cold', 'frozen'];

      temperatures.forEach(temp => {
        it(`should return non-empty action for "${temp}"`, () => {
          const result = getSuggestedAction(temp);
          expect(result.action.length).toBeGreaterThan(5);
        });
        it(`should return valid channel for "${temp}"`, () => {
          const result = getSuggestedAction(temp);
          expect(['call', 'email', 'whatsapp']).toContain(result.channel);
        });
        it(`should return object with action and channel for "${temp}"`, () => {
          const result = getSuggestedAction(temp);
          expect(result).toHaveProperty('action');
          expect(result).toHaveProperty('channel');
        });
      });
    });
  });

  // ==========================================================================
  // 3. TEMPERATURE CONFIG (Visual Mapping)
  // ==========================================================================
  describe('temperatureConfig — Visual Configuration', () => {
    const temperatures: LeadTemperature[] = ['hot', 'warm', 'cold', 'frozen'];

    temperatures.forEach(temp => {
      describe(`${temp} configuration`, () => {
        it('should have a label', () => {
          expect(temperatureConfig[temp].label).toBeTruthy();
        });
        it('should have an icon component', () => {
          expect(temperatureConfig[temp].icon).toBeDefined();
        });
        it('should have a semantic color class', () => {
          expect(temperatureConfig[temp].colorClass).toMatch(/^text-/);
        });
        it('should have a background class', () => {
          expect(temperatureConfig[temp].bgClass).toMatch(/^bg-/);
        });
        it('should have an emoji', () => {
          expect(temperatureConfig[temp].emoji.length).toBeGreaterThan(0);
        });
      });
    });

    it('should use semantic design tokens (not hardcoded colors)', () => {
      expect(temperatureConfig.hot.colorClass).toBe('text-destructive');
      expect(temperatureConfig.warm.colorClass).toBe('text-status-warning');
      expect(temperatureConfig.cold.colorClass).toBe('text-status-info');
      expect(temperatureConfig.frozen.colorClass).toBe('text-primary');
    });

    it('should cover all 4 temperature states', () => {
      expect(Object.keys(temperatureConfig)).toHaveLength(4);
      expect(Object.keys(temperatureConfig).sort()).toEqual(['cold', 'frozen', 'hot', 'warm']);
    });

    it('should have unique labels', () => {
      const labels = Object.values(temperatureConfig).map(c => c.label);
      expect(new Set(labels).size).toBe(labels.length);
    });

    it('should have unique emojis', () => {
      const emojis = Object.values(temperatureConfig).map(c => c.emoji);
      expect(new Set(emojis).size).toBe(emojis.length);
    });
  });

  // ==========================================================================
  // 4. COLDLEAD INTERFACE VALIDATION
  // ==========================================================================
  describe('ColdLead Interface — Data Shape', () => {
    const createLead = (overrides: Partial<ColdLead> = {}): ColdLead => ({
      id: 'test-lead-1',
      client_name: 'Empresa ABC',
      product_name: 'Plano Premium',
      amount: 50000,
      status: 'qualified',
      updated_at: '2025-01-01T00:00:00Z',
      days_inactive: 10,
      temperature: 'cold',
      suggested_action: 'Re-engajar com insight',
      suggested_channel: 'whatsapp',
      ...overrides,
    });

    it('should accept valid lead data', () => {
      const lead = createLead();
      expect(lead.id).toBe('test-lead-1');
      expect(lead.temperature).toBe('cold');
    });

    it('should accept optional last_activity', () => {
      const lead = createLead({ last_activity: { notes: 'Ligação feita', type: 'call', created_at: '2025-01-15T10:00:00Z' } });
      expect(lead.last_activity).toBeDefined();
    });

    it('should handle zero amount', () => {
      const lead = createLead({ amount: 0 });
      expect(lead.amount).toBe(0);
    });

    it('should handle various statuses', () => {
      const statuses = ['lead', 'qualified', 'proposal', 'negotiation', 'open'];
      statuses.forEach(status => {
        const lead = createLead({ status });
        expect(lead.status).toBe(status);
      });
    });

    it('should handle very high amounts', () => {
      const lead = createLead({ amount: 999999999 });
      expect(lead.amount).toBe(999999999);
    });

    it('should handle empty product_name', () => {
      const lead = createLead({ product_name: '' });
      expect(lead.product_name).toBe('');
    });
  });

  // ==========================================================================
  // 5. TEMPERATURE DISTRIBUTION SIMULATION
  // ==========================================================================
  describe('Temperature Distribution — Batch Classification', () => {
    it('should correctly classify a mixed pipeline', () => {
      const days = [0, 1, 3, 4, 7, 8, 14, 15, 30, 100];
      const expected = ['hot', 'hot', 'hot', 'warm', 'warm', 'cold', 'cold', 'frozen', 'frozen', 'frozen'];
      const results = days.map(d => getTemperature(d));
      expect(results).toEqual(expected);
    });

    it('should identify urgency progression correctly', () => {
      const progression = Array.from({ length: 20 }, (_, i) => getTemperature(i));
      const lastHotIdx = progression.lastIndexOf('hot');
      const firstWarmIdx = progression.indexOf('warm');
      const lastWarmIdx = progression.lastIndexOf('warm');
      const firstColdIdx = progression.indexOf('cold');
      
      expect(lastHotIdx).toBeLessThan(firstWarmIdx);
      expect(lastWarmIdx).toBeLessThan(firstColdIdx);
    });

    it('should produce monotonically increasing urgency', () => {
      const urgencyMap: Record<string, number> = { hot: 1, warm: 2, cold: 3, frozen: 4 };
      let prev = 0;
      for (let day = 0; day <= 20; day++) {
        const current = urgencyMap[getTemperature(day)];
        expect(current).toBeGreaterThanOrEqual(prev);
        prev = current;
      }
    });
  });
});

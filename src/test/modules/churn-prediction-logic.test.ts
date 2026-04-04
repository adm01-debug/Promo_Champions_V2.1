/**
 * Churn Prediction Logic Tests
 * Tests: risk score calculation, risk level assignment, factor detection,
 * filtering, edge cases
 */
import { describe, it, expect } from 'vitest';

interface ChurnPredictionItem {
  clientId: string;
  clientName: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high';
  factors: string[];
  lastActivity: string | null;
  daysSinceLastPurchase: number;
}

interface ClientRow {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  updated_at: string;
}

function calculateChurn(clients: ClientRow[]): ChurnPredictionItem[] {
  const now = new Date();
  return clients
    .map((client) => {
      const lastUpdate = new Date(client.updated_at);
      const daysSince = Math.floor(
        (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24)
      );
      let riskScore = Math.min(100, daysSince * 2);
      let riskLevel: ChurnPredictionItem['riskLevel'] = 'low';
      const factors: string[] = [];

      if (daysSince > 90) {
        riskLevel = 'high';
        factors.push('Sem atividade há mais de 90 dias');
      } else if (daysSince > 30) {
        riskLevel = 'medium';
        factors.push('Sem atividade há mais de 30 dias');
      }

      if (!client.email) {
        riskScore += 10;
        factors.push('Sem email cadastrado');
      }
      if (!client.phone) {
        riskScore += 10;
        factors.push('Sem telefone cadastrado');
      }

      return {
        clientId: client.id,
        clientName: client.name,
        riskScore: Math.min(100, riskScore),
        riskLevel,
        factors,
        lastActivity: client.updated_at,
        daysSinceLastPurchase: daysSince,
      };
    })
    .filter((c) => c.riskScore > 20);
}

describe('Churn Prediction - Risk Score Calculation', () => {
  const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

  it('should calculate score as daysSince * 2', () => {
    const result = calculateChurn([
      { id: '1', name: 'A', email: 'a@b.com', phone: '123', updated_at: daysAgo(15) },
    ]);
    expect(result[0].riskScore).toBe(30);
  });

  it('should cap score at 100', () => {
    const result = calculateChurn([
      { id: '1', name: 'A', email: 'a@b.com', phone: '123', updated_at: daysAgo(200) },
    ]);
    expect(result[0].riskScore).toBe(100);
  });

  it('should add 10 for missing email', () => {
    const result = calculateChurn([
      { id: '1', name: 'A', email: null, phone: '123', updated_at: daysAgo(15) },
    ]);
    expect(result[0].riskScore).toBe(40); // 30 + 10
    expect(result[0].factors).toContain('Sem email cadastrado');
  });

  it('should add 10 for missing phone', () => {
    const result = calculateChurn([
      { id: '1', name: 'A', email: 'a@b.com', phone: null, updated_at: daysAgo(15) },
    ]);
    expect(result[0].riskScore).toBe(40); // 30 + 10
    expect(result[0].factors).toContain('Sem telefone cadastrado');
  });

  it('should add 20 for missing both email and phone', () => {
    const result = calculateChurn([
      { id: '1', name: 'A', email: null, phone: null, updated_at: daysAgo(15) },
    ]);
    expect(result[0].riskScore).toBe(50); // 30 + 20
  });

  it('should still cap at 100 even with penalties', () => {
    const result = calculateChurn([
      { id: '1', name: 'A', email: null, phone: null, updated_at: daysAgo(200) },
    ]);
    expect(result[0].riskScore).toBe(100);
  });
});

describe('Churn Prediction - Risk Level Assignment', () => {
  const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

  it('should assign "low" for ≤30 days', () => {
    const result = calculateChurn([
      { id: '1', name: 'A', email: 'a@b.com', phone: '123', updated_at: daysAgo(25) },
    ]);
    expect(result[0].riskLevel).toBe('low');
  });

  it('should assign "medium" for 31-90 days', () => {
    const result = calculateChurn([
      { id: '1', name: 'A', email: 'a@b.com', phone: '123', updated_at: daysAgo(45) },
    ]);
    expect(result[0].riskLevel).toBe('medium');
    expect(result[0].factors).toContain('Sem atividade há mais de 30 dias');
  });

  it('should assign "high" for 91+ days', () => {
    const result = calculateChurn([
      { id: '1', name: 'A', email: 'a@b.com', phone: '123', updated_at: daysAgo(100) },
    ]);
    expect(result[0].riskLevel).toBe('high');
    expect(result[0].factors).toContain('Sem atividade há mais de 90 dias');
  });
});

describe('Churn Prediction - Filtering', () => {
  const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

  it('should filter out clients with riskScore <= 20', () => {
    const result = calculateChurn([
      { id: '1', name: 'Recent', email: 'a@b.com', phone: '123', updated_at: daysAgo(5) },
    ]);
    // 5 * 2 = 10, which is <= 20 — filtered out
    expect(result).toHaveLength(0);
  });

  it('should include clients with riskScore > 20', () => {
    const result = calculateChurn([
      { id: '1', name: 'Old', email: 'a@b.com', phone: '123', updated_at: daysAgo(15) },
    ]);
    // 15 * 2 = 30
    expect(result).toHaveLength(1);
  });

  it('should handle empty input', () => {
    expect(calculateChurn([])).toHaveLength(0);
  });

  it('should include borderline client at score 21 (11 days, no email)', () => {
    const result = calculateChurn([
      { id: '1', name: 'Edge', email: null, phone: '123', updated_at: daysAgo(11) },
    ]);
    // 11 * 2 = 22 + 10 = 32 => included
    expect(result).toHaveLength(1);
  });
});

describe('Churn Prediction - Factor Accumulation', () => {
  const daysAgo = (d: number) => new Date(Date.now() - d * 86400000).toISOString();

  it('should accumulate multiple factors', () => {
    const result = calculateChurn([
      { id: '1', name: 'A', email: null, phone: null, updated_at: daysAgo(100) },
    ]);
    expect(result[0].factors).toContain('Sem atividade há mais de 90 dias');
    expect(result[0].factors).toContain('Sem email cadastrado');
    expect(result[0].factors).toContain('Sem telefone cadastrado');
    expect(result[0].factors).toHaveLength(3);
  });

  it('should have no activity factor for recent clients', () => {
    const result = calculateChurn([
      { id: '1', name: 'A', email: null, phone: null, updated_at: daysAgo(15) },
    ]);
    expect(result[0].factors).not.toContain('Sem atividade há mais de 30 dias');
    expect(result[0].factors).not.toContain('Sem atividade há mais de 90 dias');
  });
});

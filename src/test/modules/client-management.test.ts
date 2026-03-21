/**
 * Client Management Tests
 * Tests: client CRUD validation, search, segmentation, health score
 */
import { describe, it, expect } from 'vitest';

describe('Client Validation', () => {
  const validateClient = (client: { name: string; email?: string; phone?: string }): string[] => {
    const errors: string[] = [];
    if (!client.name?.trim()) errors.push('Nome é obrigatório');
    if (client.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) errors.push('Email inválido');
    if (client.phone) {
      const cleaned = client.phone.replace(/\D/g, '');
      if (cleaned.length < 10 || cleaned.length > 11) errors.push('Telefone inválido');
    }
    return errors;
  };

  it('should pass valid client', () => {
    expect(validateClient({ name: 'João Silva', email: 'joao@test.com', phone: '11999999999' })).toHaveLength(0);
  });

  it('should require name', () => {
    expect(validateClient({ name: '' })).toContain('Nome é obrigatório');
  });

  it('should validate email format', () => {
    expect(validateClient({ name: 'A', email: 'invalid' })).toContain('Email inválido');
  });

  it('should validate phone length', () => {
    expect(validateClient({ name: 'A', phone: '123' })).toContain('Telefone inválido');
  });

  it('should accept client without optional fields', () => {
    expect(validateClient({ name: 'Maria' })).toHaveLength(0);
  });
});

describe('Client Search', () => {
  const searchClients = (clients: { name: string; company?: string; email?: string }[], query: string) => {
    if (!query.trim()) return clients;
    const q = query.toLowerCase();
    return clients.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.company || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q)
    );
  };

  const clients = [
    { name: 'João Silva', company: 'ABC Corp', email: 'joao@abc.com' },
    { name: 'Maria Santos', company: 'XYZ Ltda', email: 'maria@xyz.com' },
    { name: 'Pedro Costa', company: 'ABC Corp', email: 'pedro@abc.com' },
  ];

  it('should search by name', () => {
    expect(searchClients(clients, 'maria')).toHaveLength(1);
  });

  it('should search by company', () => {
    expect(searchClients(clients, 'ABC')).toHaveLength(2);
  });

  it('should search by email', () => {
    expect(searchClients(clients, 'xyz.com')).toHaveLength(1);
  });

  it('should return all for empty query', () => {
    expect(searchClients(clients, '')).toHaveLength(3);
  });

  it('should return empty for no match', () => {
    expect(searchClients(clients, 'zzzzz')).toHaveLength(0);
  });
});

describe('Client Segmentation', () => {
  type Client = { id: string; total_value: number; last_purchase_date?: string };

  const segmentClient = (client: Client): 'vip' | 'active' | 'inactive' | 'new' => {
    if (client.total_value >= 100000) return 'vip';
    if (!client.last_purchase_date) return 'new';
    const daysSincePurchase = Math.floor(
      (Date.now() - new Date(client.last_purchase_date).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (daysSincePurchase > 90) return 'inactive';
    return 'active';
  };

  it('should classify VIP by value', () => {
    expect(segmentClient({ id: '1', total_value: 150000, last_purchase_date: '2024-01-01' })).toBe('vip');
  });

  it('should classify new clients', () => {
    expect(segmentClient({ id: '2', total_value: 0 })).toBe('new');
  });

  it('should classify inactive by purchase date', () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 100);
    expect(segmentClient({ id: '3', total_value: 5000, last_purchase_date: oldDate.toISOString() })).toBe('inactive');
  });

  it('should classify active', () => {
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 30);
    expect(segmentClient({ id: '4', total_value: 5000, last_purchase_date: recentDate.toISOString() })).toBe('active');
  });
});

describe('Client Health Score', () => {
  const calculateHealthScore = (metrics: {
    purchaseFrequency: number; // 0-10
    avgTicket: number; // 0-10
    engagementLevel: number; // 0-10
    daysSinceLastContact: number;
  }): number => {
    const recencyScore = Math.max(0, 10 - Math.floor(metrics.daysSinceLastContact / 7));
    const raw = (metrics.purchaseFrequency * 30 + metrics.avgTicket * 25 + metrics.engagementLevel * 25 + recencyScore * 20) / 10;
    return Math.round(Math.min(100, Math.max(0, raw)));
  };

  it('should return high score for great client', () => {
    const score = calculateHealthScore({ purchaseFrequency: 9, avgTicket: 8, engagementLevel: 9, daysSinceLastContact: 3 });
    expect(score).toBeGreaterThan(80);
  });

  it('should return low score for disengaged client', () => {
    const score = calculateHealthScore({ purchaseFrequency: 2, avgTicket: 3, engagementLevel: 1, daysSinceLastContact: 60 });
    expect(score).toBeLessThan(30);
  });

  it('should clamp between 0 and 100', () => {
    const score = calculateHealthScore({ purchaseFrequency: 10, avgTicket: 10, engagementLevel: 10, daysSinceLastContact: 0 });
    expect(score).toBeLessThanOrEqual(100);
  });
});

describe('Client Portfolio Assignment', () => {
  const assignRoundRobin = (clients: string[], salespeople: string[]): Map<string, string[]> => {
    const assignments = new Map<string, string[]>();
    salespeople.forEach(sp => assignments.set(sp, []));
    clients.forEach((client, idx) => {
      const sp = salespeople[idx % salespeople.length];
      assignments.get(sp)!.push(client);
    });
    return assignments;
  };

  it('should distribute evenly', () => {
    const result = assignRoundRobin(['C1', 'C2', 'C3', 'C4'], ['SP1', 'SP2']);
    expect(result.get('SP1')).toHaveLength(2);
    expect(result.get('SP2')).toHaveLength(2);
  });

  it('should handle uneven distribution', () => {
    const result = assignRoundRobin(['C1', 'C2', 'C3'], ['SP1', 'SP2']);
    expect(result.get('SP1')).toHaveLength(2);
    expect(result.get('SP2')).toHaveLength(1);
  });

  it('should handle empty clients', () => {
    const result = assignRoundRobin([], ['SP1']);
    expect(result.get('SP1')).toHaveLength(0);
  });
});

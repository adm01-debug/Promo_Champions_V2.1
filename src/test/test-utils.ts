/**
 * Test utilities and shared mocks for Sales Arena test suite
 */
import { vi } from 'vitest';
import React from 'react';

// ==========================================
// SUPABASE MOCK
// ==========================================

const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockInsert = vi.fn();
const mockUpdate = vi.fn();
const mockDelete = vi.fn();
const mockEq = vi.fn();
const mockNeq = vi.fn();
const mockGte = vi.fn();
const mockLte = vi.fn();
const mockIn = vi.fn();
const mockOrder = vi.fn();
const mockLimit = vi.fn();
const mockSingle = vi.fn();
const mockMaybeSingle = vi.fn();

function createChain(resolveValue: any = { data: [], error: null }) {
  const chain: any = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    neq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    range: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue(resolveValue),
    maybeSingle: vi.fn().mockResolvedValue(resolveValue),
    then: vi.fn((resolve: any) => resolve(resolveValue)),
  };
  // Make it thenable so await works
  chain[Symbol.toStringTag] = 'Promise';
  Object.defineProperty(chain, 'then', {
    value: (resolve: any) => Promise.resolve(resolveValue).then(resolve),
  });
  Object.defineProperty(chain, 'catch', {
    value: (reject: any) => Promise.resolve(resolveValue).catch(reject),
  });
  return chain;
}

export function createMockSupabase(overrides: Record<string, any> = {}) {
  return {
    from: vi.fn((table: string) => {
      if (overrides[table]) {
        return createChain(overrides[table]);
      }
      return createChain();
    }),
    auth: {
      getSession: vi.fn().mockResolvedValue({ data: { session: null }, error: null }),
      getUser: vi.fn().mockResolvedValue({ data: { user: null }, error: null }),
      signInWithPassword: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signUp: vi.fn().mockResolvedValue({ data: {}, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: {}, error: null }),
    },
    channel: vi.fn().mockReturnValue({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    }),
    removeChannel: vi.fn(),
  };
}

// ==========================================
// MOCK DATA FACTORIES
// ==========================================

export function createMockSalesperson(overrides: any = {}) {
  return {
    id: 'sp-1',
    name: 'João Silva',
    email: 'joao@test.com',
    avatar_url: null,
    role: 'closer',
    commission_rate: 10,
    is_active: true,
    ...overrides,
  };
}

export function createMockSale(overrides: any = {}) {
  return {
    id: 'sale-1',
    client_name: 'Cliente A',
    product_name: 'Produto X',
    amount: 5000,
    status: 'completed',
    category: 'tech',
    salesperson_id: 'sp-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockActivity(overrides: any = {}) {
  return {
    id: 'act-1',
    activity_type: 'call' as const,
    outcome: 'connected' as const,
    contact_name: 'Maria',
    notes: 'Ligação produtiva',
    duration_minutes: 15,
    sale_id: 'sale-1',
    salesperson_id: 'sp-1',
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockClient(overrides: any = {}) {
  return {
    id: 'client-1',
    name: 'Empresa ABC',
    email: 'contato@abc.com',
    phone: '11999999999',
    company: 'ABC Ltda',
    total_value: 50000,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockTask(overrides: any = {}) {
  return {
    id: 'task-1',
    title: 'Follow up com cliente',
    description: 'Ligar para o cliente sobre proposta',
    assigned_to: 'sp-1',
    created_by: 'sp-1',
    due_date: new Date().toISOString().split('T')[0],
    completed: false,
    priority: 'medium' as const,
    task_type: 'call' as const,
    created_at: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockQuote(overrides: any = {}) {
  return {
    id: 'quote-1',
    quote_number: 'ORC-001',
    client_name: 'Cliente A',
    title: 'Proposta Comercial',
    status: 'draft',
    subtotal: 10000,
    discount_amount: 500,
    total: 9500,
    valid_until: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    created_by: 'sp-1',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

export function createMockKPIs(overrides: any = {}) {
  return {
    current: {
      totalRevenue: 150000,
      totalSales: 45,
      newClients: 12,
      conversionRate: 32.5,
      avgTicket: 3333,
      ...overrides.current,
    },
    previous: {
      totalRevenue: 120000,
      totalSales: 38,
      newClients: 10,
      conversionRate: 28.0,
      avgTicket: 3157,
      ...overrides.previous,
    },
    changes: {
      revenue: 25,
      sales: 18.4,
      clients: 20,
      conversion: 16.1,
      avgTicket: 5.6,
      ...overrides.changes,
    },
  };
}

export function createMockRanking(count = 5) {
  return Array.from({ length: count }, (_, i) => ({
    id: `sp-${i + 1}`,
    name: `Vendedor ${i + 1}`,
    avatar_url: null,
    role: i % 2 === 0 ? 'closer' : 'sdr',
    totalSales: (count - i) * 10000,
    dealsCount: (count - i) * 5,
    rank: i + 1,
    title: i < 3 ? ['Lenda', 'Elite', 'Veterano'][i] : null,
    emoji: i < 3 ? ['👑', '⚔️', '🏆'][i] : null,
    color: null,
    gapToFirst: i * 10000,
    gapToNext: i > 0 ? 10000 : 0,
    leadsCount: (count - i) * 3,
  }));
}

// ==========================================
// RENDER HELPERS
// ==========================================

export function createWrapper() {
  const { QueryClient, QueryClientProvider } = require('@tanstack/react-query');
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
}

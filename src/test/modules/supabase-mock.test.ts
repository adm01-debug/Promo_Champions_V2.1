/**
 * Supabase Mock Infrastructure Tests
 * Tests: mock chain behavior, auth mocks, function invocations
 */
import { describe, it, expect, vi } from 'vitest';
import { createMockSupabase } from '@/test/test-utils';

describe('Supabase Mock - Query Chain', () => {
  it('should create a valid mock', () => {
    const mock = createMockSupabase();
    expect(mock.from).toBeDefined();
    expect(mock.auth).toBeDefined();
    expect(mock.functions).toBeDefined();
  });

  it('should return chainable methods from .from()', () => {
    const mock = createMockSupabase();
    const chain = mock.from('sales');
    expect(chain.select).toBeDefined();
    expect(chain.insert).toBeDefined();
    expect(chain.update).toBeDefined();
    expect(chain.delete).toBeDefined();
    expect(chain.eq).toBeDefined();
    expect(chain.order).toBeDefined();
    expect(chain.limit).toBeDefined();
  });

  it('should support method chaining', () => {
    const mock = createMockSupabase();
    const chain = mock.from('sales');
    const result = chain.select().eq('id', '1').order('created_at').limit(10);
    expect(result).toBeDefined();
  });

  it('should resolve awaited queries', async () => {
    const mock = createMockSupabase();
    const result = await mock.from('sales').select();
    expect(result).toEqual({ data: [], error: null });
  });

  it('should support custom overrides per table', async () => {
    const mock = createMockSupabase({
      salespeople: { data: [{ id: '1', name: 'Test' }], error: null },
    });
    const result = await mock.from('salespeople').select();
    expect(result.data).toHaveLength(1);
    expect(result.data[0].name).toBe('Test');
  });

  it('should return empty for non-overridden tables', async () => {
    const mock = createMockSupabase({
      salespeople: { data: [{ id: '1' }], error: null },
    });
    const result = await mock.from('clients').select();
    expect(result.data).toEqual([]);
  });
});

describe('Supabase Mock - Auth', () => {
  it('should have auth methods', () => {
    const mock = createMockSupabase();
    expect(mock.auth.getSession).toBeDefined();
    expect(mock.auth.getUser).toBeDefined();
    expect(mock.auth.signInWithPassword).toBeDefined();
    expect(mock.auth.signUp).toBeDefined();
    expect(mock.auth.signOut).toBeDefined();
    expect(mock.auth.onAuthStateChange).toBeDefined();
  });

  it('should resolve getSession with null', async () => {
    const mock = createMockSupabase();
    const result = await mock.auth.getSession();
    expect(result.data.session).toBeNull();
  });

  it('should resolve signOut without error', async () => {
    const mock = createMockSupabase();
    const result = await mock.auth.signOut();
    expect(result.error).toBeNull();
  });

  it('should provide unsubscribe on auth state change', () => {
    const mock = createMockSupabase();
    const { data } = mock.auth.onAuthStateChange(() => {});
    expect(data.subscription.unsubscribe).toBeDefined();
  });
});

describe('Supabase Mock - Functions', () => {
  it('should support edge function invocation', async () => {
    const mock = createMockSupabase();
    const result = await mock.functions.invoke('test-function', { body: {} });
    expect(result.error).toBeNull();
  });
});

describe('Supabase Mock - Realtime', () => {
  it('should support channel creation', () => {
    const mock = createMockSupabase();
    const channel = mock.channel('test');
    expect(channel.on).toBeDefined();
    expect(channel.subscribe).toBeDefined();
  });

  it('should support method chaining on channel', () => {
    const mock = createMockSupabase();
    const result = mock.channel('test').on('postgres_changes', {}, () => {}).subscribe();
    expect(result).toBeDefined();
  });

  it('should support removeChannel', () => {
    const mock = createMockSupabase();
    expect(() => mock.removeChannel(mock.channel('test'))).not.toThrow();
  });
});
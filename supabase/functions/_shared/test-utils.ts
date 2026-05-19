import { createClient } from "npm:@supabase/supabase-js@2.49.4";

/**
 * Mock utility for Supabase client in tests.
 * Allows intercepting and providing mock data for database calls.
 */
export function createMockSupabaseClient(mockData: Record<string, any[]> = {}) {
  const queryBuilder = (tableName: string) => {
    const builder = {
      select: () => builder,
      from: (name: string) => queryBuilder(name),
      in: () => builder,
      eq: () => builder,
      gte: () => builder,
      order: () => builder,
      upsert: () => Promise.resolve({ data: null, error: null }),
      then: (resolve: any) => {
        resolve({ data: mockData[tableName] || [], error: null });
        return Promise.resolve();
      },
    };
    return builder;
  };

  return {
    from: (name: string) => queryBuilder(name),
    auth: {
      getUser: () => Promise.resolve({ data: { user: { id: 'test-user' } }, error: null }),
    }
  } as any;
}

/**
 * Mock utility for Edge Function requests.
 */
export function createMockRequest(body: any, method = 'POST') {
  return new Request('https://edge-function.test', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

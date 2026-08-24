/**
 * Mock utility for Supabase client in tests.
 * Allows intercepting and providing mock data for database calls.
 */
export function createMockSupabaseClient(
  mockData: Record<string, Record<string, unknown>[]> = {}
) {
  const queryBuilder = (tableName: string) => {
    const builder = {
      select: () => builder,
      from: (name: string) => queryBuilder(name),
      in: () => builder,
      eq: () => builder,
      gte: () => builder,
      order: () => builder,
      upsert: () => Promise.resolve({ data: null, error: null }),
      then: (resolve: (result: { data: unknown; error: null }) => void) => {
        resolve({ data: mockData[tableName] || [], error: null });
        return Promise.resolve();
      },
    };
    return builder;
  };

  return {
    from: (name: string) => queryBuilder(name),
    auth: {
      getUser: () =>
        Promise.resolve({ data: { user: { id: 'test-user' } }, error: null }),
    },
  };
}

/**
 * Mock utility for Edge Function requests.
 */
export function createMockRequest(body: unknown, method = 'POST') {
  return new Request('https://edge-function.test', {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

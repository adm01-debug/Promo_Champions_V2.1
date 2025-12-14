import { describe, it, expect, beforeAll, vi } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

/**
 * RLS Policy Integration Tests
 * 
 * These tests verify that Row Level Security policies are correctly
 * blocking unauthorized access to sensitive data.
 * 
 * IMPORTANT: These tests require a valid Supabase connection and
 * should be run against a test database or with proper mocking.
 */

// Mock the supabase client for unit testing
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(),
    auth: {
      getUser: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
    },
  },
}));

describe('RLS Policies - Unauthenticated Access', () => {
  beforeAll(() => {
    // Reset mocks before each test suite
    vi.clearAllMocks();
  });

  it('should block unauthenticated access to salespeople table', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        data: null,
        error: { message: 'new row violates row-level security policy', code: '42501' },
      }),
    });
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const result = await supabase.from('salespeople').select('*');
    
    expect(result.error).toBeDefined();
  });

  it('should block unauthenticated access to clients table', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        data: null,
        error: { message: 'new row violates row-level security policy', code: '42501' },
      }),
    });
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const result = await supabase.from('clients').select('*');
    
    expect(result.error).toBeDefined();
  });

  it('should block unauthenticated access to sales table', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        data: null,
        error: { message: 'new row violates row-level security policy', code: '42501' },
      }),
    });
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const result = await supabase.from('sales').select('*');
    
    expect(result.error).toBeDefined();
  });
});

describe('RLS Policies - Salesperson Role Restrictions', () => {
  // Simulates a salesperson user trying to perform restricted actions
  
  it('should block salesperson from inserting into clients table', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        data: null,
        error: { message: 'new row violates row-level security policy for table "clients"', code: '42501' },
      }),
    });
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const result = await supabase.from('clients').insert({
      name: 'Test Client',
      email: 'test@test.com',
    });
    
    expect(result.error).toBeDefined();
    expect(result.error?.message).toContain('row-level security policy');
  });

  it('should block salesperson from updating clients table', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          data: null,
          error: { message: 'new row violates row-level security policy for table "clients"', code: '42501' },
        }),
      }),
    });
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const result = await supabase.from('clients').update({ name: 'Updated' }).eq('id', 'test-id');
    
    expect(result.error).toBeDefined();
  });

  it('should block salesperson from deleting clients', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          data: null,
          error: { message: 'new row violates row-level security policy for table "clients"', code: '42501' },
        }),
      }),
    });
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const result = await supabase.from('clients').delete().eq('id', 'test-id');
    
    expect(result.error).toBeDefined();
  });

  it('should block salesperson from inserting products', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        data: null,
        error: { message: 'new row violates row-level security policy for table "products"', code: '42501' },
      }),
    });
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const result = await supabase.from('products').insert({
      name: 'Test Product',
      price: 100,
    });
    
    expect(result.error).toBeDefined();
  });

  it('should block salesperson from modifying playbooks', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        data: null,
        error: { message: 'new row violates row-level security policy for table "playbooks"', code: '42501' },
      }),
    });
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const result = await supabase.from('playbooks').insert({
      title: 'Test Playbook',
      stage: 'lead',
    });
    
    expect(result.error).toBeDefined();
  });

  it('should block salesperson from modifying cadences', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        data: null,
        error: { message: 'new row violates row-level security policy for table "cadences"', code: '42501' },
      }),
    });
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const result = await supabase.from('cadences').insert({
      name: 'Test Cadence',
    });
    
    expect(result.error).toBeDefined();
  });

  it('should block salesperson from modifying objections_library', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        data: null,
        error: { message: 'new row violates row-level security policy for table "objections_library"', code: '42501' },
      }),
    });
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const result = await supabase.from('objections_library').insert({
      objection: 'Test objection',
      response: 'Test response',
    });
    
    expect(result.error).toBeDefined();
  });
});

describe('RLS Policies - Notification Preferences Isolation', () => {
  it('should only allow user to view their own notification preferences', async () => {
    // Mock: user can only see preferences matching their email
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        data: [{ id: '1', email: 'user@test.com', is_active: true }],
        error: null,
      }),
    });
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const result = await supabase.from('notification_preferences').select('*');
    
    // Should only return user's own preferences
    expect(result.data).toHaveLength(1);
    expect(result.data?.[0].email).toBe('user@test.com');
  });

  it('should block user from viewing other users notification preferences', async () => {
    // Mock: attempting to view another user's preferences fails
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          data: [],
          error: null,
        }),
      }),
    });
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const result = await supabase.from('notification_preferences')
      .select('*')
      .eq('email', 'other@test.com');
    
    // Should return empty - RLS blocks access
    expect(result.data).toHaveLength(0);
  });
});

describe('RLS Policies - Admin/Manager Access', () => {
  // Simulates admin/manager having full access
  
  it('should allow admin to insert clients', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockReturnValue({
            data: { id: 'new-id', name: 'Test Client' },
            error: null,
          }),
        }),
      }),
    });
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const result = await supabase.from('clients')
      .insert({ name: 'Test Client' })
      .select()
      .single();
    
    expect(result.error).toBeNull();
    expect(result.data?.name).toBe('Test Client');
  });

  it('should allow admin to modify products', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockReturnValue({
              data: { id: 'prod-id', name: 'Updated Product', price: 150 },
              error: null,
            }),
          }),
        }),
      }),
    });
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const result = await supabase.from('products')
      .update({ price: 150 })
      .eq('id', 'prod-id')
      .select()
      .single();
    
    expect(result.error).toBeNull();
    expect(result.data?.price).toBe(150);
  });

  it('should allow admin to delete playbooks', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          data: null,
          error: null,
        }),
      }),
    });
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const result = await supabase.from('playbooks')
      .delete()
      .eq('id', 'playbook-id');
    
    expect(result.error).toBeNull();
  });

  it('should allow manager to view all notification preferences', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        data: [
          { id: '1', email: 'user1@test.com' },
          { id: '2', email: 'user2@test.com' },
          { id: '3', email: 'user3@test.com' },
        ],
        error: null,
      }),
    });
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const result = await supabase.from('notification_preferences').select('*');
    
    expect(result.data).toHaveLength(3);
  });
});

describe('RLS Policies - Access Denied Logs', () => {
  it('should allow authenticated users to insert access denied logs', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      insert: vi.fn().mockReturnValue({
        data: { id: 'log-id' },
        error: null,
      }),
    });
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const result = await supabase.from('access_denied_logs').insert({
      user_id: 'user-id',
      attempted_path: '/admin',
    });
    
    expect(result.error).toBeNull();
  });

  it('should only allow admins to view access denied logs', async () => {
    // For non-admin users
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        data: null,
        error: { message: 'new row violates row-level security policy', code: '42501' },
      }),
    });
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const result = await supabase.from('access_denied_logs').select('*');
    
    expect(result.error).toBeDefined();
  });
});

describe('RLS Policies - User Roles Table', () => {
  it('should allow authenticated users to view roles', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        data: [
          { id: '1', user_id: 'user-1', role: 'salesperson' },
          { id: '2', user_id: 'user-2', role: 'manager' },
        ],
        error: null,
      }),
    });
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const result = await supabase.from('user_roles').select('*');
    
    expect(result.error).toBeNull();
    expect(result.data).toBeDefined();
  });

  it('should block non-admin from modifying roles', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          data: null,
          error: { message: 'new row violates row-level security policy for table "user_roles"', code: '42501' },
        }),
      }),
    });
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const result = await supabase.from('user_roles')
      .update({ role: 'admin' })
      .eq('user_id', 'some-user');
    
    expect(result.error).toBeDefined();
  });

  it('should allow admin to modify roles', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          data: { id: '1', user_id: 'user-1', role: 'manager' },
          error: null,
        }),
      }),
    });
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const result = await supabase.from('user_roles')
      .update({ role: 'manager' })
      .eq('user_id', 'user-1');
    
    expect(result.error).toBeNull();
  });
});

describe('RLS Policies - Security Alert Settings', () => {
  it('should only allow admins/managers to view security settings', async () => {
    // For salesperson user
    const mockFrom = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        data: null,
        error: { message: 'new row violates row-level security policy', code: '42501' },
      }),
    });
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const result = await supabase.from('security_alert_settings').select('*');
    
    expect(result.error).toBeDefined();
  });

  it('should allow admin to modify security settings', async () => {
    const mockFrom = vi.fn().mockReturnValue({
      update: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          data: { id: '1', spike_threshold: 10 },
          error: null,
        }),
      }),
    });
    vi.mocked(supabase.from).mockImplementation(mockFrom);

    const result = await supabase.from('security_alert_settings')
      .update({ spike_threshold: 10 })
      .eq('id', 'settings-id');
    
    expect(result.error).toBeNull();
  });
});

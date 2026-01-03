import { supabase } from '@/integrations/supabase/client';

export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy';
  latency?: number;
  error?: string;
}

export async function checkSupabaseHealth(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    const { error } = await supabase.from('salespeople').select('id').limit(1);
    if (error) throw error;
    
    return {
      service: 'supabase',
      status: 'healthy',
      latency: Date.now() - start,
    };
  } catch (error: unknown) {
    return {
      service: 'supabase',
      status: 'unhealthy',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function checkSystemHealth(): Promise<HealthCheckResult[]> {
  const checks = await Promise.all([
    checkSupabaseHealth(),
  ]);
  
  return checks;
}

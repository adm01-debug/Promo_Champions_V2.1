export interface HealthCheckResult {
  service: string;
  status: 'healthy' | 'unhealthy';
  latency?: number;
  error?: string;
}

export async function checkSupabaseHealth(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error) throw error;
    
    return {
      service: 'supabase',
      status: 'healthy',
      latency: Date.now() - start,
    };
  } catch (error: any) {
    return {
      service: 'supabase',
      status: 'unhealthy',
      error: error.message,
    };
  }
}

export async function checkBitrix24Health(): Promise<HealthCheckResult> {
  const start = Date.now();
  try {
    await bitrix24.call('user.current');
    
    return {
      service: 'bitrix24',
      status: 'healthy',
      latency: Date.now() - start,
    };
  } catch (error: any) {
    return {
      service: 'bitrix24',
      status: 'unhealthy',
      error: error.message,
    };
  }
}

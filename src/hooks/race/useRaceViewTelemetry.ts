import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Round 3 — Telemetria de TTI (time-to-interactive) por rota Race Arena.
 * Registra duração entre mount e o primeiro frame "pronto" (ready=true)
 * em `page_analytics.metadata` via update silencioso. Falhas são engolidas
 * para nunca quebrar a UI.
 */
export function useRaceViewTelemetry(route: string, ready: boolean) {
  const startedAtRef = useRef<number>(performance.now());
  const flushedRef = useRef(false);

  useEffect(() => {
    if (!ready || flushedRef.current) return;
    flushedRef.current = true;
    const ms = Math.round(performance.now() - startedAtRef.current);

    // Fire-and-forget — não bloqueia render
    void (async () => {
      try {
        // Resolve salesperson_id via auth atual (best-effort)
        const { data: auth } = await supabase.auth.getUser();
        if (!auth.user) return;
        const { data: sp } = await supabase
          .from('salespeople')
          .select('id')
          .eq('auth_user_id', auth.user.id)
          .maybeSingle();
        if (!sp) return;

        await supabase.from('page_analytics').insert({
          salesperson_id: sp.id,
          route,
          page_title: `race_view_loaded:${route}`,
          session_id: `race-tti-${Date.now()}`,
          device_type: window.innerWidth < 768 ? 'mobile' : 'desktop',
          duration_seconds: Math.round(ms / 1000),
          interactions: 0,
          entered_at: new Date(startedAtRef.current + performance.timeOrigin).toISOString(),
          exited_at: new Date().toISOString(),
        });
      } catch {
        // silent
      }
    })();
  }, [ready, route]);
}

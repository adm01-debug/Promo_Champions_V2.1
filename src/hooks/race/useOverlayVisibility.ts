import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

/**
 * Registra quando um overlay é efetivamente visto por > thresholdMs em uma sessão.
 * Faz upsert agregado em `race_overlay_telemetry` (1x por session+overlay).
 *
 * Usar:
 *   const ref = useOverlayVisibility('LiveTimingTower');
 *   <div ref={ref}>...</div>
 */
const sessionSeen = new Set<string>();

export function useOverlayVisibility<T extends Element = HTMLDivElement>(
  overlayName: string,
  thresholdMs = 2000,
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!ref.current || typeof IntersectionObserver === 'undefined') return;
    if (sessionSeen.has(overlayName)) return;

    let visibleSince: number | null = null;
    let timer: number | null = null;

    const record = async () => {
      if (sessionSeen.has(overlayName)) return;
      sessionSeen.add(overlayName);
      try {
        const { data: auth } = await supabase.auth.getUser();
        const uid = auth.user?.id;
        if (!uid) return;
        // Upsert: incrementa viewed_count e atualiza last_viewed_at
        const { data: existing } = await supabase
          .from('race_overlay_telemetry')
          .select('id, viewed_count')
          .eq('user_id', uid)
          .eq('overlay_name', overlayName)
          .maybeSingle();
        if (existing) {
          await supabase
            .from('race_overlay_telemetry')
            .update({
              viewed_count: (existing.viewed_count ?? 0) + 1,
              last_viewed_at: new Date().toISOString(),
            })
            .eq('id', existing.id);
        } else {
          await supabase.from('race_overlay_telemetry').insert({
            user_id: uid,
            overlay_name: overlayName,
            viewed_count: 1,
            last_viewed_at: new Date().toISOString(),
          });
        }
      } catch { /* falha silenciosa por design */ }
    };

    const obs = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting && entry.intersectionRatio > 0.4) {
          if (visibleSince == null) {
            visibleSince = Date.now();
            timer = window.setTimeout(record, thresholdMs);
          }
        } else {
          visibleSince = null;
          if (timer != null) { window.clearTimeout(timer); timer = null; }
        }
      }
    }, { threshold: [0, 0.4, 0.8] });

    obs.observe(ref.current);
    return () => {
      obs.disconnect();
      if (timer != null) window.clearTimeout(timer);
    };
  }, [overlayName, thresholdMs]);

  return ref;
}

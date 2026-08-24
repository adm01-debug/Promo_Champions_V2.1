import { supabase } from '@/integrations/supabase/client';

/**
 * Dispara processamento de evento de corrida ao criar/atualizar uma venda.
 * Fire-and-forget: nunca bloqueia a UX.
 */
export function triggerRaceEvent(saleId: string) {
  supabase.functions
    .invoke('process-race-event', { body: { sale_id: saleId } })
    .catch((e) => {
      console.warn('race-event trigger failed', e);
    });
}

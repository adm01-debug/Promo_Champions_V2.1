import { useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { EligibleBonus } from '@/hooks/useEligibleBonuses';

/**
 * Registra automaticamente premiações conquistadas via RPC idempotente
 * `award_bonus_if_eligible`. Segurança:
 * - salesperson_id é derivado de auth.uid() dentro da função (SECURITY DEFINER),
 *   ignorando qualquer id passado pelo cliente.
 * - Executa apenas quando o dashboard exibido pertence ao usuário autenticado
 *   (evita admins gerarem awards navegando em painéis alheios).
 */
export function useAutoAwardBonuses(
  achieved: EligibleBonus[],
  viewedSalespersonId: string | undefined,
) {
  const dispatched = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!viewedSalespersonId || achieved.length === 0) return;

    let cancelled = false;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const authUserId = sess.session?.user?.id;
      if (!authUserId) return;

      // Confirma que o painel exibido é o do próprio usuário autenticado
      const { data: sp } = await supabase
        .from('salespeople')
        .select('id')
        .eq('auth_user_id', authUserId)
        .maybeSingle();

      if (!sp || sp.id !== viewedSalespersonId) return;

      for (const b of achieved) {
        if (cancelled) return;
        const key = `${b.id}`;
        if (dispatched.current.has(key)) continue;
        dispatched.current.add(key);

        await supabase.rpc('award_bonus_if_eligible', {
          _bonus_id: b.id,
          _computed_amount: Number(b.bonus_amount),
          _bonus_kind: b.bonus_kind,
        });
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [achieved, viewedSalespersonId]);
}

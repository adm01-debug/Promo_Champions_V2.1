-- Sessão de validação adversarial pós-auditoria (2026-09-02).
--
-- 1) TRUNCATE não é filtrado por RLS no Postgres. O padrão de criação de
--    tabela do Supabase concede GRANT ALL (incluindo TRUNCATE) a anon e
--    authenticated por padrão. PostgREST nunca emite TRUNCATE via API REST
--    (só SELECT/INSERT/UPDATE/DELETE), então isto não é explorável pela API
--    pública hoje, mas viola o princípio de menor privilégio sem nenhum
--    custo de correção (nenhuma policy RLS depende de TRUNCATE). Revogado
--    em todo o schema public, não só nas tabelas de audit log.
--
-- 2) public.sync_battle_score() foi "corrigida" em
--    20260814190000_fix_broken_sales_triggers.sql, mas a correção nunca foi
--    aplicada no banco canônico (usyxfpqlsspldubptrdl) -- a função ao vivo
--    ainda escrevia em battle_participants.updated_at, coluna inexistente.
--    Bug dormente: só falha quando existe sales_battle ativa com
--    participante dentro da janela de tempo. Reaplica aqui a versão já
--    revisada, sem alterações de comportamento além da correção documentada.

REVOKE TRUNCATE ON ALL TABLES IN SCHEMA public FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.sync_battle_score()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
    v_battle_id UUID;
    v_metric TEXT;
    v_score NUMERIC;
BEGIN
    FOR v_battle_id, v_metric IN
        SELECT b.id, b.metric
        FROM public.sales_battles b
        JOIN public.battle_participants p ON p.battle_id = b.id
        WHERE b.status = 'active'
        AND p.salesperson_id = COALESCE(NEW.salesperson_id, OLD.salesperson_id)
        AND (b.starts_at <= NOW() AND b.ends_at >= NOW())
    LOOP
        IF v_metric = 'revenue' THEN
            SELECT COALESCE(SUM(amount), 0) INTO v_score
            FROM public.sales
            WHERE salesperson_id = COALESCE(NEW.salesperson_id, OLD.salesperson_id)
            AND (status = 'won' OR status = 'completed')
            AND created_at >= (SELECT starts_at FROM public.sales_battles WHERE id = v_battle_id);

        ELSIF v_metric = 'deals' THEN
            SELECT COUNT(*) INTO v_score
            FROM public.sales
            WHERE salesperson_id = COALESCE(NEW.salesperson_id, OLD.salesperson_id)
            AND (status = 'won' OR status = 'completed')
            AND created_at >= (SELECT starts_at FROM public.sales_battles WHERE id = v_battle_id);

        ELSIF v_metric = 'calls' THEN
            SELECT COUNT(*) INTO v_score
            FROM public.activities
            WHERE salesperson_id = COALESCE(NEW.salesperson_id, OLD.salesperson_id)
            AND activity_type = 'call'
            AND created_at >= (SELECT starts_at FROM public.sales_battles WHERE id = v_battle_id);

        ELSIF v_metric = 'meetings' THEN
            SELECT COUNT(*) INTO v_score
            FROM public.activities
            WHERE salesperson_id = COALESCE(NEW.salesperson_id, OLD.salesperson_id)
            AND activity_type = 'meeting'
            AND created_at >= (SELECT starts_at FROM public.sales_battles WHERE id = v_battle_id);
        END IF;

        UPDATE public.battle_participants
        SET current_score = v_score
        WHERE battle_id = v_battle_id
        AND salesperson_id = COALESCE(NEW.salesperson_id, OLD.salesperson_id);
    END LOOP;

    RETURN NEW;
END;
$function$;

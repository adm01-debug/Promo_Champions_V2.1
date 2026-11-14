-- Feed de vitórias: concluir uma batalha gerava 2 posts "Campeão da Arena! 🏆".
--
-- Causa: public.sales_battles tinha DOIS triggers AFTER UPDATE gravando em
-- public.victory_feed na mesma transição status -> 'completed':
--   * tr_victory_battle        -> public.auto_victory_post()  (sem metadata)
--   * tr_notify_battle_victory -> public.fn_notify_victory()  (metadata.battle_id)
-- Resultado: cada conclusão (active -> completed com winner_id) virava 2 posts.
--
-- Efeito desta migration:
-- 1) Remove tr_victory_battle: o caminho único passa a ser fn_notify_victory,
--    que grava metadata.battle_id (usado por VictoryFeedItem/VictoryFeedPage
--    para o selo/link da batalha) e o nome do vencedor na descrição.
-- 2) fn_notify_victory (ramo sales_battles) fica idempotente e cobre o que o
--    trigger removido cobria:
--      - dispara em qualquer transição para 'completed' (OLD.status distinto
--        de 'completed'), não só a partir de 'active';
--      - não insere se já existe post de vitória da mesma batalha
--        (metadata.battle_id), então reabrir/reconcluir não duplica.
--    O ramo de public.sales fica byte a byte igual (fora do escopo).
-- 3) public.auto_victory_post continua existindo e em uso por tr_victory_sale
--    (public.sales) — não é alterada aqui.
--
-- Idempotente: DROP TRIGGER IF EXISTS + CREATE OR REPLACE FUNCTION.
-- Função mantém SECURITY INVOKER e search_path fixo (como em produção);
-- só admin/gerente atualiza sales_battles (policy "Admins can manage battles"),
-- e a policy de INSERT em victory_feed já libera is_admin_or_manager.

DROP TRIGGER IF EXISTS tr_victory_battle ON public.sales_battles;

CREATE OR REPLACE FUNCTION public.fn_notify_victory()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $function$
DECLARE
    v_salesperson_name TEXT;
BEGIN
    IF TG_TABLE_NAME = 'sales' THEN
        IF NEW.deal_status = 'completed' AND (OLD.deal_status IS NULL OR OLD.deal_status != 'completed') THEN
            SELECT name INTO v_salesperson_name FROM public.salespeople WHERE id = NEW.salesperson_id;

            INSERT INTO public.victory_feed (salesperson_id, event_type, title, description, value, metadata)
            VALUES (
                NEW.salesperson_id,
                'sale',
                'Venda Fechada! 💰',
                v_salesperson_name || ' acabou de fechar um negócio de ' || to_char(NEW.amount, 'L999G999G999D99'),
                NEW.amount,
                jsonb_build_object('sale_id', NEW.id)
            );
        END IF;
    ELSIF TG_TABLE_NAME = 'sales_battles' THEN
        IF NEW.status = 'completed'
           AND OLD.status IS DISTINCT FROM 'completed'
           AND NEW.winner_id IS NOT NULL
           AND NOT EXISTS (
               SELECT 1
                 FROM public.victory_feed vf
                WHERE vf.event_type = 'achievement'
                  AND vf.metadata ->> 'battle_id' = NEW.id::text
           ) THEN
            SELECT name INTO v_salesperson_name FROM public.salespeople WHERE id = NEW.winner_id;

            INSERT INTO public.victory_feed (salesperson_id, event_type, title, description, metadata)
            VALUES (
                NEW.winner_id,
                'achievement',
                'Campeão da Arena! 🏆',
                v_salesperson_name || ' venceu a batalha: ' || NEW.title,
                jsonb_build_object('battle_id', NEW.id)
            );
        END IF;
    END IF;

    RETURN NEW;
END;
$function$;

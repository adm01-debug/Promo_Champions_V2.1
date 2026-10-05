-- Fix real em produção (suite E2E quote-to-sale, cleanup-contract):
-- public.trg_refresh_ranking_on_sale() é SECURITY INVOKER e chama
-- private.refresh_competitive_ranking(). Quando um usuário autenticado
-- deleta/atualiza uma venda via PostgREST, o trigger resolve a função
-- privada com os privilégios do chamador — `authenticated` não tem
-- USAGE no schema `private` → 42501 "permission denied for schema
-- private" e o DELETE inteiro aborta (a sale fica para trás).
-- Em INSERT o mesmo trigger funcionava porque os INSERTs de produção
-- acontecem dentro de RPCs SECURITY DEFINER (fn_convert_quote_to_sale),
-- que rodam como dono. DELETE nunca passou por esse caminho.
-- Correção: SECURITY DEFINER — o padrão dos demais trigger helpers que
-- tocam objetos privados (cf. CLAUDE.md §1.7: definer para helpers que
-- cruzam o schema). Sem mudança de comportamento: a função ainda só faz
-- PERFORM + RETURN NULL.

CREATE OR REPLACE FUNCTION public.trg_refresh_ranking_on_sale()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
    PERFORM private.refresh_competitive_ranking();
    RETURN NULL;
END;
$function$;

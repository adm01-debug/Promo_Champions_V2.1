CREATE OR REPLACE FUNCTION public.tg_order_marca_primeira_venda()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- O estado de credito e decidido aqui, nunca pelo INSERT (a policy de
  -- "pedido proprio" deixaria o usuario nascer o pedido ja 'aprovado').
  NEW.credit_status := 'nao_aplicavel';
  NEW.credit_limit_approved := NULL;
  NEW.credit_max_installments := NULL;
  NEW.credit_notes := NULL;
  NEW.credit_decided_at := NULL;

  -- Primeira venda = nenhum pedido anterior liberado para este cliente
  -- (anterior a regra = 'nao_aplicavel', ou aprovado pelo Financeiro).
  -- Pedido reprovado ou ainda em analise nao conta como historico.
  -- Sem cliente vinculado (orcamento sem e-mail/telefone) = cliente
  -- desconhecido: tambem passa pelo Financeiro.
  IF NEW.client_id IS NULL OR NOT EXISTS (
    SELECT 1 FROM public.orders o
     WHERE o.client_id = NEW.client_id
       AND o.status <> 'cancelled'
       AND o.credit_status IN ('nao_aplicavel', 'aprovado')
  ) THEN
    NEW.credit_status := 'aguardando_credito';
  END IF;
  RETURN NEW;
END;
$function$

-- ONDA 1 (A1): corrige o cálculo de comissão.
--
-- 1) commissions tinha UNIQUE(sale_id): a linha do SDR de ativação colidia
--    com a do closer e a trigger abortava a conclusão da venda inteira.
--    O modelo correto é uma linha por (sale_id, salesperson_id).
-- 2) A seleção de regra ignorava category/min_amount/max_amount e deixava a
--    regra global vencer da específica por ORDER BY priority DESC puro.
--    Nova ordem: regra do vendedor > match de categoria > faixa de valor > global.

ALTER TABLE public.commissions
  DROP CONSTRAINT IF EXISTS commissions_sale_id_key;

ALTER TABLE public.commissions
  ADD CONSTRAINT commissions_sale_salesperson_key UNIQUE (sale_id, salesperson_id);

CREATE OR REPLACE FUNCTION private.handle_sale_commissions()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    v_is_activation BOOLEAN;
    v_sdr_commission NUMERIC := 0;
    v_closer_commission NUMERIC := 0;
    v_rule_percentage NUMERIC;
    v_rule_id UUID;
    v_sdr_rule_percentage NUMERIC;
    v_sdr_rule_id UUID;
    v_target_closer_id UUID;
BEGIN
    IF (
        (TG_OP = 'UPDATE' AND (NEW.status IN ('completed', 'won') OR NEW.deal_status = 'completed') AND (OLD.status NOT IN ('completed', 'won') AND OLD.deal_status != 'completed'))
        OR
        (TG_OP = 'INSERT' AND (NEW.status IN ('completed', 'won') OR NEW.deal_status = 'completed'))
    ) THEN
        v_target_closer_id := COALESCE(NEW.closer_id, NEW.salesperson_id);

        IF v_target_closer_id IS NULL THEN
            RETURN NEW;
        END IF;

        IF NEW.is_first_sale IS NOT NULL THEN
            v_is_activation := NEW.is_first_sale;
        ELSE
            IF NEW.client_id IS NOT NULL THEN
                v_is_activation := private.check_is_first_activation(NEW.client_id, NEW.id);
            ELSE
                v_is_activation := TRUE;
            END IF;
        END IF;

        -- Regra do closer: específica do vendedor > categoria > faixa > global.
        -- Faixa: amount dentro de [min_amount, max_amount] quando definidos.
        SELECT id, percentage INTO v_rule_id, v_rule_percentage
        FROM public.commission_rules
        WHERE is_active = true
          AND (salesperson_id = v_target_closer_id OR salesperson_id IS NULL)
          AND (category IS NULL OR category = NEW.category)
          AND NEW.amount >= COALESCE(min_amount, 0)
          AND (max_amount IS NULL OR NEW.amount <= max_amount)
        ORDER BY
          (salesperson_id = v_target_closer_id) DESC,
          (category IS NOT NULL) DESC,
          priority DESC
        LIMIT 1;

        IF v_rule_percentage IS NULL THEN v_rule_percentage := 5.0; END IF;

        v_closer_commission := (NEW.amount * v_rule_percentage / 100);

        INSERT INTO public.commissions (
            sale_id, salesperson_id, rule_id, base_amount, percentage, commission_amount, status, is_first_sale
        ) VALUES (
            NEW.id, v_target_closer_id, v_rule_id, NEW.amount, v_rule_percentage, v_closer_commission, 'pending', v_is_activation
        );

        -- Comissão do SDR na ativação: regra resolvida para o SDR, não a do closer.
        IF v_is_activation AND NEW.sdr_id IS NOT NULL AND NEW.sdr_id != v_target_closer_id THEN
            SELECT id, percentage INTO v_sdr_rule_id, v_sdr_rule_percentage
            FROM public.commission_rules
            WHERE is_active = true
              AND (salesperson_id = NEW.sdr_id OR salesperson_id IS NULL)
              AND (category IS NULL OR category = NEW.category)
              AND NEW.amount >= COALESCE(min_amount, 0)
              AND (max_amount IS NULL OR NEW.amount <= max_amount)
            ORDER BY
              (salesperson_id = NEW.sdr_id) DESC,
              (category IS NOT NULL) DESC,
              priority DESC
            LIMIT 1;

            IF v_sdr_rule_percentage IS NULL THEN v_sdr_rule_percentage := 5.0; END IF;

            v_sdr_commission := (NEW.amount * v_sdr_rule_percentage / 100);

            INSERT INTO public.commissions (
                sale_id, salesperson_id, rule_id, base_amount, percentage, commission_amount, status, is_first_sale
            ) VALUES (
                NEW.id, NEW.sdr_id, v_sdr_rule_id, NEW.amount, v_sdr_rule_percentage, v_sdr_commission, 'pending', TRUE
            );
        END IF;
    END IF;
    RETURN NEW;
END;
$function$;

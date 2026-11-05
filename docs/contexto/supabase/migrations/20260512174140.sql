-- Ensure the function exists (it was found in routines, but we'll re-apply for consistency)
CREATE OR REPLACE FUNCTION public.auto_create_commission()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_rule_percentage NUMERIC(5,2);
  v_rule_id UUID;
  v_commission_amount NUMERIC(12,2);
BEGIN
  -- Only trigger on completed sales with a salesperson
  IF NEW.deal_status != 'completed' OR NEW.salesperson_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Skip if commission already exists for this sale
  IF EXISTS (SELECT 1 FROM public.commissions WHERE sale_id = NEW.id) THEN
    RETURN NEW;
  END IF;

  -- Find best matching rule (priority: salesperson + category > salesperson > category > global)
  SELECT id, percentage INTO v_rule_id, v_rule_percentage
  FROM public.commission_rules
  WHERE is_active = true
    AND (min_amount IS NULL OR NEW.amount >= min_amount)
    AND (max_amount IS NULL OR NEW.amount <= max_amount)
    AND (
      (salesperson_id = NEW.salesperson_id AND category = NEW.category)
      OR (salesperson_id = NEW.salesperson_id AND category IS NULL)
      OR (salesperson_id IS NULL AND category = NEW.category)
      OR (salesperson_id IS NULL AND category IS NULL)
    )
  ORDER BY
    CASE
      WHEN salesperson_id = NEW.salesperson_id AND category = NEW.category THEN 1
      WHEN salesperson_id = NEW.salesperson_id THEN 2
      WHEN category = NEW.category THEN 3
      ELSE 4
    END ASC,
    priority DESC,
    created_at DESC
  LIMIT 1;

  -- Default to 5% if no rule found
  IF v_rule_id IS NULL THEN
    v_rule_percentage := 5.00;
  END IF;

  v_commission_amount := ROUND(NEW.amount * v_rule_percentage / 100, 2);

  INSERT INTO public.commissions (
    sale_id, salesperson_id, rule_id, base_amount, percentage, commission_amount, status
  ) VALUES (
    NEW.id, NEW.salesperson_id, v_rule_id, NEW.amount, v_rule_percentage, v_commission_amount, 'pending'
  );

  RETURN NEW;
END;
$function$;

-- Create the trigger
DROP TRIGGER IF EXISTS tr_auto_create_commission ON public.sales;
CREATE TRIGGER tr_auto_create_commission
AFTER UPDATE OF deal_status ON public.sales
FOR EACH ROW
WHEN (NEW.deal_status = 'completed' AND OLD.deal_status IS DISTINCT FROM 'completed')
EXECUTE FUNCTION public.auto_create_commission();

-- Also handle initial inserts if status is already completed
DROP TRIGGER IF EXISTS tr_auto_create_commission_insert ON public.sales;
CREATE TRIGGER tr_auto_create_commission_insert
AFTER INSERT ON public.sales
FOR EACH ROW
WHEN (NEW.deal_status = 'completed')
EXECUTE FUNCTION public.auto_create_commission();

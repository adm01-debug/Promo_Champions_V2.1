CREATE OR REPLACE FUNCTION public.check_webhook_rate_limit(_subscription_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_limit  integer;
  v_window integer;
  v_usado  integer;
BEGIN
  SELECT s.rate_limit_per_minute, s.rate_limit_window_seconds
    INTO v_limit, v_window
  FROM public.winloss_webhook_subscriptions s
  WHERE s.id = _subscription_id
  FOR UPDATE;

  IF NOT FOUND THEN RETURN false; END IF;

  DELETE FROM public.webhook_dispatch_rate r
  WHERE r.subscription_id = _subscription_id
    AND r.dispatched_at < now() - make_interval(secs => v_window * 10);

  SELECT count(*) INTO v_usado
  FROM public.webhook_dispatch_rate r
  WHERE r.subscription_id = _subscription_id
    AND r.dispatched_at > now() - make_interval(secs => v_window);

  IF v_usado >= v_limit THEN
    RETURN false;
  END IF;

  INSERT INTO public.webhook_dispatch_rate (subscription_id) VALUES (_subscription_id);
  RETURN true;
END;
$function$

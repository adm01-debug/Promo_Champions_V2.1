CREATE OR REPLACE FUNCTION public.fn_admin_conversion_trail(_quote_id uuid DEFAULT NULL::uuid, _sale_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid UUID := auth.uid();
  v_quote UUID := _quote_id;
  v_sale  UUID := _sale_id;
  v_result JSONB;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION '[NOT_AUTHENTICATED] auth.uid() ausente';
  END IF;
  IF NOT public.has_role(v_uid, 'admin') THEN
    RAISE EXCEPTION '[FORBIDDEN] admin role requerido';
  END IF;
  IF v_quote IS NULL AND v_sale IS NULL THEN
    RAISE EXCEPTION '[INVALID_INPUT] informe quote_id ou sale_id';
  END IF;

  -- Resolve o par (quote_id, sale_id) a partir do que veio
  IF v_quote IS NULL THEN
    SELECT id INTO v_quote FROM public.quotes WHERE sale_id = v_sale LIMIT 1;
  END IF;
  IF v_sale IS NULL THEN
    SELECT sale_id INTO v_sale FROM public.quotes WHERE id = v_quote LIMIT 1;
  END IF;

  SELECT jsonb_build_object(
    'quote_id', v_quote,
    'sale_id',  v_sale,
    'quote',    (SELECT to_jsonb(q) FROM public.quotes q WHERE q.id = v_quote),
    'sale',     (SELECT to_jsonb(s) FROM public.sales s WHERE s.id = v_sale),
    'orders',   COALESCE((SELECT jsonb_agg(to_jsonb(o) ORDER BY o.created_at)
                         FROM public.orders o WHERE o.quote_id = v_quote), '[]'::jsonb),
    'order_items', COALESCE((SELECT jsonb_agg(to_jsonb(oi))
                             FROM public.order_items oi
                             JOIN public.orders o ON o.id = oi.order_id
                             WHERE o.quote_id = v_quote), '[]'::jsonb),
    'quote_items', COALESCE((SELECT jsonb_agg(to_jsonb(qi))
                             FROM public.quote_items qi WHERE qi.quote_id = v_quote), '[]'::jsonb),
    'conversion_audit', COALESCE((SELECT jsonb_agg(to_jsonb(a) ORDER BY a.created_at)
                                   FROM public.quote_conversion_audit a
                                   WHERE a.quote_id = v_quote OR a.sale_id = v_sale), '[]'::jsonb),
    'sale_notifications', COALESCE((SELECT jsonb_agg(to_jsonb(n) ORDER BY n.created_at)
                                     FROM public.sale_notifications_audit n
                                     WHERE n.sale_id = v_sale), '[]'::jsonb),
    'follow_up_notifications', COALESCE((SELECT jsonb_agg(to_jsonb(f) ORDER BY f.created_at)
                                          FROM public.follow_up_notifications f
                                          WHERE f.sale_id = v_sale), '[]'::jsonb),
    'follow_up_audit_logs', COALESCE((SELECT jsonb_agg(to_jsonb(l) ORDER BY l.created_at)
                                       FROM public.follow_up_audit_logs l
                                       WHERE l.sale_id = v_sale), '[]'::jsonb)
  ) INTO v_result;

  RETURN v_result;
END $function$

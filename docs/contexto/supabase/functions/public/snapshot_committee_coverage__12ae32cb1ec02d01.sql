CREATE OR REPLACE FUNCTION public.snapshot_committee_coverage()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.committee_coverage_history (
    sale_id, coverage_score, tier, stakeholder_count, gaps
  ) VALUES (
    NEW.sale_id,
    COALESCE(NEW.coverage_score, 0),
    COALESCE(NEW.tier, 'weak'),
    COALESCE(NEW.stakeholder_count, 0),
    COALESCE(NEW.gaps, '[]'::jsonb)
  );
  RETURN NEW;
END;
$function$

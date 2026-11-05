CREATE OR REPLACE FUNCTION public.get_bulk_job_summary(_job_id uuid)
 RETURNS TABLE(total integer, approved integer, sent integer, errored integer, pending integer)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT
    COUNT(*)::int AS total,
    COUNT(*) FILTER (WHERE approved)::int AS approved,
    COUNT(*) FILTER (WHERE sent_at IS NOT NULL)::int AS sent,
    COUNT(*) FILTER (WHERE error IS NOT NULL)::int AS errored,
    COUNT(*) FILTER (WHERE approved AND sent_at IS NULL AND error IS NULL)::int AS pending
  FROM public.email_bulk_drafts
  WHERE job_id = _job_id;
$function$

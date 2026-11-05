CREATE OR REPLACE FUNCTION public.update_call_recording_tsv()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.transcript_tsv := to_tsvector(
    'portuguese',
    coalesce(NEW.transcript, '') || ' ' ||
    coalesce(NEW.summary, '') || ' ' ||
    coalesce(array_to_string(NEW.key_topics, ' '), '') || ' ' ||
    coalesce(NEW.title, '')
  );
  RETURN NEW;
END;
$function$

CREATE OR REPLACE FUNCTION private.handle_template_versioning()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    next_version INTEGER;
BEGIN
    IF (OLD.whatsapp_template IS DISTINCT FROM NEW.whatsapp_template) THEN
        SELECT COALESCE(MAX(version_number), 0) + 1 INTO next_version
        FROM public.whatsapp_template_versions
        WHERE template_id = NEW.id;

        INSERT INTO public.whatsapp_template_versions (template_id, body, version_number, created_by)
        VALUES (NEW.id, NEW.whatsapp_template, next_version, auth.uid());
    END IF;
    RETURN NEW;
END;
$function$

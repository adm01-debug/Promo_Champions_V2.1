CREATE OR REPLACE FUNCTION public.create_version()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  INSERT INTO entity_versions (entity_type, entity_id, version_number, data, changed_by, change_summary)
  SELECT TG_TABLE_NAME, NEW.id, COALESCE(MAX(version_number), 0) + 1, row_to_json(OLD), auth.uid(), 'Auto-save'
  FROM entity_versions WHERE entity_type = TG_TABLE_NAME AND entity_id = NEW.id;
  RETURN NEW;
END;
$function$

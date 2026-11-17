CREATE OR REPLACE FUNCTION private.trigger_refresh_monthly_summary()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    IF (TG_OP = 'DELETE') THEN
        PERFORM private.refresh_monthly_sales_summary(to_char(OLD.created_at, 'YYYY-MM'));
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE'
           AND to_char(OLD.created_at, 'YYYY-MM') IS DISTINCT FROM to_char(NEW.created_at, 'YYYY-MM')) THEN
        PERFORM private.refresh_monthly_sales_summary(to_char(OLD.created_at, 'YYYY-MM'));
        PERFORM private.refresh_monthly_sales_summary(to_char(NEW.created_at, 'YYYY-MM'));
        RETURN NEW;
    ELSE
        PERFORM private.refresh_monthly_sales_summary(to_char(NEW.created_at, 'YYYY-MM'));
        RETURN NEW;
    END IF;
END;
$function$

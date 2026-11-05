CREATE OR REPLACE FUNCTION public.generate_cadence_tasks()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    step_record RECORD;
BEGIN
    -- For each step in the assigned cadence, create a task
    FOR step_record IN 
        SELECT id, day_number, title, description, template_content, task_type 
        FROM public.cadence_steps 
        WHERE cadence_id = NEW.cadence_id
    LOOP
        INSERT INTO public.cadence_tasks (
            prospect_cadence_id,
            cadence_step_id,
            scheduled_date,
            status,
            priority,
            task_type
        ) VALUES (
            NEW.id,
            step_record.id,
            CURRENT_DATE + (step_record.day_number || ' days')::interval,
            'pending',
            'medium',
            step_record.task_type
        );
    END LOOP;

    RETURN NEW;
END;
$function$

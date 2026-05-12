-- Add task_type to cadence_steps
ALTER TABLE public.cadence_steps 
ADD COLUMN IF NOT EXISTS task_type TEXT DEFAULT 'manual';

-- Update the generate_cadence_tasks trigger function
CREATE OR REPLACE FUNCTION public.generate_cadence_tasks()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
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
            (CURRENT_DATE + (step_record.day_number - 1) * INTERVAL '1 day')::DATE,
            'pending',
            'medium',
            COALESCE(step_record.task_type, 'manual')
        );
    END LOOP;
    
    RETURN NEW;
END;
$function$;
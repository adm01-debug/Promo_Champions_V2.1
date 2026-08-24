-- Function to automatically generate tasks for a prospect cadence
CREATE OR REPLACE FUNCTION public.generate_cadence_tasks()
RETURNS TRIGGER AS $$
DECLARE
    step_record RECORD;
BEGIN
    -- For each step in the assigned cadence, create a task
    FOR step_record IN 
        SELECT id, day_number, title, description, template_content 
        FROM public.cadence_steps 
        WHERE cadence_id = NEW.cadence_id
    LOOP
        INSERT INTO public.cadence_tasks (
            prospect_cadence_id,
            cadence_step_id,
            scheduled_date,
            status,
            priority
        ) VALUES (
            NEW.id,
            step_record.id,
            (CURRENT_DATE + (step_record.day_number - 1) * INTERVAL '1 day')::DATE,
            'pending',
            'medium'
        );
    END LOOP;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic task generation
DROP TRIGGER IF EXISTS trg_generate_cadence_tasks ON public.prospect_cadences;
CREATE TRIGGER trg_generate_cadence_tasks
AFTER INSERT ON public.prospect_cadences
FOR EACH ROW
EXECUTE FUNCTION public.generate_cadence_tasks();


-- Function to automatically enroll sales in cadences based on rules
CREATE OR REPLACE FUNCTION public.auto_enroll_in_cadence()
RETURNS TRIGGER AS $$
DECLARE
    matching_rule RECORD;
BEGIN
    -- Use the existing find_matching_cadence_rule function (if it exists as I saw earlier)
    -- or implement the logic directly
    SELECT r.id, r.cadence_id
    INTO matching_rule
    FROM public.cadence_enrollment_rules r
    WHERE r.is_active = true
      AND (r.trigger_stage IS NULL OR r.trigger_stage = NEW.status)
      AND (r.trigger_category IS NULL OR r.trigger_category = NEW.category)
      AND (r.trigger_source IS NULL OR r.trigger_source = NEW.source)
      AND (r.min_amount IS NULL OR NEW.total_amount >= r.min_amount)
      AND (r.max_amount IS NULL OR NEW.total_amount <= r.max_amount)
      -- Don't re-enroll if active cadence exists
      AND NOT EXISTS (
        SELECT 1 FROM public.prospect_cadences pc
        WHERE pc.sale_id = NEW.id
          AND pc.cadence_id = r.cadence_id
          AND pc.status IN ('active', 'paused')
      )
    ORDER BY r.priority ASC
    LIMIT 1;

    IF matching_rule.id IS NOT NULL THEN
        INSERT INTO public.prospect_cadences (
            sale_id,
            cadence_id,
            salesperson_id,
            status,
            next_action_date
        ) VALUES (
            NEW.id,
            matching_rule.cadence_id,
            NEW.salesperson_id,
            'active',
            CURRENT_DATE
        );
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for automatic enrollment on sales creation/update
DROP TRIGGER IF EXISTS trg_auto_enroll_on_sale ON public.sales;
CREATE TRIGGER trg_auto_enroll_on_sale
AFTER INSERT OR UPDATE OF status ON public.sales
FOR EACH ROW
EXECUTE FUNCTION public.auto_enroll_in_cadence();

-- Function to trigger deal health recalculation
CREATE OR REPLACE FUNCTION public.trigger_recalculate_deal_health()
RETURNS TRIGGER AS $$
DECLARE
  v_sale_id UUID;
BEGIN
  -- Get sale_id from the recording
  SELECT sale_id INTO v_sale_id 
  FROM public.call_recordings 
  WHERE id = NEW.recording_id;

  IF v_sale_id IS NOT NULL THEN
    -- We can't call HTTP directly from SQL easily without extensions like pg_net,
    -- but we can flag the score as "stale" or insert into a job queue.
    -- For now, let's update the health_score row to trigger a refresh in the UI
    -- or just mark it as needing calculation.
    UPDATE public.deal_health_scores
    SET calculated_at = now() - interval '1 day' -- Mark as stale
    WHERE sale_id = v_sale_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for competitor mentions
DROP TRIGGER IF EXISTS tr_competitor_mention_health ON public.competitor_mentions;
CREATE TRIGGER tr_competitor_mention_health
AFTER INSERT OR UPDATE ON public.competitor_mentions
FOR EACH ROW EXECUTE FUNCTION public.trigger_recalculate_deal_health();

-- Trigger for critical moments
DROP TRIGGER IF EXISTS tr_critical_moment_health ON public.call_critical_moments;
CREATE TRIGGER tr_critical_moment_health
AFTER INSERT OR UPDATE ON public.call_critical_moments
FOR EACH ROW EXECUTE FUNCTION public.trigger_recalculate_deal_health();

-- Stored Procedures for Complex Operations

-- Calculate deal probability
CREATE OR REPLACE FUNCTION calculate_deal_probability(deal_id UUID)
RETURNS NUMERIC AS $$
DECLARE
  probability NUMERIC;
BEGIN
  SELECT 
    CASE stage
      WHEN 'qualification' THEN 0.20
      WHEN 'proposal' THEN 0.40
      WHEN 'negotiation' THEN 0.60
      WHEN 'closing' THEN 0.80
      ELSE 0.10
    END INTO probability
  FROM deals
  WHERE id = deal_id;
  
  RETURN probability;
END;
$$ LANGUAGE plpgsql;

-- Update lead score
CREATE OR REPLACE FUNCTION update_lead_score(client_id UUID)
RETURNS VOID AS $$
DECLARE
  score INT;
BEGIN
  SELECT 
    (COALESCE(deal_count, 0) * 10) +
    (COALESCE(activity_count, 0) * 5) +
    (CASE WHEN last_contact > NOW() - INTERVAL '7 days' THEN 20 ELSE 0 END)
  INTO score
  FROM (
    SELECT 
      c.id,
      COUNT(DISTINCT d.id) as deal_count,
      COUNT(DISTINCT a.id) as activity_count,
      MAX(a.created_at) as last_contact
    FROM clients c
    LEFT JOIN deals d ON c.id = d.client_id
    LEFT JOIN activities a ON c.id = a.client_id
    WHERE c.id = client_id
    GROUP BY c.id
  ) stats;
  
  UPDATE clients SET lead_score = score WHERE id = client_id;
END;
$$ LANGUAGE plpgsql;

-- Archive old data
CREATE OR REPLACE FUNCTION archive_old_data(days_old INT)
RETURNS INT AS $$
DECLARE
  archived_count INT;
BEGIN
  WITH archived AS (
    UPDATE deals
    SET deleted_at = NOW()
    WHERE status = 'lost'
      AND updated_at < NOW() - (days_old || ' days')::INTERVAL
      AND deleted_at IS NULL
    RETURNING id
  )
  SELECT COUNT(*) INTO archived_count FROM archived;
  
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- Recreate contact_best_send_window
CREATE OR REPLACE VIEW public.contact_best_send_window 
WITH (security_invoker = true)
AS
 SELECT contact_id,
    contact_type,
    hour_of_day,
    day_of_week,
    opens,
    clicks,
    replies,
    score,
    rank
   FROM ( SELECT p.id,
            p.contact_id,
            p.contact_type,
            p.hour_of_day,
            p.day_of_week,
            p.opens,
            p.clicks,
            p.replies,
            p.score,
            p.updated_at,
            row_number() OVER (PARTITION BY p.contact_id, p.contact_type ORDER BY p.score DESC, p.updated_at DESC) AS rank
           FROM contact_send_time_profile p
          WHERE (p.score > (0)::numeric)) ranked
  WHERE (rank <= 3);

-- Recreate conversation_insights_summary
CREATE OR REPLACE VIEW public.conversation_insights_summary 
WITH (security_invoker = true)
AS
 SELECT analyzed_by AS user_id,
    (count(*))::integer AS total_analyses,
    (count(*) FILTER (WHERE (sentiment = 'positive'::text)))::integer AS positive_count,
    (count(*) FILTER (WHERE (sentiment = 'negative'::text)))::integer AS negative_count,
    (count(*) FILTER (WHERE (sentiment = 'neutral'::text)))::integer AS neutral_count,
    (count(*) FILTER (WHERE (sentiment = 'mixed'::text)))::integer AS mixed_count,
    (COALESCE(avg(COALESCE(array_length(buying_signals, 1), 0)), (0)::numeric))::numeric(10,2) AS avg_buying_signals,
    (COALESCE(avg(COALESCE(array_length(risk_signals, 1), 0)), (0)::numeric))::numeric(10,2) AS avg_risk_signals,
    (COALESCE(avg(jsonb_array_length(objections)), (0)::numeric))::numeric(10,2) AS avg_objections,
    max(created_at) AS last_analysis_at
   FROM conversation_analyses ca
  GROUP BY analyzed_by;

-- Recreate client_purchase_seasonality
CREATE OR REPLACE VIEW public.client_purchase_seasonality 
WITH (security_invoker = true)
AS
 SELECT c.id AS client_id,
    c.name AS client_name,
    (EXTRACT(month FROM s.created_at))::integer AS month_of_year,
    (EXTRACT(dow FROM s.created_at))::integer AS day_of_week,
    (count(*))::integer AS deal_count,
    COALESCE(avg(s.amount), (0)::numeric) AS avg_revenue,
    COALESCE(sum(s.amount), (0)::numeric) AS total_revenue
   FROM (sales s
     JOIN clients c ON ((c.name = s.client_name)))
  WHERE (s.status = 'won'::text)
  GROUP BY c.id, c.name, (EXTRACT(month FROM s.created_at)), (EXTRACT(dow FROM s.created_at));

-- Recreate race_leaderboard_view
CREATE OR REPLACE VIEW public.race_leaderboard_view 
WITH (security_invoker = true)
AS
 WITH season_metrics AS (
         SELECT rs.id AS season_id,
            rs.role_type,
            rs.start_date,
            rs.end_date,
            rs.goal_amount,
            rc.id AS car_id,
            rc.salesperson_id,
            sp.name AS salesperson_name,
            sp.avatar_url,
            rc.car_number,
            rc.primary_color,
            rc.secondary_color,
            rc.car_style,
            rc.nickname,
            COALESCE(sum(s.amount) FILTER (WHERE (s.status = 'completed'::text)), (0)::numeric) AS sales_value_raw,
            (count(s.id) FILTER (WHERE (s.status = 'completed'::text)))::numeric AS deals_count_raw,
            (count(DISTINCT s.client_name) FILTER (WHERE (s.status = 'completed'::text)))::numeric AS new_clients_raw,
            ( SELECT (count(*))::numeric AS count
                   FROM activities a
                  WHERE ((a.salesperson_id = rc.salesperson_id) AND (((a.created_at)::date >= rs.start_date) AND ((a.created_at)::date <= rs.end_date)))) AS activities_raw,
            ( SELECT (count(*))::numeric AS count
                   FROM activities a
                  WHERE ((a.salesperson_id = rc.salesperson_id) AND (((a.created_at)::date >= rs.start_date) AND ((a.created_at)::date <= rs.end_date)) AND (a.outcome = ANY (ARRAY['connected'::activity_outcome, 'qualified'::activity_outcome, 'scheduled'::activity_outcome, 'callback'::activity_outcome])))) AS conversations_raw
           FROM (((race_seasons rs
             CROSS JOIN race_cars rc)
             JOIN salespeople sp ON ((sp.id = rc.salesperson_id)))
             LEFT JOIN sales s ON (((s.salesperson_id = rc.salesperson_id) AND (((s.created_at)::date >= rs.start_date) AND ((s.created_at)::date <= rs.end_date)))))
          WHERE ((rs.status = 'active'::text) AND (((sp.role)::text = rs.role_type) OR ((sp.role)::text = 'hybrid'::text)))
          GROUP BY rs.id, rs.role_type, rs.start_date, rs.end_date, rs.goal_amount, rc.id, rc.salesperson_id, sp.name, sp.avatar_url, rc.car_number, rc.primary_color, rc.secondary_color, rc.car_style, rc.nickname
        ), scored AS (
         SELECT sm.season_id,
            sm.role_type,
            sm.start_date,
            sm.end_date,
            sm.goal_amount,
            sm.car_id,
            sm.salesperson_id,
            sm.salesperson_name,
            sm.avatar_url,
            sm.car_number,
            sm.primary_color,
            sm.secondary_color,
            sm.car_style,
            sm.nickname,
            sm.sales_value_raw,
            sm.deals_count_raw,
            sm.new_clients_raw,
            sm.activities_raw,
            sm.conversations_raw,
            COALESCE(( SELECT sum(((
                        CASE rsr.metric_code
                            WHEN 'sales_value'::text THEN sm.sales_value_raw
                            WHEN 'sales_value_originated'::text THEN sm.sales_value_raw
                            WHEN 'new_clients_activated'::text THEN sm.new_clients_raw
                            WHEN 'stakeholders_captured'::text THEN sm.new_clients_raw
                            WHEN 'routine_compliance'::text THEN sm.activities_raw
                            WHEN 'conversations_initiated'::text THEN sm.conversations_raw
                            WHEN 'markup_pct'::text THEN (sm.sales_value_raw * 0.3)
                            ELSE (0)::numeric
                        END * rsr.points_per_unit) * rsr.weight)) AS sum
                   FROM race_scoring_rules rsr
                  WHERE (rsr.season_id = sm.season_id)), sm.sales_value_raw) AS score_raw
           FROM season_metrics sm
        )
 SELECT season_id,
    car_id,
    salesperson_id,
    salesperson_name,
    avatar_url,
    car_number,
    primary_color,
    secondary_color,
    car_style,
    nickname,
    role_type,
    sales_value_raw AS total_sales,
    (deals_count_raw)::bigint AS deals_count,
    new_clients_raw AS new_clients_count,
    activities_raw AS activities_count,
    conversations_raw AS conversations_count,
    score_raw AS score,
        CASE
            WHEN (goal_amount > (0)::numeric) THEN LEAST(1.0, (score_raw / goal_amount))
            ELSE (0)::numeric
        END AS progress
   FROM scored;

-- Recreate race_spectator_view
CREATE OR REPLACE VIEW public.race_spectator_view 
WITH (security_invoker = true)
AS
 SELECT season_id,
    car_id,
    salesperson_id,
    salesperson_name,
    avatar_url,
    car_number,
    primary_color,
    secondary_color,
    car_style,
    nickname,
    role_type,
    total_sales,
    deals_count,
    score,
    progress
   FROM public.race_leaderboard_view;

-- Recreate race_rivalries_view
CREATE OR REPLACE VIEW public.race_rivalries_view 
WITH (security_invoker = true)
AS
 WITH overtake_pairs AS (
         SELECT race_events.season_id,
            race_events.salesperson_id AS overtaker_id,
            ((race_events.metadata ->> 'overtaken_id'::text))::uuid AS overtaken_id,
            race_events.created_at
           FROM race_events
          WHERE ((race_events.event_type = 'overtake'::text) AND (race_events.metadata ? 'overtaken_id'::text) AND (((race_events.metadata ->> 'overtaken_id'::text))::uuid IS NOT NULL))
        ), normalized AS (
         SELECT overtake_pairs.season_id,
            LEAST(overtake_pairs.overtaker_id, overtake_pairs.overtaken_id) AS rival_a,
            GREATEST(overtake_pairs.overtaker_id, overtake_pairs.overtaken_id) AS rival_b,
            overtake_pairs.created_at
           FROM overtake_pairs
          WHERE (overtake_pairs.overtaker_id <> overtake_pairs.overtaken_id)
        )
 SELECT season_id,
    rival_a,
    rival_b,
    (count(*))::integer AS swap_count,
    max(created_at) AS last_swap_at
   FROM normalized
  GROUP BY season_id, rival_a, rival_b
 HAVING (count(*) >= 3);

-- Recreate revenue_forecast_view
CREATE OR REPLACE VIEW public.revenue_forecast_view 
WITH (security_invoker = true)
AS
 WITH open_deals AS (
         SELECT s.id,
            s.salesperson_id,
            s.amount,
            s.status,
            s.created_at,
            s.updated_at,
                CASE s.status
                    WHEN 'lead'::text THEN 0.10
                    WHEN 'qualified'::text THEN 0.30
                    WHEN 'proposal'::text THEN 0.55
                    WHEN 'negotiation'::text THEN 0.75
                    WHEN 'pending'::text THEN 0.85
                    ELSE 0.20
                END AS stage_probability
           FROM sales s
          WHERE (s.status <> ALL (ARRAY['completed'::text, 'lost'::text]))
        ), closed_recent AS (
         SELECT sales.salesperson_id,
            count(*) AS won_count,
            avg((EXTRACT(epoch FROM (sales.updated_at - sales.created_at)) / 86400.0)) AS avg_cycle_days,
            sum(sales.amount) AS won_amount_90d
           FROM sales
          WHERE ((sales.status = 'completed'::text) AND (sales.updated_at >= (now() - '90 days'::interval)))
          GROUP BY sales.salesperson_id
        ), goals_current AS (
         SELECT sales_goals.salesperson_id,
            sales_goals.goal_amount
           FROM sales_goals
          WHERE (sales_goals.month = (date_trunc('month'::text, now()))::date)
        )
 SELECT COALESCE(od.salesperson_id, cr.salesperson_id, gc.salesperson_id) AS salesperson_id,
    COALESCE(sum(od.amount), (0)::numeric) AS total_open_pipeline,
    COALESCE(sum((od.amount * od.stage_probability)), (0)::numeric) AS weighted_forecast,
    count(od.id) FILTER (WHERE (od.id IS NOT NULL)) AS open_deals_count,
    COALESCE(max(cr.avg_cycle_days), (45)::numeric) AS avg_cycle_days,
    COALESCE(max(cr.won_amount_90d), (0)::numeric) AS won_amount_90d,
    COALESCE(max(cr.won_count), (0)::bigint) AS won_count_90d,
    COALESCE(max(gc.goal_amount), (0)::numeric) AS monthly_goal,
    (COALESCE(sum((od.amount * od.stage_probability)), (0)::numeric) * 0.70) AS pessimistic_30d,
    COALESCE(sum((od.amount * od.stage_probability)), (0)::numeric) AS realistic_30d,
    (COALESCE(sum((od.amount * od.stage_probability)), (0)::numeric) * 1.25) AS optimistic_30d
   FROM ((open_deals od
     FULL JOIN closed_recent cr ON ((cr.salesperson_id = od.salesperson_id)))
     FULL JOIN goals_current gc ON ((gc.salesperson_id = COALESCE(od.salesperson_id, cr.salesperson_id))))
  GROUP BY COALESCE(od.salesperson_id, cr.salesperson_id, gc.salesperson_id);

-- Recreate latest_briefing_view
CREATE OR REPLACE VIEW public.latest_briefing_view 
WITH (security_invoker = true)
AS
 SELECT id,
    briefing_date,
    pulse_score,
    headline,
    narrative,
    key_wins,
    key_risks,
    recommended_actions,
    generated_by,
    created_by,
    created_at
   FROM public.executive_briefings
  ORDER BY briefing_date DESC, created_at DESC
 LIMIT 1;

-- Recreate v_pipeline_coverage_summary
CREATE OR REPLACE VIEW public.v_pipeline_coverage_summary 
WITH (security_invoker = true)
AS
 SELECT DISTINCT ON (COALESCE((owner_id)::text, 'global'::text)) COALESCE((owner_id)::text, 'global'::text) AS owner_key,
    owner_id,
    period_start,
    period_end,
    sum(quota_amount) OVER (PARTITION BY COALESCE((owner_id)::text, 'global'::text), calculated_at) AS total_quota,
    sum(weighted_pipeline) OVER (PARTITION BY COALESCE((owner_id)::text, 'global'::text), calculated_at) AS total_weighted,
    avg(coverage_ratio) OVER (PARTITION BY COALESCE((owner_id)::text, 'global'::text), calculated_at) AS avg_ratio,
    health,
    calculated_at
   FROM public.pipeline_coverage_snapshots
  ORDER BY COALESCE((owner_id)::text, 'global'::text), calculated_at DESC;

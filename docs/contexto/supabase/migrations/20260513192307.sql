-- Recreate call_sentiment_summary
CREATE OR REPLACE VIEW public.call_sentiment_summary 
WITH (security_invoker = true)
AS
 SELECT recording_id,
    count(*) AS segments_count,
    (avg(score))::numeric(4,3) AS avg_score,
    (avg(score) FILTER (WHERE (speaker = 'salesperson'::text)))::numeric(4,3) AS avg_score_salesperson,
    (avg(score) FILTER (WHERE (speaker = 'client'::text)))::numeric(4,3) AS avg_score_client,
    count(*) FILTER (WHERE (sentiment = ANY (ARRAY['positive'::text, 'very_positive'::text]))) AS positive_count,
    count(*) FILTER (WHERE (sentiment = ANY (ARRAY['negative'::text, 'very_negative'::text]))) AS negative_count
   FROM call_sentiment_timeline
  GROUP BY recording_id;

-- Recreate coaching_impact_metrics
CREATE OR REPLACE VIEW public.coaching_impact_metrics 
WITH (security_invoker = true)
AS
 WITH base AS (
          SELECT cs.id AS session_id,
             cs.salesperson_id,
             cs.coach_id,
             cs.completed_at,
             cs.focus_skills,
             cs.outcome_rating
            FROM coaching_sessions cs
           WHERE ((cs.status = 'completed'::text) AND (cs.completed_at IS NOT NULL) AND (cs.salesperson_id IS NOT NULL))
         ), score_pre AS (
          SELECT b_1.session_id,
             avg(s.overall_score) AS pre_avg_overall
            FROM (base b_1
              LEFT JOIN call_coaching_scorecards s ON (((s.salesperson_id = b_1.salesperson_id) AND (s.calculated_at >= (b_1.completed_at - '30 days'::interval)) AND (s.calculated_at < b_1.completed_at))))
           GROUP BY b_1.session_id
         ), score_post AS (
          SELECT b_1.session_id,
             avg(s.overall_score) AS post_avg_overall
            FROM (base b_1
              LEFT JOIN call_coaching_scorecards s ON (((s.salesperson_id = b_1.salesperson_id) AND (s.calculated_at > b_1.completed_at) AND (s.calculated_at <= (b_1.completed_at + '30 days'::interval)))))
           GROUP BY b_1.session_id
         ), sales_pre AS (
          SELECT b_1.session_id,
             ((count(*) FILTER (WHERE (sa.status = 'completed'::text)))::numeric / (NULLIF(count(*), 0))::numeric) AS pre_conversion,
             avg(sa.amount) FILTER (WHERE (sa.status = 'completed'::text)) AS pre_ticket
            FROM (base b_1
              LEFT JOIN sales sa ON (((sa.salesperson_id = b_1.salesperson_id) AND (sa.created_at >= (b_1.completed_at - '30 days'::interval)) AND (sa.created_at < b_1.completed_at))))
           GROUP BY b_1.session_id
         ), sales_post AS (
          SELECT b_1.session_id,
             ((count(*) FILTER (WHERE (sa.status = 'completed'::text)))::numeric / (NULLIF(count(*), 0))::numeric) AS post_conversion,
             avg(sa.amount) FILTER (WHERE (sa.status = 'completed'::text)) AS post_ticket
            FROM (base b_1
              LEFT JOIN sales sa ON (((sa.salesperson_id = b_1.salesperson_id) AND (sa.created_at > b_1.completed_at) AND (sa.created_at <= (b_1.completed_at + '30 days'::interval)))))
           GROUP BY b_1.session_id
         )
  SELECT b.session_id,
     b.salesperson_id,
     b.coach_id,
     b.completed_at,
     b.focus_skills,
     b.outcome_rating,
     COALESCE(sp.pre_avg_overall, (0)::numeric) AS pre_avg_overall,
     COALESCE(spo.post_avg_overall, (0)::numeric) AS post_avg_overall,
         CASE
             WHEN (COALESCE(sp.pre_avg_overall, (0)::numeric) = (0)::numeric) THEN (0)::numeric
             ELSE (((COALESCE(spo.post_avg_overall, (0)::numeric) - sp.pre_avg_overall) / sp.pre_avg_overall) * (100)::numeric)
         END AS delta_overall,
     COALESCE(sap.pre_conversion, (0)::numeric) AS pre_conversion,
     COALESCE(sapo.post_conversion, (0)::numeric) AS post_conversion,
         CASE
             WHEN (COALESCE(sap.pre_conversion, (0)::numeric) = (0)::numeric) THEN (0)::numeric
             ELSE (((COALESCE(sapo.post_conversion, (0)::numeric) - sap.pre_conversion) / sap.pre_conversion) * (100)::numeric)
         END AS delta_conversion,
     COALESCE(sap.pre_ticket, (0)::numeric) AS pre_ticket,
     COALESCE(sapo.post_ticket, (0)::numeric) AS post_ticket,
         CASE
             WHEN (COALESCE(sap.pre_ticket, (0)::numeric) = (0)::numeric) THEN (0)::numeric
             ELSE (((COALESCE(sapo.post_ticket, (0)::numeric) - sap.pre_ticket) / sap.pre_ticket) * (100)::numeric)
         END AS delta_ticket
    FROM ((((base b
      LEFT JOIN score_pre sp ON ((sp.session_id = b.session_id)))
      LEFT JOIN score_post spo ON ((spo.session_id = b.session_id)))
      LEFT JOIN sales_pre sap ON ((sap.session_id = b.session_id)))
      LEFT JOIN sales_post sapo ON ((sapo.session_id = b.session_id)));

-- Recreate engagement_score_leaderboard
CREATE OR REPLACE VIEW public.engagement_score_leaderboard 
WITH (security_invoker = true)
AS
 SELECT id,
    contact_id,
    contact_type,
    score,
    tier,
    total_opens,
    total_clicks,
    total_replies,
    last_signal_at,
    updated_at,
        CASE
            WHEN (contact_type = 'lead'::text) THEN ( SELECT sales.client_name
               FROM sales
              WHERE (sales.id = ces.contact_id))
            WHEN (contact_type = 'client'::text) THEN ( SELECT clients.name
               FROM clients
              WHERE (clients.id = ces.contact_id))
            ELSE NULL::text
        END AS contact_name,
        CASE
            WHEN (contact_type = 'lead'::text) THEN ( SELECT sales.salesperson_id
               FROM sales
              WHERE (sales.id = ces.contact_id))
            WHEN (contact_type = 'client'::text) THEN ( SELECT client_portfolio.salesperson_id
               FROM client_portfolio
              WHERE (client_portfolio.client_id = ces.contact_id)
             LIMIT 1)
            ELSE NULL::uuid
        END AS owner_salesperson_id
   FROM contact_engagement_score ces
  WHERE (last_signal_at >= (now() - '14 days'::interval));

-- Recreate follow_up_audit_view
CREATE OR REPLACE VIEW public.follow_up_audit_view 
WITH (security_invoker = true)
AS
 SELECT al.id,
    al.sale_id,
    s.client_name AS lead_name,
    al.user_id,
    sp.name AS user_name,
    al.action_type,
    al.details,
    al.status,
    al.retry_count,
    al.created_at
   FROM ((follow_up_audit_logs al
     LEFT JOIN sales s ON ((al.sale_id = s.id)))
     LEFT JOIN salespeople sp ON ((al.user_id = sp.auth_user_id)));

-- Recreate sequence_variant_performance
CREATE OR REPLACE VIEW public.sequence_variant_performance 
WITH (security_invoker = true)
AS
 SELECT v.step_id,
    v.id AS variant_id,
    v.label,
    (count(e.id))::integer AS sent,
    (count(e.replied_at))::integer AS replied,
        CASE
            WHEN (count(e.id) > 0) THEN round(((100.0 * (count(e.replied_at))::numeric) / (count(e.id))::numeric), 2)
            ELSE (0)::numeric
        END AS reply_rate
   FROM (sequence_step_variants v
     LEFT JOIN sequence_step_executions e ON ((e.variant_id = v.id)))
  GROUP BY v.step_id, v.id, v.label;

# Views


## public.activities_active (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | public.activities |
| populada | n/a |
| comentário |  |


```sql
SELECT id,
    sale_id,
    salesperson_id,
    activity_type,
    outcome,
    notes,
    duration_minutes,
    contact_name,
    created_at,
    client_id,
    lead_status,
    mql_qualified_at,
    qualification_score,
    deleted_at,
    deleted_by,
    delete_reason
   FROM activities
  WHERE deleted_at IS NULL;
```

## public.call_sentiment_summary (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | public.call_sentiment_timeline |
| populada | n/a |
| comentário |  |


```sql
SELECT recording_id,
    count(*) AS segments_count,
    avg(score)::numeric(4,3) AS avg_score,
    avg(score) FILTER (WHERE speaker = 'salesperson'::text)::numeric(4,3) AS avg_score_salesperson,
    avg(score) FILTER (WHERE speaker = 'client'::text)::numeric(4,3) AS avg_score_client,
    count(*) FILTER (WHERE sentiment = ANY (ARRAY['positive'::text, 'very_positive'::text])) AS positive_count,
    count(*) FILTER (WHERE sentiment = ANY (ARRAY['negative'::text, 'very_negative'::text])) AS negative_count
   FROM call_sentiment_timeline
  GROUP BY recording_id;
```

## public.client_purchase_seasonality (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | public.clients, public.sales |
| populada | n/a |
| comentário |  |


```sql
SELECT c.id AS client_id,
    c.name AS client_name,
    EXTRACT(month FROM s.created_at)::integer AS month_of_year,
    EXTRACT(dow FROM s.created_at)::integer AS day_of_week,
    count(*)::integer AS deal_count,
    COALESCE(avg(s.amount), 0::numeric) AS avg_revenue,
    COALESCE(sum(s.amount), 0::numeric) AS total_revenue
   FROM sales s
     JOIN clients c ON c.name = s.client_name
  WHERE s.status = 'won'::text
  GROUP BY c.id, c.name, (EXTRACT(month FROM s.created_at)), (EXTRACT(dow FROM s.created_at));
```

## public.clients_active (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | public.clients |
| populada | n/a |
| comentário |  |


```sql
SELECT id,
    name,
    email,
    phone,
    company,
    total_value,
    created_at,
    updated_at,
    deleted_at,
    deleted_by,
    delete_reason,
    lat,
    lng,
    user_id,
    last_interaction_at,
    lead_source,
    email_verified,
    phone_verified,
    last_enrichment_id,
    is_activated,
    activated_at,
    ramo_atividade
   FROM clients
  WHERE deleted_at IS NULL;
```

## public.coaching_impact_metrics (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | public.call_coaching_scorecards, public.coaching_sessions, public.sales |
| populada | n/a |
| comentário |  |


```sql
WITH base AS (
         SELECT cs.id AS session_id,
            cs.salesperson_id,
            cs.coach_id,
            cs.completed_at,
            cs.focus_skills,
            cs.outcome_rating
           FROM coaching_sessions cs
          WHERE cs.status = 'completed'::text AND cs.completed_at IS NOT NULL AND cs.salesperson_id IS NOT NULL
        ), score_pre AS (
         SELECT b_1.session_id,
            avg(s.overall_score) AS pre_avg_overall
           FROM base b_1
             LEFT JOIN call_coaching_scorecards s ON s.salesperson_id = b_1.salesperson_id AND s.calculated_at >= (b_1.completed_at - '30 days'::interval) AND s.calculated_at < b_1.completed_at
          GROUP BY b_1.session_id
        ), score_post AS (
         SELECT b_1.session_id,
            avg(s.overall_score) AS post_avg_overall
           FROM base b_1
             LEFT JOIN call_coaching_scorecards s ON s.salesperson_id = b_1.salesperson_id AND s.calculated_at > b_1.completed_at AND s.calculated_at <= (b_1.completed_at + '30 days'::interval)
          GROUP BY b_1.session_id
        ), sales_pre AS (
         SELECT b_1.session_id,
            count(*) FILTER (WHERE sa.status = 'completed'::text)::numeric / NULLIF(count(*), 0)::numeric AS pre_conversion,
            avg(sa.amount) FILTER (WHERE sa.status = 'completed'::text) AS pre_ticket
           FROM base b_1
             LEFT JOIN sales sa ON sa.salesperson_id = b_1.salesperson_id AND sa.created_at >= (b_1.completed_at - '30 days'::interval) AND sa.created_at < b_1.completed_at
          GROUP BY b_1.session_id
        ), sales_post AS (
         SELECT b_1.session_id,
            count(*) FILTER (WHERE sa.status = 'completed'::text)::numeric / NULLIF(count(*), 0)::numeric AS post_conversion,
            avg(sa.amount) FILTER (WHERE sa.status = 'completed'::text) AS post_ticket
           FROM base b_1
             LEFT JOIN sales sa ON sa.salesperson_id = b_1.salesperson_id AND sa.created_at > b_1.completed_at AND sa.created_at <= (b_1.completed_at + '30 days'::interval)
          GROUP BY b_1.session_id
        )
 SELECT b.session_id,
    b.salesperson_id,
    b.coach_id,
    b.completed_at,
    b.focus_skills,
    b.outcome_rating,
    COALESCE(sp.pre_avg_overall, 0::numeric) AS pre_avg_overall,
    COALESCE(spo.post_avg_overall, 0::numeric) AS post_avg_overall,
        CASE
            WHEN COALESCE(sp.pre_avg_overall, 0::numeric) = 0::numeric THEN 0::numeric
            ELSE (COALESCE(spo.post_avg_overall, 0::numeric) - sp.pre_avg_overall) / sp.pre_avg_overall * 100::numeric
        END AS delta_overall,
    COALESCE(sap.pre_conversion, 0::numeric) AS pre_conversion,
    COALESCE(sapo.post_conversion, 0::numeric) AS post_conversion,
        CASE
            WHEN COALESCE(sap.pre_conversion, 0::numeric) = 0::numeric THEN 0::numeric
            ELSE (COALESCE(sapo.post_conversion, 0::numeric) - sap.pre_conversion) / sap.pre_conversion * 100::numeric
        END AS delta_conversion,
    COALESCE(sap.pre_ticket, 0::numeric) AS pre_ticket,
    COALESCE(sapo.post_ticket, 0::numeric) AS post_ticket,
        CASE
            WHEN COALESCE(sap.pre_ticket, 0::numeric) = 0::numeric THEN 0::numeric
            ELSE (COALESCE(sapo.post_ticket, 0::numeric) - sap.pre_ticket) / sap.pre_ticket * 100::numeric
        END AS delta_ticket
   FROM base b
     LEFT JOIN score_pre sp ON sp.session_id = b.session_id
     LEFT JOIN score_post spo ON spo.session_id = b.session_id
     LEFT JOIN sales_pre sap ON sap.session_id = b.session_id
     LEFT JOIN sales_post sapo ON sapo.session_id = b.session_id;
```

## public.competitive_ranking (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | public.mv_competitive_ranking |
| populada | n/a |
| comentário |  |


```sql
SELECT id,
    name,
    avatar_url,
    role,
    total_sales,
    deals_count,
    leads_count,
    rank
   FROM mv_competitive_ranking;
```

## public.contact_best_send_window (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | public.contact_send_time_profile |
| populada | n/a |
| comentário |  |


```sql
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
          WHERE p.score > 0::numeric) ranked
  WHERE rank <= 3;
```

## public.conversation_insights_summary (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | public.conversation_analyses |
| populada | n/a |
| comentário |  |


```sql
SELECT analyzed_by AS user_id,
    count(*)::integer AS total_analyses,
    count(*) FILTER (WHERE sentiment = 'positive'::text)::integer AS positive_count,
    count(*) FILTER (WHERE sentiment = 'negative'::text)::integer AS negative_count,
    count(*) FILTER (WHERE sentiment = 'neutral'::text)::integer AS neutral_count,
    count(*) FILTER (WHERE sentiment = 'mixed'::text)::integer AS mixed_count,
    COALESCE(avg(COALESCE(array_length(buying_signals, 1), 0)), 0::numeric)::numeric(10,2) AS avg_buying_signals,
    COALESCE(avg(COALESCE(array_length(risk_signals, 1), 0)), 0::numeric)::numeric(10,2) AS avg_risk_signals,
    COALESCE(avg(jsonb_array_length(objections)), 0::numeric)::numeric(10,2) AS avg_objections,
    max(created_at) AS last_analysis_at
   FROM conversation_analyses ca
  GROUP BY analyzed_by;
```

## public.engagement_score_leaderboard (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | public.client_portfolio, public.clients, public.contact_engagement_score, public.sales |
| populada | n/a |
| comentário |  |


```sql
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
            WHEN contact_type = 'lead'::text THEN ( SELECT sales.client_name
               FROM sales
              WHERE sales.id = ces.contact_id)
            WHEN contact_type = 'client'::text THEN ( SELECT clients.name
               FROM clients
              WHERE clients.id = ces.contact_id)
            ELSE NULL::text
        END AS contact_name,
        CASE
            WHEN contact_type = 'lead'::text THEN ( SELECT sales.salesperson_id
               FROM sales
              WHERE sales.id = ces.contact_id)
            WHEN contact_type = 'client'::text THEN ( SELECT client_portfolio.salesperson_id
               FROM client_portfolio
              WHERE client_portfolio.client_id = ces.contact_id
             LIMIT 1)
            ELSE NULL::uuid
        END AS owner_salesperson_id
   FROM contact_engagement_score ces
  WHERE last_signal_at >= (now() - '14 days'::interval);
```

## public.follow_up_audit_view (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | public.follow_up_audit_logs, public.sales, public.salespeople |
| populada | n/a |
| comentário |  |


```sql
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
   FROM follow_up_audit_logs al
     LEFT JOIN sales s ON al.sale_id = s.id
     LEFT JOIN salespeople sp ON al.user_id = sp.auth_user_id;
```

## public.latest_briefing_view (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | public.executive_briefings |
| populada | n/a |
| comentário |  |


```sql
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
   FROM executive_briefings
  ORDER BY briefing_date DESC, created_at DESC
 LIMIT 1;
```

## public.mv_competitive_ranking (materialized)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | n/a |
| opções |  |
| depende de | public.sales, public.salespeople |
| populada | sim |
| comentário |  |


```sql
WITH monthly_sales AS (
         SELECT sales.salesperson_id,
            sum(sales.amount) AS total_sales,
            count(*) AS deals_count
           FROM sales
          WHERE (sales.status = ANY (ARRAY['completed'::text, 'won'::text, 'closed'::text])) AND COALESCE(sales.closed_at, sales.updated_at) >= (date_trunc('month'::text, (now() AT TIME ZONE 'America/Sao_Paulo'::text)) AT TIME ZONE 'America/Sao_Paulo'::text) AND COALESCE(sales.closed_at, sales.updated_at) < ((date_trunc('month'::text, (now() AT TIME ZONE 'America/Sao_Paulo'::text)) AT TIME ZONE 'America/Sao_Paulo'::text) + '1 mon'::interval)
          GROUP BY sales.salesperson_id
        ), monthly_leads AS (
         SELECT sales.salesperson_id,
            count(*) AS leads_count
           FROM sales
          WHERE sales.status <> ALL (ARRAY['completed'::text, 'won'::text, 'closed'::text, 'lost'::text, 'cancelled'::text])
          GROUP BY sales.salesperson_id
        )
 SELECT s.id,
    s.name,
    s.avatar_url,
    s.role,
    COALESCE(ms.total_sales, 0::numeric) AS total_sales,
    COALESCE(ms.deals_count, 0::bigint) AS deals_count,
    COALESCE(ml.leads_count, 0::bigint) AS leads_count,
    rank() OVER (ORDER BY (COALESCE(ms.total_sales, 0::numeric)) DESC, (COALESCE(ms.deals_count, 0::bigint)) DESC) AS rank
   FROM salespeople s
     LEFT JOIN monthly_sales ms ON s.id = ms.salesperson_id
     LEFT JOIN monthly_leads ml ON s.id = ml.salesperson_id
  WHERE s.is_active = true;
```

## public.race_leaderboard_view (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | public.activities, public.race_cars, public.race_scoring_rules, public.race_seasons, public.sales, public.salespeople |
| populada | n/a |
| comentário |  |


```sql
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
            COALESCE(sum(s.amount) FILTER (WHERE s.status = ANY (ARRAY['won'::text, 'completed'::text])), 0::numeric) AS sales_value_raw,
            count(s.id) FILTER (WHERE s.status = ANY (ARRAY['won'::text, 'completed'::text]))::numeric AS deals_count_raw,
            count(DISTINCT s.client_name) FILTER (WHERE s.status = ANY (ARRAY['won'::text, 'completed'::text]))::numeric AS new_clients_raw,
            ( SELECT count(*)::numeric AS count
                   FROM activities a
                  WHERE a.salesperson_id = rc.salesperson_id AND a.created_at::date >= rs.start_date AND a.created_at::date <= rs.end_date) AS activities_raw,
            ( SELECT count(*)::numeric AS count
                   FROM activities a
                  WHERE a.salesperson_id = rc.salesperson_id AND a.created_at::date >= rs.start_date AND a.created_at::date <= rs.end_date AND (a.outcome = ANY (ARRAY['connected'::activity_outcome, 'qualified'::activity_outcome, 'scheduled'::activity_outcome, 'callback'::activity_outcome]))) AS conversations_raw
           FROM race_seasons rs
             CROSS JOIN race_cars rc
             JOIN salespeople sp ON sp.id = rc.salesperson_id
             LEFT JOIN sales s ON s.salesperson_id = rc.salesperson_id AND s.created_at::date >= rs.start_date AND s.created_at::date <= rs.end_date
          WHERE rs.status = 'active'::text AND (sp.role::text = rs.role_type OR sp.role::text = 'hybrid'::text)
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
            COALESCE(( SELECT sum(
                        CASE rsr.metric_code
                            WHEN 'sales_value'::text THEN sm.sales_value_raw
                            WHEN 'sales_value_originated'::text THEN sm.sales_value_raw
                            WHEN 'new_clients_activated'::text THEN sm.new_clients_raw
                            WHEN 'stakeholders_captured'::text THEN sm.new_clients_raw
                            WHEN 'routine_compliance'::text THEN sm.activities_raw
                            WHEN 'conversations_initiated'::text THEN sm.conversations_raw
                            WHEN 'markup_pct'::text THEN sm.sales_value_raw * 0.3
                            ELSE 0::numeric
                        END * rsr.points_per_unit * rsr.weight) AS sum
                   FROM race_scoring_rules rsr
                  WHERE rsr.season_id = sm.season_id), sm.sales_value_raw) AS score_raw
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
    deals_count_raw::bigint AS deals_count,
    new_clients_raw AS new_clients_count,
    activities_raw AS activities_count,
    conversations_raw AS conversations_count,
    score_raw AS score,
        CASE
            WHEN goal_amount > 0::numeric THEN LEAST(1.0, score_raw / goal_amount)
            ELSE 0::numeric
        END AS progress
   FROM scored;
```

## public.race_rivalries_view (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | public.race_events |
| populada | n/a |
| comentário | Pares de vendedores com >= 3 ultrapassagens entre si na mesma temporada (rivalidades). |


```sql
WITH overtake_pairs AS (
         SELECT race_events.season_id,
            race_events.salesperson_id AS overtaker_id,
            (race_events.metadata ->> 'overtaken_id'::text)::uuid AS overtaken_id,
            race_events.created_at
           FROM race_events
          WHERE race_events.event_type = 'overtake'::text AND race_events.metadata ? 'overtaken_id'::text AND ((race_events.metadata ->> 'overtaken_id'::text)::uuid) IS NOT NULL
        ), normalized AS (
         SELECT overtake_pairs.season_id,
            LEAST(overtake_pairs.overtaker_id, overtake_pairs.overtaken_id) AS rival_a,
            GREATEST(overtake_pairs.overtaker_id, overtake_pairs.overtaken_id) AS rival_b,
            overtake_pairs.created_at
           FROM overtake_pairs
          WHERE overtake_pairs.overtaker_id <> overtake_pairs.overtaken_id
        )
 SELECT season_id,
    rival_a,
    rival_b,
    count(*)::integer AS swap_count,
    max(created_at) AS last_swap_at
   FROM normalized
  GROUP BY season_id, rival_a, rival_b
 HAVING count(*) >= 3;
```

## public.race_spectator_view (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | public.race_leaderboard_view |
| populada | n/a |
| comentário |  |


```sql
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
   FROM race_leaderboard_view;
```

## public.revenue_forecast_view (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | public.sales, public.sales_goals, public.stage_probabilities |
| populada | n/a |
| comentário |  |


```sql
WITH open_deals AS (
         SELECT s.id,
            s.salesperson_id,
            s.amount,
            s.status,
            s.forecast_category,
            s.created_at,
            s.updated_at,
            sp.probability AS stage_probability
           FROM sales s
             JOIN stage_probabilities sp ON sp.stage = s.status
          WHERE sp.probability > 0::numeric AND sp.probability < 1::numeric
        ), category_agg AS (
         SELECT open_deals.salesperson_id,
            sum(open_deals.amount) FILTER (WHERE open_deals.forecast_category = 'commit'::forecast_category) AS commit_amount,
            sum(open_deals.amount) FILTER (WHERE open_deals.forecast_category = 'best_case'::forecast_category) AS best_case_amount,
            sum(open_deals.amount) FILTER (WHERE open_deals.forecast_category = 'pipeline'::forecast_category) AS pipeline_amount
           FROM open_deals
          GROUP BY open_deals.salesperson_id
        ), closed_recent AS (
         SELECT sales.salesperson_id,
            count(*) AS won_count,
            avg(EXTRACT(epoch FROM COALESCE(sales.closed_at, sales.updated_at) - sales.created_at) / 86400.0) AS avg_cycle_days,
            sum(sales.amount) AS won_amount_90d
           FROM sales
          WHERE (sales.status = ANY (ARRAY['completed'::text, 'won'::text, 'closed'::text])) AND COALESCE(sales.closed_at, sales.updated_at) >= (now() - '90 days'::interval)
          GROUP BY sales.salesperson_id
        ), goals_current AS (
         SELECT DISTINCT ON (sales_goals.salesperson_id) sales_goals.salesperson_id,
            sales_goals.goal_amount
           FROM sales_goals
          WHERE sales_goals.month <= date_trunc('month'::text, (now() AT TIME ZONE 'America/Sao_Paulo'::text))::date
          ORDER BY sales_goals.salesperson_id, sales_goals.month DESC
        )
 SELECT COALESCE(od.salesperson_id, cr.salesperson_id, gc.salesperson_id) AS salesperson_id,
    COALESCE(sum(od.amount), 0::numeric) AS total_open_pipeline,
    COALESCE(sum(od.amount * od.stage_probability), 0::numeric) AS weighted_forecast,
    count(od.id) FILTER (WHERE od.id IS NOT NULL) AS open_deals_count,
    COALESCE(max(cr.avg_cycle_days), 45::numeric) AS avg_cycle_days,
    COALESCE(max(cr.won_amount_90d), 0::numeric) AS won_amount_90d,
    COALESCE(max(cr.won_count), 0::bigint) AS won_count_90d,
    COALESCE(max(gc.goal_amount), 0::numeric) AS monthly_goal,
    COALESCE(max(ca.commit_amount), 0::numeric) AS commit_amount,
    COALESCE(max(ca.best_case_amount), 0::numeric) AS best_case_amount,
    COALESCE(max(ca.pipeline_amount), 0::numeric) AS pipeline_amount,
    COALESCE(max(COALESCE(ca.commit_amount, 0::numeric)), 0::numeric) AS pessimistic_30d,
    COALESCE(max(COALESCE(ca.commit_amount, 0::numeric) + COALESCE(ca.best_case_amount, 0::numeric) * 0.5), 0::numeric) AS realistic_30d,
    COALESCE(max(COALESCE(ca.commit_amount, 0::numeric) + COALESCE(ca.best_case_amount, 0::numeric) + COALESCE(ca.pipeline_amount, 0::numeric) * 0.3), 0::numeric) AS optimistic_30d
   FROM open_deals od
     FULL JOIN closed_recent cr ON cr.salesperson_id = od.salesperson_id
     FULL JOIN goals_current gc ON gc.salesperson_id = COALESCE(od.salesperson_id, cr.salesperson_id)
     LEFT JOIN category_agg ca ON ca.salesperson_id = COALESCE(od.salesperson_id, cr.salesperson_id)
  GROUP BY (COALESCE(od.salesperson_id, cr.salesperson_id, gc.salesperson_id));
```

## public.sales_with_markup (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | public.sales |
| populada | n/a |
| comentário | Visão de vendas com markup; mascara custos absolutos para vendedores e oculta vendas soft-deletadas. |


```sql
SELECT id,
    client_id,
    client_name,
    product_id,
    product_name,
    sku,
    amount,
    status,
    salesperson_id,
    sdr_id,
    closer_id,
    created_at,
    updated_at,
    markup_pct,
    cost_source,
    cost_synced_at,
        CASE
            WHEN has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) THEN unit_cost
            ELSE NULL::numeric
        END AS unit_cost,
        CASE
            WHEN has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) THEN total_cost
            ELSE NULL::numeric
        END AS total_cost,
        CASE
            WHEN has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) THEN margin_amount
            ELSE NULL::numeric
        END AS margin_amount
   FROM sales s
  WHERE deleted_at IS NULL;
```

## public.salespeople_public (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | public.salespeople |
| populada | n/a |
| comentário |  |


```sql
SELECT id,
    name,
    avatar_url,
    role,
    is_active
   FROM salespeople
  WHERE is_active = true;
```

## public.sequence_variant_performance (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | public.sequence_step_executions, public.sequence_step_variants |
| populada | n/a |
| comentário |  |


```sql
SELECT v.step_id,
    v.id AS variant_id,
    v.label,
    count(e.id)::integer AS sent,
    count(e.replied_at)::integer AS replied,
        CASE
            WHEN count(e.id) > 0 THEN round(100.0 * count(e.replied_at)::numeric / count(e.id)::numeric, 2)
            ELSE 0::numeric
        END AS reply_rate
   FROM sequence_step_variants v
     LEFT JOIN sequence_step_executions e ON e.variant_id = v.id
  GROUP BY v.step_id, v.id, v.label;
```

## public.tasks_active (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | public.tasks |
| populada | n/a |
| comentário |  |


```sql
SELECT id,
    title,
    description,
    salesperson_id,
    sale_id,
    priority,
    status,
    task_type,
    due_date,
    due_time,
    completed_at,
    created_at,
    updated_at,
    source_insight_id,
    client_id,
    deleted_at
   FROM tasks
  WHERE deleted_at IS NULL;
```

## public.v_active_activities (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | public.activities |
| populada | n/a |
| comentário |  |


```sql
SELECT id,
    sale_id,
    salesperson_id,
    activity_type,
    outcome,
    notes,
    duration_minutes,
    contact_name,
    created_at,
    client_id,
    lead_status,
    mql_qualified_at,
    qualification_score,
    deleted_at,
    deleted_by,
    delete_reason
   FROM activities
  WHERE deleted_at IS NULL;
```

## public.v_active_clients (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | public.clients |
| populada | n/a |
| comentário |  |


```sql
SELECT id,
    name,
    email,
    phone,
    company,
    total_value,
    created_at,
    updated_at,
    deleted_at,
    deleted_by,
    delete_reason,
    lat,
    lng,
    user_id,
    last_interaction_at,
    lead_source,
    email_verified,
    phone_verified,
    last_enrichment_id,
    is_activated,
    activated_at,
    ramo_atividade
   FROM clients
  WHERE deleted_at IS NULL;
```

## public.v_active_products (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | public.products |
| populada | n/a |
| comentário |  |


```sql
SELECT id,
    name,
    category,
    price,
    sales_count,
    rating,
    status,
    created_at,
    updated_at,
    sku,
    stock_quantity,
    min_stock_level,
    description,
    default_cost,
    cost_synced_at,
    deleted_at,
    deleted_by,
    delete_reason
   FROM products
  WHERE deleted_at IS NULL;
```

## public.v_active_suppliers (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | public.suppliers |
| populada | n/a |
| comentário |  |


```sql
SELECT id,
    name,
    contact_name,
    email,
    phone,
    address,
    city,
    state,
    country,
    cnpj,
    category,
    payment_terms,
    lead_time_days,
    reliability_score,
    is_active,
    notes,
    created_at,
    updated_at,
    deleted_at,
    deleted_by,
    delete_reason
   FROM suppliers
  WHERE deleted_at IS NULL;
```

## public.v_active_teams (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | public.teams |
| populada | n/a |
| comentário |  |


```sql
SELECT id,
    name,
    sdr_id,
    is_active,
    inactivity_days,
    created_at,
    updated_at,
    deleted_at,
    deleted_by,
    delete_reason
   FROM teams
  WHERE deleted_at IS NULL;
```

## public.v_deleted_clients (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | auth.users, public.clients |
| populada | n/a |
| comentário |  |


```sql
SELECT c.id,
    c.name,
    c.email,
    c.phone,
    c.company,
    c.total_value,
    c.created_at,
    c.updated_at,
    c.deleted_at,
    c.deleted_by,
    c.delete_reason,
    c.lat,
    c.lng,
    c.user_id,
    c.last_interaction_at,
    c.lead_source,
    c.email_verified,
    c.phone_verified,
    c.last_enrichment_id,
    c.is_activated,
    c.activated_at,
    c.ramo_atividade,
    u.email AS deleted_by_email
   FROM clients c
     LEFT JOIN auth.users u ON u.id = c.deleted_by
  WHERE c.deleted_at IS NOT NULL;
```

## public.v_pipeline_coverage_summary (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | public.pipeline_coverage_snapshots |
| populada | n/a |
| comentário |  |


```sql
SELECT DISTINCT ON ((COALESCE(owner_id::text, 'global'::text))) COALESCE(owner_id::text, 'global'::text) AS owner_key,
    owner_id,
    period_start,
    period_end,
    sum(quota_amount) OVER (PARTITION BY (COALESCE(owner_id::text, 'global'::text)), calculated_at) AS total_quota,
    sum(weighted_pipeline) OVER (PARTITION BY (COALESCE(owner_id::text, 'global'::text)), calculated_at) AS total_weighted,
    avg(coverage_ratio) OVER (PARTITION BY (COALESCE(owner_id::text, 'global'::text)), calculated_at) AS avg_ratio,
    health,
    calculated_at
   FROM pipeline_coverage_snapshots
  ORDER BY (COALESCE(owner_id::text, 'global'::text)), calculated_at DESC;
```

## public.v_platform_slo (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | public.circuit_breaker_events, public.error_logs, public.v4_callback_metrics, public.winloss_webhook_deliveries |
| populada | n/a |
| comentário |  |


```sql
WITH days AS (
         SELECT generate_series((CURRENT_DATE - '29 days'::interval)::date::timestamp with time zone, CURRENT_DATE::timestamp with time zone, '1 day'::interval)::date AS day
        ), dispatch AS (
         SELECT date_trunc('day'::text, wd.created_at)::date AS day,
            count(*) FILTER (WHERE wd.succeeded IS TRUE) AS sent_ok,
            count(*) FILTER (WHERE wd.succeeded IS FALSE) AS failed
           FROM winloss_webhook_deliveries wd
          WHERE wd.created_at >= (CURRENT_DATE - '29 days'::interval)
          GROUP BY (date_trunc('day'::text, wd.created_at)::date)
        ), v4 AS (
         SELECT v.day,
            COALESCE(v.sent_ok, 0) AS ok,
            COALESCE(v.failed, 0) AS ko,
            COALESCE(v.exhausted, 0) AS exhausted
           FROM v4_callback_metrics v
          WHERE v.day >= (CURRENT_DATE - '29 days'::interval)
        ), circuits AS (
         SELECT date_trunc('day'::text, cb.created_at)::date AS day,
            count(*) FILTER (WHERE cb.event_type = 'opened'::text) AS opened,
            count(*) AS total_events
           FROM circuit_breaker_events cb
          WHERE cb.created_at >= (CURRENT_DATE - '29 days'::interval)
          GROUP BY (date_trunc('day'::text, cb.created_at)::date)
        ), errors AS (
         SELECT date_trunc('day'::text, el.created_at)::date AS day,
            count(*) FILTER (WHERE el.severity = ANY (ARRAY['critical'::text, 'error'::text, 'high'::text])) AS critical_errors,
            count(*) AS total_logs
           FROM error_logs el
          WHERE el.created_at >= (CURRENT_DATE - '29 days'::interval)
          GROUP BY (date_trunc('day'::text, el.created_at)::date)
        )
 SELECT d.day,
        CASE
            WHEN COALESCE(dp.sent_ok + dp.failed, 0::bigint) = 0 THEN NULL::numeric
            ELSE dp.sent_ok::numeric / NULLIF(dp.sent_ok + dp.failed, 0)::numeric
        END AS webhook_success_ratio,
    0.99 AS webhook_success_target,
    COALESCE(dp.sent_ok, 0::bigint) AS webhook_sent_ok,
    COALESCE(dp.failed, 0::bigint) AS webhook_failed,
        CASE
            WHEN COALESCE(v4.ok + v4.ko + v4.exhausted, 0) = 0 THEN NULL::numeric
            ELSE v4.ok::numeric / NULLIF(v4.ok + v4.ko + v4.exhausted, 0)::numeric
        END AS v4_callback_success_ratio,
    0.99 AS v4_callback_success_target,
    COALESCE(v4.ok, 0) AS v4_callback_ok,
    COALESCE(v4.ko + v4.exhausted, 0) AS v4_callback_failed,
        CASE
            WHEN COALESCE(c.total_events, 0::bigint) = 0 THEN NULL::numeric
            ELSE 1::numeric - c.opened::numeric / NULLIF(c.total_events, 0)::numeric
        END AS circuit_stability_ratio,
    0.95 AS circuit_stability_target,
    COALESCE(c.opened, 0::bigint) AS circuits_opened,
    COALESCE(c.total_events, 0::bigint) AS circuit_events_total,
        CASE
            WHEN COALESCE(e.total_logs, 0::bigint) = 0 THEN NULL::numeric
            ELSE 1::numeric - e.critical_errors::numeric / NULLIF(e.total_logs, 0)::numeric
        END AS error_free_ratio,
    0.99 AS error_free_target,
    COALESCE(e.critical_errors, 0::bigint) AS critical_error_count,
    COALESCE(e.total_logs, 0::bigint) AS total_log_count
   FROM days d
     LEFT JOIN dispatch dp ON dp.day = d.day
     LEFT JOIN v4 ON v4.day = d.day
     LEFT JOIN circuits c ON c.day = d.day
     LEFT JOIN errors e ON e.day = d.day
  ORDER BY d.day DESC;
```

## public.v_platform_wal_health (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | pg_catalog.pg_replication_slots, pg_catalog.pg_stat_activity |
| populada | n/a |
| comentário | PERF-01: WAL/replication health snapshot. Alert when max_slot_lag_bytes > 1GB or long_running_tx_count > 0. |


```sql
SELECT ( SELECT pg_size_pretty(sum(pg_ls_waldir.size)) AS pg_size_pretty
           FROM pg_ls_waldir() pg_ls_waldir(name, size, modification)) AS wal_dir_size,
    ( SELECT pg_size_pretty(pg_database_size(current_database())) AS pg_size_pretty) AS db_size,
    ( SELECT count(*) AS count
           FROM pg_replication_slots
          WHERE pg_replication_slots.active) AS active_slots,
    ( SELECT count(*) AS count
           FROM pg_replication_slots
          WHERE NOT pg_replication_slots.active) AS inactive_slots,
    ( SELECT pg_size_pretty(COALESCE(max(pg_wal_lsn_diff(pg_current_wal_lsn(), pg_replication_slots.restart_lsn)), 0::numeric)) AS pg_size_pretty
           FROM pg_replication_slots) AS max_slot_lag_bytes,
    ( SELECT count(*) AS count
           FROM pg_stat_activity
          WHERE pg_stat_activity.state <> 'idle'::text AND pg_stat_activity.xact_start IS NOT NULL AND (now() - pg_stat_activity.xact_start) > '00:05:00'::interval) AS long_running_tx_count,
    ( SELECT EXTRACT(epoch FROM now() - min(pg_stat_activity.xact_start))::integer AS "extract"
           FROM pg_stat_activity
          WHERE pg_stat_activity.state <> 'idle'::text AND pg_stat_activity.xact_start IS NOT NULL) AS oldest_tx_age_seconds;
```

## public.v_quote_conversion_history (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | public.quote_conversion_audit, public.quotes |
| populada | n/a |
| comentário |  |


```sql
SELECT a.id AS audit_id,
    a.created_at AS occurred_at,
    a.quote_id,
    q.title AS quote_title,
    q.client_name AS quote_client,
    a.sale_id,
    a.order_id,
    a.order_number,
    a.previous_status,
    a.new_status,
    a.reused_order,
    a.idempotent,
    a.success,
    a.error_code,
    a.error_message,
    a.latency_ms,
    a.request_id,
    a.actor_user_id
   FROM quote_conversion_audit a
     LEFT JOIN quotes q ON q.id = a.quote_id;
```

## public.v_quote_conversion_metrics_daily (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | public.quote_conversion_audit |
| populada | n/a |
| comentário |  |


```sql
SELECT date_trunc('day'::text, created_at)::date AS day,
    count(*) AS attempts,
    count(*) FILTER (WHERE success) AS successes,
    count(*) FILTER (WHERE NOT success) AS failures,
    count(*) FILTER (WHERE idempotent) AS idempotent_hits,
    count(*) FILTER (WHERE reused_order) AS reused_orders,
    round(count(*) FILTER (WHERE success)::numeric / NULLIF(count(*), 0)::numeric * 100::numeric, 2) AS success_rate_pct,
    percentile_cont(0.50::double precision) WITHIN GROUP (ORDER BY (latency_ms::double precision)) FILTER (WHERE latency_ms IS NOT NULL) AS latency_p50_ms,
    percentile_cont(0.95::double precision) WITHIN GROUP (ORDER BY (latency_ms::double precision)) FILTER (WHERE latency_ms IS NOT NULL) AS latency_p95_ms,
    max(latency_ms) AS latency_max_ms
   FROM quote_conversion_audit
  GROUP BY (date_trunc('day'::text, created_at)::date)
  ORDER BY (date_trunc('day'::text, created_at)::date) DESC;
```

## public.v_quote_to_sale_invariants (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | public.orders, public.quotes, public.sales |
| populada | n/a |
| comentário | Invariantes do fluxo quote→sale: duplicatas, órfãos (só vendas de origem quote_conversion/gift_store), quotes multi-order, gap de sequence. Admin-only via RLS das tabelas base. |


```sql
WITH dup AS (
         SELECT count(*) AS n
           FROM ( SELECT orders.order_number
                   FROM orders
                  WHERE orders.order_number IS NOT NULL
                  GROUP BY orders.order_number
                 HAVING count(*) > 1) d
        ), orphans AS (
         SELECT count(*) AS n
           FROM sales s
          WHERE (s.source = ANY (ARRAY['quote_conversion'::text, 'gift_store'::text])) AND NOT (EXISTS ( SELECT 1
                   FROM quotes q
                  WHERE q.sale_id = s.id))
        ), multi AS (
         SELECT count(*) AS n
           FROM ( SELECT orders.quote_id
                   FROM orders
                  WHERE orders.quote_id IS NOT NULL
                  GROUP BY orders.quote_id
                 HAVING count(*) > 1) m
        ), seq AS (
         SELECT orders_conversion_seq.last_value AS seq_last
           FROM orders_conversion_seq
        ), maxorc AS (
         SELECT COALESCE(max(NULLIF(split_part(orders.order_number, '-'::text, 3), ''::text)::bigint), 0::bigint) AS max_suffix
           FROM orders
          WHERE orders.order_number ~~ 'ORC-%'::text
        )
 SELECT dup.n AS duplicate_order_numbers,
    orphans.n AS orphan_sales,
    multi.n AS quotes_with_multiple_orders,
    seq.seq_last AS orders_conversion_seq_last,
    maxorc.max_suffix AS max_orc_suffix,
    GREATEST(maxorc.max_suffix - seq.seq_last, 0::bigint) AS sequence_gap,
    dup.n = 0 AND orphans.n = 0 AND multi.n = 0 AND maxorc.max_suffix <= seq.seq_last AS all_ok,
    now() AS checked_at
   FROM dup,
    orphans,
    multi,
    seq,
    maxorc;
```

## public.v_rate_limit_blocked_sellers (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | public.rate_limit_logs |
| populada | n/a |
| comentário | Identificadores bloqueados pelo rate limit de sync com Champions V2 (leitura respeita RLS de rate_limit_logs — só admin/manager). |


```sql
SELECT identifier,
    identifier_type,
    action AS endpoint,
    request_count,
    window_start,
    window_end AS blocked_until,
    EXTRACT(epoch FROM window_end - now()) AS seconds_until_unblock,
    created_at
   FROM rate_limit_logs
  WHERE action = 'quote-sync-promo-champions'::text AND blocked = true AND window_end IS NOT NULL AND window_end > now()
  ORDER BY window_end DESC;
```

## public.v_security_definer_exposure (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de |  |
| populada | n/a |
| comentário | SEC-01 audit: SECURITY DEFINER exposure per role. Query as service_role or admin via RPC wrapper. |


```sql
SELECT n.nspname AS schema_name,
    p.proname AS function_name,
    pg_get_function_identity_arguments(p.oid) AS args,
    has_function_privilege('anon'::name, p.oid, 'EXECUTE'::text) AS anon_can_execute,
    has_function_privilege('authenticated'::name, p.oid, 'EXECUTE'::text) AS authenticated_can_execute,
    has_function_privilege('service_role'::name, p.oid, 'EXECUTE'::text) AS service_role_can_execute,
    p.proconfig IS NOT NULL AND (EXISTS ( SELECT 1
           FROM unnest(p.proconfig) c(c)
          WHERE c.c ~~ 'search_path=%'::text)) AS has_search_path
   FROM pg_proc p
     JOIN pg_namespace n ON n.oid = p.pronamespace
  WHERE n.nspname = 'public'::name AND p.prosecdef
  ORDER BY p.proname;
```

## public.v_web_vitals_p75 (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | public.web_vitals_samples |
| populada | n/a |
| comentário |  |


```sql
SELECT date_trunc('day'::text, created_at)::date AS day,
    COALESCE(NULLIF(route, ''::text), '/'::text) AS route,
        CASE
            WHEN viewport_width IS NULL THEN 'unknown'::text
            WHEN viewport_width < 768 THEN 'mobile'::text
            WHEN viewport_width < 1024 THEN 'tablet'::text
            ELSE 'desktop'::text
        END AS device_type,
    metric AS metric_name,
    count(*)::integer AS samples,
    percentile_disc(0.50::double precision) WITHIN GROUP (ORDER BY value)::numeric(10,2) AS p50,
    percentile_disc(0.75::double precision) WITHIN GROUP (ORDER BY value)::numeric(10,2) AS p75,
    percentile_disc(0.95::double precision) WITHIN GROUP (ORDER BY value)::numeric(10,2) AS p95,
        CASE metric
            WHEN 'LCP'::text THEN 2500::numeric
            WHEN 'CLS'::text THEN 0.1
            WHEN 'INP'::text THEN 200::numeric
            WHEN 'FCP'::text THEN 1800::numeric
            WHEN 'TTFB'::text THEN 800::numeric
            ELSE NULL::numeric
        END AS budget_p75
   FROM web_vitals_samples
  WHERE created_at >= (CURRENT_DATE - '30 days'::interval)
  GROUP BY (date_trunc('day'::text, created_at)::date), (COALESCE(NULLIF(route, ''::text), '/'::text)), (
        CASE
            WHEN viewport_width IS NULL THEN 'unknown'::text
            WHEN viewport_width < 768 THEN 'mobile'::text
            WHEN viewport_width < 1024 THEN 'tablet'::text
            ELSE 'desktop'::text
        END), metric
  ORDER BY (date_trunc('day'::text, created_at)::date) DESC, (COALESCE(NULLIF(route, ''::text), '/'::text)), (
        CASE
            WHEN viewport_width IS NULL THEN 'unknown'::text
            WHEN viewport_width < 768 THEN 'mobile'::text
            WHEN viewport_width < 1024 THEN 'tablet'::text
            ELSE 'desktop'::text
        END), metric;
```

## public.web_vitals_p75_last7d (view)

| campo | valor |
|---|---|
| owner | postgres |
| security_invoker | sim |
| opções | security_invoker=true |
| depende de | public.web_vitals_samples |
| populada | n/a |
| comentário |  |


```sql
SELECT route,
    metric,
    count(*) AS samples,
    percentile_cont(0.75::double precision) WITHIN GROUP (ORDER BY value) AS p75,
    percentile_cont(0.95::double precision) WITHIN GROUP (ORDER BY value) AS p95,
    avg(value) AS avg_value,
    sum(
        CASE
            WHEN rating = 'poor'::text THEN 1
            ELSE 0
        END)::double precision / NULLIF(count(*), 0)::double precision AS poor_ratio
   FROM web_vitals_samples
  WHERE created_at > (now() - '7 days'::interval)
  GROUP BY route, metric;
```

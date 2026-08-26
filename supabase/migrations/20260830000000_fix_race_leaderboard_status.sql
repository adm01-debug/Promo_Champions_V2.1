-- Fix race_leaderboard_view: aceitar tanto 'won' quanto 'completed' como status de venda ganha.
-- O banco só usa 'won' em sales.status, então a view estava retornando zeros.
-- A projeção mantém nomes, ordem e tipos da view anterior; CREATE OR REPLACE
-- preserva as dependências e evita remover a race_spectator_view em cascata.
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
            COALESCE(sum(s.amount) FILTER (WHERE (s.status = ANY (ARRAY['won'::text, 'completed'::text]))), (0)::numeric) AS sales_value_raw,
            (count(s.id) FILTER (WHERE (s.status = ANY (ARRAY['won'::text, 'completed'::text]))))::numeric AS deals_count_raw,
            (count(DISTINCT s.client_name) FILTER (WHERE (s.status = ANY (ARRAY['won'::text, 'completed'::text]))))::numeric AS new_clients_raw,
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

-- Mantém a view de espectador dependente da leaderboard sem removê-la.
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

-- Contrato público do modo espectador, inclusive em bancos onde o ACL prévio não exista.
GRANT SELECT ON public.race_spectator_view TO anon, authenticated;

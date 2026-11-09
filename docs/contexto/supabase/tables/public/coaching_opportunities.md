# public.coaching_opportunities

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 2 |
| realtime (publication) | sim |
| replica identity | full |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `salesperson_id` | `uuid` | não |  |  |  |
| 3 | `metric_key` | `text` | não |  |  |  |
| 4 | `metric_label` | `text` | não |  |  |  |
| 5 | `current_value` | `numeric` | não | `0` |  |  |
| 6 | `team_benchmark` | `numeric` | não | `0` |  |  |
| 7 | `gap_pct` | `numeric` | sim | ` CASE     WHEN (team_benchmark = (0)::numeric) THEN (0)::numeric     ELSE (((team_benchmark - current_value) / team_benchmark) * (100)::numeric) END` | s |  |
| 8 | `severity` | `text` | não | `'low'::text` |  |  |
| 9 | `skill_focus` | `text` | não |  |  |  |
| 10 | `recommended_action` | `text` | sim |  |  |  |
| 11 | `priority` | `integer` | não | `1` |  |  |
| 12 | `detected_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| coaching_opportunities_metric_key_check | CHECK | `CHECK (metric_key = ANY (ARRAY['conversion_rate'::text, 'stage_duration'::text, 'win_rate'::text, 'avg_ticket'::text, 'activities_per_day'::text]))` |  |  | sim |
| coaching_opportunities_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| coaching_opportunities_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| coaching_opportunities_severity_check | CHECK | `CHECK (severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text]))` |  |  | sim |
| coaching_opportunities_skill_focus_check | CHECK | `CHECK (skill_focus = ANY (ARRAY['discovery'::text, 'qualification'::text, 'objection_handling'::text, 'closing'::text, 'prospecting'::text, 'negotiation'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| coaching_opportunities_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX coaching_opportunities_pkey ON public.coaching_opportunities USING btree (id)` |
| coaching_opportunities_unique_per_day | btree | salesperson_id, metric_key | sim | sim |  | `CREATE UNIQUE INDEX coaching_opportunities_unique_per_day ON public.coaching_opportunities USING btree (salesperson_id, metric_key, (((detected_at AT TIME ZONE 'UTC'::text))::date))` |
| idx_coaching_opp_detected | btree | detected_at | não | sim |  | `CREATE INDEX idx_coaching_opp_detected ON public.coaching_opportunities USING btree (detected_at DESC)` |
| idx_coaching_opp_salesperson | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_coaching_opp_salesperson ON public.coaching_opportunities USING btree (salesperson_id)` |
| idx_coaching_opp_severity | btree | severity | não | sim |  | `CREATE INDEX idx_coaching_opp_severity ON public.coaching_opportunities USING btree (severity)` |


## Policies (RLS)

### `coaching_opp_read_authenticated`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `coaching_opp_write_admin_manager`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

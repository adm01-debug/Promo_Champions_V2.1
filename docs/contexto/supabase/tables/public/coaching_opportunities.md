# public.coaching_opportunities

> Tabela public.coaching_opportunities. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), salesperson_id uuid NOT NULL, metric_key text NOT NULL, metric_label text NOT NULL, current_value numeric NOT NULL DEFAULT 0, team_benchmark numeric NOT NULL DEFAULT 0, gap_pct numeric NULLABLE DEFAULT 
CASE
    WHEN (team_benchmark = (0)::numeric) THEN (0)::numeric
    ELSE (((team_benchmark - current_value) / team_benchmark) * (100)::numeric)
END, severity text NOT NULL DEFAULT 'low'::text, skill_focus text NOT NULL, recommended_action text NULLABLE, priority integer NOT NULL DEFAULT 1, detected_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: salesperson_id → public.salespeople(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.coaching_opportunities. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `salesperson_id` | `uuid` | não |  |  | Coluna salesperson_id da tabela public.coaching_opportunities. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.salespeople(id). |
| 3 | `metric_key` | `text` | não |  |  | Coluna metric_key da tabela public.coaching_opportunities. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (metric_key = ANY (ARRAY['conversion_rate'::text, 'stage_duration'::text, 'win_rate'::text, 'avg_ticket'::text, 'activities_per_day'::text])). |
| 4 | `metric_label` | `text` | não |  |  | Coluna metric_label da tabela public.coaching_opportunities. Tipo PostgreSQL: text. Não aceita NULL. |
| 5 | `current_value` | `numeric` | não | `0` |  | Coluna current_value da tabela public.coaching_opportunities. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 6 | `team_benchmark` | `numeric` | não | `0` |  | Coluna team_benchmark da tabela public.coaching_opportunities. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 7 | `gap_pct` | `numeric` | sim | ` CASE     WHEN (team_benchmark = (0)::numeric) THEN (0)::numeric     ELSE (((team_benchmark - current_value) / team_benchmark) * (100)::numeric) END` | s | Coluna gap_pct da tabela public.coaching_opportunities. Tipo PostgreSQL: numeric. Aceita NULL. Valor padrão:  CASE     WHEN (team_benchmark = (0)::numeric) THEN (0)::numeric     ELSE (((team_benchmark - current_value) / team_benchmark) * (100)::numeric) END. |
| 8 | `severity` | `text` | não | `'low'::text` |  | Coluna severity da tabela public.coaching_opportunities. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'low'::text. Validação CHECK: CHECK (severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])). |
| 9 | `skill_focus` | `text` | não |  |  | Coluna skill_focus da tabela public.coaching_opportunities. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (skill_focus = ANY (ARRAY['discovery'::text, 'qualification'::text, 'objection_handling'::text, 'closing'::text, 'prospecting'::text, 'negotiation'::text])). |
| 10 | `recommended_action` | `text` | sim |  |  | Coluna recommended_action da tabela public.coaching_opportunities. Tipo PostgreSQL: text. Aceita NULL. |
| 11 | `priority` | `integer` | não | `1` |  | Coluna priority da tabela public.coaching_opportunities. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 1. |
| 12 | `detected_at` | `timestamp with time zone` | não | `now()` |  | Coluna detected_at da tabela public.coaching_opportunities. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


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

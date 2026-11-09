# public.salesperson_coaching_aggregates

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
| 3 | `period_start` | `date` | não |  |  |  |
| 4 | `period_end` | `date` | não |  |  |  |
| 5 | `calls_analyzed` | `integer` | não | `0` |  |  |
| 6 | `avg_overall` | `numeric` | não | `0` |  |  |
| 7 | `avg_talk` | `numeric` | não | `0` |  |  |
| 8 | `avg_questions` | `numeric` | não | `0` |  |  |
| 9 | `avg_objections` | `numeric` | não | `0` |  |  |
| 10 | `avg_sentiment` | `numeric` | não | `0` |  |  |
| 11 | `trend_direction` | `text` | não | `'flat'::text` |  |  |
| 12 | `trend_delta` | `numeric` | não | `0` |  |  |
| 13 | `top_recurring_gap` | `text` | sim |  |  |  |
| 14 | `last_calculated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| salesperson_coaching_aggregates_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| salesperson_coaching_aggregates_salesperson_id_key | UNIQUE | `UNIQUE (salesperson_id)` |  |  | sim |
| salesperson_coaching_aggregates_trend_direction_check | CHECK | `CHECK (trend_direction = ANY (ARRAY['up'::text, 'flat'::text, 'down'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_sca_avg_overall | btree | avg_overall | não | sim |  | `CREATE INDEX idx_sca_avg_overall ON public.salesperson_coaching_aggregates USING btree (avg_overall DESC)` |
| idx_sca_salesperson | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_sca_salesperson ON public.salesperson_coaching_aggregates USING btree (salesperson_id)` |
| salesperson_coaching_aggregates_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX salesperson_coaching_aggregates_pkey ON public.salesperson_coaching_aggregates USING btree (id)` |
| salesperson_coaching_aggregates_salesperson_id_key | btree | salesperson_id | sim | sim |  | `CREATE UNIQUE INDEX salesperson_coaching_aggregates_salesperson_id_key ON public.salesperson_coaching_aggregates USING btree (salesperson_id)` |


## Policies (RLS)

### `sca_read_authenticated`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `sca_write_admin_manager`

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

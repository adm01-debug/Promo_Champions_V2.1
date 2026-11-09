# public.coaching_skill_benchmarks

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
| 2 | `metric_key` | `text` | não |  |  |  |
| 3 | `team_avg` | `numeric` | não | `0` |  |  |
| 4 | `top_quartile` | `numeric` | não | `0` |  |  |
| 5 | `sample_size` | `integer` | não | `0` |  |  |
| 6 | `computed_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| coaching_skill_benchmarks_metric_key_check | CHECK | `CHECK (metric_key = ANY (ARRAY['conversion_rate'::text, 'stage_duration'::text, 'win_rate'::text, 'avg_ticket'::text, 'activities_per_day'::text]))` |  |  | sim |
| coaching_skill_benchmarks_metric_key_key | UNIQUE | `UNIQUE (metric_key)` |  |  | sim |
| coaching_skill_benchmarks_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| coaching_skill_benchmarks_metric_key_key | btree | metric_key | sim | sim |  | `CREATE UNIQUE INDEX coaching_skill_benchmarks_metric_key_key ON public.coaching_skill_benchmarks USING btree (metric_key)` |
| coaching_skill_benchmarks_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX coaching_skill_benchmarks_pkey ON public.coaching_skill_benchmarks USING btree (id)` |


## Policies (RLS)

### `coaching_bench_read_authenticated`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `coaching_bench_write_admin_manager`

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

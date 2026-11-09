# public.stage_bottleneck_insights

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 3 |
| realtime (publication) | sim |
| replica identity | full |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `stage` | `text` | não |  |  |  |
| 3 | `owner_id` | `uuid` | sim |  |  |  |
| 4 | `severity` | `text` | não | `'low'::text` |  |  |
| 5 | `conversion_rate` | `numeric(5,2)` | não | `0` |  |  |
| 6 | `top_loss_reasons` | `jsonb` | não | `'[]'::jsonb` |  |  |
| 7 | `recommendations` | `jsonb` | não | `'[]'::jsonb` |  |  |
| 8 | `ai_summary` | `text` | sim |  |  |  |
| 9 | `calculated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 11 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| stage_bottleneck_insights_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| stage_bottleneck_insights_severity_check | CHECK | `CHECK (severity = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_stage_bottleneck_owner | btree | owner_id | não | sim |  | `CREATE INDEX idx_stage_bottleneck_owner ON public.stage_bottleneck_insights USING btree (owner_id)` |
| idx_stage_bottleneck_severity | btree | severity | não | sim |  | `CREATE INDEX idx_stage_bottleneck_severity ON public.stage_bottleneck_insights USING btree (severity)` |
| stage_bottleneck_insights_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX stage_bottleneck_insights_pkey ON public.stage_bottleneck_insights USING btree (id)` |
| stage_bottleneck_insights_unique | btree | stage | sim | sim |  | `CREATE UNIQUE INDEX stage_bottleneck_insights_unique ON public.stage_bottleneck_insights USING btree (stage, COALESCE(owner_id, '00000000-0000-0000-0000-000000000000'::uuid))` |


## Policies (RLS)

### `Admins manage bottleneck insights insert`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `Admins manage bottleneck insights update`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |

### `Users view own and global bottleneck insights`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((owner_id IS NULL) OR (owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_stage_bottleneck_insights_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

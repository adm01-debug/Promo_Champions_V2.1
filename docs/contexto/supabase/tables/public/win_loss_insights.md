# public.win_loss_insights

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 2 |
| realtime (publication) | sim |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `insight_type` | `text` | não |  |  |  |
| 3 | `title` | `text` | não |  |  |  |
| 4 | `description` | `text` | não |  |  |  |
| 5 | `severity` | `text` | não | `'info'::text` |  |  |
| 6 | `evidence` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 8 | `applied_at` | `timestamp with time zone` | sim |  |  |  |
| 9 | `applied_by` | `uuid` | sim |  |  |  |
| 10 | `assigned_to` | `uuid` | sim |  |  |  |
| 11 | `assigned_at` | `timestamp with time zone` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| win_loss_insights_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| win_loss_insights_severity_check | CHECK | `CHECK (severity = ANY (ARRAY['info'::text, 'opportunity'::text, 'risk'::text]))` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.tasks | tasks_source_insight_id_fkey | source_insight_id | SET NULL |
| public.win_loss_insight_comments | win_loss_insight_comments_insight_id_fkey | insight_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_wli_created | btree | created_at | não | sim |  | `CREATE INDEX idx_wli_created ON public.win_loss_insights USING btree (created_at DESC)` |
| idx_wli_severity | btree | severity | não | sim |  | `CREATE INDEX idx_wli_severity ON public.win_loss_insights USING btree (severity)` |
| win_loss_insights_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX win_loss_insights_pkey ON public.win_loss_insights USING btree (id)` |


## Policies (RLS)

### `wli read auth`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() IS NOT NULL)` |
| WITH CHECK |  |

### `wli write admin/manager`

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

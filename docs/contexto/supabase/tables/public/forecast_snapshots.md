# public.forecast_snapshots

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 3 |
| realtime (publication) | sim |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `period_start` | `date` | não |  |  |  |
| 3 | `period_end` | `date` | não |  |  |  |
| 4 | `owner_id` | `uuid` | sim |  |  |  |
| 5 | `segment` | `text` | sim |  |  |  |
| 6 | `forecast_amount` | `numeric` | não | `0` |  |  |
| 7 | `forecast_deals` | `integer` | não | `0` |  |  |
| 8 | `weighted_amount` | `numeric` | não | `0` |  |  |
| 9 | `commit_amount` | `numeric` | não | `0` |  |  |
| 10 | `best_case_amount` | `numeric` | não | `0` |  |  |
| 11 | `source` | `text` | não | `'weighted'::text` |  |  |
| 12 | `snapshot_at` | `timestamp with time zone` | não | `now()` |  |  |
| 13 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| forecast_snapshots_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| forecast_snapshots_source_check | CHECK | `CHECK (source = ANY (ARRAY['manual'::text, 'weighted'::text, 'ai'::text]))` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.forecast_accuracy | forecast_accuracy_snapshot_id_fkey | snapshot_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| forecast_snapshots_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX forecast_snapshots_pkey ON public.forecast_snapshots USING btree (id)` |
| idx_forecast_snapshots_owner | btree | owner_id | não | sim |  | `CREATE INDEX idx_forecast_snapshots_owner ON public.forecast_snapshots USING btree (owner_id)` |
| idx_forecast_snapshots_period | btree | period_start, period_end | não | sim |  | `CREATE INDEX idx_forecast_snapshots_period ON public.forecast_snapshots USING btree (period_start, period_end)` |
| idx_forecast_snapshots_source | btree | source | não | sim |  | `CREATE INDEX idx_forecast_snapshots_source ON public.forecast_snapshots USING btree (source)` |


## Policies (RLS)

### `Allow read for all authenticated users`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.role() = 'authenticated'::text)` |
| WITH CHECK |  |

### `fs_read_auth`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `fs_write_admin_manager`

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

_nenhum_

# public.forecast_accuracy

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
| 2 | `snapshot_id` | `uuid` | não |  |  |  |
| 3 | `actual_amount` | `numeric` | não | `0` |  |  |
| 4 | `actual_deals` | `integer` | não | `0` |  |  |
| 5 | `variance_amount` | `numeric` | sim | `(actual_amount - (0)::numeric)` | s |  |
| 6 | `variance_pct` | `numeric` | não | `0` |  |  |
| 7 | `mape` | `numeric` | não | `0` |  |  |
| 8 | `bias` | `text` | não | `'accurate'::text` |  |  |
| 9 | `computed_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| forecast_accuracy_bias_check | CHECK | `CHECK (bias = ANY (ARRAY['optimistic'::text, 'pessimistic'::text, 'accurate'::text]))` |  |  | sim |
| forecast_accuracy_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| forecast_accuracy_snapshot_id_fkey | FOREIGN KEY | `FOREIGN KEY (snapshot_id) REFERENCES forecast_snapshots(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| forecast_accuracy_snapshot_id_key | UNIQUE | `UNIQUE (snapshot_id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| forecast_accuracy_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX forecast_accuracy_pkey ON public.forecast_accuracy USING btree (id)` |
| forecast_accuracy_snapshot_id_key | btree | snapshot_id | sim | sim |  | `CREATE UNIQUE INDEX forecast_accuracy_snapshot_id_key ON public.forecast_accuracy USING btree (snapshot_id)` |
| idx_forecast_accuracy_bias | btree | bias | não | sim |  | `CREATE INDEX idx_forecast_accuracy_bias ON public.forecast_accuracy USING btree (bias)` |


## Policies (RLS)

### `Allow read for all authenticated users`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.role() = 'authenticated'::text)` |
| WITH CHECK |  |

### `fa_read_auth`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `fa_write_admin_manager`

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

# public.quota_attainment_alerts

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
| 2 | `prediction_id` | `uuid` | não |  |  |  |
| 3 | `salesperson_id` | `uuid` | não |  |  |  |
| 4 | `severity` | `text` | não | `'info'::text` |  |  |
| 5 | `message` | `text` | não |  |  |  |
| 6 | `recommended_action` | `text` | sim |  |  |  |
| 7 | `acknowledged` | `boolean` | não | `false` |  |  |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| quota_attainment_alerts_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| quota_attainment_alerts_prediction_id_fkey | FOREIGN KEY | `FOREIGN KEY (prediction_id) REFERENCES quota_attainment_predictions(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| quota_attainment_alerts_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| quota_attainment_alerts_severity_check | CHECK | `CHECK (severity = ANY (ARRAY['info'::text, 'warning'::text, 'critical'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_qaa_salesperson | btree | salesperson_id, created_at | não | sim |  | `CREATE INDEX idx_qaa_salesperson ON public.quota_attainment_alerts USING btree (salesperson_id, created_at DESC)` |
| idx_qaa_unack | btree | acknowledged, created_at | não | sim |  | `CREATE INDEX idx_qaa_unack ON public.quota_attainment_alerts USING btree (acknowledged, created_at DESC)` |
| idx_quota_attainment_alerts_prediction_id | btree | prediction_id | não | sim |  | `CREATE INDEX idx_quota_attainment_alerts_prediction_id ON public.quota_attainment_alerts USING btree (prediction_id)` |
| quota_attainment_alerts_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX quota_attainment_alerts_pkey ON public.quota_attainment_alerts USING btree (id)` |


## Policies (RLS)

### `Admin/manager write alerts`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `Authenticated read alerts`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_

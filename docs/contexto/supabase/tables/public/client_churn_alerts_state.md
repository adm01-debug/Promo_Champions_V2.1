# public.client_churn_alerts_state

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 2 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `salesperson_id` | `uuid` | não |  |  |  |
| 3 | `client_name` | `text` | não |  |  |  |
| 4 | `last_level` | `text` | não |  |  |  |
| 5 | `last_days_since` | `integer` | não |  |  |  |
| 6 | `last_alerted_at` | `timestamp with time zone` | não | `now()` |  |  |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 8 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 9 | `last_expected_interval_days` | `integer` | sim |  |  |  |
| 10 | `last_threshold_days` | `integer` | sim |  |  |  |
| 11 | `last_task_id` | `uuid` | sim |  |  |  |
| 12 | `last_task_created_at` | `timestamp with time zone` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| client_churn_alerts_state_last_level_check | CHECK | `CHECK (last_level = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text]))` |  |  | sim |
| client_churn_alerts_state_last_task_id_fkey | FOREIGN KEY | `FOREIGN KEY (last_task_id) REFERENCES tasks(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| client_churn_alerts_state_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| client_churn_alerts_state_salesperson_id_client_name_key | UNIQUE | `UNIQUE (salesperson_id, client_name)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| client_churn_alerts_state_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX client_churn_alerts_state_pkey ON public.client_churn_alerts_state USING btree (id)` |
| client_churn_alerts_state_salesperson_id_client_name_key | btree | salesperson_id, client_name | sim | sim |  | `CREATE UNIQUE INDEX client_churn_alerts_state_salesperson_id_client_name_key ON public.client_churn_alerts_state USING btree (salesperson_id, client_name)` |
| idx_churn_alerts_state_salesperson | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_churn_alerts_state_salesperson ON public.client_churn_alerts_state USING btree (salesperson_id)` |
| idx_client_churn_alerts_state_last_task_id_fk | btree | last_task_id | não | sim |  | `CREATE INDEX idx_client_churn_alerts_state_last_task_id_fk ON public.client_churn_alerts_state USING btree (last_task_id)` |


## Policies (RLS)

### `Admins can view all churn alert state`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |

### `Users can view their own churn alert state`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(salesperson_id = auth.uid())` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

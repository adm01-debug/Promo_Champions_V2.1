# public.client_churn_alerts_state

> Tabela public.client_churn_alerts_state. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), salesperson_id uuid NOT NULL, client_name text NOT NULL, last_level text NOT NULL, last_days_since integer NOT NULL, last_alerted_at timestamp with time zone NOT NULL DEFAULT now(), created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), last_expected_interval_days integer NULLABLE, last_threshold_days integer NULLABLE, last_task_id uuid NULLABLE, last_task_created_at timestamp with time zone NULLABLE. Relacionamentos FK: last_task_id → public.tasks(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.client_churn_alerts_state. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `salesperson_id` | `uuid` | não |  |  | Coluna salesperson_id da tabela public.client_churn_alerts_state. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 3 | `client_name` | `text` | não |  |  | Coluna client_name da tabela public.client_churn_alerts_state. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `last_level` | `text` | não |  |  | Coluna last_level da tabela public.client_churn_alerts_state. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (last_level = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'critical'::text])). |
| 5 | `last_days_since` | `integer` | não |  |  | Coluna last_days_since da tabela public.client_churn_alerts_state. Tipo PostgreSQL: integer. Não aceita NULL. |
| 6 | `last_alerted_at` | `timestamp with time zone` | não | `now()` |  | Coluna last_alerted_at da tabela public.client_churn_alerts_state. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.client_churn_alerts_state. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 8 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.client_churn_alerts_state. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 9 | `last_expected_interval_days` | `integer` | sim |  |  | Coluna last_expected_interval_days da tabela public.client_churn_alerts_state. Tipo PostgreSQL: integer. Aceita NULL. |
| 10 | `last_threshold_days` | `integer` | sim |  |  | Coluna last_threshold_days da tabela public.client_churn_alerts_state. Tipo PostgreSQL: integer. Aceita NULL. |
| 11 | `last_task_id` | `uuid` | sim |  |  | Coluna last_task_id da tabela public.client_churn_alerts_state. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.tasks(id). |
| 12 | `last_task_created_at` | `timestamp with time zone` | sim |  |  | Coluna last_task_created_at da tabela public.client_churn_alerts_state. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |


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

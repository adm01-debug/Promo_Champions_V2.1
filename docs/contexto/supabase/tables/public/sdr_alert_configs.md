# public.sdr_alert_configs

> Tabela public.sdr_alert_configs. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), user_id uuid NOT NULL, metric_type text NOT NULL, threshold_value double precision NOT NULL, is_active boolean NULLABLE DEFAULT true, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: user_id → auth.users(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 1 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.sdr_alert_configs. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `user_id` | `uuid` | não |  |  | Coluna user_id da tabela public.sdr_alert_configs. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: auth.users(id). |
| 3 | `metric_type` | `text` | não |  |  | Coluna metric_type da tabela public.sdr_alert_configs. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `threshold_value` | `double precision` | não |  |  | Coluna threshold_value da tabela public.sdr_alert_configs. Tipo PostgreSQL: double precision. Não aceita NULL. |
| 5 | `is_active` | `boolean` | sim | `true` |  | Coluna is_active da tabela public.sdr_alert_configs. Tipo PostgreSQL: boolean. Aceita NULL. Valor padrão: true. |
| 6 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.sdr_alert_configs. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 7 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.sdr_alert_configs. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| sdr_alert_configs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| sdr_alert_configs_user_id_fkey | FOREIGN KEY | `FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_sdr_alert_configs_user_id | btree | user_id | não | sim |  | `CREATE INDEX idx_sdr_alert_configs_user_id ON public.sdr_alert_configs USING btree (user_id)` |
| sdr_alert_configs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX sdr_alert_configs_pkey ON public.sdr_alert_configs USING btree (id)` |


## Policies (RLS)

### `Users can manage their own alert configs`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() = user_id)` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

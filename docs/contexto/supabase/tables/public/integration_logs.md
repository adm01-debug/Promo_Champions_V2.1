# public.integration_logs

> Tabela public.integration_logs. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), "timestamp" timestamp with time zone NULLABLE DEFAULT now(), integration_type text NOT NULL, event_type text NOT NULL, status text NOT NULL, details jsonb NULLABLE, recipient text NULLABLE, error_message text NULLABLE, metadata jsonb NULLABLE DEFAULT '{}'::jsonb.

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.integration_logs. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `timestamp` | `timestamp with time zone` | sim | `now()` |  | Coluna "timestamp" da tabela public.integration_logs. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |
| 3 | `integration_type` | `text` | não |  |  | Coluna integration_type da tabela public.integration_logs. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `event_type` | `text` | não |  |  | Coluna event_type da tabela public.integration_logs. Tipo PostgreSQL: text. Não aceita NULL. |
| 5 | `status` | `text` | não |  |  | Coluna status da tabela public.integration_logs. Tipo PostgreSQL: text. Não aceita NULL. |
| 6 | `details` | `jsonb` | sim |  |  | Coluna details da tabela public.integration_logs. Tipo PostgreSQL: jsonb. Aceita NULL. |
| 7 | `recipient` | `text` | sim |  |  | Coluna recipient da tabela public.integration_logs. Tipo PostgreSQL: text. Aceita NULL. |
| 8 | `error_message` | `text` | sim |  |  | Coluna error_message da tabela public.integration_logs. Tipo PostgreSQL: text. Aceita NULL. |
| 9 | `metadata` | `jsonb` | sim | `'{}'::jsonb` |  | Coluna metadata da tabela public.integration_logs. Tipo PostgreSQL: jsonb. Aceita NULL. Valor padrão: '{}'::jsonb. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| integration_logs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_integration_logs_status | btree | status | não | sim |  | `CREATE INDEX idx_integration_logs_status ON public.integration_logs USING btree (status)` |
| idx_integration_logs_timestamp | btree | timestamp | não | sim |  | `CREATE INDEX idx_integration_logs_timestamp ON public.integration_logs USING btree ("timestamp" DESC)` |
| idx_integration_logs_type | btree | integration_type | não | sim |  | `CREATE INDEX idx_integration_logs_type ON public.integration_logs USING btree (integration_type)` |
| idx_integration_logs_type_ts | btree | integration_type, timestamp | não | sim |  | `CREATE INDEX idx_integration_logs_type_ts ON public.integration_logs USING btree (integration_type, "timestamp" DESC)` |
| integration_logs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX integration_logs_pkey ON public.integration_logs USING btree (id)` |


## Policies (RLS)

### `Admins and managers can view integration logs`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

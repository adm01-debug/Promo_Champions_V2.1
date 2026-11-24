# public.integration_health_checks

> Tabela public.integration_health_checks. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), connection_id uuid NOT NULL, status integration_health_status NOT NULL, latency_ms integer NULLABLE, error text NULLABLE, details jsonb NULLABLE, triggered_by integration_trigger NOT NULL DEFAULT 'manual'::integration_trigger, checked_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: connection_id → public.integration_connections(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.integration_health_checks. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `connection_id` | `uuid` | não |  |  | Coluna connection_id da tabela public.integration_health_checks. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.integration_connections(id). |
| 3 | `status` | `integration_health_status` | não |  |  | Coluna status da tabela public.integration_health_checks. Tipo PostgreSQL: integration_health_status. Não aceita NULL. Valores do enum: 'success', 'failure', 'degraded', 'pending'. |
| 4 | `latency_ms` | `integer` | sim |  |  | Coluna latency_ms da tabela public.integration_health_checks. Tipo PostgreSQL: integer. Aceita NULL. |
| 5 | `error` | `text` | sim |  |  | Coluna error da tabela public.integration_health_checks. Tipo PostgreSQL: text. Aceita NULL. |
| 6 | `details` | `jsonb` | sim |  |  | Coluna details da tabela public.integration_health_checks. Tipo PostgreSQL: jsonb. Aceita NULL. |
| 7 | `triggered_by` | `integration_trigger` | não | `'manual'::integration_trigger` |  | Coluna triggered_by da tabela public.integration_health_checks. Tipo PostgreSQL: integration_trigger. Não aceita NULL. Valor padrão: 'manual'::integration_trigger. Valores do enum: 'manual', 'auto'. |
| 8 | `checked_at` | `timestamp with time zone` | não | `now()` |  | Coluna checked_at da tabela public.integration_health_checks. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| integration_health_checks_connection_id_fkey | FOREIGN KEY | `FOREIGN KEY (connection_id) REFERENCES integration_connections(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| integration_health_checks_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_health_conn_time | btree | connection_id, checked_at | não | sim |  | `CREATE INDEX idx_health_conn_time ON public.integration_health_checks USING btree (connection_id, checked_at DESC)` |
| integration_health_checks_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX integration_health_checks_pkey ON public.integration_health_checks USING btree (id)` |


## Policies (RLS)

### `admins read health`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |

### `admins write health`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

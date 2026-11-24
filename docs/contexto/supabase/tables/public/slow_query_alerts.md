# public.slow_query_alerts

> G6: consultas SQL detectadas como lentas. Dedupe por query_hash enquanto não reconhecidas.

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.slow_query_alerts. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `query_hash` | `text` | não |  |  | Coluna query_hash da tabela public.slow_query_alerts. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `query_preview` | `text` | não |  |  | Coluna query_preview da tabela public.slow_query_alerts. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `mean_exec_ms` | `double precision` | não |  |  | Coluna mean_exec_ms da tabela public.slow_query_alerts. Tipo PostgreSQL: double precision. Não aceita NULL. |
| 5 | `max_exec_ms` | `double precision` | não |  |  | Coluna max_exec_ms da tabela public.slow_query_alerts. Tipo PostgreSQL: double precision. Não aceita NULL. |
| 6 | `calls` | `bigint` | não |  |  | Coluna calls da tabela public.slow_query_alerts. Tipo PostgreSQL: bigint. Não aceita NULL. |
| 7 | `total_exec_ms` | `double precision` | não |  |  | Coluna total_exec_ms da tabela public.slow_query_alerts. Tipo PostgreSQL: double precision. Não aceita NULL. |
| 8 | `threshold_mean_ms` | `double precision` | não |  |  | Coluna threshold_mean_ms da tabela public.slow_query_alerts. Tipo PostgreSQL: double precision. Não aceita NULL. |
| 9 | `threshold_min_calls` | `bigint` | não |  |  | Coluna threshold_min_calls da tabela public.slow_query_alerts. Tipo PostgreSQL: bigint. Não aceita NULL. |
| 10 | `first_detected_at` | `timestamp with time zone` | não | `now()` |  | Coluna first_detected_at da tabela public.slow_query_alerts. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 11 | `last_detected_at` | `timestamp with time zone` | não | `now()` |  | Coluna last_detected_at da tabela public.slow_query_alerts. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 12 | `detection_count` | `integer` | não | `1` |  | Coluna detection_count da tabela public.slow_query_alerts. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 1. |
| 13 | `acknowledged_at` | `timestamp with time zone` | sim |  |  | Coluna acknowledged_at da tabela public.slow_query_alerts. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 14 | `acknowledged_by` | `uuid` | sim |  |  | Coluna acknowledged_by da tabela public.slow_query_alerts. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: auth.users(id). |
| 15 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.slow_query_alerts. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| slow_query_alerts_acknowledged_by_fkey | FOREIGN KEY | `FOREIGN KEY (acknowledged_by) REFERENCES auth.users(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| slow_query_alerts_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_slow_query_alerts_acknowledged_by_fk | btree | acknowledged_by | não | sim |  | `CREATE INDEX idx_slow_query_alerts_acknowledged_by_fk ON public.slow_query_alerts USING btree (acknowledged_by)` |
| idx_slow_query_alerts_last_detected | btree | last_detected_at | não | sim |  | `CREATE INDEX idx_slow_query_alerts_last_detected ON public.slow_query_alerts USING btree (last_detected_at DESC)` |
| slow_query_alerts_active_uk | btree | query_hash | sim | sim | `(acknowledged_at IS NULL)` | `CREATE UNIQUE INDEX slow_query_alerts_active_uk ON public.slow_query_alerts USING btree (query_hash) WHERE (acknowledged_at IS NULL)` |
| slow_query_alerts_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX slow_query_alerts_pkey ON public.slow_query_alerts USING btree (id)` |


## Policies (RLS)

### `Admins ack slow query alerts`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |

### `Admins view slow query alerts`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

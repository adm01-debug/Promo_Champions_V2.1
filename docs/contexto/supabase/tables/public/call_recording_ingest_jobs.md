# public.call_recording_ingest_jobs

> Tabela public.call_recording_ingest_jobs. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), idempotency_key text NOT NULL, recording_id uuid NOT NULL, salesperson_id uuid NOT NULL, payload jsonb NOT NULL, status text NOT NULL DEFAULT 'pending'::text, attempts integer NOT NULL DEFAULT 0, max_attempts integer NOT NULL DEFAULT 5, next_attempt_at timestamp with time zone NOT NULL DEFAULT now(), locked_at timestamp with time zone NULLABLE, locked_by text NULLABLE, last_error text NULLABLE, last_error_at timestamp with time zone NULLABLE, completed_at timestamp with time zone NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now().

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 3 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.call_recording_ingest_jobs. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `idempotency_key` | `text` | não |  |  | Coluna idempotency_key da tabela public.call_recording_ingest_jobs. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `recording_id` | `uuid` | não |  |  | Coluna recording_id da tabela public.call_recording_ingest_jobs. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 4 | `salesperson_id` | `uuid` | não |  |  | Coluna salesperson_id da tabela public.call_recording_ingest_jobs. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 5 | `payload` | `jsonb` | não |  |  | Coluna payload da tabela public.call_recording_ingest_jobs. Tipo PostgreSQL: jsonb. Não aceita NULL. |
| 6 | `status` | `text` | não | `'pending'::text` |  | Coluna status da tabela public.call_recording_ingest_jobs. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'pending'::text. Validação CHECK: CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'succeeded'::text, 'failed'::text, 'dead_letter'::text])). |
| 7 | `attempts` | `integer` | não | `0` |  | Coluna attempts da tabela public.call_recording_ingest_jobs. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 8 | `max_attempts` | `integer` | não | `5` |  | Coluna max_attempts da tabela public.call_recording_ingest_jobs. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 5. |
| 9 | `next_attempt_at` | `timestamp with time zone` | não | `now()` |  | Coluna next_attempt_at da tabela public.call_recording_ingest_jobs. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 10 | `locked_at` | `timestamp with time zone` | sim |  |  | Coluna locked_at da tabela public.call_recording_ingest_jobs. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 11 | `locked_by` | `text` | sim |  |  | Coluna locked_by da tabela public.call_recording_ingest_jobs. Tipo PostgreSQL: text. Aceita NULL. |
| 12 | `last_error` | `text` | sim |  |  | Coluna last_error da tabela public.call_recording_ingest_jobs. Tipo PostgreSQL: text. Aceita NULL. |
| 13 | `last_error_at` | `timestamp with time zone` | sim |  |  | Coluna last_error_at da tabela public.call_recording_ingest_jobs. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 14 | `completed_at` | `timestamp with time zone` | sim |  |  | Coluna completed_at da tabela public.call_recording_ingest_jobs. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 15 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.call_recording_ingest_jobs. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 16 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.call_recording_ingest_jobs. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| call_recording_ingest_jobs_idempotency_key_key | UNIQUE | `UNIQUE (idempotency_key)` |  |  | sim |
| call_recording_ingest_jobs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| call_recording_ingest_jobs_status_check | CHECK | `CHECK (status = ANY (ARRAY['pending'::text, 'processing'::text, 'succeeded'::text, 'failed'::text, 'dead_letter'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| call_recording_ingest_jobs_idempotency_key_key | btree | idempotency_key | sim | sim |  | `CREATE UNIQUE INDEX call_recording_ingest_jobs_idempotency_key_key ON public.call_recording_ingest_jobs USING btree (idempotency_key)` |
| call_recording_ingest_jobs_pending_idx | btree | status, next_attempt_at | não | sim | `(status = ANY (ARRAY['pending'::text, 'processing'::text]))` | `CREATE INDEX call_recording_ingest_jobs_pending_idx ON public.call_recording_ingest_jobs USING btree (status, next_attempt_at) WHERE (status = ANY (ARRAY['pending'::text, 'processing'::text]))` |
| call_recording_ingest_jobs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX call_recording_ingest_jobs_pkey ON public.call_recording_ingest_jobs USING btree (id)` |
| call_recording_ingest_jobs_salesperson_idx | btree | salesperson_id, created_at | não | sim |  | `CREATE INDEX call_recording_ingest_jobs_salesperson_idx ON public.call_recording_ingest_jobs USING btree (salesperson_id, created_at DESC)` |
| idx_call_recording_ingest_jobs_status_updated | btree | status, updated_at | não | sim |  | `CREATE INDEX idx_call_recording_ingest_jobs_status_updated ON public.call_recording_ingest_jobs USING btree (status, updated_at)` |


## Policies (RLS)

### `admin_can_read_all_ingest_jobs`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |

### `salesperson_can_enqueue_own_ingest_jobs`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |

### `salesperson_can_read_own_ingest_jobs`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| call_recording_ingest_jobs_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

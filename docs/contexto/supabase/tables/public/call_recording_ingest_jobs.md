# public.call_recording_ingest_jobs

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `idempotency_key` | `text` | não |  |  |  |
| 3 | `recording_id` | `uuid` | não |  |  |  |
| 4 | `salesperson_id` | `uuid` | não |  |  |  |
| 5 | `payload` | `jsonb` | não |  |  |  |
| 6 | `status` | `text` | não | `'pending'::text` |  |  |
| 7 | `attempts` | `integer` | não | `0` |  |  |
| 8 | `max_attempts` | `integer` | não | `5` |  |  |
| 9 | `next_attempt_at` | `timestamp with time zone` | não | `now()` |  |  |
| 10 | `locked_at` | `timestamp with time zone` | sim |  |  |  |
| 11 | `locked_by` | `text` | sim |  |  |  |
| 12 | `last_error` | `text` | sim |  |  |  |
| 13 | `last_error_at` | `timestamp with time zone` | sim |  |  |  |
| 14 | `completed_at` | `timestamp with time zone` | sim |  |  |  |
| 15 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 16 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


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

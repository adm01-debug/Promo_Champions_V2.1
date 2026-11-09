# public.data_subject_requests

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
| 2 | `request_type` | `text` | não |  |  |  |
| 3 | `subject_id` | `uuid` | sim |  |  |  |
| 4 | `subject_email` | `text` | não |  |  |  |
| 5 | `subject_client_id` | `uuid` | sim |  |  |  |
| 6 | `status` | `text` | não | `'pending'::text` |  |  |
| 7 | `payload` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 8 | `notes` | `text` | sim |  |  |  |
| 9 | `requested_by` | `uuid` | sim |  |  |  |
| 10 | `requested_at` | `timestamp with time zone` | não | `now()` |  |  |
| 11 | `due_at` | `timestamp with time zone` | não | `(now() + '15 days'::interval)` |  |  |
| 12 | `processed_by` | `uuid` | sim |  |  |  |
| 13 | `processed_at` | `timestamp with time zone` | sim |  |  |  |
| 14 | `result` | `jsonb` | sim |  |  |  |
| 15 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 16 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| data_subject_requests_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| data_subject_requests_request_type_check | CHECK | `CHECK (request_type = ANY (ARRAY['access'::text, 'rectification'::text, 'erasure'::text, 'portability'::text, 'consent_revocation'::text, 'information'::text]))` |  |  | sim |
| data_subject_requests_status_check | CHECK | `CHECK (status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text, 'rejected'::text]))` |  |  | sim |
| data_subject_requests_subject_client_id_fkey | FOREIGN KEY | `FOREIGN KEY (subject_client_id) REFERENCES clients(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| data_subject_requests_subject_id_fkey | FOREIGN KEY | `FOREIGN KEY (subject_id) REFERENCES auth.users(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| data_subject_requests_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX data_subject_requests_pkey ON public.data_subject_requests USING btree (id)` |
| idx_dsr_status_due | btree | status, due_at | não | sim |  | `CREATE INDEX idx_dsr_status_due ON public.data_subject_requests USING btree (status, due_at)` |
| idx_dsr_subject_email | btree |  | não | sim |  | `CREATE INDEX idx_dsr_subject_email ON public.data_subject_requests USING btree (lower(subject_email))` |


## Policies (RLS)

### `Admins gerenciam data_subject_requests`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Titular abre própria solicitação`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `((subject_id = auth.uid()) AND (lower(subject_email) = lower((auth.jwt() ->> 'email'::text))))` |

### `Titular lê própria solicitação`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((subject_id = auth.uid()) OR (lower(subject_email) = lower((auth.jwt() ->> 'email'::text))))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| update_data_subject_requests_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

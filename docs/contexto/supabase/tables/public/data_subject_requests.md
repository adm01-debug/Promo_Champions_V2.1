# public.data_subject_requests

> Tabela public.data_subject_requests. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), request_type text NOT NULL, subject_id uuid NULLABLE, subject_email text NOT NULL, subject_client_id uuid NULLABLE, status text NOT NULL DEFAULT 'pending'::text, payload jsonb NOT NULL DEFAULT '{}'::jsonb, notes text NULLABLE, requested_by uuid NULLABLE, requested_at timestamp with time zone NOT NULL DEFAULT now(), due_at timestamp with time zone NOT NULL DEFAULT (now() + '15 days'::interval), processed_by uuid NULLABLE, processed_at timestamp with time zone NULLABLE, result jsonb NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: subject_client_id → public.clients(id); subject_id → auth.users(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.data_subject_requests. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `request_type` | `text` | não |  |  | Coluna request_type da tabela public.data_subject_requests. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (request_type = ANY (ARRAY['access'::text, 'rectification'::text, 'erasure'::text, 'portability'::text, 'consent_revocation'::text, 'information'::text])). |
| 3 | `subject_id` | `uuid` | sim |  |  | Coluna subject_id da tabela public.data_subject_requests. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: auth.users(id). |
| 4 | `subject_email` | `text` | não |  |  | Coluna subject_email da tabela public.data_subject_requests. Tipo PostgreSQL: text. Não aceita NULL. |
| 5 | `subject_client_id` | `uuid` | sim |  |  | Coluna subject_client_id da tabela public.data_subject_requests. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.clients(id). |
| 6 | `status` | `text` | não | `'pending'::text` |  | Coluna status da tabela public.data_subject_requests. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'pending'::text. Validação CHECK: CHECK (status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text, 'rejected'::text])). |
| 7 | `payload` | `jsonb` | não | `'{}'::jsonb` |  | Coluna payload da tabela public.data_subject_requests. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '{}'::jsonb. |
| 8 | `notes` | `text` | sim |  |  | Coluna notes da tabela public.data_subject_requests. Tipo PostgreSQL: text. Aceita NULL. |
| 9 | `requested_by` | `uuid` | sim |  |  | Coluna requested_by da tabela public.data_subject_requests. Tipo PostgreSQL: uuid. Aceita NULL. |
| 10 | `requested_at` | `timestamp with time zone` | não | `now()` |  | Coluna requested_at da tabela public.data_subject_requests. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 11 | `due_at` | `timestamp with time zone` | não | `(now() + '15 days'::interval)` |  | Coluna due_at da tabela public.data_subject_requests. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: (now() + '15 days'::interval). |
| 12 | `processed_by` | `uuid` | sim |  |  | Coluna processed_by da tabela public.data_subject_requests. Tipo PostgreSQL: uuid. Aceita NULL. |
| 13 | `processed_at` | `timestamp with time zone` | sim |  |  | Coluna processed_at da tabela public.data_subject_requests. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 14 | `result` | `jsonb` | sim |  |  | Coluna result da tabela public.data_subject_requests. Tipo PostgreSQL: jsonb. Aceita NULL. |
| 15 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.data_subject_requests. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 16 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.data_subject_requests. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


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
| idx_data_subject_requests_subject_client_id | btree | subject_client_id | não | sim |  | `CREATE INDEX idx_data_subject_requests_subject_client_id ON public.data_subject_requests USING btree (subject_client_id)` |
| idx_data_subject_requests_subject_id | btree | subject_id | não | sim |  | `CREATE INDEX idx_data_subject_requests_subject_id ON public.data_subject_requests USING btree (subject_id)` |
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
| trg_data_subject_requests_guard_payload | BEFORE | INSERT OR UPDATE | ROW | enabled | public.data_subject_requests_guard_payload |
| update_data_subject_requests_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

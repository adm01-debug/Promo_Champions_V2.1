# public.email_bulk_drafts

> Tabela public.email_bulk_drafts. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), job_id uuid NOT NULL, sale_id uuid NULLABLE, client_id uuid NULLABLE, recipient_email text NULLABLE, recipient_name text NULLABLE, subject text NOT NULL DEFAULT ''::text, body text NOT NULL DEFAULT ''::text, personalization_notes text NULLABLE, approved boolean NOT NULL DEFAULT false, sent_at timestamp with time zone NULLABLE, error text NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), retry_count integer NOT NULL DEFAULT 0, next_retry_at timestamp with time zone NULLABLE, last_error_at timestamp with time zone NULLABLE, last_error_message text NULLABLE, recovered_at timestamp with time zone NULLABLE. Relacionamentos FK: job_id → public.email_bulk_jobs(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 4 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.email_bulk_drafts. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `job_id` | `uuid` | não |  |  | Coluna job_id da tabela public.email_bulk_drafts. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.email_bulk_jobs(id). |
| 3 | `sale_id` | `uuid` | sim |  |  | Coluna sale_id da tabela public.email_bulk_drafts. Tipo PostgreSQL: uuid. Aceita NULL. |
| 4 | `client_id` | `uuid` | sim |  |  | Coluna client_id da tabela public.email_bulk_drafts. Tipo PostgreSQL: uuid. Aceita NULL. |
| 5 | `recipient_email` | `text` | sim |  |  | Coluna recipient_email da tabela public.email_bulk_drafts. Tipo PostgreSQL: text. Aceita NULL. |
| 6 | `recipient_name` | `text` | sim |  |  | Coluna recipient_name da tabela public.email_bulk_drafts. Tipo PostgreSQL: text. Aceita NULL. |
| 7 | `subject` | `text` | não | `''::text` |  | Coluna subject da tabela public.email_bulk_drafts. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: ''::text. |
| 8 | `body` | `text` | não | `''::text` |  | Coluna body da tabela public.email_bulk_drafts. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: ''::text. |
| 9 | `personalization_notes` | `text` | sim |  |  | Coluna personalization_notes da tabela public.email_bulk_drafts. Tipo PostgreSQL: text. Aceita NULL. |
| 10 | `approved` | `boolean` | não | `false` |  | Coluna approved da tabela public.email_bulk_drafts. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: false. |
| 11 | `sent_at` | `timestamp with time zone` | sim |  |  | Coluna sent_at da tabela public.email_bulk_drafts. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 12 | `error` | `text` | sim |  |  | Coluna error da tabela public.email_bulk_drafts. Tipo PostgreSQL: text. Aceita NULL. |
| 13 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.email_bulk_drafts. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 14 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.email_bulk_drafts. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 15 | `retry_count` | `integer` | não | `0` |  | Coluna retry_count da tabela public.email_bulk_drafts. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 16 | `next_retry_at` | `timestamp with time zone` | sim |  |  | Coluna next_retry_at da tabela public.email_bulk_drafts. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 17 | `last_error_at` | `timestamp with time zone` | sim |  |  | Coluna last_error_at da tabela public.email_bulk_drafts. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 18 | `last_error_message` | `text` | sim |  |  | Coluna last_error_message da tabela public.email_bulk_drafts. Tipo PostgreSQL: text. Aceita NULL. |
| 19 | `recovered_at` | `timestamp with time zone` | sim |  |  | Coluna recovered_at da tabela public.email_bulk_drafts. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| email_bulk_drafts_job_id_fkey | FOREIGN KEY | `FOREIGN KEY (job_id) REFERENCES email_bulk_jobs(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| email_bulk_drafts_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| email_bulk_drafts_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX email_bulk_drafts_pkey ON public.email_bulk_drafts USING btree (id)` |
| idx_email_bulk_drafts_ever_failed | btree | job_id | não | sim | `(last_error_message IS NOT NULL)` | `CREATE INDEX idx_email_bulk_drafts_ever_failed ON public.email_bulk_drafts USING btree (job_id) WHERE (last_error_message IS NOT NULL)` |
| idx_email_bulk_drafts_job | btree | job_id | não | sim |  | `CREATE INDEX idx_email_bulk_drafts_job ON public.email_bulk_drafts USING btree (job_id)` |
| idx_email_bulk_drafts_job_sent_at | btree | job_id, sent_at | não | sim | `(sent_at IS NOT NULL)` | `CREATE INDEX idx_email_bulk_drafts_job_sent_at ON public.email_bulk_drafts USING btree (job_id, sent_at) WHERE (sent_at IS NOT NULL)` |
| idx_email_bulk_drafts_pending | btree | job_id | não | sim | `(sent_at IS NULL)` | `CREATE INDEX idx_email_bulk_drafts_pending ON public.email_bulk_drafts USING btree (job_id) WHERE (sent_at IS NULL)` |
| idx_email_bulk_drafts_recovered | btree | job_id, recovered_at | não | sim | `(recovered_at IS NOT NULL)` | `CREATE INDEX idx_email_bulk_drafts_recovered ON public.email_bulk_drafts USING btree (job_id, recovered_at) WHERE (recovered_at IS NOT NULL)` |
| idx_email_bulk_drafts_retry | btree | next_retry_at | não | sim | `((sent_at IS NULL) AND (error IS NOT NULL))` | `CREATE INDEX idx_email_bulk_drafts_retry ON public.email_bulk_drafts USING btree (next_retry_at) WHERE ((sent_at IS NULL) AND (error IS NOT NULL))` |
| idx_email_bulk_drafts_sent_email | btree | job_id | não | sim | `(sent_at IS NOT NULL)` | `CREATE INDEX idx_email_bulk_drafts_sent_email ON public.email_bulk_drafts USING btree (job_id, lower(btrim(recipient_email))) WHERE (sent_at IS NOT NULL)` |


## Policies (RLS)

### `draft access via parent job`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM email_bulk_jobs j   WHERE ((j.id = email_bulk_drafts.job_id) AND ((j.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)))))` |
| WITH CHECK |  |

### `draft delete via parent job`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM email_bulk_jobs j   WHERE ((j.id = email_bulk_drafts.job_id) AND ((j.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)))))` |
| WITH CHECK |  |

### `draft insert via parent job`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(EXISTS ( SELECT 1    FROM email_bulk_jobs j   WHERE ((j.id = email_bulk_drafts.job_id) AND ((j.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)))))` |

### `draft update via parent job`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM email_bulk_jobs j   WHERE ((j.id = email_bulk_drafts.job_id) AND ((j.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)))))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_email_bulk_drafts_recovery | BEFORE | UPDATE | ROW | enabled | public.track_bulk_draft_recovery |
| trg_email_bulk_drafts_updated | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

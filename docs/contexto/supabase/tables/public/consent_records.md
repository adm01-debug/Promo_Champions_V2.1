# public.consent_records

> Tabela public.consent_records. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), subject_id uuid NULLABLE, subject_email text NULLABLE, subject_client_id uuid NULLABLE, purpose text NOT NULL, legal_basis text NOT NULL DEFAULT 'consent'::text, source text NULLABLE, granted_at timestamp with time zone NOT NULL DEFAULT now(), revoked_at timestamp with time zone NULLABLE, granted_by uuid NULLABLE, metadata jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: subject_client_id → public.clients(id); subject_id → auth.users(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.consent_records. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `subject_id` | `uuid` | sim |  |  | Coluna subject_id da tabela public.consent_records. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: auth.users(id). Validação CHECK: CHECK (subject_id IS NOT NULL OR subject_email IS NOT NULL OR subject_client_id IS NOT NULL). |
| 3 | `subject_email` | `text` | sim |  |  | Coluna subject_email da tabela public.consent_records. Tipo PostgreSQL: text. Aceita NULL. Validação CHECK: CHECK (subject_id IS NOT NULL OR subject_email IS NOT NULL OR subject_client_id IS NOT NULL). |
| 4 | `subject_client_id` | `uuid` | sim |  |  | Coluna subject_client_id da tabela public.consent_records. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.clients(id). Validação CHECK: CHECK (subject_id IS NOT NULL OR subject_email IS NOT NULL OR subject_client_id IS NOT NULL). |
| 5 | `purpose` | `text` | não |  |  | Coluna purpose da tabela public.consent_records. Tipo PostgreSQL: text. Não aceita NULL. |
| 6 | `legal_basis` | `text` | não | `'consent'::text` |  | Coluna legal_basis da tabela public.consent_records. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'consent'::text. Validação CHECK: CHECK (legal_basis = ANY (ARRAY['consent'::text, 'legitimate_interest'::text, 'contract'::text, 'legal_obligation'::text])). |
| 7 | `source` | `text` | sim |  |  | Coluna source da tabela public.consent_records. Tipo PostgreSQL: text. Aceita NULL. |
| 8 | `granted_at` | `timestamp with time zone` | não | `now()` |  | Coluna granted_at da tabela public.consent_records. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 9 | `revoked_at` | `timestamp with time zone` | sim |  |  | Coluna revoked_at da tabela public.consent_records. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 10 | `granted_by` | `uuid` | sim |  |  | Coluna granted_by da tabela public.consent_records. Tipo PostgreSQL: uuid. Aceita NULL. |
| 11 | `metadata` | `jsonb` | não | `'{}'::jsonb` |  | Coluna metadata da tabela public.consent_records. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '{}'::jsonb. |
| 12 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.consent_records. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 13 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.consent_records. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| consent_records_legal_basis_check | CHECK | `CHECK (legal_basis = ANY (ARRAY['consent'::text, 'legitimate_interest'::text, 'contract'::text, 'legal_obligation'::text]))` |  |  | sim |
| consent_records_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| consent_records_subject_client_id_fkey | FOREIGN KEY | `FOREIGN KEY (subject_client_id) REFERENCES clients(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| consent_records_subject_id_fkey | FOREIGN KEY | `FOREIGN KEY (subject_id) REFERENCES auth.users(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| consent_records_subject_required | CHECK | `CHECK (subject_id IS NOT NULL OR subject_email IS NOT NULL OR subject_client_id IS NOT NULL)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.website_visitor_logs | website_visitor_logs_consent_record_id_fkey | consent_record_id | SET NULL |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| consent_records_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX consent_records_pkey ON public.consent_records USING btree (id)` |
| idx_consent_records_purpose | btree | purpose, revoked_at | não | sim |  | `CREATE INDEX idx_consent_records_purpose ON public.consent_records USING btree (purpose, revoked_at)` |
| idx_consent_records_subject_client_id | btree | subject_client_id | não | sim |  | `CREATE INDEX idx_consent_records_subject_client_id ON public.consent_records USING btree (subject_client_id)` |
| idx_consent_records_subject_email | btree |  | não | sim | `(revoked_at IS NULL)` | `CREATE INDEX idx_consent_records_subject_email ON public.consent_records USING btree (lower(subject_email)) WHERE (revoked_at IS NULL)` |
| idx_consent_records_subject_id | btree | subject_id | não | sim | `(revoked_at IS NULL)` | `CREATE INDEX idx_consent_records_subject_id ON public.consent_records USING btree (subject_id) WHERE (revoked_at IS NULL)` |


## Policies (RLS)

### `Admins gerenciam consent_records`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Titular lê próprio consentimento`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((subject_id = auth.uid()) OR (lower(subject_email) = lower((auth.jwt() ->> 'email'::text))))` |
| WITH CHECK |  |

### `Titular registra próprio consentimento`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `((subject_id = auth.uid()) OR (lower(subject_email) = lower((auth.jwt() ->> 'email'::text))))` |

### `Titular revoga próprio consentimento`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((subject_id = auth.uid()) OR (lower(subject_email) = lower((auth.jwt() ->> 'email'::text))))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| update_consent_records_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

# public.consent_records

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `subject_id` | `uuid` | sim |  |  |  |
| 3 | `subject_email` | `text` | sim |  |  |  |
| 4 | `subject_client_id` | `uuid` | sim |  |  |  |
| 5 | `purpose` | `text` | não |  |  |  |
| 6 | `legal_basis` | `text` | não | `'consent'::text` |  |  |
| 7 | `source` | `text` | sim |  |  |  |
| 8 | `granted_at` | `timestamp with time zone` | não | `now()` |  |  |
| 9 | `revoked_at` | `timestamp with time zone` | sim |  |  |  |
| 10 | `granted_by` | `uuid` | sim |  |  |  |
| 11 | `metadata` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 12 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 13 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


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

_nenhum_

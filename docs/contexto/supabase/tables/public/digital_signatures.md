# public.digital_signatures

> Documentos preparados para assinatura digital e seus estados de assinatura.

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Identificador único do documento de assinatura. |
| 2 | `title` | `text` | não |  |  | Título do documento. |
| 3 | `description` | `text` | sim |  |  | Descrição do documento. |
| 4 | `status` | `text` | não | `'draft'::text` |  | Estado do documento: draft, pending, signed, rejected ou expired. |
| 5 | `file_url` | `text` | sim |  |  | URL do arquivo associado ao documento, quando disponível. |
| 6 | `created_by` | `uuid` | sim |  |  | Vendedor que criou o documento, quando identificado. |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  | Data e hora de criação do documento. |
| 8 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Data e hora da última atualização do documento. |
| 9 | `expires_at` | `timestamp with time zone` | sim |  |  | Data e hora de expiração do documento, quando configurada. |
| 10 | `signed_at` | `timestamp with time zone` | sim |  |  | Data e hora em que o documento foi assinado. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| digital_signatures_created_by_fkey | FOREIGN KEY | `FOREIGN KEY (created_by) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| digital_signatures_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| digital_signatures_status_check | CHECK | `CHECK (status = ANY (ARRAY['draft'::text, 'pending'::text, 'signed'::text, 'rejected'::text, 'expired'::text]))` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.document_signers | document_signers_document_id_fkey | document_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| digital_signatures_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX digital_signatures_pkey ON public.digital_signatures USING btree (id)` |
| idx_digital_signatures_created_by | btree | created_by | não | sim |  | `CREATE INDEX idx_digital_signatures_created_by ON public.digital_signatures USING btree (created_by)` |
| idx_digital_signatures_status | btree | status | não | sim |  | `CREATE INDEX idx_digital_signatures_status ON public.digital_signatures USING btree (status)` |


## Policies (RLS)

### `Admins and managers can delete digital_signatures`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Users can insert own digital_signatures`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `((created_by = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |

### `Users can read own digital_signatures`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((created_by = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `Users can update own digital_signatures`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((created_by = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_digital_signatures_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

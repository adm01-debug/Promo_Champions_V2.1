# public.document_signers

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
| 2 | `document_id` | `uuid` | não |  |  |  |
| 3 | `name` | `text` | não |  |  |  |
| 4 | `email` | `text` | não |  |  |  |
| 5 | `status` | `text` | não | `'pending'::text` |  |  |
| 6 | `signed_at` | `timestamp with time zone` | sim |  |  |  |
| 7 | `sign_order` | `integer` | sim | `1` |  |  |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| document_signers_document_id_fkey | FOREIGN KEY | `FOREIGN KEY (document_id) REFERENCES digital_signatures(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| document_signers_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| document_signers_status_check | CHECK | `CHECK (status = ANY (ARRAY['pending'::text, 'signed'::text, 'rejected'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| document_signers_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX document_signers_pkey ON public.document_signers USING btree (id)` |
| idx_document_signers_document | btree | document_id | não | sim |  | `CREATE INDEX idx_document_signers_document ON public.document_signers USING btree (document_id)` |
| idx_document_signers_email | btree | email | não | sim |  | `CREATE INDEX idx_document_signers_email ON public.document_signers USING btree (email)` |


## Policies (RLS)

### `Admins and managers can delete document_signers`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Authenticated users can insert document_signers`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `((document_id IN ( SELECT digital_signatures.id    FROM digital_signatures   WHERE (digital_signatures.created_by = get_current_salesperson_id()))) OR is_admin_or_manager(auth.uid()))` |

### `Authenticated users can update document_signers`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((document_id IN ( SELECT digital_signatures.id    FROM digital_signatures   WHERE (digital_signatures.created_by = get_current_salesperson_id()))) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `Users can read own document_signers`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((document_id IN ( SELECT digital_signatures.id    FROM digital_signatures   WHERE (digital_signatures.created_by = get_current_salesperson_id()))) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_

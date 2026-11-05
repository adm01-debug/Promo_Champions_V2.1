# public.approval_requests

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 3 |
| realtime (publication) | sim |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `workflow_id` | `uuid` | não |  |  |  |
| 3 | `requester_id` | `uuid` | não |  |  |  |
| 4 | `deal_id` | `uuid` | sim |  |  |  |
| 5 | `deal_name` | `text` | sim |  |  |  |
| 6 | `requested_value` | `numeric(12,2)` | não |  |  |  |
| 7 | `original_value` | `numeric(12,2)` | sim |  |  |  |
| 8 | `discount_percentage` | `numeric(5,2)` | sim |  |  |  |
| 9 | `justification` | `text` | sim |  |  |  |
| 10 | `status` | `text` | não | `'pending'::text` |  |  |
| 11 | `current_level` | `integer` | não | `1` |  |  |
| 12 | `expires_at` | `timestamp with time zone` | sim |  |  |  |
| 13 | `resolved_at` | `timestamp with time zone` | sim |  |  |  |
| 14 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 15 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| approval_requests_deal_id_fkey | FOREIGN KEY | `FOREIGN KEY (deal_id) REFERENCES sales(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| approval_requests_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| approval_requests_requester_id_fkey | FOREIGN KEY | `FOREIGN KEY (requester_id) REFERENCES auth.users(id)` | NO ACTION | NO ACTION | sim |
| approval_requests_status_check | CHECK | `CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'expired'::text, 'cancelled'::text]))` |  |  | sim |
| approval_requests_workflow_id_fkey | FOREIGN KEY | `FOREIGN KEY (workflow_id) REFERENCES approval_workflows(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.approval_decisions | approval_decisions_request_id_fkey | request_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| approval_requests_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX approval_requests_pkey ON public.approval_requests USING btree (id)` |
| idx_approval_requests_deal_id | btree | deal_id | não | sim |  | `CREATE INDEX idx_approval_requests_deal_id ON public.approval_requests USING btree (deal_id)` |
| idx_approval_requests_requester_id | btree | requester_id | não | sim |  | `CREATE INDEX idx_approval_requests_requester_id ON public.approval_requests USING btree (requester_id)` |
| idx_approval_requests_workflow_id | btree | workflow_id | não | sim |  | `CREATE INDEX idx_approval_requests_workflow_id ON public.approval_requests USING btree (workflow_id)` |


## Policies (RLS)

### `Admins and managers can update requests`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Users can create requests`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(requester_id = auth.uid())` |

### `Users can view own requests`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((requester_id = auth.uid()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_approval_requests_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_

# public.commercial_approval_requests

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 5 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `requester_id` | `uuid` | sim |  |  |  |
| 3 | `type` | `text` | não |  |  |  |
| 4 | `entity_id` | `uuid` | sim |  |  |  |
| 5 | `competence_month` | `date` | não |  |  |  |
| 6 | `new_values` | `jsonb` | não |  |  |  |
| 7 | `old_values` | `jsonb` | sim |  |  |  |
| 8 | `status` | `text` | não | `'pending'::text` |  |  |
| 9 | `approver_id` | `uuid` | sim |  |  |  |
| 10 | `justification` | `text` | sim |  |  |  |
| 11 | `created_at` | `timestamp with time zone` | sim | `now()` |  |  |
| 12 | `updated_at` | `timestamp with time zone` | sim | `now()` |  |  |
| 13 | `effective_at` | `timestamp with time zone` | sim |  |  | When the approved change should actually take effect in the system. |
| 14 | `approved_at` | `timestamp with time zone` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| commercial_approval_requests_approver_id_fkey | FOREIGN KEY | `FOREIGN KEY (approver_id) REFERENCES auth.users(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| commercial_approval_requests_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| commercial_approval_requests_requester_id_fkey | FOREIGN KEY | `FOREIGN KEY (requester_id) REFERENCES auth.users(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| commercial_approval_requests_status_check | CHECK | `CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text]))` |  |  | sim |
| commercial_approval_requests_type_check | CHECK | `CHECK (type = ANY (ARRAY['goal'::text, 'scoring_rule'::text, 'commission'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| commercial_approval_requests_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX commercial_approval_requests_pkey ON public.commercial_approval_requests USING btree (id)` |
| idx_commercial_approval_requests_approver_id | btree | approver_id | não | sim |  | `CREATE INDEX idx_commercial_approval_requests_approver_id ON public.commercial_approval_requests USING btree (approver_id)` |
| idx_commercial_approval_requests_requester_id | btree | requester_id | não | sim |  | `CREATE INDEX idx_commercial_approval_requests_requester_id ON public.commercial_approval_requests USING btree (requester_id)` |


## Policies (RLS)

### `Criar solicitações`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(auth.uid() = requester_id)` |

### `Only admins and managers can update approval requests`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Users can create approval requests`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(auth.uid() = requester_id)` |

### `Users can view their own approval requests`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((auth.uid() = requester_id) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `Ver solicitações`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_commercial_approvals_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

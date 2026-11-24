# public.commercial_approval_requests

> Tabela public.commercial_approval_requests. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), requester_id uuid NULLABLE, type text NOT NULL, entity_id uuid NULLABLE, competence_month date NOT NULL, new_values jsonb NOT NULL, old_values jsonb NULLABLE, status text NOT NULL DEFAULT 'pending'::text, approver_id uuid NULLABLE, justification text NULLABLE, created_at timestamp with time zone NULLABLE DEFAULT now(), updated_at timestamp with time zone NULLABLE DEFAULT now(), effective_at timestamp with time zone NULLABLE, approved_at timestamp with time zone NULLABLE. Relacionamentos FK: approver_id → auth.users(id); requester_id → auth.users(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.commercial_approval_requests. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `requester_id` | `uuid` | sim |  |  | Coluna requester_id da tabela public.commercial_approval_requests. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: auth.users(id). |
| 3 | `type` | `text` | não |  |  | Coluna type da tabela public.commercial_approval_requests. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (type = ANY (ARRAY['goal'::text, 'scoring_rule'::text, 'commission'::text])). |
| 4 | `entity_id` | `uuid` | sim |  |  | Coluna entity_id da tabela public.commercial_approval_requests. Tipo PostgreSQL: uuid. Aceita NULL. |
| 5 | `competence_month` | `date` | não |  |  | Coluna competence_month da tabela public.commercial_approval_requests. Tipo PostgreSQL: date. Não aceita NULL. |
| 6 | `new_values` | `jsonb` | não |  |  | Coluna new_values da tabela public.commercial_approval_requests. Tipo PostgreSQL: jsonb. Não aceita NULL. |
| 7 | `old_values` | `jsonb` | sim |  |  | Coluna old_values da tabela public.commercial_approval_requests. Tipo PostgreSQL: jsonb. Aceita NULL. |
| 8 | `status` | `text` | não | `'pending'::text` |  | Coluna status da tabela public.commercial_approval_requests. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'pending'::text. Validação CHECK: CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])). |
| 9 | `approver_id` | `uuid` | sim |  |  | Coluna approver_id da tabela public.commercial_approval_requests. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: auth.users(id). |
| 10 | `justification` | `text` | sim |  |  | Coluna justification da tabela public.commercial_approval_requests. Tipo PostgreSQL: text. Aceita NULL. |
| 11 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Coluna created_at da tabela public.commercial_approval_requests. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |
| 12 | `updated_at` | `timestamp with time zone` | sim | `now()` |  | Coluna updated_at da tabela public.commercial_approval_requests. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |
| 13 | `effective_at` | `timestamp with time zone` | sim |  |  | When the approved change should actually take effect in the system. |
| 14 | `approved_at` | `timestamp with time zone` | sim |  |  | Coluna approved_at da tabela public.commercial_approval_requests. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |


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

# public.approval_requests

> Tabela public.approval_requests. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), workflow_id uuid NOT NULL, requester_id uuid NOT NULL, deal_id uuid NULLABLE, deal_name text NULLABLE, requested_value numeric(12,2) NOT NULL, original_value numeric(12,2) NULLABLE, discount_percentage numeric(5,2) NULLABLE, justification text NULLABLE, status text NOT NULL DEFAULT 'pending'::text, current_level integer NOT NULL DEFAULT 1, expires_at timestamp with time zone NULLABLE, resolved_at timestamp with time zone NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: deal_id → public.sales(id); requester_id → auth.users(id); workflow_id → public.approval_workflows(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.approval_requests. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `workflow_id` | `uuid` | não |  |  | Coluna workflow_id da tabela public.approval_requests. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.approval_workflows(id). |
| 3 | `requester_id` | `uuid` | não |  |  | Coluna requester_id da tabela public.approval_requests. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: auth.users(id). |
| 4 | `deal_id` | `uuid` | sim |  |  | Coluna deal_id da tabela public.approval_requests. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.sales(id). |
| 5 | `deal_name` | `text` | sim |  |  | Coluna deal_name da tabela public.approval_requests. Tipo PostgreSQL: text. Aceita NULL. |
| 6 | `requested_value` | `numeric(12,2)` | não |  |  | Coluna requested_value da tabela public.approval_requests. Tipo PostgreSQL: numeric(12,2). Não aceita NULL. |
| 7 | `original_value` | `numeric(12,2)` | sim |  |  | Coluna original_value da tabela public.approval_requests. Tipo PostgreSQL: numeric(12,2). Aceita NULL. |
| 8 | `discount_percentage` | `numeric(5,2)` | sim |  |  | Coluna discount_percentage da tabela public.approval_requests. Tipo PostgreSQL: numeric(5,2). Aceita NULL. |
| 9 | `justification` | `text` | sim |  |  | Coluna justification da tabela public.approval_requests. Tipo PostgreSQL: text. Aceita NULL. |
| 10 | `status` | `text` | não | `'pending'::text` |  | Coluna status da tabela public.approval_requests. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'pending'::text. Validação CHECK: CHECK (status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'expired'::text, 'cancelled'::text])). |
| 11 | `current_level` | `integer` | não | `1` |  | Coluna current_level da tabela public.approval_requests. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 1. |
| 12 | `expires_at` | `timestamp with time zone` | sim |  |  | Coluna expires_at da tabela public.approval_requests. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 13 | `resolved_at` | `timestamp with time zone` | sim |  |  | Coluna resolved_at da tabela public.approval_requests. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 14 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.approval_requests. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 15 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.approval_requests. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


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

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

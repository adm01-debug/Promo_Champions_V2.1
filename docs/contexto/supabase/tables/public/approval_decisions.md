# public.approval_decisions

> Tabela public.approval_decisions. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), request_id uuid NOT NULL, approver_id uuid NOT NULL, decision text NOT NULL, comments text NULLABLE, level integer NOT NULL DEFAULT 1, decided_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: approver_id → auth.users(id); request_id → public.approval_requests(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 2 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.approval_decisions. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `request_id` | `uuid` | não |  |  | Coluna request_id da tabela public.approval_decisions. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.approval_requests(id). |
| 3 | `approver_id` | `uuid` | não |  |  | Coluna approver_id da tabela public.approval_decisions. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: auth.users(id). |
| 4 | `decision` | `text` | não |  |  | Coluna decision da tabela public.approval_decisions. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (decision = ANY (ARRAY['approved'::text, 'rejected'::text])). |
| 5 | `comments` | `text` | sim |  |  | Coluna comments da tabela public.approval_decisions. Tipo PostgreSQL: text. Aceita NULL. |
| 6 | `level` | `integer` | não | `1` |  | Coluna level da tabela public.approval_decisions. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 1. |
| 7 | `decided_at` | `timestamp with time zone` | não | `now()` |  | Coluna decided_at da tabela public.approval_decisions. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| approval_decisions_approver_id_fkey | FOREIGN KEY | `FOREIGN KEY (approver_id) REFERENCES auth.users(id) ON DELETE RESTRICT` | RESTRICT | NO ACTION | sim |
| approval_decisions_decision_check | CHECK | `CHECK (decision = ANY (ARRAY['approved'::text, 'rejected'::text]))` |  |  | sim |
| approval_decisions_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| approval_decisions_request_id_fkey | FOREIGN KEY | `FOREIGN KEY (request_id) REFERENCES approval_requests(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| approval_decisions_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX approval_decisions_pkey ON public.approval_decisions USING btree (id)` |
| idx_approval_decisions_approver_id | btree | approver_id | não | sim |  | `CREATE INDEX idx_approval_decisions_approver_id ON public.approval_decisions USING btree (approver_id)` |
| idx_approval_decisions_request_id | btree | request_id | não | sim |  | `CREATE INDEX idx_approval_decisions_request_id ON public.approval_decisions USING btree (request_id)` |


## Policies (RLS)

### `Admins and managers can create decisions`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(is_admin_or_manager(auth.uid()) AND (approver_id = auth.uid()))` |

### `Users can view decisions on their requests`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(EXISTS ( SELECT 1    FROM approval_requests ar   WHERE ((ar.id = approval_decisions.request_id) AND ((ar.requester_id = auth.uid()) OR is_admin_or_manager(auth.uid())))))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

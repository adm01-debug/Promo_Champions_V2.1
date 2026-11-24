# public.approval_workflows

> Tabela public.approval_workflows. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), name text NOT NULL, workflow_type text NOT NULL DEFAULT 'discount'::text, description text NULLABLE, threshold_amount numeric(12,2) NULLABLE, threshold_percentage numeric(5,2) NULLABLE, required_approvers integer NOT NULL DEFAULT 1, auto_approve_below numeric(12,2) NULLABLE, is_active boolean NOT NULL DEFAULT true, created_by uuid NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), min_mrr_threshold numeric(15,2) NULLABLE, auto_approve_below_discount numeric(5,2) NULLABLE. Relacionamentos FK: created_by → auth.users(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.approval_workflows. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `name` | `text` | não |  |  | Coluna name da tabela public.approval_workflows. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `workflow_type` | `text` | não | `'discount'::text` |  | Coluna workflow_type da tabela public.approval_workflows. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'discount'::text. Validação CHECK: CHECK (workflow_type = ANY (ARRAY['discount'::text, 'proposal'::text, 'exception'::text, 'refund'::text])). |
| 4 | `description` | `text` | sim |  |  | Coluna description da tabela public.approval_workflows. Tipo PostgreSQL: text. Aceita NULL. |
| 5 | `threshold_amount` | `numeric(12,2)` | sim |  |  | Coluna threshold_amount da tabela public.approval_workflows. Tipo PostgreSQL: numeric(12,2). Aceita NULL. |
| 6 | `threshold_percentage` | `numeric(5,2)` | sim |  |  | Coluna threshold_percentage da tabela public.approval_workflows. Tipo PostgreSQL: numeric(5,2). Aceita NULL. |
| 7 | `required_approvers` | `integer` | não | `1` |  | Coluna required_approvers da tabela public.approval_workflows. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 1. |
| 8 | `auto_approve_below` | `numeric(12,2)` | sim |  |  | Coluna auto_approve_below da tabela public.approval_workflows. Tipo PostgreSQL: numeric(12,2). Aceita NULL. |
| 9 | `is_active` | `boolean` | não | `true` |  | Coluna is_active da tabela public.approval_workflows. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: true. |
| 10 | `created_by` | `uuid` | sim |  |  | Coluna created_by da tabela public.approval_workflows. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: auth.users(id). |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.approval_workflows. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 12 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.approval_workflows. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 13 | `min_mrr_threshold` | `numeric(15,2)` | sim |  |  | Coluna min_mrr_threshold da tabela public.approval_workflows. Tipo PostgreSQL: numeric(15,2). Aceita NULL. |
| 14 | `auto_approve_below_discount` | `numeric(5,2)` | sim |  |  | Coluna auto_approve_below_discount da tabela public.approval_workflows. Tipo PostgreSQL: numeric(5,2). Aceita NULL. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| approval_workflows_created_by_fkey | FOREIGN KEY | `FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| approval_workflows_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| approval_workflows_workflow_type_check | CHECK | `CHECK (workflow_type = ANY (ARRAY['discount'::text, 'proposal'::text, 'exception'::text, 'refund'::text]))` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.approval_requests | approval_requests_workflow_id_fkey | workflow_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| approval_workflows_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX approval_workflows_pkey ON public.approval_workflows USING btree (id)` |
| idx_approval_workflows_created_by | btree | created_by | não | sim |  | `CREATE INDEX idx_approval_workflows_created_by ON public.approval_workflows USING btree (created_by)` |


## Policies (RLS)

### `Admins and managers can manage workflows`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Authenticated users can view active workflows`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(is_active = true)` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_approval_workflows_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

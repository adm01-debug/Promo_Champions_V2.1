# public.approval_workflows

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `name` | `text` | não |  |  |  |
| 3 | `workflow_type` | `text` | não | `'discount'::text` |  |  |
| 4 | `description` | `text` | sim |  |  |  |
| 5 | `threshold_amount` | `numeric(12,2)` | sim |  |  |  |
| 6 | `threshold_percentage` | `numeric(5,2)` | sim |  |  |  |
| 7 | `required_approvers` | `integer` | não | `1` |  |  |
| 8 | `auto_approve_below` | `numeric(12,2)` | sim |  |  |  |
| 9 | `is_active` | `boolean` | não | `true` |  |  |
| 10 | `created_by` | `uuid` | sim |  |  |  |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 12 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 13 | `min_mrr_threshold` | `numeric(15,2)` | sim |  |  |  |
| 14 | `auto_approve_below_discount` | `numeric(5,2)` | sim |  |  |  |


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

_nenhum_

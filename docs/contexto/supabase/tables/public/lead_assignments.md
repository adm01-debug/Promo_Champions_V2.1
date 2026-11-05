# public.lead_assignments

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
| 2 | `sale_id` | `uuid` | não |  |  |  |
| 3 | `salesperson_id` | `uuid` | não |  |  |  |
| 4 | `rule_id` | `uuid` | sim |  |  |  |
| 5 | `strategy_used` | `text` | não |  |  |  |
| 6 | `assigned_at` | `timestamp with time zone` | não | `now()` |  |  |
| 7 | `metadata` | `jsonb` | sim | `'{}'::jsonb` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| lead_assignments_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| lead_assignments_rule_id_fkey | FOREIGN KEY | `FOREIGN KEY (rule_id) REFERENCES lead_routing_rules(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| lead_assignments_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| lead_assignments_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_lead_assignments_at | btree | assigned_at | não | sim |  | `CREATE INDEX idx_lead_assignments_at ON public.lead_assignments USING btree (assigned_at DESC)` |
| idx_lead_assignments_rule_id | btree | rule_id | não | sim |  | `CREATE INDEX idx_lead_assignments_rule_id ON public.lead_assignments USING btree (rule_id)` |
| idx_lead_assignments_sale | btree | sale_id | não | sim |  | `CREATE INDEX idx_lead_assignments_sale ON public.lead_assignments USING btree (sale_id)` |
| idx_lead_assignments_sp | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_lead_assignments_sp ON public.lead_assignments USING btree (salesperson_id)` |
| lead_assignments_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX lead_assignments_pkey ON public.lead_assignments USING btree (id)` |


## Policies (RLS)

### `Admin/manager manage assignments`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `View own assignments`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(is_admin_or_manager(auth.uid()) OR (salesperson_id = get_current_salesperson_id()))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_

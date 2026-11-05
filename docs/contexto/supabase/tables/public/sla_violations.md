# public.sla_violations

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
| 3 | `policy_id` | `uuid` | sim |  |  |  |
| 4 | `stage` | `text` | não |  |  |  |
| 5 | `hours_in_stage` | `numeric(10,2)` | não | `0` |  |  |
| 6 | `status` | `text` | não | `'warning'::text` |  |  |
| 7 | `detected_at` | `timestamp with time zone` | não | `now()` |  |  |
| 8 | `resolved_at` | `timestamp with time zone` | sim |  |  |  |
| 9 | `metadata` | `jsonb` | sim | `'{}'::jsonb` |  |  |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 11 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| sla_violations_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| sla_violations_policy_id_fkey | FOREIGN KEY | `FOREIGN KEY (policy_id) REFERENCES sla_policies(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| sla_violations_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_sla_violations_detected | btree | detected_at | não | sim |  | `CREATE INDEX idx_sla_violations_detected ON public.sla_violations USING btree (detected_at DESC)` |
| idx_sla_violations_policy_id | btree | policy_id | não | sim |  | `CREATE INDEX idx_sla_violations_policy_id ON public.sla_violations USING btree (policy_id)` |
| idx_sla_violations_sale_id | btree | sale_id | não | sim |  | `CREATE INDEX idx_sla_violations_sale_id ON public.sla_violations USING btree (sale_id)` |
| idx_sla_violations_status | btree | status | não | sim |  | `CREATE INDEX idx_sla_violations_status ON public.sla_violations USING btree (status)` |
| sla_violations_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX sla_violations_pkey ON public.sla_violations USING btree (id)` |


## Policies (RLS)

### `Admin/manager manage violations`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Salespeople view own violations`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM sales s   WHERE ((s.id = sla_violations.sale_id) AND (s.salesperson_id = get_current_salesperson_id())))))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_sla_violations_updated | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_

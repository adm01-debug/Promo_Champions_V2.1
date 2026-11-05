# public.qbr_schedule

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
| 2 | `account_id` | `uuid` | não |  |  |  |
| 3 | `frequency` | `qbr_frequency` | não | `'quarterly'::qbr_frequency` |  |  |
| 4 | `next_qbr_at` | `date` | sim |  |  |  |
| 5 | `last_qbr_at` | `date` | sim |  |  |  |
| 6 | `owner_salesperson_id` | `uuid` | sim |  |  |  |
| 7 | `auto_generate` | `boolean` | não | `true` |  |  |
| 8 | `is_active` | `boolean` | não | `true` |  |  |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 10 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| qbr_schedule_account_id_fkey | FOREIGN KEY | `FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| qbr_schedule_owner_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (owner_salesperson_id) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| qbr_schedule_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_qbr_schedule_account | btree | account_id | não | sim |  | `CREATE INDEX idx_qbr_schedule_account ON public.qbr_schedule USING btree (account_id)` |
| idx_qbr_schedule_next | btree | next_qbr_at | não | sim |  | `CREATE INDEX idx_qbr_schedule_next ON public.qbr_schedule USING btree (next_qbr_at)` |
| idx_qbr_schedule_owner_salesperson_id | btree | owner_salesperson_id | não | sim |  | `CREATE INDEX idx_qbr_schedule_owner_salesperson_id ON public.qbr_schedule USING btree (owner_salesperson_id)` |
| qbr_schedule_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX qbr_schedule_pkey ON public.qbr_schedule USING btree (id)` |


## Policies (RLS)

### `cs_qbr_modify`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `cs_qbr_select`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(is_admin_or_manager(auth.uid()) OR (owner_salesperson_id = get_current_salesperson_id()) OR (EXISTS ( SELECT 1    FROM accounts a   WHERE ((a.id = qbr_schedule.account_id) AND (a.owner_id = get_current_salesperson_id())))))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_qbr_schedule_uat | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_

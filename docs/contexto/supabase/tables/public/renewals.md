# public.renewals

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
| 3 | `contract_value` | `numeric(14,2)` | não | `0` |  |  |
| 4 | `currency` | `text` | não | `'BRL'::text` |  |  |
| 5 | `renewal_date` | `date` | não |  |  |  |
| 6 | `notice_period_days` | `integer` | não | `30` |  |  |
| 7 | `auto_renew` | `boolean` | não | `false` |  |  |
| 8 | `status` | `renewal_status` | não | `'upcoming'::renewal_status` |  |  |
| 9 | `owner_salesperson_id` | `uuid` | sim |  |  |  |
| 10 | `notes` | `text` | sim |  |  |  |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 12 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| renewals_account_id_fkey | FOREIGN KEY | `FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| renewals_owner_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (owner_salesperson_id) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| renewals_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_renewals_account | btree | account_id | não | sim |  | `CREATE INDEX idx_renewals_account ON public.renewals USING btree (account_id)` |
| idx_renewals_date | btree | renewal_date | não | sim |  | `CREATE INDEX idx_renewals_date ON public.renewals USING btree (renewal_date)` |
| idx_renewals_owner_salesperson_id | btree | owner_salesperson_id | não | sim |  | `CREATE INDEX idx_renewals_owner_salesperson_id ON public.renewals USING btree (owner_salesperson_id)` |
| idx_renewals_status | btree | status | não | sim |  | `CREATE INDEX idx_renewals_status ON public.renewals USING btree (status)` |
| renewals_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX renewals_pkey ON public.renewals USING btree (id)` |


## Policies (RLS)

### `cs_rn_modify`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `cs_rn_select`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(is_admin_or_manager(auth.uid()) OR (owner_salesperson_id = get_current_salesperson_id()) OR (EXISTS ( SELECT 1    FROM accounts a   WHERE ((a.id = renewals.account_id) AND (a.owner_id = get_current_salesperson_id())))))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_renewals_uat | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

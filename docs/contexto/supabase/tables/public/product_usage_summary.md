# public.product_usage_summary

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
| 1 | `account_id` | `uuid` | não |  |  |  |
| 2 | `dau` | `integer` | não | `0` |  |  |
| 3 | `wau` | `integer` | não | `0` |  |  |
| 4 | `mau` | `integer` | não | `0` |  |  |
| 5 | `last_login_at` | `timestamp with time zone` | sim |  |  |  |
| 6 | `top_features` | `jsonb` | não | `'[]'::jsonb` |  |  |
| 7 | `adoption_score` | `integer` | não | `0` |  |  |
| 8 | `computed_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| product_usage_summary_account_id_fkey | FOREIGN KEY | `FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| product_usage_summary_pkey | PRIMARY KEY | `PRIMARY KEY (account_id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| product_usage_summary_pkey | btree | account_id | sim | sim |  | `CREATE UNIQUE INDEX product_usage_summary_pkey ON public.product_usage_summary USING btree (account_id)` |


## Policies (RLS)

### `cs_pus_modify`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `cs_pus_select`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM accounts a   WHERE ((a.id = product_usage_summary.account_id) AND (a.owner_id = get_current_salesperson_id())))))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

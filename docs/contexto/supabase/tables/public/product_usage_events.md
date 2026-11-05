# public.product_usage_events

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
| 3 | `user_email` | `text` | sim |  |  |  |
| 4 | `feature_key` | `text` | não |  |  |  |
| 5 | `event_type` | `text` | não | `'feature_use'::text` |  |  |
| 6 | `occurred_at` | `timestamp with time zone` | não | `now()` |  |  |
| 7 | `metadata` | `jsonb` | não | `'{}'::jsonb` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| product_usage_events_account_id_fkey | FOREIGN KEY | `FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| product_usage_events_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_pue_account_time | btree | account_id, occurred_at | não | sim |  | `CREATE INDEX idx_pue_account_time ON public.product_usage_events USING btree (account_id, occurred_at DESC)` |
| idx_pue_feature | btree | feature_key | não | sim |  | `CREATE INDEX idx_pue_feature ON public.product_usage_events USING btree (feature_key)` |
| product_usage_events_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX product_usage_events_pkey ON public.product_usage_events USING btree (id)` |


## Policies (RLS)

### `cs_pue_insert`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `cs_pue_select`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(is_admin_or_manager(auth.uid()) OR (EXISTS ( SELECT 1    FROM accounts a   WHERE ((a.id = product_usage_events.account_id) AND (a.owner_id = get_current_salesperson_id())))))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_

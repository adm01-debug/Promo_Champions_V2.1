# public.sales_territories

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `territory_name` | `text` | não |  |  |  |
| 3 | `territory_type` | `text` | não | `'segment'::text` |  |  |
| 4 | `current_owner_id` | `uuid` | sim |  |  |  |
| 5 | `total_revenue` | `numeric` | não | `0` |  |  |
| 6 | `total_deals` | `integer` | não | `0` |  |  |
| 7 | `conquered_at` | `timestamp with time zone` | sim |  |  |  |
| 8 | `is_contested` | `boolean` | não | `false` |  |  |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 10 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| sales_territories_current_owner_id_fkey | FOREIGN KEY | `FOREIGN KEY (current_owner_id) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| sales_territories_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| sales_territories_territory_type_check | CHECK | `CHECK (territory_type = ANY (ARRAY['segment'::text, 'region'::text, 'product'::text, 'niche'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_sales_territories_current_owner_id | btree | current_owner_id | não | sim |  | `CREATE INDEX idx_sales_territories_current_owner_id ON public.sales_territories USING btree (current_owner_id)` |
| sales_territories_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX sales_territories_pkey ON public.sales_territories USING btree (id)` |


## Policies (RLS)

### `Admins can insert territories`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Admins can update territories`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Auth users can read territories`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

# public.demand_forecasts

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 4 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `product_id` | `uuid` | sim |  |  |  |
| 3 | `forecast_date` | `date` | não |  |  |  |
| 4 | `predicted_quantity` | `integer` | não | `0` |  |  |
| 5 | `predicted_revenue` | `numeric(12,2)` | não | `0` |  |  |
| 6 | `confidence_score` | `numeric(5,2)` | sim | `0.80` |  |  |
| 7 | `factors` | `jsonb` | sim | `'{}'::jsonb` |  |  |
| 8 | `model_version` | `text` | sim | `'v1'::text` |  |  |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 10 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| demand_forecasts_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| demand_forecasts_product_id_fkey | FOREIGN KEY | `FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| demand_forecasts_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX demand_forecasts_pkey ON public.demand_forecasts USING btree (id)` |
| idx_demand_forecasts_date | btree | forecast_date | não | sim |  | `CREATE INDEX idx_demand_forecasts_date ON public.demand_forecasts USING btree (forecast_date)` |
| idx_demand_forecasts_product_id | btree | product_id | não | sim |  | `CREATE INDEX idx_demand_forecasts_product_id ON public.demand_forecasts USING btree (product_id)` |


## Policies (RLS)

### `Admins and managers can delete demand forecasts`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Admins and managers can insert demand forecasts`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Admins and managers can update demand forecasts`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Authenticated users can view demand forecasts`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_authenticated()` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_demand_forecasts_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_

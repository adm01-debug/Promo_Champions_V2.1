# public.sales_goals

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
| usada por views | public.revenue_forecast_view |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `salesperson_id` | `uuid` | não |  |  |  |
| 3 | `month` | `date` | não |  |  |  |
| 4 | `goal_amount` | `numeric(12,2)` | não | `0` |  |  |
| 5 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| sales_goals_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| sales_goals_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE RESTRICT` | RESTRICT | NO ACTION | sim |
| sales_goals_salesperson_id_month_key | UNIQUE | `UNIQUE (salesperson_id, month)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_sales_goals_month | btree | month | não | sim |  | `CREATE INDEX idx_sales_goals_month ON public.sales_goals USING btree (month)` |
| idx_sales_goals_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_sales_goals_salesperson_id ON public.sales_goals USING btree (salesperson_id)` |
| idx_sales_goals_sp_month | btree | salesperson_id, month | não | sim |  | `CREATE INDEX idx_sales_goals_sp_month ON public.sales_goals USING btree (salesperson_id, month)` |
| sales_goals_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX sales_goals_pkey ON public.sales_goals USING btree (id)` |
| sales_goals_salesperson_id_month_key | btree | salesperson_id, month | sim | sim |  | `CREATE UNIQUE INDEX sales_goals_salesperson_id_month_key ON public.sales_goals USING btree (salesperson_id, month)` |


## Policies (RLS)

### `Admins can delete goals`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Admins can insert goals`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Admins can update goals`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Users can read own goals or admins all`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_

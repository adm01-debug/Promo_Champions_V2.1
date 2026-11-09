# public.daily_metrics

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
| 2 | `date` | `date` | não |  |  |  |
| 3 | `revenue` | `numeric(12,2)` | não | `0` |  |  |
| 4 | `revenue_goal` | `numeric(12,2)` | não | `0` |  |  |
| 5 | `new_clients` | `integer` | não | `0` |  |  |
| 6 | `total_sales` | `integer` | não | `0` |  |  |
| 7 | `conversion_rate` | `numeric(5,2)` | não | `0` |  |  |
| 8 | `avg_ticket` | `numeric(12,2)` | não | `0` |  |  |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| daily_metrics_date_key | UNIQUE | `UNIQUE (date)` |  |  | sim |
| daily_metrics_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| daily_metrics_date_key | btree | date | sim | sim |  | `CREATE UNIQUE INDEX daily_metrics_date_key ON public.daily_metrics USING btree (date)` |
| daily_metrics_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX daily_metrics_pkey ON public.daily_metrics USING btree (id)` |
| idx_daily_metrics_date | btree | date | não | sim |  | `CREATE INDEX idx_daily_metrics_date ON public.daily_metrics USING btree (date DESC)` |


## Policies (RLS)

### `Admin and managers can read daily_metrics`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Admins and managers can delete daily_metrics`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Admins and managers can insert daily_metrics`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Admins and managers can update daily_metrics`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

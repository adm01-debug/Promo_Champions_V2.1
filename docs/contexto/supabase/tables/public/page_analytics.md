# public.page_analytics

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 3 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `salesperson_id` | `uuid` | sim |  |  |  |
| 3 | `route` | `text` | não |  |  |  |
| 4 | `page_title` | `text` | sim |  |  |  |
| 5 | `duration_seconds` | `integer` | sim | `0` |  |  |
| 6 | `interactions` | `integer` | sim | `0` |  |  |
| 7 | `session_id` | `text` | sim |  |  |  |
| 8 | `device_type` | `text` | sim | `'desktop'::text` |  |  |
| 9 | `referrer_route` | `text` | sim |  |  |  |
| 10 | `entered_at` | `timestamp with time zone` | não | `now()` |  |  |
| 11 | `exited_at` | `timestamp with time zone` | sim |  |  |  |
| 12 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| page_analytics_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| page_analytics_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_page_analytics_entered | btree | entered_at | não | sim |  | `CREATE INDEX idx_page_analytics_entered ON public.page_analytics USING btree (entered_at DESC)` |
| idx_page_analytics_route | btree | route | não | sim |  | `CREATE INDEX idx_page_analytics_route ON public.page_analytics USING btree (route)` |
| idx_page_analytics_salesperson | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_page_analytics_salesperson ON public.page_analytics USING btree (salesperson_id)` |
| idx_page_analytics_salesperson_route | btree | salesperson_id, route, entered_at | não | sim |  | `CREATE INDEX idx_page_analytics_salesperson_route ON public.page_analytics USING btree (salesperson_id, route, entered_at DESC)` |
| page_analytics_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX page_analytics_pkey ON public.page_analytics USING btree (id)` |


## Policies (RLS)

### `Users can insert own analytics`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |

### `Users can update own analytics`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |
| WITH CHECK |  |

### `Users can view own analytics`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_

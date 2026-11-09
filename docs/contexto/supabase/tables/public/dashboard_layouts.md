# public.dashboard_layouts

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 1 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `salesperson_id` | `uuid` | não |  |  |  |
| 3 | `layout_config` | `jsonb` | não | `'[]'::jsonb` |  |  |
| 4 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 5 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| dashboard_layouts_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| dashboard_layouts_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| dashboard_layouts_salesperson_id_key | UNIQUE | `UNIQUE (salesperson_id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| dashboard_layouts_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX dashboard_layouts_pkey ON public.dashboard_layouts USING btree (id)` |
| dashboard_layouts_salesperson_id_key | btree | salesperson_id | sim | sim |  | `CREATE UNIQUE INDEX dashboard_layouts_salesperson_id_key ON public.dashboard_layouts USING btree (salesperson_id)` |


## Policies (RLS)

### `Users can manage own dashboard layout`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(salesperson_id = get_current_salesperson_id())` |
| WITH CHECK | `(salesperson_id = get_current_salesperson_id())` |


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

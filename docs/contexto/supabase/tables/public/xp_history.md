# public.xp_history

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
| 3 | `xp_amount` | `integer` | não |  |  |  |
| 4 | `source_type` | `text` | não |  |  |  |
| 5 | `source_id` | `text` | sim |  |  |  |
| 6 | `description` | `text` | sim |  |  |  |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| xp_history_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| xp_history_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_xp_history_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_xp_history_salesperson_id ON public.xp_history USING btree (salesperson_id)` |
| xp_history_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX xp_history_pkey ON public.xp_history USING btree (id)` |


## Policies (RLS)

### `Users can read own xp_history`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| tr_sync_total_xp | AFTER | INSERT | ROW | enabled | public.sync_total_xp |


## Grants

_nenhum_

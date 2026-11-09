# public.kudos

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
| 2 | `from_salesperson_id` | `uuid` | não |  |  |  |
| 3 | `to_salesperson_id` | `uuid` | não |  |  |  |
| 4 | `message` | `text` | não |  |  |  |
| 5 | `kudos_type` | `text` | não | `'recognition'::text` |  |  |
| 6 | `is_pinned` | `boolean` | não | `false` |  |  |
| 7 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| kudos_from_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (from_salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| kudos_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| kudos_to_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (to_salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_kudos_from_salesperson_id | btree | from_salesperson_id | não | sim |  | `CREATE INDEX idx_kudos_from_salesperson_id ON public.kudos USING btree (from_salesperson_id)` |
| idx_kudos_to_salesperson_id | btree | to_salesperson_id | não | sim |  | `CREATE INDEX idx_kudos_to_salesperson_id ON public.kudos USING btree (to_salesperson_id)` |
| kudos_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX kudos_pkey ON public.kudos USING btree (id)` |


## Policies (RLS)

### `Admins can update kudos`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Authenticated can view kudos`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `Users can send kudos`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(from_salesperson_id = get_current_salesperson_id())` |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

# public.team_closers

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
| 2 | `team_id` | `uuid` | não |  |  |  |
| 3 | `closer_id` | `uuid` | não |  |  |  |
| 4 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| team_closers_closer_id_fkey | FOREIGN KEY | `FOREIGN KEY (closer_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| team_closers_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| team_closers_team_id_closer_id_key | UNIQUE | `UNIQUE (team_id, closer_id)` |  |  | sim |
| team_closers_team_id_fkey | FOREIGN KEY | `FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_team_closers_closer_id | btree | closer_id | não | sim |  | `CREATE INDEX idx_team_closers_closer_id ON public.team_closers USING btree (closer_id)` |
| idx_team_closers_team_id | btree | team_id | não | sim |  | `CREATE INDEX idx_team_closers_team_id ON public.team_closers USING btree (team_id)` |
| team_closers_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX team_closers_pkey ON public.team_closers USING btree (id)` |
| team_closers_team_id_closer_id_key | btree | team_id, closer_id | sim | sim |  | `CREATE UNIQUE INDEX team_closers_team_id_closer_id_key ON public.team_closers USING btree (team_id, closer_id)` |


## Policies (RLS)

### `Admins and managers can delete team_closers`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Admins and managers can insert team_closers`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `Authenticated can view team closers`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_

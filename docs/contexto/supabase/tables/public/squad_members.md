# public.squad_members

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
| 1 | `squad_id` | `uuid` | não |  |  |  |
| 2 | `user_id` | `uuid` | não |  |  |  |
| 3 | `added_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| squad_members_pkey | PRIMARY KEY | `PRIMARY KEY (squad_id, user_id)` |  |  | sim |
| squad_members_squad_id_fkey | FOREIGN KEY | `FOREIGN KEY (squad_id) REFERENCES squads(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_squad_members_squad_id | btree | squad_id | não | sim |  | `CREATE INDEX idx_squad_members_squad_id ON public.squad_members USING btree (squad_id)` |
| idx_squad_members_user | btree | user_id | não | sim |  | `CREATE INDEX idx_squad_members_user ON public.squad_members USING btree (user_id)` |
| squad_members_pkey | btree | squad_id, user_id | sim | sim |  | `CREATE UNIQUE INDEX squad_members_pkey ON public.squad_members USING btree (squad_id, user_id)` |


## Policies (RLS)

### `Squad members admin manage`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |

### `Squad members viewable by authenticated`

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

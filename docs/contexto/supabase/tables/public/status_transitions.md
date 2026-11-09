# public.status_transitions

> Máquina de estados: transições de status válidas por entidade (sales, commissions).

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
| 1 | `entity` | `text` | não |  |  |  |
| 2 | `status_origem` | `text` | não |  |  |  |
| 3 | `status_destino` | `text` | não |  |  |  |
| 4 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| status_transitions_pkey | PRIMARY KEY | `PRIMARY KEY (entity, status_origem, status_destino)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| status_transitions_pkey | btree | entity, status_origem, status_destino | sim | sim |  | `CREATE UNIQUE INDEX status_transitions_pkey ON public.status_transitions USING btree (entity, status_origem, status_destino)` |


## Policies (RLS)

### `admin manager write status transitions`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK | `is_admin_or_manager(auth.uid())` |

### `authenticated read status transitions`

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

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

# public.db_rollback_snapshots

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
| 2 | `captured_at` | `timestamp with time zone` | não | `now()` |  |  |
| 3 | `xact_commit` | `bigint` | não |  |  |  |
| 4 | `xact_rollback` | `bigint` | não |  |  |  |
| 5 | `deadlocks` | `bigint` | não | `0` |  |  |
| 6 | `temp_files` | `bigint` | não | `0` |  |  |
| 7 | `temp_bytes` | `bigint` | não | `0` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| db_rollback_snapshots_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| db_rollback_snapshots_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX db_rollback_snapshots_pkey ON public.db_rollback_snapshots USING btree (id)` |
| idx_db_rollback_snapshots_captured_at | btree | captured_at | não | sim |  | `CREATE INDEX idx_db_rollback_snapshots_captured_at ON public.db_rollback_snapshots USING btree (captured_at DESC)` |


## Policies (RLS)

### `Admins can view rollback snapshots`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

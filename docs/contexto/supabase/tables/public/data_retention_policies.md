# public.data_retention_policies

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
| 1 | `table_name` | `text` | não |  |  |  |
| 2 | `ts_column` | `text` | não | `'created_at'::text` |  |  |
| 3 | `retention_days` | `integer` | não |  |  |  |
| 4 | `enabled` | `boolean` | não | `true` |  |  |
| 5 | `notes` | `text` | sim |  |  |  |
| 6 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 7 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| data_retention_policies_pkey | PRIMARY KEY | `PRIMARY KEY (table_name)` |  |  | sim |
| data_retention_policies_retention_days_check | CHECK | `CHECK (retention_days > 0)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| data_retention_policies_pkey | btree | table_name | sim | sim |  | `CREATE UNIQUE INDEX data_retention_policies_pkey ON public.data_retention_policies USING btree (table_name)` |


## Policies (RLS)

### `Admins leem data_retention_policies`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
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

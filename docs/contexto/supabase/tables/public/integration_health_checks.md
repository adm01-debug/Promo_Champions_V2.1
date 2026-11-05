# public.integration_health_checks

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `connection_id` | `uuid` | não |  |  |  |
| 3 | `status` | `integration_health_status` | não |  |  |  |
| 4 | `latency_ms` | `integer` | sim |  |  |  |
| 5 | `error` | `text` | sim |  |  |  |
| 6 | `details` | `jsonb` | sim |  |  |  |
| 7 | `triggered_by` | `integration_trigger` | não | `'manual'::integration_trigger` |  |  |
| 8 | `checked_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| integration_health_checks_connection_id_fkey | FOREIGN KEY | `FOREIGN KEY (connection_id) REFERENCES integration_connections(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| integration_health_checks_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_health_conn_time | btree | connection_id, checked_at | não | sim |  | `CREATE INDEX idx_health_conn_time ON public.integration_health_checks USING btree (connection_id, checked_at DESC)` |
| integration_health_checks_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX integration_health_checks_pkey ON public.integration_health_checks USING btree (id)` |


## Policies (RLS)

### `admins read health`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |

### `admins write health`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |


## Triggers

_nenhum_


## Grants

_nenhum_

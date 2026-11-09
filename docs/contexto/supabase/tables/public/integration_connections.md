# public.integration_connections

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
| 2 | `kind` | `integration_kind` | não |  |  |  |
| 3 | `label` | `text` | não |  |  |  |
| 4 | `config` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 5 | `secret_refs` | `text[]` | não | `ARRAY[]::text[]` |  |  |
| 6 | `source` | `integration_source` | não | `'db'::integration_source` |  |  |
| 7 | `enabled` | `boolean` | não | `true` |  |  |
| 8 | `created_by` | `uuid` | sim |  |  |  |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 10 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| integration_connections_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.integration_health_checks | integration_health_checks_connection_id_fkey | connection_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_integration_connections_enabled | btree | enabled | não | sim |  | `CREATE INDEX idx_integration_connections_enabled ON public.integration_connections USING btree (enabled)` |
| idx_integration_connections_kind | btree | kind | não | sim |  | `CREATE INDEX idx_integration_connections_kind ON public.integration_connections USING btree (kind)` |
| integration_connections_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX integration_connections_pkey ON public.integration_connections USING btree (id)` |


## Policies (RLS)

### `admins manage connections`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_integration_connections_updated | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

# public.geo_access_logs

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
| 2 | `ip_address` | `text` | não |  |  |  |
| 3 | `country_code` | `text` | sim |  |  |  |
| 4 | `country_name` | `text` | sim |  |  |  |
| 5 | `city` | `text` | sim |  |  |  |
| 6 | `region` | `text` | sim |  |  |  |
| 7 | `blocked` | `boolean` | sim | `false` |  |  |
| 8 | `user_agent` | `text` | sim |  |  |  |
| 9 | `attempted_path` | `text` | sim |  |  |  |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| geo_access_logs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| geo_access_logs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX geo_access_logs_pkey ON public.geo_access_logs USING btree (id)` |
| idx_geo_access_logs_country_code | btree | country_code | não | sim |  | `CREATE INDEX idx_geo_access_logs_country_code ON public.geo_access_logs USING btree (country_code)` |
| idx_geo_access_logs_created_at | btree | created_at | não | sim |  | `CREATE INDEX idx_geo_access_logs_created_at ON public.geo_access_logs USING btree (created_at DESC)` |


## Policies (RLS)

### `Admins can read geo_access_logs`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
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

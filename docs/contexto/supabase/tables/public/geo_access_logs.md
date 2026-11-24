# public.geo_access_logs

> Tabela public.geo_access_logs. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), ip_address text NOT NULL, country_code text NULLABLE, country_name text NULLABLE, city text NULLABLE, region text NULLABLE, blocked boolean NULLABLE DEFAULT false, user_agent text NULLABLE, attempted_path text NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now().

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.geo_access_logs. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `ip_address` | `text` | não |  |  | Coluna ip_address da tabela public.geo_access_logs. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `country_code` | `text` | sim |  |  | Coluna country_code da tabela public.geo_access_logs. Tipo PostgreSQL: text. Aceita NULL. |
| 4 | `country_name` | `text` | sim |  |  | Coluna country_name da tabela public.geo_access_logs. Tipo PostgreSQL: text. Aceita NULL. |
| 5 | `city` | `text` | sim |  |  | Coluna city da tabela public.geo_access_logs. Tipo PostgreSQL: text. Aceita NULL. |
| 6 | `region` | `text` | sim |  |  | Coluna region da tabela public.geo_access_logs. Tipo PostgreSQL: text. Aceita NULL. |
| 7 | `blocked` | `boolean` | sim | `false` |  | Coluna blocked da tabela public.geo_access_logs. Tipo PostgreSQL: boolean. Aceita NULL. Valor padrão: false. |
| 8 | `user_agent` | `text` | sim |  |  | Coluna user_agent da tabela public.geo_access_logs. Tipo PostgreSQL: text. Aceita NULL. |
| 9 | `attempted_path` | `text` | sim |  |  | Coluna attempted_path da tabela public.geo_access_logs. Tipo PostgreSQL: text. Aceita NULL. |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.geo_access_logs. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


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

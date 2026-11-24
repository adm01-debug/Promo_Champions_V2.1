# public.geo_blocked_regions

> Tabela public.geo_blocked_regions. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), country_code text NOT NULL, country_name text NOT NULL, reason text NULLABLE, blocked_by uuid NULLABLE, blocked_at timestamp with time zone NULLABLE DEFAULT now(), is_active boolean NULLABLE DEFAULT true, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: blocked_by → auth.users(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.geo_blocked_regions. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `country_code` | `text` | não |  |  | Coluna country_code da tabela public.geo_blocked_regions. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `country_name` | `text` | não |  |  | Coluna country_name da tabela public.geo_blocked_regions. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `reason` | `text` | sim |  |  | Coluna reason da tabela public.geo_blocked_regions. Tipo PostgreSQL: text. Aceita NULL. |
| 5 | `blocked_by` | `uuid` | sim |  |  | Coluna blocked_by da tabela public.geo_blocked_regions. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: auth.users(id). |
| 6 | `blocked_at` | `timestamp with time zone` | sim | `now()` |  | Coluna blocked_at da tabela public.geo_blocked_regions. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |
| 7 | `is_active` | `boolean` | sim | `true` |  | Coluna is_active da tabela public.geo_blocked_regions. Tipo PostgreSQL: boolean. Aceita NULL. Valor padrão: true. |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.geo_blocked_regions. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 9 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.geo_blocked_regions. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| geo_blocked_regions_blocked_by_fkey | FOREIGN KEY | `FOREIGN KEY (blocked_by) REFERENCES auth.users(id)` | NO ACTION | NO ACTION | sim |
| geo_blocked_regions_country_code_key | UNIQUE | `UNIQUE (country_code)` |  |  | sim |
| geo_blocked_regions_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| geo_blocked_regions_country_code_key | btree | country_code | sim | sim |  | `CREATE UNIQUE INDEX geo_blocked_regions_country_code_key ON public.geo_blocked_regions USING btree (country_code)` |
| geo_blocked_regions_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX geo_blocked_regions_pkey ON public.geo_blocked_regions USING btree (id)` |
| idx_geo_blocked_regions_blocked_by | btree | blocked_by | não | sim |  | `CREATE INDEX idx_geo_blocked_regions_blocked_by ON public.geo_blocked_regions USING btree (blocked_by)` |
| idx_geo_blocked_regions_country_code | btree | country_code | não | sim |  | `CREATE INDEX idx_geo_blocked_regions_country_code ON public.geo_blocked_regions USING btree (country_code)` |


## Policies (RLS)

### `Admin and managers can read geo_blocked_regions`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Admins can manage geo_blocked_regions`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

# public.geocode_cache

> Tabela public.geocode_cache. Estrutura registrada no catálogo do PostgreSQL: query_key text NOT NULL, lat double precision NULLABLE, lng double precision NULLABLE, found boolean NOT NULL DEFAULT true, provider text NOT NULL DEFAULT 'nominatim'::text, created_at timestamp with time zone NOT NULL DEFAULT now().

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
| 1 | `query_key` | `text` | não |  |  | Coluna query_key da tabela public.geocode_cache. Tipo PostgreSQL: text. Participa da chave primária. Não aceita NULL. |
| 2 | `lat` | `double precision` | sim |  |  | Coluna lat da tabela public.geocode_cache. Tipo PostgreSQL: double precision. Aceita NULL. |
| 3 | `lng` | `double precision` | sim |  |  | Coluna lng da tabela public.geocode_cache. Tipo PostgreSQL: double precision. Aceita NULL. |
| 4 | `found` | `boolean` | não | `true` |  | Coluna found da tabela public.geocode_cache. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: true. |
| 5 | `provider` | `text` | não | `'nominatim'::text` |  | Coluna provider da tabela public.geocode_cache. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'nominatim'::text. |
| 6 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.geocode_cache. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| geocode_cache_pkey | PRIMARY KEY | `PRIMARY KEY (query_key)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| geocode_cache_created_at_idx | btree | created_at | não | sim |  | `CREATE INDEX geocode_cache_created_at_idx ON public.geocode_cache USING btree (created_at)` |
| geocode_cache_pkey | btree | query_key | sim | sim |  | `CREATE UNIQUE INDEX geocode_cache_pkey ON public.geocode_cache USING btree (query_key)` |


## Policies (RLS)

### `Deny all access to geocode_cache`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | anon, authenticated |
| USING | `false` |
| WITH CHECK | `false` |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

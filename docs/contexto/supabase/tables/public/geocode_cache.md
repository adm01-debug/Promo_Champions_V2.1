# public.geocode_cache

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 0 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `query_key` | `text` | não |  |  |  |
| 2 | `lat` | `double precision` | sim |  |  |  |
| 3 | `lng` | `double precision` | sim |  |  |  |
| 4 | `found` | `boolean` | não | `true` |  |  |
| 5 | `provider` | `text` | não | `'nominatim'::text` |  |  |
| 6 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


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

> ⚠️ RLS habilitado **sem policies**: nenhum acesso via API (anon/authenticated).



## Triggers

_nenhum_


## Grants

_nenhum_

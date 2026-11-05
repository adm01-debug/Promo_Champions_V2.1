# public.ai_narrative_cache

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
| 2 | `cache_key` | `text` | não |  |  |  |
| 3 | `narrative_type` | `text` | não |  |  |  |
| 4 | `payload_hash` | `text` | não |  |  |  |
| 5 | `narrative` | `text` | não |  |  |  |
| 6 | `model` | `text` | sim |  |  |  |
| 7 | `tokens_input` | `integer` | sim |  |  |  |
| 8 | `tokens_output` | `integer` | sim |  |  |  |
| 9 | `hit_count` | `integer` | não | `0` |  |  |
| 10 | `expires_at` | `timestamp with time zone` | não |  |  |  |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 12 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| ai_narrative_cache_cache_key_key | UNIQUE | `UNIQUE (cache_key)` |  |  | sim |
| ai_narrative_cache_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| ai_narrative_cache_cache_key_key | btree | cache_key | sim | sim |  | `CREATE UNIQUE INDEX ai_narrative_cache_cache_key_key ON public.ai_narrative_cache USING btree (cache_key)` |
| ai_narrative_cache_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX ai_narrative_cache_pkey ON public.ai_narrative_cache USING btree (id)` |
| idx_ai_narrative_cache_expires | btree | expires_at | não | sim |  | `CREATE INDEX idx_ai_narrative_cache_expires ON public.ai_narrative_cache USING btree (expires_at)` |
| idx_ai_narrative_cache_key | btree | cache_key | não | sim |  | `CREATE INDEX idx_ai_narrative_cache_key ON public.ai_narrative_cache USING btree (cache_key)` |
| idx_ai_narrative_cache_type | btree | narrative_type | não | sim |  | `CREATE INDEX idx_ai_narrative_cache_type ON public.ai_narrative_cache USING btree (narrative_type)` |


## Policies (RLS)

### `Authenticated users can read cache`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `Service role manages cache`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | service_role |
| USING | `true` |
| WITH CHECK | `true` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| trg_ai_narrative_cache_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_

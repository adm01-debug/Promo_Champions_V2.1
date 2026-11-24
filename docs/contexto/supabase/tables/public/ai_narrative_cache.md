# public.ai_narrative_cache

> Tabela public.ai_narrative_cache. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), cache_key text NOT NULL, narrative_type text NOT NULL, payload_hash text NOT NULL, narrative text NOT NULL, model text NULLABLE, tokens_input integer NULLABLE, tokens_output integer NULLABLE, hit_count integer NOT NULL DEFAULT 0, expires_at timestamp with time zone NOT NULL, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now().

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.ai_narrative_cache. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `cache_key` | `text` | não |  |  | Coluna cache_key da tabela public.ai_narrative_cache. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `narrative_type` | `text` | não |  |  | Coluna narrative_type da tabela public.ai_narrative_cache. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `payload_hash` | `text` | não |  |  | Coluna payload_hash da tabela public.ai_narrative_cache. Tipo PostgreSQL: text. Não aceita NULL. |
| 5 | `narrative` | `text` | não |  |  | Coluna narrative da tabela public.ai_narrative_cache. Tipo PostgreSQL: text. Não aceita NULL. |
| 6 | `model` | `text` | sim |  |  | Coluna model da tabela public.ai_narrative_cache. Tipo PostgreSQL: text. Aceita NULL. |
| 7 | `tokens_input` | `integer` | sim |  |  | Coluna tokens_input da tabela public.ai_narrative_cache. Tipo PostgreSQL: integer. Aceita NULL. |
| 8 | `tokens_output` | `integer` | sim |  |  | Coluna tokens_output da tabela public.ai_narrative_cache. Tipo PostgreSQL: integer. Aceita NULL. |
| 9 | `hit_count` | `integer` | não | `0` |  | Coluna hit_count da tabela public.ai_narrative_cache. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 10 | `expires_at` | `timestamp with time zone` | não |  |  | Coluna expires_at da tabela public.ai_narrative_cache. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.ai_narrative_cache. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 12 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.ai_narrative_cache. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


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

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

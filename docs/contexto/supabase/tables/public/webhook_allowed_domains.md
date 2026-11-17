# public.webhook_allowed_domains

> Allowlist de hosts para webhook de saida. Vazia = nada e permitido (fail-closed). Gerida por admin. A blocklist de rede privada/metadata nao fica aqui: esta no corpo de is_webhook_host_allowed().

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
| 2 | `pattern` | `text` | não |  |  |  |
| 3 | `description` | `text` | sim |  |  |  |
| 4 | `created_by` | `uuid` | sim |  |  |  |
| 5 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 6 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| webhook_allowed_domains_created_by_fkey | FOREIGN KEY | `FOREIGN KEY (created_by) REFERENCES auth.users(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| webhook_allowed_domains_pattern_formato | CHECK | `CHECK (pattern = lower(pattern) AND pattern !~ '\s'::text AND pattern <> ''::text AND (pattern ~ '^[a-z0-9.-]+$'::text OR pattern ~ '^\*\.[a-z0-9.-]+$'::text))` |  |  | sim |
| webhook_allowed_domains_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| ux_webhook_allowed_domains_pattern | btree | pattern | sim | sim |  | `CREATE UNIQUE INDEX ux_webhook_allowed_domains_pattern ON public.webhook_allowed_domains USING btree (pattern)` |
| webhook_allowed_domains_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX webhook_allowed_domains_pkey ON public.webhook_allowed_domains USING btree (id)` |


## Policies (RLS)

### `Admins manage webhook_allowed_domains`

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
| set_updated_at_webhook_allowed_domains | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| authenticated | DELETE, INSERT, SELECT, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

# public.api_tokens

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
| 2 | `token` | `text` | não |  |  |  |
| 3 | `company_name` | `text` | não | `'Default'::text` |  |  |
| 4 | `team_id` | `uuid` | sim |  |  |  |
| 5 | `created_by` | `uuid` | não |  |  |  |
| 6 | `is_active` | `boolean` | não | `true` |  |  |
| 7 | `last_used_at` | `timestamp with time zone` | sim |  |  |  |
| 8 | `usage_count` | `integer` | não | `0` |  |  |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 10 | `expires_at` | `timestamp with time zone` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| api_tokens_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| api_tokens_team_id_fkey | FOREIGN KEY | `FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| api_tokens_token_key | UNIQUE | `UNIQUE (token)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.score_change_logs | score_change_logs_api_token_id_fkey | api_token_id | SET NULL |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| api_tokens_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX api_tokens_pkey ON public.api_tokens USING btree (id)` |
| api_tokens_token_key | btree | token | sim | sim |  | `CREATE UNIQUE INDEX api_tokens_token_key ON public.api_tokens USING btree (token)` |
| idx_api_tokens_team_id | btree | team_id | não | sim |  | `CREATE INDEX idx_api_tokens_team_id ON public.api_tokens USING btree (team_id)` |


## Policies (RLS)

### `Admins can manage API tokens`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |

### `Users can see own tokens`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((created_by = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| trg_audit_api_tokens | AFTER | INSERT OR DELETE OR UPDATE | ROW | enabled | public.process_audit_log |


## Grants

_nenhum_

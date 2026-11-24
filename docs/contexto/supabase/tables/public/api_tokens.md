# public.api_tokens

> Tokens de API e seus metadados de propriedade, validade e uso.

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Identificador único do token de API. |
| 2 | `token` | `text` | não |  |  | Token de autenticação da API; credencial sensível que não deve ser exposta ou registrada em logs. |
| 3 | `company_name` | `text` | não | `'Default'::text` |  | Nome da empresa ou integração associada ao token. |
| 4 | `team_id` | `uuid` | sim |  |  | Equipe associada ao token, quando definida. |
| 5 | `created_by` | `uuid` | não |  |  | Usuário que criou o token. |
| 6 | `is_active` | `boolean` | não | `true` |  | Indica se o token pode ser utilizado. |
| 7 | `last_used_at` | `timestamp with time zone` | sim |  |  | Data e hora do uso mais recente do token. |
| 8 | `usage_count` | `integer` | não | `0` |  | Quantidade de utilizações registradas para o token. |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  | Data e hora de criação do token. |
| 10 | `expires_at` | `timestamp with time zone` | sim |  |  | Data e hora de expiração do token, quando configurada. |


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

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

# public.feature_flags

> Configuração de funcionalidades controladas por ativação e percentual de rollout.

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
| 1 | `id` | `uuid` | não | `uuid_generate_v4()` |  | Identificador único da feature flag. |
| 2 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Data e hora de criação da feature flag. |
| 3 | `key` | `text` | não |  |  | Chave única usada pela aplicação para identificar a funcionalidade. |
| 4 | `description` | `text` | sim |  |  | Descrição da funcionalidade controlada. |
| 5 | `is_enabled` | `boolean` | não | `false` |  | Indica se a funcionalidade está habilitada. |
| 6 | `rollout_percentage` | `integer` | não | `100` |  | Percentual de usuários incluídos no rollout, de 0 a 100. |
| 7 | `allowed_roles` | `text[]` | sim | `'{}'::text[]` |  | Lista de papéis autorizados a acessar a funcionalidade, quando definida. |
| 8 | `metadata` | `jsonb` | sim | `'{}'::jsonb` |  | Metadados adicionais da feature flag em formato JSON. |
| 9 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Data e hora da última atualização da feature flag. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| feature_flags_key_key | UNIQUE | `UNIQUE (key)` |  |  | sim |
| feature_flags_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| feature_flags_rollout_percentage_check | CHECK | `CHECK (rollout_percentage >= 0 AND rollout_percentage <= 100)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| feature_flags_key_key | btree | key | sim | sim |  | `CREATE UNIQUE INDEX feature_flags_key_key ON public.feature_flags USING btree (key)` |
| feature_flags_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX feature_flags_pkey ON public.feature_flags USING btree (id)` |


## Policies (RLS)

### `Authenticated users can view feature flags`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `Only admins can manage feature flags`

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
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_feature_flags_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

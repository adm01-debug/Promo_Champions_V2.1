# public.channel_credentials

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 4 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `owner_id` | `uuid` | não |  |  |  |
| 3 | `channel` | `text` | não |  |  |  |
| 4 | `provider` | `text` | não |  |  |  |
| 5 | `label` | `text` | sim |  |  |  |
| 6 | `credentials` | `jsonb` | não | `'{}'::jsonb` |  |  |
| 7 | `from_number` | `text` | sim |  |  |  |
| 8 | `enabled` | `boolean` | não | `true` |  |  |
| 9 | `verified_at` | `timestamp with time zone` | sim |  |  |  |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 11 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| channel_credentials_channel_check | CHECK | `CHECK (channel = ANY (ARRAY['whatsapp'::text, 'sms'::text]))` |  |  | sim |
| channel_credentials_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| channel_credentials_provider_check | CHECK | `CHECK (provider = ANY (ARRAY['twilio'::text, 'meta_cloud'::text, 'zapi'::text, 'messagebird'::text]))` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.integration_secret_refs | integration_secret_refs_credential_id_fkey | credential_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| channel_credentials_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX channel_credentials_pkey ON public.channel_credentials USING btree (id)` |
| idx_channel_credentials_owner | btree | owner_id, channel, enabled | não | sim |  | `CREATE INDEX idx_channel_credentials_owner ON public.channel_credentials USING btree (owner_id, channel, enabled)` |


## Policies (RLS)

### `Owners can delete their credentials`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((owner_id = auth.uid()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `Owners can insert their credentials`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(owner_id = auth.uid())` |

### `Owners can update their credentials`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((owner_id = auth.uid()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `Owners can view their credentials`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((owner_id = auth.uid()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_channel_credentials_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

_nenhum_

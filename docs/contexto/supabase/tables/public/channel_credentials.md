# public.channel_credentials

> Tabela public.channel_credentials. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), owner_id uuid NOT NULL, channel text NOT NULL, provider text NOT NULL, label text NULLABLE, credentials jsonb NOT NULL DEFAULT '{}'::jsonb, from_number text NULLABLE, enabled boolean NOT NULL DEFAULT true, verified_at timestamp with time zone NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now().

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.channel_credentials. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `owner_id` | `uuid` | não |  |  | Coluna owner_id da tabela public.channel_credentials. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 3 | `channel` | `text` | não |  |  | Coluna channel da tabela public.channel_credentials. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (channel = ANY (ARRAY['whatsapp'::text, 'sms'::text])). |
| 4 | `provider` | `text` | não |  |  | Coluna provider da tabela public.channel_credentials. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (provider = ANY (ARRAY['twilio'::text, 'meta_cloud'::text, 'zapi'::text, 'messagebird'::text, 'evolution'::text])). |
| 5 | `label` | `text` | sim |  |  | Coluna label da tabela public.channel_credentials. Tipo PostgreSQL: text. Aceita NULL. |
| 6 | `credentials` | `jsonb` | não | `'{}'::jsonb` |  | Coluna credentials da tabela public.channel_credentials. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '{}'::jsonb. |
| 7 | `from_number` | `text` | sim |  |  | Coluna from_number da tabela public.channel_credentials. Tipo PostgreSQL: text. Aceita NULL. |
| 8 | `enabled` | `boolean` | não | `true` |  | Coluna enabled da tabela public.channel_credentials. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: true. |
| 9 | `verified_at` | `timestamp with time zone` | sim |  |  | Coluna verified_at da tabela public.channel_credentials. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.channel_credentials. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 11 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.channel_credentials. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| channel_credentials_channel_check | CHECK | `CHECK (channel = ANY (ARRAY['whatsapp'::text, 'sms'::text]))` |  |  | sim |
| channel_credentials_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| channel_credentials_provider_check | CHECK | `CHECK (provider = ANY (ARRAY['twilio'::text, 'meta_cloud'::text, 'zapi'::text, 'messagebird'::text, 'evolution'::text]))` |  |  | sim |


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

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

# public.outbound_messages

> Tabela public.outbound_messages. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), owner_id uuid NOT NULL, enrollment_id uuid NULLABLE, step_id uuid NULLABLE, channel text NOT NULL, provider text NOT NULL, to_number text NOT NULL, body text NULLABLE, template_id text NULLABLE, provider_message_id text NULLABLE, status text NOT NULL DEFAULT 'queued'::text, error text NULLABLE, metadata jsonb NOT NULL DEFAULT '{}'::jsonb, sent_at timestamp with time zone NULLABLE, delivered_at timestamp with time zone NULLABLE, read_at timestamp with time zone NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: enrollment_id → public.sequence_enrollments(id); step_id → public.sequence_steps(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 3 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.outbound_messages. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `owner_id` | `uuid` | não |  |  | Coluna owner_id da tabela public.outbound_messages. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 3 | `enrollment_id` | `uuid` | sim |  |  | Coluna enrollment_id da tabela public.outbound_messages. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.sequence_enrollments(id). |
| 4 | `step_id` | `uuid` | sim |  |  | Coluna step_id da tabela public.outbound_messages. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.sequence_steps(id). |
| 5 | `channel` | `text` | não |  |  | Coluna channel da tabela public.outbound_messages. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (channel = ANY (ARRAY['whatsapp'::text, 'sms'::text])). |
| 6 | `provider` | `text` | não |  |  | Coluna provider da tabela public.outbound_messages. Tipo PostgreSQL: text. Não aceita NULL. |
| 7 | `to_number` | `text` | não |  |  | Coluna to_number da tabela public.outbound_messages. Tipo PostgreSQL: text. Não aceita NULL. |
| 8 | `body` | `text` | sim |  |  | Coluna body da tabela public.outbound_messages. Tipo PostgreSQL: text. Aceita NULL. |
| 9 | `template_id` | `text` | sim |  |  | Coluna template_id da tabela public.outbound_messages. Tipo PostgreSQL: text. Aceita NULL. |
| 10 | `provider_message_id` | `text` | sim |  |  | Coluna provider_message_id da tabela public.outbound_messages. Tipo PostgreSQL: text. Aceita NULL. |
| 11 | `status` | `text` | não | `'queued'::text` |  | Coluna status da tabela public.outbound_messages. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'queued'::text. Validação CHECK: CHECK (status = ANY (ARRAY['queued'::text, 'sent'::text, 'delivered'::text, 'read'::text, 'failed'::text])). |
| 12 | `error` | `text` | sim |  |  | Coluna error da tabela public.outbound_messages. Tipo PostgreSQL: text. Aceita NULL. |
| 13 | `metadata` | `jsonb` | não | `'{}'::jsonb` |  | Coluna metadata da tabela public.outbound_messages. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '{}'::jsonb. |
| 14 | `sent_at` | `timestamp with time zone` | sim |  |  | Coluna sent_at da tabela public.outbound_messages. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 15 | `delivered_at` | `timestamp with time zone` | sim |  |  | Coluna delivered_at da tabela public.outbound_messages. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 16 | `read_at` | `timestamp with time zone` | sim |  |  | Coluna read_at da tabela public.outbound_messages. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 17 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.outbound_messages. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 18 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.outbound_messages. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| outbound_messages_channel_check | CHECK | `CHECK (channel = ANY (ARRAY['whatsapp'::text, 'sms'::text]))` |  |  | sim |
| outbound_messages_enrollment_id_fkey | FOREIGN KEY | `FOREIGN KEY (enrollment_id) REFERENCES sequence_enrollments(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| outbound_messages_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| outbound_messages_status_check | CHECK | `CHECK (status = ANY (ARRAY['queued'::text, 'sent'::text, 'delivered'::text, 'read'::text, 'failed'::text]))` |  |  | sim |
| outbound_messages_step_id_fkey | FOREIGN KEY | `FOREIGN KEY (step_id) REFERENCES sequence_steps(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_outbound_messages_enrollment | btree | enrollment_id, created_at | não | sim |  | `CREATE INDEX idx_outbound_messages_enrollment ON public.outbound_messages USING btree (enrollment_id, created_at DESC)` |
| idx_outbound_messages_owner | btree | owner_id, created_at | não | sim |  | `CREATE INDEX idx_outbound_messages_owner ON public.outbound_messages USING btree (owner_id, created_at DESC)` |
| idx_outbound_messages_provider_msg | btree | provider_message_id | não | sim | `(provider_message_id IS NOT NULL)` | `CREATE INDEX idx_outbound_messages_provider_msg ON public.outbound_messages USING btree (provider_message_id) WHERE (provider_message_id IS NOT NULL)` |
| idx_outbound_messages_step_id | btree | step_id | não | sim |  | `CREATE INDEX idx_outbound_messages_step_id ON public.outbound_messages USING btree (step_id)` |
| outbound_messages_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX outbound_messages_pkey ON public.outbound_messages USING btree (id)` |


## Policies (RLS)

### `Owners can insert their outbound messages`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `((owner_id = auth.uid()) OR is_admin_or_manager(auth.uid()))` |

### `Owners can update their outbound messages`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((owner_id = auth.uid()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `Owners can view their outbound messages`

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
| trg_outbound_messages_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

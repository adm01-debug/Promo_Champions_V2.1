# public.inbound_reply_events

> Tabela public.inbound_reply_events. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), provider text NOT NULL, message_id text NULLABLE, from_email text NULLABLE, subject text NULLABLE, received_at timestamp with time zone NOT NULL DEFAULT now(), matched_enrollment_id uuid NULLABLE, event_type text NOT NULL DEFAULT 'reply'::text, payload jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: matched_enrollment_id → public.sequence_enrollments(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.inbound_reply_events. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `provider` | `text` | não |  |  | Coluna provider da tabela public.inbound_reply_events. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `message_id` | `text` | sim |  |  | Coluna message_id da tabela public.inbound_reply_events. Tipo PostgreSQL: text. Aceita NULL. |
| 4 | `from_email` | `text` | sim |  |  | Coluna from_email da tabela public.inbound_reply_events. Tipo PostgreSQL: text. Aceita NULL. |
| 5 | `subject` | `text` | sim |  |  | Coluna subject da tabela public.inbound_reply_events. Tipo PostgreSQL: text. Aceita NULL. |
| 6 | `received_at` | `timestamp with time zone` | não | `now()` |  | Coluna received_at da tabela public.inbound_reply_events. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 7 | `matched_enrollment_id` | `uuid` | sim |  |  | Coluna matched_enrollment_id da tabela public.inbound_reply_events. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.sequence_enrollments(id). |
| 8 | `event_type` | `text` | não | `'reply'::text` |  | Coluna event_type da tabela public.inbound_reply_events. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'reply'::text. |
| 9 | `payload` | `jsonb` | não | `'{}'::jsonb` |  | Coluna payload da tabela public.inbound_reply_events. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '{}'::jsonb. |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.inbound_reply_events. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| inbound_reply_events_matched_enrollment_id_fkey | FOREIGN KEY | `FOREIGN KEY (matched_enrollment_id) REFERENCES sequence_enrollments(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| inbound_reply_events_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_inbound_reply_events_from_email | btree |  | não | sim |  | `CREATE INDEX idx_inbound_reply_events_from_email ON public.inbound_reply_events USING btree (lower(from_email))` |
| idx_inbound_reply_events_matched_enrollment_id | btree | matched_enrollment_id | não | sim |  | `CREATE INDEX idx_inbound_reply_events_matched_enrollment_id ON public.inbound_reply_events USING btree (matched_enrollment_id)` |
| idx_inbound_reply_events_received_at | btree | received_at | não | sim |  | `CREATE INDEX idx_inbound_reply_events_received_at ON public.inbound_reply_events USING btree (received_at DESC)` |
| inbound_reply_events_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX inbound_reply_events_pkey ON public.inbound_reply_events USING btree (id)` |
| uq_inbound_reply_events_provider_message_id | btree | provider, message_id | sim | sim |  | `CREATE UNIQUE INDEX uq_inbound_reply_events_provider_message_id ON public.inbound_reply_events USING btree (provider, message_id)` |


## Policies (RLS)

### `Admins can view inbound reply events`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

# public.whatsapp_conversations

> Tabela public.whatsapp_conversations. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), sale_id uuid NULLABLE, sender_id uuid NULLABLE, external_message_id text NULLABLE, direction text NULLABLE, body text NULLABLE, status text NULLABLE, sent_at timestamp with time zone NULLABLE DEFAULT now(), created_at timestamp with time zone NULLABLE DEFAULT now(). Relacionamentos FK: sale_id → public.sales(id); sender_id → auth.users(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.whatsapp_conversations. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `sale_id` | `uuid` | sim |  |  | Coluna sale_id da tabela public.whatsapp_conversations. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.sales(id). |
| 3 | `sender_id` | `uuid` | sim |  |  | Coluna sender_id da tabela public.whatsapp_conversations. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: auth.users(id). |
| 4 | `external_message_id` | `text` | sim |  |  | Coluna external_message_id da tabela public.whatsapp_conversations. Tipo PostgreSQL: text. Aceita NULL. |
| 5 | `direction` | `text` | sim |  |  | Coluna direction da tabela public.whatsapp_conversations. Tipo PostgreSQL: text. Aceita NULL. Validação CHECK: CHECK (direction = ANY (ARRAY['inbound'::text, 'outbound'::text])). |
| 6 | `body` | `text` | sim |  |  | Coluna body da tabela public.whatsapp_conversations. Tipo PostgreSQL: text. Aceita NULL. |
| 7 | `status` | `text` | sim |  |  | Coluna status da tabela public.whatsapp_conversations. Tipo PostgreSQL: text. Aceita NULL. |
| 8 | `sent_at` | `timestamp with time zone` | sim | `now()` |  | Coluna sent_at da tabela public.whatsapp_conversations. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |
| 9 | `created_at` | `timestamp with time zone` | sim | `now()` |  | Coluna created_at da tabela public.whatsapp_conversations. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| whatsapp_conversations_direction_check | CHECK | `CHECK (direction = ANY (ARRAY['inbound'::text, 'outbound'::text]))` |  |  | sim |
| whatsapp_conversations_external_message_id_key | UNIQUE | `UNIQUE (external_message_id)` |  |  | sim |
| whatsapp_conversations_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| whatsapp_conversations_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| whatsapp_conversations_sender_id_fkey | FOREIGN KEY | `FOREIGN KEY (sender_id) REFERENCES auth.users(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_whatsapp_conversations_sale_id | btree | sale_id | não | sim |  | `CREATE INDEX idx_whatsapp_conversations_sale_id ON public.whatsapp_conversations USING btree (sale_id)` |
| idx_whatsapp_conversations_sender_id | btree | sender_id | não | sim |  | `CREATE INDEX idx_whatsapp_conversations_sender_id ON public.whatsapp_conversations USING btree (sender_id)` |
| whatsapp_conversations_external_message_id_key | btree | external_message_id | sim | sim |  | `CREATE UNIQUE INDEX whatsapp_conversations_external_message_id_key ON public.whatsapp_conversations USING btree (external_message_id)` |
| whatsapp_conversations_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX whatsapp_conversations_pkey ON public.whatsapp_conversations USING btree (id)` |


## Policies (RLS)

### `Users can log WhatsApp messages`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(EXISTS ( SELECT 1    FROM sales   WHERE ((sales.id = whatsapp_conversations.sale_id) AND (sales.salesperson_id = auth.uid()))))` |

### `Users can view WhatsApp conversations for their sales`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM sales   WHERE ((sales.id = whatsapp_conversations.sale_id) AND (sales.salesperson_id = auth.uid()))))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

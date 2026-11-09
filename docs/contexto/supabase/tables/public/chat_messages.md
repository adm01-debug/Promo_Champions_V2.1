# public.chat_messages

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
| 2 | `conversation_id` | `uuid` | não |  |  |  |
| 3 | `role` | `text` | não |  |  |  |
| 4 | `content` | `text` | não |  |  |  |
| 5 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| chat_messages_conversation_id_fkey | FOREIGN KEY | `FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| chat_messages_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| chat_messages_role_check | CHECK | `CHECK (role = ANY (ARRAY['user'::text, 'assistant'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| chat_messages_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX chat_messages_pkey ON public.chat_messages USING btree (id)` |
| idx_chat_messages_conversation | btree | conversation_id | não | sim |  | `CREATE INDEX idx_chat_messages_conversation ON public.chat_messages USING btree (conversation_id)` |
| idx_chat_messages_created | btree | created_at | não | sim |  | `CREATE INDEX idx_chat_messages_created ON public.chat_messages USING btree (created_at)` |


## Policies (RLS)

### `Users can insert own chat_messages`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(conversation_id IN ( SELECT chat_conversations.id    FROM chat_conversations   WHERE (chat_conversations.salesperson_id = get_current_salesperson_id())))` |

### `Users can read own chat_messages`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(conversation_id IN ( SELECT chat_conversations.id    FROM chat_conversations   WHERE (chat_conversations.salesperson_id = get_current_salesperson_id())))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

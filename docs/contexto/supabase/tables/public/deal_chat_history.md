# public.deal_chat_history

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 3 |
| realtime (publication) | sim |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `deal_id` | `uuid` | não |  |  |  |
| 3 | `salesperson_id` | `uuid` | sim |  |  |  |
| 4 | `question` | `text` | não |  |  |  |
| 5 | `response` | `text` | sim |  |  |  |
| 6 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 7 | `question_type` | `text` | não | `'general'::text` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| deal_chat_history_deal_id_fkey | FOREIGN KEY | `FOREIGN KEY (deal_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| deal_chat_history_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| deal_chat_history_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| deal_chat_history_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX deal_chat_history_pkey ON public.deal_chat_history USING btree (id)` |
| idx_deal_chat_history_created_at | btree | created_at | não | sim |  | `CREATE INDEX idx_deal_chat_history_created_at ON public.deal_chat_history USING btree (created_at DESC)` |
| idx_deal_chat_history_deal_id | btree | deal_id | não | sim |  | `CREATE INDEX idx_deal_chat_history_deal_id ON public.deal_chat_history USING btree (deal_id)` |
| idx_deal_chat_history_question_type | btree | question_type | não | sim |  | `CREATE INDEX idx_deal_chat_history_question_type ON public.deal_chat_history USING btree (question_type)` |
| idx_deal_chat_history_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_deal_chat_history_salesperson_id ON public.deal_chat_history USING btree (salesperson_id)` |


## Policies (RLS)

### `Users can delete own chat history`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |

### `Users can insert own deal_chat_history`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |

### `Users can read own deal_chat_history`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_

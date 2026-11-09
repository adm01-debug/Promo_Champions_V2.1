# public.competitive_chat_messages

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
| 2 | `salesperson_id` | `uuid` | não |  |  |  |
| 3 | `message` | `text` | não |  |  |  |
| 4 | `message_type` | `text` | não | `'chat'::text` |  |  |
| 5 | `target_salesperson_id` | `uuid` | sim |  |  |  |
| 6 | `matchup_id` | `uuid` | sim |  |  |  |
| 7 | `reactions` | `jsonb` | sim | `'{}'::jsonb` |  |  |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 9 | `squad_id` | `uuid` | sim |  |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| competitive_chat_messages_matchup_id_fkey | FOREIGN KEY | `FOREIGN KEY (matchup_id) REFERENCES weekly_matchups(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| competitive_chat_messages_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| competitive_chat_messages_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| competitive_chat_messages_target_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (target_salesperson_id) REFERENCES salespeople(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| competitive_chat_messages_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX competitive_chat_messages_pkey ON public.competitive_chat_messages USING btree (id)` |
| idx_competitive_chat_messages_matchup_id | btree | matchup_id | não | sim |  | `CREATE INDEX idx_competitive_chat_messages_matchup_id ON public.competitive_chat_messages USING btree (matchup_id)` |
| idx_competitive_chat_messages_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_competitive_chat_messages_salesperson_id ON public.competitive_chat_messages USING btree (salesperson_id)` |
| idx_competitive_chat_messages_target_salesperson_id | btree | target_salesperson_id | não | sim |  | `CREATE INDEX idx_competitive_chat_messages_target_salesperson_id ON public.competitive_chat_messages USING btree (target_salesperson_id)` |


## Policies (RLS)

### `Competitive Chat - INSERT`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(((squad_id IS NULL) OR (squad_id IN ( SELECT salespeople.squad_id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))) AND (salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid()))))` |

### `Competitive Chat - SELECT`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((squad_id IS NULL) OR (squad_id IN ( SELECT salespeople.squad_id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid()))))` |
| WITH CHECK |  |

### `Competitive Chat - UPDATE`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((squad_id IS NULL) OR (squad_id IN ( SELECT salespeople.squad_id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid()))))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

# public.feed_comments

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
| 2 | `feed_item_id` | `uuid` | não |  |  |  |
| 3 | `salesperson_id` | `uuid` | não |  |  |  |
| 4 | `content` | `text` | não |  |  |  |
| 5 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| feed_comments_feed_item_id_fkey | FOREIGN KEY | `FOREIGN KEY (feed_item_id) REFERENCES victory_feed(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| feed_comments_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| feed_comments_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| feed_comments_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX feed_comments_pkey ON public.feed_comments USING btree (id)` |
| idx_feed_comments_feed_item_id | btree | feed_item_id | não | sim |  | `CREATE INDEX idx_feed_comments_feed_item_id ON public.feed_comments USING btree (feed_item_id)` |
| idx_feed_comments_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_feed_comments_salesperson_id ON public.feed_comments USING btree (salesperson_id)` |


## Policies (RLS)

### `Authenticated can read feed_comments`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() IS NOT NULL)` |
| WITH CHECK |  |

### `Users can insert own feed_comments`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(salesperson_id = get_current_salesperson_id())` |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

# public.victory_feed

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 2 |
| realtime (publication) | sim |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `salesperson_id` | `uuid` | não |  |  |  |
| 3 | `event_type` | `text` | não | `'sale'::text` |  |  |
| 4 | `title` | `text` | não |  |  |  |
| 5 | `description` | `text` | sim |  |  |  |
| 6 | `value` | `numeric` | sim | `0` |  |  |
| 7 | `metadata` | `jsonb` | sim | `'{}'::jsonb` |  |  |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| victory_feed_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| victory_feed_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.feed_comments | feed_comments_feed_item_id_fkey | feed_item_id | CASCADE |
| public.feed_reactions | feed_reactions_feed_item_id_fkey | feed_item_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_victory_feed_created | btree | created_at | não | sim |  | `CREATE INDEX idx_victory_feed_created ON public.victory_feed USING btree (created_at DESC)` |
| idx_victory_feed_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_victory_feed_salesperson_id ON public.victory_feed USING btree (salesperson_id)` |
| victory_feed_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX victory_feed_pkey ON public.victory_feed USING btree (id)` |


## Policies (RLS)

### `Authenticated can read victory_feed`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() IS NOT NULL)` |
| WITH CHECK |  |

### `Users can insert own victory_feed`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `((salesperson_id = get_current_salesperson_id()) OR is_admin_or_manager(auth.uid()))` |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

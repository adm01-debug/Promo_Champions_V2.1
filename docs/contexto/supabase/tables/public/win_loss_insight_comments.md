# public.win_loss_insight_comments

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
| 2 | `insight_id` | `uuid` | não |  |  |  |
| 3 | `author_id` | `uuid` | não |  |  |  |
| 4 | `body` | `text` | não |  |  |  |
| 5 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| win_loss_insight_comments_insight_id_fkey | FOREIGN KEY | `FOREIGN KEY (insight_id) REFERENCES win_loss_insights(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| win_loss_insight_comments_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_wl_insight_comments_insight | btree | insight_id, created_at | não | sim |  | `CREATE INDEX idx_wl_insight_comments_insight ON public.win_loss_insight_comments USING btree (insight_id, created_at DESC)` |
| win_loss_insight_comments_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX win_loss_insight_comments_pkey ON public.win_loss_insight_comments USING btree (id)` |


## Policies (RLS)

### `auth insert own comment`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(author_id = auth.uid())` |

### `auth read comments`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(auth.uid() IS NOT NULL)` |
| WITH CHECK |  |

### `owner delete comment`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(author_id = auth.uid())` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

_nenhum_

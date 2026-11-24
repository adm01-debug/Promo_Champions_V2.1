# public.win_loss_insight_comments

> Tabela public.win_loss_insight_comments. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), insight_id uuid NOT NULL, author_id uuid NOT NULL, body text NOT NULL, created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: insight_id → public.win_loss_insights(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.win_loss_insight_comments. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `insight_id` | `uuid` | não |  |  | Coluna insight_id da tabela public.win_loss_insight_comments. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.win_loss_insights(id). |
| 3 | `author_id` | `uuid` | não |  |  | Coluna author_id da tabela public.win_loss_insight_comments. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 4 | `body` | `text` | não |  |  | Coluna body da tabela public.win_loss_insight_comments. Tipo PostgreSQL: text. Não aceita NULL. |
| 5 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.win_loss_insight_comments. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


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

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

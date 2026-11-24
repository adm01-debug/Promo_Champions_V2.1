# public.rank_change_notifications

> Tabela public.rank_change_notifications. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), salesperson_id uuid NOT NULL, overtaken_by_id uuid NOT NULL, old_rank integer NOT NULL, new_rank integer NOT NULL, context text NULLABLE DEFAULT 'monthly'::text, is_read boolean NULLABLE DEFAULT false, created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: overtaken_by_id → public.salespeople(id); salesperson_id → public.salespeople(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.rank_change_notifications. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `salesperson_id` | `uuid` | não |  |  | Coluna salesperson_id da tabela public.rank_change_notifications. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.salespeople(id). |
| 3 | `overtaken_by_id` | `uuid` | não |  |  | Coluna overtaken_by_id da tabela public.rank_change_notifications. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.salespeople(id). |
| 4 | `old_rank` | `integer` | não |  |  | Coluna old_rank da tabela public.rank_change_notifications. Tipo PostgreSQL: integer. Não aceita NULL. |
| 5 | `new_rank` | `integer` | não |  |  | Coluna new_rank da tabela public.rank_change_notifications. Tipo PostgreSQL: integer. Não aceita NULL. |
| 6 | `context` | `text` | sim | `'monthly'::text` |  | Coluna context da tabela public.rank_change_notifications. Tipo PostgreSQL: text. Aceita NULL. Valor padrão: 'monthly'::text. |
| 7 | `is_read` | `boolean` | sim | `false` |  | Coluna is_read da tabela public.rank_change_notifications. Tipo PostgreSQL: boolean. Aceita NULL. Valor padrão: false. |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.rank_change_notifications. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| rank_change_notifications_overtaken_by_id_fkey | FOREIGN KEY | `FOREIGN KEY (overtaken_by_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| rank_change_notifications_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| rank_change_notifications_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_rank_change_notifications_overtaken_by_id | btree | overtaken_by_id | não | sim |  | `CREATE INDEX idx_rank_change_notifications_overtaken_by_id ON public.rank_change_notifications USING btree (overtaken_by_id)` |
| idx_rank_change_notifications_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_rank_change_notifications_salesperson_id ON public.rank_change_notifications USING btree (salesperson_id)` |
| rank_change_notifications_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX rank_change_notifications_pkey ON public.rank_change_notifications USING btree (id)` |


## Policies (RLS)

### `Users can insert own rank_notifications`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(salesperson_id = get_current_salesperson_id())` |

### `Users can read own rank notifications`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(salesperson_id = get_current_salesperson_id())` |
| WITH CHECK |  |

### `Users can update own notifications`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(salesperson_id = get_current_salesperson_id())` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

# public.ranking_notifications

> Tabela public.ranking_notifications. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), salesperson_id uuid NOT NULL, rank integer NOT NULL, total_sales numeric NOT NULL DEFAULT 0, gap_to_first numeric NOT NULL DEFAULT 0, gap_to_next numeric NOT NULL DEFAULT 0, next_competitor_name text NULLABLE, period_start date NOT NULL, message text NOT NULL, read_at timestamp with time zone NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: salesperson_id → public.salespeople(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 4 |
| realtime (publication) | sim |
| replica identity | full |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.ranking_notifications. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `salesperson_id` | `uuid` | não |  |  | Coluna salesperson_id da tabela public.ranking_notifications. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.salespeople(id). |
| 3 | `rank` | `integer` | não |  |  | Coluna rank da tabela public.ranking_notifications. Tipo PostgreSQL: integer. Não aceita NULL. |
| 4 | `total_sales` | `numeric` | não | `0` |  | Coluna total_sales da tabela public.ranking_notifications. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 5 | `gap_to_first` | `numeric` | não | `0` |  | Coluna gap_to_first da tabela public.ranking_notifications. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 6 | `gap_to_next` | `numeric` | não | `0` |  | Coluna gap_to_next da tabela public.ranking_notifications. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 7 | `next_competitor_name` | `text` | sim |  |  | Coluna next_competitor_name da tabela public.ranking_notifications. Tipo PostgreSQL: text. Aceita NULL. |
| 8 | `period_start` | `date` | não |  |  | Coluna period_start da tabela public.ranking_notifications. Tipo PostgreSQL: date. Não aceita NULL. |
| 9 | `message` | `text` | não |  |  | Coluna message da tabela public.ranking_notifications. Tipo PostgreSQL: text. Não aceita NULL. |
| 10 | `read_at` | `timestamp with time zone` | sim |  |  | Coluna read_at da tabela public.ranking_notifications. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.ranking_notifications. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| ranking_notifications_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| ranking_notifications_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| ranking_notifications_salesperson_id_period_start_key | UNIQUE | `UNIQUE (salesperson_id, period_start)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_ranking_notif_salesperson | btree | salesperson_id, created_at | não | sim |  | `CREATE INDEX idx_ranking_notif_salesperson ON public.ranking_notifications USING btree (salesperson_id, created_at DESC)` |
| idx_ranking_notif_unread | btree | salesperson_id | não | sim | `(read_at IS NULL)` | `CREATE INDEX idx_ranking_notif_unread ON public.ranking_notifications USING btree (salesperson_id) WHERE (read_at IS NULL)` |
| ranking_notifications_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX ranking_notifications_pkey ON public.ranking_notifications USING btree (id)` |
| ranking_notifications_salesperson_id_period_start_key | btree | salesperson_id, period_start | sim | sim |  | `CREATE UNIQUE INDEX ranking_notifications_salesperson_id_period_start_key ON public.ranking_notifications USING btree (salesperson_id, period_start)` |


## Policies (RLS)

### `Admin manager delete ranking notifications`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |

### `Admin manager insert ranking notifications`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `Salesperson reads own ranking notifications`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `((salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid()))) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |

### `Salesperson updates own ranking notifications`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

# public.order_status_events

> Tabela public.order_status_events. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), order_id uuid NOT NULL, status text NOT NULL, description text NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: order_id → public.orders(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.order_status_events. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `order_id` | `uuid` | não |  |  | Coluna order_id da tabela public.order_status_events. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.orders(id). |
| 3 | `status` | `text` | não |  |  | Coluna status da tabela public.order_status_events. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `description` | `text` | sim |  |  | Coluna description da tabela public.order_status_events. Tipo PostgreSQL: text. Aceita NULL. |
| 5 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.order_status_events. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| order_status_events_order_id_fkey | FOREIGN KEY | `FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| order_status_events_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_order_status_events_order | btree | order_id, created_at | não | sim |  | `CREATE INDEX idx_order_status_events_order ON public.order_status_events USING btree (order_id, created_at)` |
| order_status_events_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX order_status_events_pkey ON public.order_status_events USING btree (id)` |


## Policies (RLS)

### `Admins and managers view order events`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Users view own order events`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM orders o   WHERE ((o.id = order_status_events.order_id) AND ((o.user_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)))))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

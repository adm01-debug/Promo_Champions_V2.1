# public.dialer_queue_items

> Tabela public.dialer_queue_items. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), queue_id uuid NOT NULL, sale_id uuid NOT NULL, score numeric NOT NULL DEFAULT 0, queue_position integer NOT NULL DEFAULT 0, status text NOT NULL DEFAULT 'pending'::text, snooze_until timestamp with time zone NULLABLE, added_at timestamp with time zone NOT NULL DEFAULT now(), completed_at timestamp with time zone NULLABLE. Relacionamentos FK: queue_id → public.dialer_queues(id); sale_id → public.sales(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.dialer_queue_items. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `queue_id` | `uuid` | não |  |  | Coluna queue_id da tabela public.dialer_queue_items. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.dialer_queues(id). |
| 3 | `sale_id` | `uuid` | não |  |  | Coluna sale_id da tabela public.dialer_queue_items. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.sales(id). |
| 4 | `score` | `numeric` | não | `0` |  | Coluna score da tabela public.dialer_queue_items. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 5 | `queue_position` | `integer` | não | `0` |  | Coluna queue_position da tabela public.dialer_queue_items. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 6 | `status` | `text` | não | `'pending'::text` |  | Coluna status da tabela public.dialer_queue_items. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'pending'::text. Validação CHECK: CHECK (status = ANY (ARRAY['pending'::text, 'calling'::text, 'done'::text, 'skipped'::text, 'snoozed'::text])). |
| 7 | `snooze_until` | `timestamp with time zone` | sim |  |  | Coluna snooze_until da tabela public.dialer_queue_items. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 8 | `added_at` | `timestamp with time zone` | não | `now()` |  | Coluna added_at da tabela public.dialer_queue_items. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 9 | `completed_at` | `timestamp with time zone` | sim |  |  | Coluna completed_at da tabela public.dialer_queue_items. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| dialer_queue_items_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| dialer_queue_items_queue_id_fkey | FOREIGN KEY | `FOREIGN KEY (queue_id) REFERENCES dialer_queues(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| dialer_queue_items_queue_id_sale_id_key | UNIQUE | `UNIQUE (queue_id, sale_id)` |  |  | sim |
| dialer_queue_items_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| dialer_queue_items_status_check | CHECK | `CHECK (status = ANY (ARRAY['pending'::text, 'calling'::text, 'done'::text, 'skipped'::text, 'snoozed'::text]))` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.call_logs | call_logs_queue_item_id_fkey | queue_item_id | SET NULL |
| public.twilio_call_sessions | twilio_call_sessions_queue_item_id_fkey | queue_item_id | SET NULL |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| dialer_queue_items_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX dialer_queue_items_pkey ON public.dialer_queue_items USING btree (id)` |
| dialer_queue_items_queue_id_sale_id_key | btree | queue_id, sale_id | sim | sim |  | `CREATE UNIQUE INDEX dialer_queue_items_queue_id_sale_id_key ON public.dialer_queue_items USING btree (queue_id, sale_id)` |
| idx_champ_dialer_queue_items_sale_id | btree | sale_id | não | sim |  | `CREATE INDEX idx_champ_dialer_queue_items_sale_id ON public.dialer_queue_items USING btree (sale_id)` |
| idx_dialer_queue_items_queue_status_pos | btree | queue_id, status, queue_position | não | sim |  | `CREATE INDEX idx_dialer_queue_items_queue_status_pos ON public.dialer_queue_items USING btree (queue_id, status, queue_position)` |


## Policies (RLS)

### `Manage items via queue ownership`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM dialer_queues q   WHERE ((q.id = dialer_queue_items.queue_id) AND ((q.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)))))` |
| WITH CHECK | `(EXISTS ( SELECT 1    FROM dialer_queues q   WHERE ((q.id = dialer_queue_items.queue_id) AND ((q.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role)))))` |

### `View items via queue ownership`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(EXISTS ( SELECT 1    FROM dialer_queues q   WHERE ((q.id = dialer_queue_items.queue_id) AND ((q.owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role)))))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

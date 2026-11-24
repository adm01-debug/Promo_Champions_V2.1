# public.call_logs

> Tabela public.call_logs. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), owner_id uuid NOT NULL, sale_id uuid NULLABLE, queue_item_id uuid NULLABLE, disposition text NOT NULL, outcome text NULLABLE, duration_seconds integer NULLABLE DEFAULT 0, notes text NULLABLE, next_action_at timestamp with time zone NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), call_sid text NULLABLE. Relacionamentos FK: queue_item_id → public.dialer_queue_items(id); sale_id → public.sales(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 4 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.call_logs. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `owner_id` | `uuid` | não |  |  | Coluna owner_id da tabela public.call_logs. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 3 | `sale_id` | `uuid` | sim |  |  | Coluna sale_id da tabela public.call_logs. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.sales(id). |
| 4 | `queue_item_id` | `uuid` | sim |  |  | Coluna queue_item_id da tabela public.call_logs. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.dialer_queue_items(id). |
| 5 | `disposition` | `text` | não |  |  | Coluna disposition da tabela public.call_logs. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (disposition = ANY (ARRAY['connected'::text, 'voicemail'::text, 'no_answer'::text, 'busy'::text, 'wrong_number'::text, 'do_not_call'::text])). |
| 6 | `outcome` | `text` | sim |  |  | Coluna outcome da tabela public.call_logs. Tipo PostgreSQL: text. Aceita NULL. Validação CHECK: CHECK (outcome = ANY (ARRAY['meeting_set'::text, 'interested'::text, 'not_interested'::text, 'callback'::text, 'nurture'::text])). |
| 7 | `duration_seconds` | `integer` | sim | `0` |  | Coluna duration_seconds da tabela public.call_logs. Tipo PostgreSQL: integer. Aceita NULL. Valor padrão: 0. |
| 8 | `notes` | `text` | sim |  |  | Coluna notes da tabela public.call_logs. Tipo PostgreSQL: text. Aceita NULL. |
| 9 | `next_action_at` | `timestamp with time zone` | sim |  |  | Coluna next_action_at da tabela public.call_logs. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 10 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.call_logs. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 11 | `call_sid` | `text` | sim |  |  | Coluna call_sid da tabela public.call_logs. Tipo PostgreSQL: text. Aceita NULL. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| call_logs_disposition_check | CHECK | `CHECK (disposition = ANY (ARRAY['connected'::text, 'voicemail'::text, 'no_answer'::text, 'busy'::text, 'wrong_number'::text, 'do_not_call'::text]))` |  |  | sim |
| call_logs_outcome_check | CHECK | `CHECK (outcome = ANY (ARRAY['meeting_set'::text, 'interested'::text, 'not_interested'::text, 'callback'::text, 'nurture'::text]))` |  |  | sim |
| call_logs_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| call_logs_queue_item_id_fkey | FOREIGN KEY | `FOREIGN KEY (queue_item_id) REFERENCES dialer_queue_items(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| call_logs_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| call_logs_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX call_logs_pkey ON public.call_logs USING btree (id)` |
| idx_call_logs_call_sid | btree | call_sid | não | sim |  | `CREATE INDEX idx_call_logs_call_sid ON public.call_logs USING btree (call_sid)` |
| idx_call_logs_owner_created | btree | owner_id, created_at | não | sim |  | `CREATE INDEX idx_call_logs_owner_created ON public.call_logs USING btree (owner_id, created_at DESC)` |
| idx_call_logs_queue_item_id | btree | queue_item_id | não | sim |  | `CREATE INDEX idx_call_logs_queue_item_id ON public.call_logs USING btree (queue_item_id)` |
| idx_call_logs_sale | btree | sale_id, created_at | não | sim |  | `CREATE INDEX idx_call_logs_sale ON public.call_logs USING btree (sale_id, created_at DESC)` |


## Policies (RLS)

### `Delete own call logs`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))` |
| WITH CHECK |  |

### `Insert own call logs`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(owner_id = auth.uid())` |

### `Update own call logs`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role))` |
| WITH CHECK |  |

### `View call logs`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((owner_id = auth.uid()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

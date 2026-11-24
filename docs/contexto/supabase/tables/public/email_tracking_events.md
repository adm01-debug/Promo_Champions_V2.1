# public.email_tracking_events

> Tabela public.email_tracking_events. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), sale_id uuid NULLABLE, salesperson_id uuid NULLABLE, recipient_email text NOT NULL, subject text NOT NULL, event_type text NOT NULL DEFAULT 'sent'::text, tracked_at timestamp with time zone NOT NULL DEFAULT now(), metadata jsonb NULLABLE DEFAULT '{}'::jsonb, created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: sale_id → public.sales(id); salesperson_id → public.salespeople(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 1 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.email_tracking_events. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `sale_id` | `uuid` | sim |  |  | Coluna sale_id da tabela public.email_tracking_events. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.sales(id). |
| 3 | `salesperson_id` | `uuid` | sim |  |  | Coluna salesperson_id da tabela public.email_tracking_events. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.salespeople(id). |
| 4 | `recipient_email` | `text` | não |  |  | Coluna recipient_email da tabela public.email_tracking_events. Tipo PostgreSQL: text. Não aceita NULL. |
| 5 | `subject` | `text` | não |  |  | Coluna subject da tabela public.email_tracking_events. Tipo PostgreSQL: text. Não aceita NULL. |
| 6 | `event_type` | `text` | não | `'sent'::text` |  | Coluna event_type da tabela public.email_tracking_events. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'sent'::text. |
| 7 | `tracked_at` | `timestamp with time zone` | não | `now()` |  | Coluna tracked_at da tabela public.email_tracking_events. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 8 | `metadata` | `jsonb` | sim | `'{}'::jsonb` |  | Coluna metadata da tabela public.email_tracking_events. Tipo PostgreSQL: jsonb. Aceita NULL. Valor padrão: '{}'::jsonb. |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.email_tracking_events. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| email_tracking_events_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| email_tracking_events_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| email_tracking_events_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| email_tracking_events_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX email_tracking_events_pkey ON public.email_tracking_events USING btree (id)` |
| idx_email_tracking_events_sale_id | btree | sale_id | não | sim |  | `CREATE INDEX idx_email_tracking_events_sale_id ON public.email_tracking_events USING btree (sale_id)` |
| idx_email_tracking_events_salesperson_id | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_email_tracking_events_salesperson_id ON public.email_tracking_events USING btree (salesperson_id)` |


## Policies (RLS)

### `Users can view own email tracking`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(salesperson_id = get_current_salesperson_id())` |
| WITH CHECK | `(salesperson_id = get_current_salesperson_id())` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| trg_email_tracking_to_cadence_intent | AFTER | INSERT | ROW | enabled | public.trg_process_email_tracking_event |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

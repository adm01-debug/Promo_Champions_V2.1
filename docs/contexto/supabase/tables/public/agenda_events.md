# public.agenda_events

> Tabela public.agenda_events. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), salesperson_id uuid NOT NULL, sale_id uuid NULLABLE, client_id uuid NULLABLE, title text NOT NULL, description text NULLABLE, event_type text NOT NULL DEFAULT 'reminder'::text, status text NOT NULL DEFAULT 'pending'::text, priority text NOT NULL DEFAULT 'medium'::text, scheduled_at timestamp with time zone NOT NULL, completed_at timestamp with time zone NULLABLE, reminder_minutes_before integer NULLABLE DEFAULT 15, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: client_id → public.clients(id); sale_id → public.sales(id); salesperson_id → public.salespeople(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.agenda_events. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `salesperson_id` | `uuid` | não |  |  | Coluna salesperson_id da tabela public.agenda_events. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.salespeople(id). |
| 3 | `sale_id` | `uuid` | sim |  |  | Coluna sale_id da tabela public.agenda_events. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.sales(id). |
| 4 | `client_id` | `uuid` | sim |  |  | Coluna client_id da tabela public.agenda_events. Tipo PostgreSQL: uuid. Aceita NULL. Referência FK: public.clients(id). |
| 5 | `title` | `text` | não |  |  | Coluna title da tabela public.agenda_events. Tipo PostgreSQL: text. Não aceita NULL. |
| 6 | `description` | `text` | sim |  |  | Coluna description da tabela public.agenda_events. Tipo PostgreSQL: text. Aceita NULL. |
| 7 | `event_type` | `text` | não | `'reminder'::text` |  | Coluna event_type da tabela public.agenda_events. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'reminder'::text. Validação CHECK: CHECK (event_type = ANY (ARRAY['reminder'::text, 'follow_up'::text, 'meeting'::text, 'call'::text, 'task'::text])). |
| 8 | `status` | `text` | não | `'pending'::text` |  | Coluna status da tabela public.agenda_events. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'pending'::text. Validação CHECK: CHECK (status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text])). |
| 9 | `priority` | `text` | não | `'medium'::text` |  | Coluna priority da tabela public.agenda_events. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'medium'::text. Validação CHECK: CHECK (priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text])). |
| 10 | `scheduled_at` | `timestamp with time zone` | não |  |  | Coluna scheduled_at da tabela public.agenda_events. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. |
| 11 | `completed_at` | `timestamp with time zone` | sim |  |  | Coluna completed_at da tabela public.agenda_events. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. |
| 12 | `reminder_minutes_before` | `integer` | sim | `15` |  | Coluna reminder_minutes_before da tabela public.agenda_events. Tipo PostgreSQL: integer. Aceita NULL. Valor padrão: 15. |
| 13 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.agenda_events. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 14 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.agenda_events. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| agenda_events_client_id_fkey | FOREIGN KEY | `FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| agenda_events_event_type_check | CHECK | `CHECK (event_type = ANY (ARRAY['reminder'::text, 'follow_up'::text, 'meeting'::text, 'call'::text, 'task'::text]))` |  |  | sim |
| agenda_events_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| agenda_events_priority_check | CHECK | `CHECK (priority = ANY (ARRAY['low'::text, 'medium'::text, 'high'::text, 'urgent'::text]))` |  |  | sim |
| agenda_events_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE SET NULL` | SET NULL | NO ACTION | sim |
| agenda_events_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| agenda_events_status_check | CHECK | `CHECK (status = ANY (ARRAY['pending'::text, 'in_progress'::text, 'completed'::text, 'cancelled'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| agenda_events_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX agenda_events_pkey ON public.agenda_events USING btree (id)` |
| idx_agenda_events_client_id | btree | client_id | não | sim |  | `CREATE INDEX idx_agenda_events_client_id ON public.agenda_events USING btree (client_id)` |
| idx_agenda_events_sale | btree | sale_id | não | sim | `(sale_id IS NOT NULL)` | `CREATE INDEX idx_agenda_events_sale ON public.agenda_events USING btree (sale_id) WHERE (sale_id IS NOT NULL)` |
| idx_agenda_events_salesperson | btree | salesperson_id | não | sim |  | `CREATE INDEX idx_agenda_events_salesperson ON public.agenda_events USING btree (salesperson_id)` |
| idx_agenda_events_scheduled | btree | scheduled_at | não | sim |  | `CREATE INDEX idx_agenda_events_scheduled ON public.agenda_events USING btree (scheduled_at)` |
| idx_agenda_events_status | btree | status | não | sim |  | `CREATE INDEX idx_agenda_events_status ON public.agenda_events USING btree (status)` |


## Policies (RLS)

### `Admins/Managers view all agenda events`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `is_admin_or_manager(auth.uid())` |
| WITH CHECK |  |

### `Salespeople manage own agenda events`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(salesperson_id = get_current_salesperson_id())` |
| WITH CHECK | `(salesperson_id = get_current_salesperson_id())` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| update_agenda_events_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

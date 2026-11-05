# public.agenda_events

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `salesperson_id` | `uuid` | não |  |  |  |
| 3 | `sale_id` | `uuid` | sim |  |  |  |
| 4 | `client_id` | `uuid` | sim |  |  |  |
| 5 | `title` | `text` | não |  |  |  |
| 6 | `description` | `text` | sim |  |  |  |
| 7 | `event_type` | `text` | não | `'reminder'::text` |  |  |
| 8 | `status` | `text` | não | `'pending'::text` |  |  |
| 9 | `priority` | `text` | não | `'medium'::text` |  |  |
| 10 | `scheduled_at` | `timestamp with time zone` | não |  |  |  |
| 11 | `completed_at` | `timestamp with time zone` | sim |  |  |  |
| 12 | `reminder_minutes_before` | `integer` | sim | `15` |  |  |
| 13 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 14 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


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

_nenhum_

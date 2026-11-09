# public.coaching_actions

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `recording_id` | `uuid` | não |  |  |  |
| 3 | `salesperson_id` | `uuid` | não |  |  |  |
| 4 | `tip` | `text` | não |  |  |  |
| 5 | `category` | `text` | não | `'discovery'::text` |  |  |
| 6 | `severity` | `text` | não | `'info'::text` |  |  |
| 7 | `timestamp_sec` | `integer` | sim |  |  |  |
| 8 | `quote` | `text` | sim |  |  |  |
| 9 | `status` | `text` | não | `'pending'::text` |  |  |
| 10 | `manager_note` | `text` | sim |  |  |  |
| 11 | `accepted_at` | `timestamp with time zone` | sim |  |  |  |
| 12 | `created_by_ai` | `boolean` | não | `true` |  |  |
| 13 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 14 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| coaching_actions_category_chk | CHECK | `CHECK (category = ANY (ARRAY['opening'::text, 'discovery'::text, 'objection'::text, 'closing'::text, 'talk_ratio'::text, 'pace'::text, 'empathy'::text, 'other'::text]))` |  |  | sim |
| coaching_actions_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| coaching_actions_recording_id_fkey | FOREIGN KEY | `FOREIGN KEY (recording_id) REFERENCES call_recordings(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| coaching_actions_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| coaching_actions_severity_chk | CHECK | `CHECK (severity = ANY (ARRAY['info'::text, 'warning'::text, 'critical'::text]))` |  |  | sim |
| coaching_actions_status_chk | CHECK | `CHECK (status = ANY (ARRAY['pending'::text, 'accepted'::text, 'dismissed'::text, 'practiced'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| coaching_actions_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX coaching_actions_pkey ON public.coaching_actions USING btree (id)` |
| idx_coaching_actions_recording | btree | recording_id | não | sim |  | `CREATE INDEX idx_coaching_actions_recording ON public.coaching_actions USING btree (recording_id)` |
| idx_coaching_actions_sp_status | btree | salesperson_id, status, created_at | não | sim |  | `CREATE INDEX idx_coaching_actions_sp_status ON public.coaching_actions USING btree (salesperson_id, status, created_at DESC)` |


## Policies (RLS)

### `Admin or manager delete coaching`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |

### `Admin or manager insert coaching`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `Salesperson updates own coaching status`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((salesperson_id = get_current_salesperson_id()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |

### `Salesperson views own coaching`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((salesperson_id = get_current_salesperson_id()) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_coaching_actions_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

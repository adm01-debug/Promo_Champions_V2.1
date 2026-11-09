# public.personal_assistant_nudges

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
| 2 | `salesperson_id` | `uuid` | não |  |  |  |
| 3 | `content` | `text` | não |  |  |  |
| 4 | `model` | `text` | sim |  |  |  |
| 5 | `feedback` | `text` | não | `'pending'::text` |  |  |
| 6 | `feedback_at` | `timestamp with time zone` | sim |  |  |  |
| 7 | `context_snapshot` | `jsonb` | sim |  |  |  |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 9 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| personal_assistant_nudges_feedback_check | CHECK | `CHECK (feedback = ANY (ARRAY['pending'::text, 'accepted'::text, 'dismissed'::text]))` |  |  | sim |
| personal_assistant_nudges_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| personal_assistant_nudges_salesperson_id_fkey | FOREIGN KEY | `FOREIGN KEY (salesperson_id) REFERENCES salespeople(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_pa_nudges_feedback | btree | feedback | não | sim | `(feedback <> 'pending'::text)` | `CREATE INDEX idx_pa_nudges_feedback ON public.personal_assistant_nudges USING btree (feedback) WHERE (feedback <> 'pending'::text)` |
| idx_pa_nudges_sp_created | btree | salesperson_id, created_at | não | sim |  | `CREATE INDEX idx_pa_nudges_sp_created ON public.personal_assistant_nudges USING btree (salesperson_id, created_at DESC)` |
| personal_assistant_nudges_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX personal_assistant_nudges_pkey ON public.personal_assistant_nudges USING btree (id)` |


## Policies (RLS)

### `Admins and managers can read all nudges`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |

### `Salesperson inserts own nudges`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |

### `Salesperson reads own nudges`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |
| WITH CHECK |  |

### `Salesperson updates own nudge feedback`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |
| WITH CHECK | `(salesperson_id IN ( SELECT salespeople.id    FROM salespeople   WHERE (salespeople.auth_user_id = auth.uid())))` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| trg_pa_nudges_protect | BEFORE | UPDATE | ROW | enabled | public.protect_pa_nudge_content |
| trg_pa_nudges_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

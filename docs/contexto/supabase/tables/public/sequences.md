# public.sequences

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
| 2 | `owner_id` | `uuid` | não |  |  |  |
| 3 | `name` | `text` | não |  |  |  |
| 4 | `description` | `text` | sim |  |  |  |
| 5 | `channel_mix` | `text[]` | não | `ARRAY[]::text[]` |  |  |
| 6 | `enabled` | `boolean` | não | `true` |  |  |
| 7 | `exit_on_reply` | `boolean` | não | `true` |  |  |
| 8 | `exit_on_meeting` | `boolean` | não | `true` |  |  |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 10 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |
| 11 | `send_time_optimization` | `boolean` | não | `true` |  |  |
| 12 | `auto_pause_on_reply` | `boolean` | não | `true` |  |  |
| 13 | `auto_pause_on_bounce` | `boolean` | não | `true` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| sequences_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Referenciada por (FKs de outras tabelas)

| tabela | constraint | colunas | on delete |
|---|---|---|---|
| public.sequence_enrollments | sequence_enrollments_sequence_id_fkey | sequence_id | CASCADE |
| public.sequence_steps | sequence_steps_sequence_id_fkey | sequence_id | CASCADE |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_sequences_enabled | btree | enabled | não | sim | `(enabled = true)` | `CREATE INDEX idx_sequences_enabled ON public.sequences USING btree (enabled) WHERE (enabled = true)` |
| idx_sequences_owner | btree | owner_id | não | sim |  | `CREATE INDEX idx_sequences_owner ON public.sequences USING btree (owner_id)` |
| sequences_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX sequences_pkey ON public.sequences USING btree (id)` |


## Policies (RLS)

### `Authenticated users create sequences`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | public |
| USING |  |
| WITH CHECK | `(auth.uid() = owner_id)` |

### `Owners delete their sequences`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((auth.uid() = owner_id) OR has_role(auth.uid(), 'admin'::app_role))` |
| WITH CHECK |  |

### `Owners update their sequences`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((auth.uid() = owner_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |

### `Owners view their sequences`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | public |
| USING | `((auth.uid() = owner_id) OR has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_sequences_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

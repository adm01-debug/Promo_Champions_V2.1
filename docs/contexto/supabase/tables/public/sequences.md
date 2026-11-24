# public.sequences

> Tabela public.sequences. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), owner_id uuid NOT NULL, name text NOT NULL, description text NULLABLE, channel_mix text[] NOT NULL DEFAULT ARRAY[]::text[], enabled boolean NOT NULL DEFAULT true, exit_on_reply boolean NOT NULL DEFAULT true, exit_on_meeting boolean NOT NULL DEFAULT true, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now(), send_time_optimization boolean NOT NULL DEFAULT true, auto_pause_on_reply boolean NOT NULL DEFAULT true, auto_pause_on_bounce boolean NOT NULL DEFAULT true.

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.sequences. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `owner_id` | `uuid` | não |  |  | Coluna owner_id da tabela public.sequences. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 3 | `name` | `text` | não |  |  | Coluna name da tabela public.sequences. Tipo PostgreSQL: text. Não aceita NULL. |
| 4 | `description` | `text` | sim |  |  | Coluna description da tabela public.sequences. Tipo PostgreSQL: text. Aceita NULL. |
| 5 | `channel_mix` | `text[]` | não | `ARRAY[]::text[]` |  | Coluna channel_mix da tabela public.sequences. Tipo PostgreSQL: text[]. Não aceita NULL. Valor padrão: ARRAY[]::text[]. |
| 6 | `enabled` | `boolean` | não | `true` |  | Coluna enabled da tabela public.sequences. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: true. |
| 7 | `exit_on_reply` | `boolean` | não | `true` |  | Coluna exit_on_reply da tabela public.sequences. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: true. |
| 8 | `exit_on_meeting` | `boolean` | não | `true` |  | Coluna exit_on_meeting da tabela public.sequences. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: true. |
| 9 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.sequences. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 10 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.sequences. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 11 | `send_time_optimization` | `boolean` | não | `true` |  | Coluna send_time_optimization da tabela public.sequences. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: true. |
| 12 | `auto_pause_on_reply` | `boolean` | não | `true` |  | Coluna auto_pause_on_reply da tabela public.sequences. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: true. |
| 13 | `auto_pause_on_bounce` | `boolean` | não | `true` |  | Coluna auto_pause_on_bounce da tabela public.sequences. Tipo PostgreSQL: boolean. Não aceita NULL. Valor padrão: true. |


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

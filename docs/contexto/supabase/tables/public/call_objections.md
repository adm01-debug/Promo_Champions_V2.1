# public.call_objections

> Tabela public.call_objections. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), recording_id uuid NOT NULL, client_turn_index integer NOT NULL DEFAULT 0, objection_text text NOT NULL, objection_type text NOT NULL DEFAULT 'other'::text, seller_response_text text NULLABLE, response_quality text NOT NULL DEFAULT 'ignored'::text, resolution_status text NOT NULL DEFAULT 'unresolved'::text, start_estimate numeric NOT NULL DEFAULT 0, factors jsonb NOT NULL DEFAULT '{}'::jsonb, created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: recording_id → public.call_recordings(id).

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 2 |
| realtime (publication) | sim |
| replica identity | full |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.call_objections. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `recording_id` | `uuid` | não |  |  | Coluna recording_id da tabela public.call_objections. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.call_recordings(id). |
| 3 | `client_turn_index` | `integer` | não | `0` |  | Coluna client_turn_index da tabela public.call_objections. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 4 | `objection_text` | `text` | não |  |  | Coluna objection_text da tabela public.call_objections. Tipo PostgreSQL: text. Não aceita NULL. |
| 5 | `objection_type` | `text` | não | `'other'::text` |  | Coluna objection_type da tabela public.call_objections. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'other'::text. |
| 6 | `seller_response_text` | `text` | sim |  |  | Coluna seller_response_text da tabela public.call_objections. Tipo PostgreSQL: text. Aceita NULL. |
| 7 | `response_quality` | `text` | não | `'ignored'::text` |  | Coluna response_quality da tabela public.call_objections. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'ignored'::text. |
| 8 | `resolution_status` | `text` | não | `'unresolved'::text` |  | Coluna resolution_status da tabela public.call_objections. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'unresolved'::text. |
| 9 | `start_estimate` | `numeric` | não | `0` |  | Coluna start_estimate da tabela public.call_objections. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 10 | `factors` | `jsonb` | não | `'{}'::jsonb` |  | Coluna factors da tabela public.call_objections. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '{}'::jsonb. |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.call_objections. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| call_objections_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| call_objections_recording_id_fkey | FOREIGN KEY | `FOREIGN KEY (recording_id) REFERENCES call_recordings(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| call_objections_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX call_objections_pkey ON public.call_objections USING btree (id)` |
| idx_call_objections_recording | btree | recording_id | não | sim |  | `CREATE INDEX idx_call_objections_recording ON public.call_objections USING btree (recording_id)` |
| idx_call_objections_type | btree | objection_type | não | sim |  | `CREATE INDEX idx_call_objections_type ON public.call_objections USING btree (objection_type)` |


## Policies (RLS)

### `Admin/manager write call objections`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `Authenticated read call objections`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

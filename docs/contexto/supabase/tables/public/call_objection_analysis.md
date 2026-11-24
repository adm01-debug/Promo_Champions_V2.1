# public.call_objection_analysis

> Tabela public.call_objection_analysis. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), recording_id uuid NOT NULL, total_objections integer NOT NULL DEFAULT 0, resolved_count integer NOT NULL DEFAULT 0, partially_resolved_count integer NOT NULL DEFAULT 0, unresolved_count integer NOT NULL DEFAULT 0, avg_response_time_seconds numeric NOT NULL DEFAULT 0, handling_score numeric NOT NULL DEFAULT 0, health text NOT NULL DEFAULT 'fair'::text, factors jsonb NOT NULL DEFAULT '{}'::jsonb, calculated_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: recording_id → public.call_recordings(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.call_objection_analysis. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `recording_id` | `uuid` | não |  |  | Coluna recording_id da tabela public.call_objection_analysis. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.call_recordings(id). |
| 3 | `total_objections` | `integer` | não | `0` |  | Coluna total_objections da tabela public.call_objection_analysis. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 4 | `resolved_count` | `integer` | não | `0` |  | Coluna resolved_count da tabela public.call_objection_analysis. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 5 | `partially_resolved_count` | `integer` | não | `0` |  | Coluna partially_resolved_count da tabela public.call_objection_analysis. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 6 | `unresolved_count` | `integer` | não | `0` |  | Coluna unresolved_count da tabela public.call_objection_analysis. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 7 | `avg_response_time_seconds` | `numeric` | não | `0` |  | Coluna avg_response_time_seconds da tabela public.call_objection_analysis. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 8 | `handling_score` | `numeric` | não | `0` |  | Coluna handling_score da tabela public.call_objection_analysis. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 9 | `health` | `text` | não | `'fair'::text` |  | Coluna health da tabela public.call_objection_analysis. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'fair'::text. |
| 10 | `factors` | `jsonb` | não | `'{}'::jsonb` |  | Coluna factors da tabela public.call_objection_analysis. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '{}'::jsonb. |
| 11 | `calculated_at` | `timestamp with time zone` | não | `now()` |  | Coluna calculated_at da tabela public.call_objection_analysis. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| call_objection_analysis_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| call_objection_analysis_recording_id_fkey | FOREIGN KEY | `FOREIGN KEY (recording_id) REFERENCES call_recordings(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| call_objection_analysis_recording_id_key | UNIQUE | `UNIQUE (recording_id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| call_objection_analysis_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX call_objection_analysis_pkey ON public.call_objection_analysis USING btree (id)` |
| call_objection_analysis_recording_id_key | btree | recording_id | sim | sim |  | `CREATE UNIQUE INDEX call_objection_analysis_recording_id_key ON public.call_objection_analysis USING btree (recording_id)` |


## Policies (RLS)

### `Admin/manager write objection analysis`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |

### `Authenticated read objection analysis`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

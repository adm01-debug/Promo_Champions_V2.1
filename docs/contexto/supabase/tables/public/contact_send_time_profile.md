# public.contact_send_time_profile

> Tabela public.contact_send_time_profile. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), contact_id uuid NOT NULL, contact_type text NOT NULL, hour_of_day smallint NOT NULL, day_of_week smallint NOT NULL, opens integer NOT NULL DEFAULT 0, clicks integer NOT NULL DEFAULT 0, replies integer NOT NULL DEFAULT 0, score numeric NULLABLE DEFAULT ((((opens)::numeric * 1.0) + ((clicks)::numeric * 2.0)) + ((replies)::numeric * 5.0)), updated_at timestamp with time zone NOT NULL DEFAULT now().

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
| usada por views | public.contact_best_send_window |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.contact_send_time_profile. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `contact_id` | `uuid` | não |  |  | Coluna contact_id da tabela public.contact_send_time_profile. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 3 | `contact_type` | `text` | não |  |  | Coluna contact_type da tabela public.contact_send_time_profile. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (contact_type = ANY (ARRAY['lead'::text, 'client'::text])). |
| 4 | `hour_of_day` | `smallint` | não |  |  | Coluna hour_of_day da tabela public.contact_send_time_profile. Tipo PostgreSQL: smallint. Não aceita NULL. Validação CHECK: CHECK (hour_of_day >= 0 AND hour_of_day <= 23). |
| 5 | `day_of_week` | `smallint` | não |  |  | Coluna day_of_week da tabela public.contact_send_time_profile. Tipo PostgreSQL: smallint. Não aceita NULL. Validação CHECK: CHECK (day_of_week >= 0 AND day_of_week <= 6). |
| 6 | `opens` | `integer` | não | `0` |  | Coluna opens da tabela public.contact_send_time_profile. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 7 | `clicks` | `integer` | não | `0` |  | Coluna clicks da tabela public.contact_send_time_profile. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 8 | `replies` | `integer` | não | `0` |  | Coluna replies da tabela public.contact_send_time_profile. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 9 | `score` | `numeric` | sim | `((((opens)::numeric * 1.0) + ((clicks)::numeric * 2.0)) + ((replies)::numeric * 5.0))` | s | Coluna score da tabela public.contact_send_time_profile. Tipo PostgreSQL: numeric. Aceita NULL. Valor padrão: ((((opens)::numeric * 1.0) + ((clicks)::numeric * 2.0)) + ((replies)::numeric * 5.0)). |
| 10 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.contact_send_time_profile. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| contact_send_time_profile_contact_id_contact_type_hour_of_d_key | UNIQUE | `UNIQUE (contact_id, contact_type, hour_of_day, day_of_week)` |  |  | sim |
| contact_send_time_profile_contact_type_check | CHECK | `CHECK (contact_type = ANY (ARRAY['lead'::text, 'client'::text]))` |  |  | sim |
| contact_send_time_profile_day_of_week_check | CHECK | `CHECK (day_of_week >= 0 AND day_of_week <= 6)` |  |  | sim |
| contact_send_time_profile_hour_of_day_check | CHECK | `CHECK (hour_of_day >= 0 AND hour_of_day <= 23)` |  |  | sim |
| contact_send_time_profile_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| contact_send_time_profile_contact_id_contact_type_hour_of_d_key | btree | contact_id, contact_type, hour_of_day, day_of_week | sim | sim |  | `CREATE UNIQUE INDEX contact_send_time_profile_contact_id_contact_type_hour_of_d_key ON public.contact_send_time_profile USING btree (contact_id, contact_type, hour_of_day, day_of_week)` |
| contact_send_time_profile_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX contact_send_time_profile_pkey ON public.contact_send_time_profile USING btree (id)` |
| idx_cstp_contact | btree | contact_id, contact_type | não | sim |  | `CREATE INDEX idx_cstp_contact ON public.contact_send_time_profile USING btree (contact_id, contact_type)` |
| idx_cstp_score | btree | contact_id, contact_type, score | não | sim |  | `CREATE INDEX idx_cstp_score ON public.contact_send_time_profile USING btree (contact_id, contact_type, score DESC)` |


## Policies (RLS)

### `STO profiles readable by managers and admins`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR has_role(auth.uid(), 'salesperson'::app_role))` |
| WITH CHECK |  |

### `STO profiles writable by service role only`

| campo | valor |
|---|---|
| comando | ALL |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK | `has_role(auth.uid(), 'admin'::app_role)` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| set_updated_at | BEFORE | UPDATE | ROW | enabled | public.handle_updated_at |
| trg_recompute_engagement_on_signal | AFTER | INSERT OR UPDATE | ROW | enabled | private.trg_recompute_engagement |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

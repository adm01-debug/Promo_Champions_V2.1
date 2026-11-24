# public.send_time_profiles

> Tabela public.send_time_profiles. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), sale_id uuid NOT NULL, best_hour integer NOT NULL DEFAULT 10, best_dow integer NOT NULL DEFAULT 2, confidence numeric NOT NULL DEFAULT 0, sample_size integer NOT NULL DEFAULT 0, tz text NOT NULL DEFAULT 'America/Sao_Paulo'::text, hour_distribution jsonb NOT NULL DEFAULT '[]'::jsonb, dow_distribution jsonb NOT NULL DEFAULT '[]'::jsonb, last_calculated_at timestamp with time zone NOT NULL DEFAULT now(), created_at timestamp with time zone NOT NULL DEFAULT now(). Relacionamentos FK: sale_id → public.sales(id).

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.send_time_profiles. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `sale_id` | `uuid` | não |  |  | Coluna sale_id da tabela public.send_time_profiles. Tipo PostgreSQL: uuid. Não aceita NULL. Referência FK: public.sales(id). |
| 3 | `best_hour` | `integer` | não | `10` |  | Coluna best_hour da tabela public.send_time_profiles. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 10. Validação CHECK: CHECK (best_hour >= 0 AND best_hour <= 23). |
| 4 | `best_dow` | `integer` | não | `2` |  | Coluna best_dow da tabela public.send_time_profiles. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 2. Validação CHECK: CHECK (best_dow >= 0 AND best_dow <= 6). |
| 5 | `confidence` | `numeric` | não | `0` |  | Coluna confidence da tabela public.send_time_profiles. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. Validação CHECK: CHECK (confidence >= 0::numeric AND confidence <= 1::numeric). |
| 6 | `sample_size` | `integer` | não | `0` |  | Coluna sample_size da tabela public.send_time_profiles. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 7 | `tz` | `text` | não | `'America/Sao_Paulo'::text` |  | Coluna tz da tabela public.send_time_profiles. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'America/Sao_Paulo'::text. |
| 8 | `hour_distribution` | `jsonb` | não | `'[]'::jsonb` |  | Coluna hour_distribution da tabela public.send_time_profiles. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '[]'::jsonb. |
| 9 | `dow_distribution` | `jsonb` | não | `'[]'::jsonb` |  | Coluna dow_distribution da tabela public.send_time_profiles. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '[]'::jsonb. |
| 10 | `last_calculated_at` | `timestamp with time zone` | não | `now()` |  | Coluna last_calculated_at da tabela public.send_time_profiles. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.send_time_profiles. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| send_time_profiles_best_dow_check | CHECK | `CHECK (best_dow >= 0 AND best_dow <= 6)` |  |  | sim |
| send_time_profiles_best_hour_check | CHECK | `CHECK (best_hour >= 0 AND best_hour <= 23)` |  |  | sim |
| send_time_profiles_confidence_check | CHECK | `CHECK (confidence >= 0::numeric AND confidence <= 1::numeric)` |  |  | sim |
| send_time_profiles_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| send_time_profiles_sale_id_fkey | FOREIGN KEY | `FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE` | CASCADE | NO ACTION | sim |
| send_time_profiles_sale_id_key | UNIQUE | `UNIQUE (sale_id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| send_time_profiles_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX send_time_profiles_pkey ON public.send_time_profiles USING btree (id)` |
| send_time_profiles_sale_id_key | btree | sale_id | sim | sim |  | `CREATE UNIQUE INDEX send_time_profiles_sale_id_key ON public.send_time_profiles USING btree (sale_id)` |


## Policies (RLS)

### `owners and managers read send_time_profiles`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role) OR (EXISTS ( SELECT 1    FROM (sales s      JOIN salespeople sp ON ((sp.id = s.salesperson_id)))   WHERE ((s.id = send_time_profiles.sale_id) AND (sp.auth_user_id = auth.uid())))))` |
| WITH CHECK |  |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

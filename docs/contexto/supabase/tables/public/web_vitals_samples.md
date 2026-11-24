# public.web_vitals_samples

> Tabela public.web_vitals_samples. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), route text NOT NULL, metric text NOT NULL, value double precision NOT NULL, rating text NOT NULL, navigation_type text NULLABLE, user_id uuid NULLABLE, session_id text NULLABLE, user_agent text NULLABLE, viewport_width integer NULLABLE, connection_type text NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now().

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
| usada por views | public.v_web_vitals_p75, public.web_vitals_p75_last7d |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.web_vitals_samples. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `route` | `text` | não |  |  | Coluna route da tabela public.web_vitals_samples. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `metric` | `text` | não |  |  | Coluna metric da tabela public.web_vitals_samples. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (metric = ANY (ARRAY['LCP'::text, 'INP'::text, 'CLS'::text, 'FCP'::text, 'TTFB'::text])). |
| 4 | `value` | `double precision` | não |  |  | Coluna value da tabela public.web_vitals_samples. Tipo PostgreSQL: double precision. Não aceita NULL. |
| 5 | `rating` | `text` | não |  |  | Coluna rating da tabela public.web_vitals_samples. Tipo PostgreSQL: text. Não aceita NULL. Validação CHECK: CHECK (rating = ANY (ARRAY['good'::text, 'needs-improvement'::text, 'poor'::text])). |
| 6 | `navigation_type` | `text` | sim |  |  | Coluna navigation_type da tabela public.web_vitals_samples. Tipo PostgreSQL: text. Aceita NULL. |
| 7 | `user_id` | `uuid` | sim |  |  | Coluna user_id da tabela public.web_vitals_samples. Tipo PostgreSQL: uuid. Aceita NULL. |
| 8 | `session_id` | `text` | sim |  |  | Coluna session_id da tabela public.web_vitals_samples. Tipo PostgreSQL: text. Aceita NULL. |
| 9 | `user_agent` | `text` | sim |  |  | Coluna user_agent da tabela public.web_vitals_samples. Tipo PostgreSQL: text. Aceita NULL. |
| 10 | `viewport_width` | `integer` | sim |  |  | Coluna viewport_width da tabela public.web_vitals_samples. Tipo PostgreSQL: integer. Aceita NULL. |
| 11 | `connection_type` | `text` | sim |  |  | Coluna connection_type da tabela public.web_vitals_samples. Tipo PostgreSQL: text. Aceita NULL. |
| 12 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.web_vitals_samples. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| web_vitals_samples_metric_check | CHECK | `CHECK (metric = ANY (ARRAY['LCP'::text, 'INP'::text, 'CLS'::text, 'FCP'::text, 'TTFB'::text]))` |  |  | sim |
| web_vitals_samples_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |
| web_vitals_samples_rating_check | CHECK | `CHECK (rating = ANY (ARRAY['good'::text, 'needs-improvement'::text, 'poor'::text]))` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_web_vitals_created_at | btree | created_at | não | sim |  | `CREATE INDEX idx_web_vitals_created_at ON public.web_vitals_samples USING btree (created_at DESC)` |
| idx_web_vitals_route_metric_created | btree | route, metric, created_at | não | sim |  | `CREATE INDEX idx_web_vitals_route_metric_created ON public.web_vitals_samples USING btree (route, metric, created_at DESC)` |
| idx_web_vitals_user_created | btree | user_id, created_at | não | sim |  | `CREATE INDEX idx_web_vitals_user_created ON public.web_vitals_samples USING btree (user_id, created_at DESC)` |
| web_vitals_samples_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX web_vitals_samples_pkey ON public.web_vitals_samples USING btree (id)` |


## Policies (RLS)

### `Admins can read web vitals`

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

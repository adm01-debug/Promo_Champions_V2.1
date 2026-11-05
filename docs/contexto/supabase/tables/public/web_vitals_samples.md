# public.web_vitals_samples

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `route` | `text` | não |  |  |  |
| 3 | `metric` | `text` | não |  |  |  |
| 4 | `value` | `double precision` | não |  |  |  |
| 5 | `rating` | `text` | não |  |  |  |
| 6 | `navigation_type` | `text` | sim |  |  |  |
| 7 | `user_id` | `uuid` | sim |  |  |  |
| 8 | `session_id` | `text` | sim |  |  |  |
| 9 | `user_agent` | `text` | sim |  |  |  |
| 10 | `viewport_width` | `integer` | sim |  |  |  |
| 11 | `connection_type` | `text` | sim |  |  |  |
| 12 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |


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

_nenhum_

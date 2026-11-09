# public.v4_callback_metrics

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
| usada por views | public.v_platform_slo |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  |  |
| 2 | `day` | `date` | não | `((now() AT TIME ZONE 'utc'::text))::date` |  |  |
| 3 | `sent_ok` | `integer` | não | `0` |  |  |
| 4 | `failed` | `integer` | não | `0` |  |  |
| 5 | `exhausted` | `integer` | não | `0` |  |  |
| 6 | `created_at` | `timestamp with time zone` | não | `now()` |  |  |
| 7 | `updated_at` | `timestamp with time zone` | não | `now()` |  |  |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| v4_callback_metrics_day_key | UNIQUE | `UNIQUE (day)` |  |  | sim |
| v4_callback_metrics_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| v4_callback_metrics_day_key | btree | day | sim | sim |  | `CREATE UNIQUE INDEX v4_callback_metrics_day_key ON public.v4_callback_metrics USING btree (day)` |
| v4_callback_metrics_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX v4_callback_metrics_pkey ON public.v4_callback_metrics USING btree (id)` |


## Policies (RLS)

### `Admins can read v4 callback metrics`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| v4_callback_metrics_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

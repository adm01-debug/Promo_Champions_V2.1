# public.v4_callback_metrics

> Tabela public.v4_callback_metrics. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), day date NOT NULL DEFAULT ((now() AT TIME ZONE 'utc'::text))::date, sent_ok integer NOT NULL DEFAULT 0, failed integer NOT NULL DEFAULT 0, exhausted integer NOT NULL DEFAULT 0, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now().

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.v4_callback_metrics. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `day` | `date` | não | `((now() AT TIME ZONE 'utc'::text))::date` |  | Coluna day da tabela public.v4_callback_metrics. Tipo PostgreSQL: date. Não aceita NULL. Valor padrão: ((now() AT TIME ZONE 'utc'::text))::date. |
| 3 | `sent_ok` | `integer` | não | `0` |  | Coluna sent_ok da tabela public.v4_callback_metrics. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 4 | `failed` | `integer` | não | `0` |  | Coluna failed da tabela public.v4_callback_metrics. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 5 | `exhausted` | `integer` | não | `0` |  | Coluna exhausted da tabela public.v4_callback_metrics. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 6 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.v4_callback_metrics. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 7 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.v4_callback_metrics. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


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

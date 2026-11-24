# public.call_metric_benchmarks

> Tabela public.call_metric_benchmarks. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), metric text NOT NULL, p25 numeric NOT NULL DEFAULT 0, p50 numeric NOT NULL DEFAULT 0, p75 numeric NOT NULL DEFAULT 0, target_min numeric NOT NULL DEFAULT 0, target_max numeric NOT NULL DEFAULT 0, updated_at timestamp with time zone NOT NULL DEFAULT now().

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 2 |
| realtime (publication) | sim |
| replica identity | default |
| vem de extensão | não |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.call_metric_benchmarks. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `metric` | `text` | não |  |  | Coluna metric da tabela public.call_metric_benchmarks. Tipo PostgreSQL: text. Não aceita NULL. |
| 3 | `p25` | `numeric` | não | `0` |  | Coluna p25 da tabela public.call_metric_benchmarks. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 4 | `p50` | `numeric` | não | `0` |  | Coluna p50 da tabela public.call_metric_benchmarks. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 5 | `p75` | `numeric` | não | `0` |  | Coluna p75 da tabela public.call_metric_benchmarks. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 6 | `target_min` | `numeric` | não | `0` |  | Coluna target_min da tabela public.call_metric_benchmarks. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 7 | `target_max` | `numeric` | não | `0` |  | Coluna target_max da tabela public.call_metric_benchmarks. Tipo PostgreSQL: numeric. Não aceita NULL. Valor padrão: 0. |
| 8 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.call_metric_benchmarks. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| call_metric_benchmarks_metric_key | UNIQUE | `UNIQUE (metric)` |  |  | sim |
| call_metric_benchmarks_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| call_metric_benchmarks_metric_key | btree | metric | sim | sim |  | `CREATE UNIQUE INDEX call_metric_benchmarks_metric_key ON public.call_metric_benchmarks USING btree (metric)` |
| call_metric_benchmarks_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX call_metric_benchmarks_pkey ON public.call_metric_benchmarks USING btree (id)` |


## Policies (RLS)

### `cmb_select_authenticated`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `cmb_write_admin`

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


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

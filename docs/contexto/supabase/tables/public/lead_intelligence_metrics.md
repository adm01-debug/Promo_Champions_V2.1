# public.lead_intelligence_metrics

> Tabela public.lead_intelligence_metrics. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), captured_at timestamp with time zone NULLABLE DEFAULT now(), avg_score numeric NULLABLE, hot_count integer NULLABLE, warm_count integer NULLABLE, cold_count integer NULLABLE, distribution jsonb NULLABLE.

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
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.lead_intelligence_metrics. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `captured_at` | `timestamp with time zone` | sim | `now()` |  | Coluna captured_at da tabela public.lead_intelligence_metrics. Tipo PostgreSQL: timestamp with time zone. Aceita NULL. Valor padrão: now(). |
| 3 | `avg_score` | `numeric` | sim |  |  | Coluna avg_score da tabela public.lead_intelligence_metrics. Tipo PostgreSQL: numeric. Aceita NULL. |
| 4 | `hot_count` | `integer` | sim |  |  | Coluna hot_count da tabela public.lead_intelligence_metrics. Tipo PostgreSQL: integer. Aceita NULL. |
| 5 | `warm_count` | `integer` | sim |  |  | Coluna warm_count da tabela public.lead_intelligence_metrics. Tipo PostgreSQL: integer. Aceita NULL. |
| 6 | `cold_count` | `integer` | sim |  |  | Coluna cold_count da tabela public.lead_intelligence_metrics. Tipo PostgreSQL: integer. Aceita NULL. |
| 7 | `distribution` | `jsonb` | sim |  |  | Coluna distribution da tabela public.lead_intelligence_metrics. Tipo PostgreSQL: jsonb. Aceita NULL. |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| lead_intelligence_metrics_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| lead_intelligence_metrics_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX lead_intelligence_metrics_pkey ON public.lead_intelligence_metrics USING btree (id)` |


## Policies (RLS)

### `Authenticated read lead_intelligence_metrics`

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

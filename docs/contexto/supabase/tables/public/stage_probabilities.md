# public.stage_probabilities

> Tabela public.stage_probabilities. Estrutura registrada no catálogo do PostgreSQL: stage text NOT NULL, probability numeric NOT NULL, updated_at timestamp with time zone NOT NULL DEFAULT now().

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
| usada por views | public.revenue_forecast_view |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `stage` | `text` | não |  |  | Coluna stage da tabela public.stage_probabilities. Tipo PostgreSQL: text. Participa da chave primária. Não aceita NULL. |
| 2 | `probability` | `numeric` | não |  |  | Coluna probability da tabela public.stage_probabilities. Tipo PostgreSQL: numeric. Não aceita NULL. Validação CHECK: CHECK (probability >= 0::numeric AND probability <= 1::numeric). |
| 3 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.stage_probabilities. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| stage_probabilities_pkey | PRIMARY KEY | `PRIMARY KEY (stage)` |  |  | sim |
| stage_probabilities_probability_check | CHECK | `CHECK (probability >= 0::numeric AND probability <= 1::numeric)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| stage_probabilities_pkey | btree | stage | sim | sim |  | `CREATE UNIQUE INDEX stage_probabilities_pkey ON public.stage_probabilities USING btree (stage)` |


## Policies (RLS)

### `stage_probabilities_select`

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

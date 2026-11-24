# public.executive_briefings

> Tabela public.executive_briefings. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), briefing_date date NOT NULL DEFAULT CURRENT_DATE, pulse_score integer NOT NULL DEFAULT 0, headline text NOT NULL, narrative text NOT NULL DEFAULT ''::text, key_wins jsonb NOT NULL DEFAULT '[]'::jsonb, key_risks jsonb NOT NULL DEFAULT '[]'::jsonb, recommended_actions jsonb NOT NULL DEFAULT '[]'::jsonb, generated_by text NOT NULL DEFAULT 'manual'::text, created_by uuid NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now().

| propriedade | valor |
|---|---|
| tipo | table |
| owner | postgres |
| RLS habilitado | sim |
| RLS forçado (owner) | não |
| policies | 4 |
| realtime (publication) | não |
| replica identity | default |
| vem de extensão | não |
| usada por views | public.latest_briefing_view |


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.executive_briefings. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `briefing_date` | `date` | não | `CURRENT_DATE` |  | Coluna briefing_date da tabela public.executive_briefings. Tipo PostgreSQL: date. Não aceita NULL. Valor padrão: CURRENT_DATE. |
| 3 | `pulse_score` | `integer` | não | `0` |  | Coluna pulse_score da tabela public.executive_briefings. Tipo PostgreSQL: integer. Não aceita NULL. Valor padrão: 0. |
| 4 | `headline` | `text` | não |  |  | Coluna headline da tabela public.executive_briefings. Tipo PostgreSQL: text. Não aceita NULL. |
| 5 | `narrative` | `text` | não | `''::text` |  | Coluna narrative da tabela public.executive_briefings. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: ''::text. |
| 6 | `key_wins` | `jsonb` | não | `'[]'::jsonb` |  | Coluna key_wins da tabela public.executive_briefings. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '[]'::jsonb. |
| 7 | `key_risks` | `jsonb` | não | `'[]'::jsonb` |  | Coluna key_risks da tabela public.executive_briefings. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '[]'::jsonb. |
| 8 | `recommended_actions` | `jsonb` | não | `'[]'::jsonb` |  | Coluna recommended_actions da tabela public.executive_briefings. Tipo PostgreSQL: jsonb. Não aceita NULL. Valor padrão: '[]'::jsonb. |
| 9 | `generated_by` | `text` | não | `'manual'::text` |  | Coluna generated_by da tabela public.executive_briefings. Tipo PostgreSQL: text. Não aceita NULL. Valor padrão: 'manual'::text. Validação CHECK: CHECK (generated_by = ANY (ARRAY['auto'::text, 'manual'::text])). |
| 10 | `created_by` | `uuid` | sim |  |  | Coluna created_by da tabela public.executive_briefings. Tipo PostgreSQL: uuid. Aceita NULL. |
| 11 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.executive_briefings. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| executive_briefings_briefing_date_key | UNIQUE | `UNIQUE (briefing_date)` |  |  | sim |
| executive_briefings_generated_by_check | CHECK | `CHECK (generated_by = ANY (ARRAY['auto'::text, 'manual'::text]))` |  |  | sim |
| executive_briefings_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| executive_briefings_briefing_date_key | btree | briefing_date | sim | sim |  | `CREATE UNIQUE INDEX executive_briefings_briefing_date_key ON public.executive_briefings USING btree (briefing_date)` |
| executive_briefings_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX executive_briefings_pkey ON public.executive_briefings USING btree (id)` |
| idx_executive_briefings_date_desc | btree | briefing_date | não | sim |  | `CREATE INDEX idx_executive_briefings_date_desc ON public.executive_briefings USING btree (briefing_date DESC)` |


## Policies (RLS)

### `Admins can delete briefings`

| campo | valor |
|---|---|
| comando | DELETE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |

### `Admins can update briefings`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `has_role(auth.uid(), 'admin'::app_role)` |
| WITH CHECK |  |

### `Authenticated users can view briefings`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `true` |
| WITH CHECK |  |

### `Managers and admins can create briefings`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |


## Triggers

_nenhum_


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

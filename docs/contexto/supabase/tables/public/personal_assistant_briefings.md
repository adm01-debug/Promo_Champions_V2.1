# public.personal_assistant_briefings

> Tabela public.personal_assistant_briefings. Estrutura registrada no catálogo do PostgreSQL: id uuid NOT NULL DEFAULT gen_random_uuid(), salesperson_id uuid NOT NULL, briefing_date date NOT NULL DEFAULT ((now() AT TIME ZONE 'America/Sao_Paulo'::text))::date, content text NOT NULL, model text NULLABLE, token_count integer NULLABLE, context_snapshot jsonb NULLABLE, created_at timestamp with time zone NOT NULL DEFAULT now(), updated_at timestamp with time zone NOT NULL DEFAULT now().

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


## Colunas

| # | coluna | tipo | nullable | default | identity/generated | comentário |
|---|---|---|---|---|---|---|
| 1 | `id` | `uuid` | não | `gen_random_uuid()` |  | Coluna id da tabela public.personal_assistant_briefings. Tipo PostgreSQL: uuid. Participa da chave primária. Não aceita NULL. Valor padrão: gen_random_uuid(). |
| 2 | `salesperson_id` | `uuid` | não |  |  | Coluna salesperson_id da tabela public.personal_assistant_briefings. Tipo PostgreSQL: uuid. Não aceita NULL. |
| 3 | `briefing_date` | `date` | não | `((now() AT TIME ZONE 'America/Sao_Paulo'::text))::date` |  | Coluna briefing_date da tabela public.personal_assistant_briefings. Tipo PostgreSQL: date. Não aceita NULL. Valor padrão: ((now() AT TIME ZONE 'America/Sao_Paulo'::text))::date. |
| 4 | `content` | `text` | não |  |  | Coluna content da tabela public.personal_assistant_briefings. Tipo PostgreSQL: text. Não aceita NULL. |
| 5 | `model` | `text` | sim |  |  | Coluna model da tabela public.personal_assistant_briefings. Tipo PostgreSQL: text. Aceita NULL. |
| 6 | `token_count` | `integer` | sim |  |  | Coluna token_count da tabela public.personal_assistant_briefings. Tipo PostgreSQL: integer. Aceita NULL. |
| 7 | `context_snapshot` | `jsonb` | sim |  |  | Coluna context_snapshot da tabela public.personal_assistant_briefings. Tipo PostgreSQL: jsonb. Aceita NULL. |
| 8 | `created_at` | `timestamp with time zone` | não | `now()` |  | Coluna created_at da tabela public.personal_assistant_briefings. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |
| 9 | `updated_at` | `timestamp with time zone` | não | `now()` |  | Coluna updated_at da tabela public.personal_assistant_briefings. Tipo PostgreSQL: timestamp with time zone. Não aceita NULL. Valor padrão: now(). |


## Constraints

| nome | tipo | definição | on delete | on update | validada |
|---|---|---|---|---|---|
| personal_assistant_briefings_pkey | PRIMARY KEY | `PRIMARY KEY (id)` |  |  | sim |


## Índices

| nome | método | colunas | único | válido | predicado | definição |
|---|---|---|---|---|---|---|
| idx_pab_salesperson_date_desc | btree | salesperson_id, briefing_date | não | sim |  | `CREATE INDEX idx_pab_salesperson_date_desc ON public.personal_assistant_briefings USING btree (salesperson_id, briefing_date DESC)` |
| personal_assistant_briefings_pkey | btree | id | sim | sim |  | `CREATE UNIQUE INDEX personal_assistant_briefings_pkey ON public.personal_assistant_briefings USING btree (id)` |
| uq_pab_salesperson_date | btree | salesperson_id, briefing_date | sim | sim |  | `CREATE UNIQUE INDEX uq_pab_salesperson_date ON public.personal_assistant_briefings USING btree (salesperson_id, briefing_date)` |


## Policies (RLS)

### `pab_admin_manager_select`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'manager'::app_role))` |
| WITH CHECK |  |

### `pab_owner_insert`

| campo | valor |
|---|---|
| comando | INSERT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING |  |
| WITH CHECK | `(salesperson_id IN ( SELECT s.id    FROM salespeople s   WHERE (s.auth_user_id = auth.uid())))` |

### `pab_owner_select`

| campo | valor |
|---|---|
| comando | SELECT |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(salesperson_id IN ( SELECT s.id    FROM salespeople s   WHERE (s.auth_user_id = auth.uid())))` |
| WITH CHECK |  |

### `pab_owner_update`

| campo | valor |
|---|---|
| comando | UPDATE |
| tipo | PERMISSIVE |
| roles | authenticated |
| USING | `(salesperson_id IN ( SELECT s.id    FROM salespeople s   WHERE (s.auth_user_id = auth.uid())))` |
| WITH CHECK | `(salesperson_id IN ( SELECT s.id    FROM salespeople s   WHERE (s.auth_user_id = auth.uid())))` |


## Triggers

| nome | timing | eventos | nível | status | função |
|---|---|---|---|---|---|
| trg_pab_updated_at | BEFORE | UPDATE | ROW | enabled | public.update_updated_at_column |


## Grants

| role | privilégios |
|---|---|
| anon | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| authenticated | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE |
| service_role | DELETE, INSERT, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE |

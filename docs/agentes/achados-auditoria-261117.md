# Achados da auditoria de 17/11/2026

Registro dos achados que **não** couberam numa PR de correção, para não se
perderem. Cada número aqui foi medido em produção ou no repo nesta sessão; onde
não houve medição, está escrito "NÃO VERIFICADO".

## 1. Receita reportada é dominada por dado de teste

`public.sales` com status ganho (`completed`, `won`, `closed`): **550 vendas**.

| agrupamento                                     | grupos | top-3 = % da receita |
| ----------------------------------------------- | ------ | -------------------- |
| por `client_name` (o que o código usa)          | **5**  | **100,0%**           |
| por cliente real (`client_id` → `clients.name`) | **43** | **73,8%**            |

Os três maiores "clientes" por receita são registros de teste:

- `Cliente Demo 10` — 71,3%
- `__aug2026__` — 28,6%
- `E2E Race Approved+UI` — 0,0%

Somam **99,9%**. Tudo que soma venda ganha herda essa distorção: BI, ranking,
metas, gamificação, curva ABC.

Distribuição por ano (vendas / clientes distintos por `client_name`):

    2024: 330 vendas / 1 cliente / R$ 1.697.514,52
    2025: 175 vendas / 1 cliente / R$   968.755,32
    2026:  45 vendas / 4 clientes / R$ 1.071.574,00

**Decisão do dono** (deleção em produção): excluir por flag ou purgar.

## 2. Agrupamento de clientes por nome colapsa 42 em 5

`src/hooks/bi/useABCAnalysis.ts` agrupa por `client_name`. Em produção há
**5 `client_name` distintos**, **42 `client_id` distintos** e **101 clientes
cadastrados** em `public.clients`. Três vendas ganhas têm `client_id` nulo.

Efeito: o insight "Concentração de Receita" reporta 100% de concentração —
alarme falso. O correto sobre cliente real é 73,8% em 43 grupos.

Correção: agrupar por `client_id` e resolver o nome em `clients`. Muda um
número exibido ao negócio, e **só faz sentido depois do item 1** — antes disso
troca um número errado por outro menos errado.

## 3. Curva ABC não tem dado para sustentar painéis por período

Tentativa de construir a matriz de deslocamento ABC (trabalho que outro agente
deixou como maquete). Janelas de 90 dias:

    atual:    13 vendas /  4 clientes / 10 produtos
    anterior: 32 vendas /  1 cliente

Com 1 cliente numa janela, ele é 100% da receita e vira classe A por definição.
Uma curva de Pareto sobre 5 nomes — dos quais 3 são teste — não informa nada.
É por isso que `ABCMatrixShift`, `ABCActionableAutomations` e
`Client360PredictiveCards` ficaram chumbados pelo agente anterior: não havia
dado. Construí-los agora produziria painel de aparência autoritária mostrando
ruído. Fica bloqueado pelo item 1.

## 4. Replay cronológico do repo quebra em julho (BUG_0002)

`supabase/migrations/20260715184427_8e4ec70a-caf2-4a8d-9042-e26e29fa3a54.sql`
executa `CREATE POLICY ... ON public._internal_secrets` sem que nenhuma
migration crie a tabela. **17 migrations commitadas referenciam
`_internal_secrets`; nenhuma a cria** (a PR #538 passa a criar, mas datada de
novembro, depois do uso em julho).

Consequência: uma base construída do zero a partir do repo morre em 15/07 —
exatamente o que a preview do Supabase tenta fazer. Consertar exige mexer na
migration de julho ou datar a reconciliação antes dela; as duas mudam a
sequência versionada. **Decisão do dono.**

## 5. Registro de migrations divergente (causa do Supabase Preview vermelho)

O check `Supabase Preview` falha com `Remote migration versions not found in
local migrations directory`. Medido: produção tem **335 versões** registradas,
**241 sem arquivo local**, todas na janela `20260511141832 .. 20260726202805`
(108 com nome no padrão UUID do editor Lovable). Dentro da mesma janela o repo
tem 250 arquivos — a `main` não perdeu o período, tem com timestamps diferentes
por causa da reescrita de 13/11. Só 94 das 335 casam.

Conserto: remover as 241 linhas órfãs de
`supabase_migrations.schema_migrations`. O schema não é tocado, só o registro.
**Decisão do dono** (escrita no registro de produção).

NÃO VERIFICADO: que os 690 arquivos atuais reproduzem o schema de produção num
banco limpo. O container não tem `pg_cron`, `pg_net`, `supabase_vault` nem
`vector` — 4 das 9 extensões de produção — então o replay fiel não roda aqui.

## 6. Endurecimento pendente nas funções resgatadas

Apontado pela revisão da PR #538 e procedente, mas é o estado atual de
produção; reproduzir a convenção no arquivo faria ele divergir de produção.

- `is_country_blocked` é `SECURITY DEFINER` sem checar o chamador, então
  qualquer papel com `EXECUTE` descobre quais países estão bloqueados, embora
  `geo_blocked_regions` só permita leitura a admin/gestor.
- `EXECUTE` não restrito em `fn_quotes_inbound_ordering_guard`,
  `trg_recording_generate_coaching` e `trigger_auto_coaching_on_recording`
  (`docs/SCHEMA_CONVENTIONS.md` exige `REVOKE` explícito).
- `geo_blocked_regions` aceita alteração mas não tem trigger de `updated_at`.
- `_internal_secrets`, `geo_access_logs` e `plan_rollback_ddl` não têm todos os
  timestamps da convenção.
- `_internal_secrets` tem grants amplos a `anon`/`authenticated`; a RLS nega
  tudo (`USING false`), então não há exposição, mas os grants são o default do
  Supabase e são desnecessários numa tabela de segredos.

Dois triggers disparam coaching em `call_recordings`
(`trg_auto_coaching_after_summary` por `summarized_at` e
`trg_recording_generate_coaching` por `transcript`), com guardas diferentes.
NÃO VERIFICADO se há disparo duplo em algum caminho.

## 7. Cobertura da varredura

| onde                | varrido                           | resultado                                             |
| ------------------- | --------------------------------- | ----------------------------------------------------- |
| branches git        | 43/43 por conteúdo (93.932 blobs) | 37 encerradas, 6 vivas, nenhuma com trabalho pendente |
| objetos de `public` | 772                               | 8 sem arquivo → PR #538                               |
| crons `pg_cron`     | 45                                | 3 sem arquivo → PR #538                               |
| edge functions      | 100 deployadas × 171 no repo      | **0** só em produção                                  |

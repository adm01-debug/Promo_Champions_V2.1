# ESTADO ATUAL DO SISTEMA — Promo Champions v2.1

> Auditoria de estado. Medição: **2026-08-16**. Banco de produção `rapjswienfhkobhlamxb`, acessado
> em modo somente leitura. Nada foi alterado em produção.
> Detalhamento por dimensão nos 13 documentos deste diretório.

---

## Veredito em uma tela

**O sistema é grande, bem escrito e quase inteiramente não utilizado.**

São ~360 mil linhas de código, 174 rotas, 168 Edge Functions e 397 tabelas construídas com
cuidado real — RLS em 100% das tabelas, PWA completo, validação de webhook com HMAC, proteção
anti-*push-phishing*. Não é código descuidado.

O que falta não é qualidade de código: é **operação**. O banco tem **2 usuários**, os 12
vendedores que aparecem em `sales` **não correspondem a nenhum usuário real**, e a telemetria
registra **75 visitas de página em 12 das 174 rotas**. A base é de demonstração, não de uso.

Por isso a regra "pronto = em produção com uso real" empurra o retrato para o meio da tabela:
**cerca de um quarto das funcionalidades está completa, quase 60% está parcial** — quase sempre
pelo mesmo motivo, que não é bug: a tabela de destino está vazia porque ninguém usou o sistema.

Há, além disso, um conjunto menor de problemas que são defeitos de verdade e independem de uso:
**dois arquivos que não compilam**, **três jobs agendados falhando em silêncio**, **dado
fictício chegando à tela do usuário**, e — o mais grave — **o ambiente de produção não é
reconstruível a partir deste repositório**.

---

## Contagem honesta

As unidades **não são somáveis entre si** (uma rota não é uma Edge Function, e uma
funcionalidade de domínio frequentemente atravessa as duas). Por isso os três blocos são
apresentados separados, cada um com seu denominador.

### Funcionalidades de domínio de negócio — 450 avaliadas

| Classificação | Qtd | % |
|---|---:|---:|
| ✅ IMPLEMENTADO_TOTAL | **110** | 24,4% |
| 🟨 IMPLEMENTADO_PARCIAL | **258** | 57,3% |
| 🟦 SUGERIDO_OU_INICIADO | **46** | 10,2% |
| ⬛ MORTO_OU_ABANDONADO | **37** | 8,2% |

### Rotas de front-end — 174

✅ 97 (55,7%) · 🟨 48 (27,6%) · 🟦 9 (5,2%) · ⬛ 20 (11,5%)

**Leia este bloco com cuidado.** Aqui ✅ significa "as camadas existem e a rota é navegável" —
**não** "está em uso". A prova está no próprio banco: `page_analytics` registra visitas em
**12 das 174 rotas (6,9%)**. As outras 162 nunca foram abertas por ninguém.

### Edge Functions — 168

✅ 54 (32,1%) · 🟨 81 (48,2%) · 🟦 9 (5,4%) · ⬛ **24 (14,3%)**

Aqui ✅ significa "tem chamador identificado e código plausivelmente funcional" — não há acesso
aos logs de invocação, então não é prova de execução.

### Por lote

| Lote | Escopo | Unidades | ✅ | 🟨 | 🟦 | ⬛ |
|---|---|---:|---:|---:|---:|---:|
| 01 | Rotas e páginas | 174 | 97 | 48 | 9 | 20 |
| 02 | CRM / Pipeline / Vendas | 60 | 29 | 28 | 2 | 1 |
| 03 | SDR / Cadências / Multicanal | 50 | 5 | 33 | 8 | 4 |
| 04 | Analytics / BI / Forecast | 106 | 25 | 65 | 7 | 9 |
| 05 | Gamificação / Race | 38 | 5* | 27 | 3 | 4 |
| 06 | IA / Coaching / Semântica | 42 | **0** | 40 | 1 | 1 |
| 07 | Win/Loss / Competitivo / CS | 86 | 26 | 35 | 17 | 8 |
| 08 | Admin / Segurança | 52 | 20 | 19 | 3 | 10 |
| 10 | Edge Functions | 168 | 54 | 81 | 9 | 24 |
| 13 | Integrações externas | 16 | **0** | 11 | 5 | 0 |

\* O lote 05 declara base 38 mas suas linhas somam 39 — um item de infraestrutura aparece entre
parênteses no ✅. Inconsistência registrada, não corrigida em silêncio.

Lotes **09** (hooks e camada lógica), **11** (banco) e **12** (infra/CI/testes) são estruturais
e não classificam funcionalidades de produto; seus números aparecem nos riscos abaixo.

---

## Riscos estruturais, do mais grave ao menos

### 1. O ambiente de produção não nasce do repositório — `VERIFICADO`

`supabase_migrations.schema_migrations` **não existe** no banco. Nenhuma das **584 migrations**
do repositório tem registro de aplicação. Não é "drift de N migrations": é a ausência completa do
livro-razão.

Consequências medidas:
- **3 tabelas existem em produção sem nenhum `CREATE TABLE` no repositório** — `_internal_secrets`
  (com 1 registro dentro), `geo_access_logs`, `geo_blocked_regions`
- 1 tabela declarada no repo não existe no banco (`call_tracking`)
- O cron `weekly-matchmaking` falha porque a função foi movida para o schema `private` por uma
  migration, enquanto o job continua chamando `public` — sintoma direto do mesmo problema

**Se este banco for perdido, ele não pode ser reconstruído a partir deste repositório.** Este é o
achado mais grave da auditoria.

### 2. Nenhum portão de qualidade executa há mais de 20 dias — `VERIFICADO`

`npm ci` falha: o `package-lock.json` está dessincronizado do `package.json` (falta a árvore
transitiva de `sucrase`, dependência de `tailwindcss`). As **10 execuções mais recentes na `main`
falharam**, a mais antiga em 2026-07-27.

`tsc`, `eslint` e `vitest` nunca chegam a rodar. O checklist obrigatório do template de PR —
que exige exatamente essas três verificações — **não pode ser cumprido por ninguém**. Os checks
vermelhos deixaram de carregar informação.

Agravantes no mesmo eixo:
- O job E2E **termina verde pulando 27 de 37 specs**, porque roda sem bloco `env:` e `HAS_AUTH`
  cai para `false`
- `docs/TEST_QUALITY_REPORT.md` ("97,6%", "10/10") são **strings hardcoded** no gerador, que
  ninguém executa
- **44 de 60 testes Deno (73%) não têm runner algum**
- `supabase/functions/**` não passa por lint nenhum

### 3. Dois arquivos não compilam — `VERIFICADO` pessoalmente

`supabase/functions/nlq-query/index.ts:9-10` e `supabase/functions/ai-copilot/index.ts:4-5`:
um `import { fetchWithTimeout } ...` foi inserido **dentro de um bloco `import {` aberto**.
Reproduzi passando os arquivos por um parser — erro de sintaxe, não opinião.

Varri o repositório inteiro pelo padrão: **exatamente 2 arquivos**, ambos confirmados. O NLQ
(`/perguntar` + widget de dashboard) e o AI Copilot estão mortos por isso.

### 4. Automação de backend praticamente não existe — `VERIFICADO`

Dos 11 jobs `pg_cron` ativos, **10 são faxina SQL**. Apenas **1 das 168 Edge Functions** é
disparada por agendamento (`campaign-health-alert`, 581 execuções, todas retornando
`{"evaluated":0,"created":0}`).

Cerca de **40 funções foram escritas como jobs periódicos e nunca foram agendadas** —
`check-lead-sla`, `sequence-runner`, `qbr-scheduler`, `detect-stuck-deals`, entre outras.
`process-cadence-tasks` só roda se um humano abrir a página `/cadencias`.

Ironia registrada: `cron-failure-alerter` — o vigia dos crons, 554 linhas — **também nunca foi
agendado**.

### 5. Três jobs agendados falhando em silêncio — `VERIFICADO`

| Job | Execuções | Falhas | Erro |
|---|---:|---:|---|
| `purge-telemetry-retention-daily` | 12 | **12 (100%)** | `column reference "table_name" is ambiguous` — diariamente desde 05/08 |
| `weekly-matchmaking` | 1 | **1** | `function public.match_weekly_players() does not exist` |
| `reset-pg-stat-statements-weekly` | 1 | **1** | `function pg_stat_statements_reset() does not exist` |

`cron_failure_alerts` parou de registrar em 04/08 enquanto o job 8 seguiu falhando até 16/08.
O detector está mudo.

### 6. Dado fictício chegando à tela do usuário — `VERIFICADO`

Não é código de teste esquecido: é conteúdo inventado renderizado em rotas de produção.
Os casos mais graves, cada um com arquivo e linha:

| Onde | O quê |
|---|---|
| `src/hooks/orders/useOrderTracking.ts:180,193,216,236` | Pedidos falsos ("Acme Corp", "Grupo Vértice") **misturados aos reais**, indistinguíveis na tela; 12 falsos puros em caso de erro. Nunca lê `orders`/`order_items`, que têm 267 linhas reais |
| `src/pages/Analytics.tsx:111,113,117` | `CompetencyRadar`, `ChurnPredictionPanel` e `LTVBySegment` montados **sem props** → competências, clientes ("Tech Solutions LTDA") e LTV inventados |
| `src/lib/bi/mockData.ts` | "Tendências do setor" com MacBook Pro M3 e Herman Miller — numa empresa de brindes. Alimenta `/ferramentas/bi` sem sinalizar que é mock |
| `PredictiveIntelligenceDashboard.tsx:139` | Simulador de cenários com `baseRevenue = 2.500.000` fixo |
| `src/lib/winloss/atRiskFixtures.ts` | *Fixtures* re-exportadas e renderizadas em `/win-loss-intelligence` |
| `FollowUpAudit.tsx:77-99` | **Sempre** concatena leads inventados aos reais |
| `UsageAnalytics.tsx:74` | `login_count = Math.random()` |
| `src/hooks/gamification/usePrizeWheel.ts:33,85` | Sorteia o prêmio com `Math.random()` **no navegador** e grava direto na tabela, sem RPC |

O lote 04 catalogou 25 ocorrências; o lote 01, 13 focos. Contrapeso justo: nos domínios de
**IA** e **SDR** o código é honesto — praticamente não há mock, e as telas vazias estão vazias de
verdade.

### 7. Métricas que mentem por raiz de dado — `VERIFICADO`

Quatro causas explicam a maior parte dos painéis zerados. Nenhuma é "falta de dado do cliente":

- **`sales.status = 'completed'` não existe** (os valores reais são `won`, `lost`, `cancelled`,
  `closed`, `pending`, `proposal`, `lead`). Views e RPCs filtram por `completed` → ranking
  competitivo dá `rank = 1` para todos; `revops-hub` zera win rate, ciclo e receita
- **`sales.stage` é NULL em 100% das linhas** → forecast ponderado sempre R$ 0
- **`deal_stage_history` está vazia; o dado real está em `deal_stage_transitions` (1.254 linhas)**
  — seis hooks leem a tabela errada → Funil de Conversão e Tempo de Fechamento sempre vazios
- **Colunas inexistentes**: `pipeline-pulse-aggregator` lê `sales.total_amount` (a coluna é
  `amount`); `predict-quota-attainment` lê `salespeople.monthly_goal` (não existe)

O caso mais perigoso é o mascaramento: `useForecastAccuracy.ts:96-98` transforma tabela vazia em
**"MAPE 0,0% — Excelente"**, em verde. O painel não diz "sem dado": diz que está ótimo.

### 8. Exposição anônima de dados — `VERIFICADO` (e corrigido em relação ao relato inicial)

Assumindo o papel `anon` no banco, é possível ler sem qualquer login:

| Tabela | Linhas legíveis |
|---|---:|
| `products` | 17 |
| `suppliers` | **6** |
| `teams` | 3 |

`suppliers` é comercialmente sensível. **`clients` (100) e `activities` (2.228) NÃO são
legíveis** — o relato inicial dizia que sim, e foi corrigido com errata no lote 08.

**A ressalva importa mais que o achado.** A proteção de `clients` e `activities` é **acidental**:
não vem de uma policy que nega, vem de um erro de permissão em função auxiliar
(`permission denied for function has_permission`). Um `GRANT EXECUTE` a mais — plausível como
"correção de bug" — abriria os 100 clientes e as 2.228 atividades imediatamente.

### 9. Superfície muito acima do uso

- **302 de 397 tabelas (76,1%) têm zero linhas**
- **24 Edge Functions sem nenhum chamador**, incluindo o subsistema de webhooks Win/Loss:
  **7.707 linhas (15% do backend)** que nunca processaram um evento
- **16 integrações externas codificadas, 0 configuradas** — 18 de 18 tabelas de integração vazias;
  todo o histórico de `pg_net` são 12 chamadas HTTP
- **49 de 857 hooks sem qualquer referência** (critério declarado, taxa de falso-positivo medida)
- **20 rotas sem nenhum link que leve a elas**
- **110 de 432 tabelas nunca lidas pelo front**

Cada item é código a manter, revisar e proteger sem retorno.

---

## O que está bom — e é bastante

Não distorço o quadro para parecer rigoroso. Isto aqui funciona:

- **RLS impecável na forma**: 397 de 397 tabelas com RLS habilitado, **zero tabelas com RLS e sem
  policy** (a armadilha silenciosa mais comum em Supabase). 1.019 policies.
- **Núcleo CRM funciona de ponta a ponta**: clientes (100), vendas (954), atividades (2.228),
  tarefas (600), pedidos (267/540/267), comissões (942), produtos (17).
- **Win/Loss core, Purchase Intelligence, Customer Success 360, Portfólio, Deal Health e
  Stakeholders** têm fio completo e dado real.
- **Comparador de preços** é uma das poucas features com dado genuinamente operacional:
  6 fornecedores, 41 SKUs, 200 preços, 18 alertas.
- **O código de IA não é fachada.** 30 das 42 features chamam um provedor real (Lovable AI
  Gateway); não há uma única resposta de IA hardcoded nem `Math.random()` fingindo score.
- **Segurança bem-feita onde foi feita**: `receive-quote-sync` com HMAC-SHA256, rate-limit e
  dedupe; `send-push-notification` com proteção explícita contra *push-phishing*;
  `email-unsubscribe` com token assinado. Nenhuma exposição pública grave em Edge Function.
- **PWA completo e correto**, com service worker e atualização registrada.
- **Nenhuma outra função repete o vazamento do `migrate-helper`** (removido no commit `14b2750`) —
  verificado por varredura.
- **Zero `TODO`/`FIXME`/`HACK`** em toda a camada lógica.

---

## O que esta auditoria NÃO cobriu

Declarado, não escondido:

1. **Nenhuma suíte de teste foi executada.** `node_modules` não está instalado neste ambiente.
   Não afirmo em lugar nenhum que algo compila, que o lint passa ou que os testes passam — exceto
   os 2 arquivos que reprovei em parser, e isso está marcado como verificado.
2. **Logs de invocação das Edge Functions: `NAO_VERIFICADO`.** Não distingo "foi chamada e falhou"
   de "nunca foi chamada". Todo ✅ de Edge Function significa "caminho de chamada existe", não
   "executou".
3. **Segredos de Edge Function: `NAO_VERIFICADO`.** Vivem em cofre da plataforma Supabase, fora do
   Postgres. `vault.secrets` está vazio, mas isso é esperado e não prova nada sobre eles.
4. **O front-end não foi executado.** Nenhuma tela foi aberta, nenhum fluxo percorrido.
5. **Nenhuma chamada real a terceiro foi disparada** — seria alterar estado externo.
6. **Cobertura em nível de arquivo**: os lotes citam 587 arquivos distintos. **40 de 104 domínios
   de componentes não têm citação em nível de arquivo** — foram tratados em altitude ou ficaram na
   costura entre lotes. Os menos cobertos: `bi`, `reports`, `portfolio`, `goals`, `shared`,
   `navigation`, `skeletons`, `molecules`. Edge Functions, ao contrário, têm **168 de 168** citadas.
7. **Histórico de `pg_cron` limitado a ~12 dias** de retenção; estatísticas de tabela zeradas em
   2026-07-24.
8. **Branch protection do GitHub** não é versionada — não sei quais checks são obrigatórios.

### Sobre a confiabilidade destes números

Os 13 lotes foram produzidos em paralelo e depois **verificados de forma independente**:

- **Recontagem**: dos 587 arquivos citados, **4 não existiam** (0,7%). Triados um a um — 1 era
  erro de caminho real (corrigido), 2 eram nomes truncados na prosa (completados), e 1
  (`src/main.ts`) **não era erro e sim achado**: o `deno.json` manda checar um arquivo inexistente.
- **Amostragem dos achados graves**: reproduzi pessoalmente 7. Seis confirmados, **um refutado** —
  a exposição de `clients`/`activities`, corrigida com bloco de errata no próprio lote 08, com o
  texto original preservado.
- Registro também um erro **meu**: minha primeira conferência dessa exposição usou um filtro
  estreito demais e quase absolveu o achado por engano. Foi o teste empírico com `SET ROLE anon`,
  não a leitura estrutural, que deu a resposta certa.

---

## Próximos passos, por valor

### Barato e seguro — não toca produção

1. **Corrigir os 2 arquivos que não compilam.** É apagar uma linha mal colocada em cada.
   Ressuscita o NLQ e o AI Copilot. Menor esforço, maior efeito imediato.
2. **Reparar as 4 raízes de dado do bloco 7** — `status='completed'`, `stage` NULL,
   `deal_stage_history` vs `deal_stage_transitions`, colunas inexistentes. São poucos pontos de
   código e destravam dezenas de painéis de uma vez. É o melhor retorno por hora de trabalho
   desta lista.
3. **Remover ou marcar o dado fictício.** No mínimo, um selo visível de "dado de exemplo" onde
   houver mock. Hoje o usuário não tem como distinguir pedido real de pedido inventado.
4. **Trocar o mascaramento de zero por estado vazio honesto** — "MAPE 0,0% Excelente" sobre tabela
   vazia é pior que não mostrar nada.
5. **Regenerar o `package-lock.json`** em ambiente com rede e confirmar que `npm ci` volta a
   funcionar. Sem isso, nenhum outro portão de qualidade tem efeito.
6. **Dar `env` ao job E2E** para que os 27 specs deixem de ser pulados em silêncio.

### Exige decisão sua — toca produção ou é estratégico

7. **Reconstruir o livro-razão de migrations.** É o risco nº 1 e o único cuja materialização é
   catastrófica. Envolve produção e precisa de plano; não é algo que eu faça sem sua aprovação.
8. **Corrigir os 3 crons quebrados** e agendar o `cron-failure-alerter`, para que a próxima falha
   apareça.
9. **Decidir sobre a exposição anônima** de `products`, `suppliers` e `teams` — e, no mesmo
   movimento, tornar deliberada a proteção de `clients` e `activities`, que hoje é acidental.
10. **Decidir o destino do que está dormente.** Race Arena (11.930 linhas, zero acessos), webhooks
    Win/Loss (7.707 linhas, zero eventos), 24 Edge Functions órfãs, 16 integrações não
    configuradas. São três caminhos legítimos: **ativar** (agendar crons, configurar credenciais),
    **arquivar** (remover do bundle, manter em branch) ou **manter e assumir o custo**. A decisão é
    sua; o que não recomendo é deixar como está, porque hoje isso custa manutenção e não entrega.
11. **A pergunta de fundo:** o sistema nunca teve usuários reais. Antes de construir mais, vale
    colocar 5 vendedores usando o núcleo que já funciona por duas semanas. Isso responderá mais
    sobre o que falta do que qualquer auditoria — inclusive esta.

# Status de execução — Plano de 100 etapas (v2, reescrita pós-revisão)

| Campo | Valor |
|---|---|
| Data de abertura | 2026-08-30 |
| Esta revisão | v2.2 — v2 (15 correções do operador + 9 threads Codex do #68) → v2.1 (14 comentários do #69) → **v2.2: atendimento integral das 20 correções do operador** com baseline de segredos fixado por commit, P0s reconciliados com as fontes reais e revalidação do Lote 1 (§9.3, §9.4, §11) |
| Executor | Cline (agente) sob supervisão do operador |
| Fonte canônica das etapas | `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md` (§"Plano de melhorias e correções em 100 etapas", linhas 651–783) — **a numeração 1–100 deste documento segue exatamente essa fonte** |
| Fontes auxiliares | Handoff operacional 2026-08-30; Auditoria 2026-08-30 v2 (plano re-renumerado — divergência documentada em §5.1) |
| Modo | Somente leitura em bancos/painéis; escrita restrita a este documento |
| Destino declarado | Supabase Cloud `usyxfpqlsspldubptrdl` (sa-east-1) |
| Origem | `rapjswienfhkobhlamxb` (Lovable Cloud) |
| Sanitização | Nenhum valor de segredo é reproduzido; achados são referenciados por arquivo:linha:commit |

---

## 0. Linha do tempo e estado dos PRs (dependências explícitas)

| Item | Estado | Evidência |
|---|---|---|
| PR #67 `fix/hermes-h102707-auditoria-exaustiva` (auditoria exaustiva + plano de 100 etapas) | **Mergeado** em 2026-08-30 19:45:54 UTC | merge `aa0a12a42771` |
| PR #68 `docs/hermes-h108538-status-100-etapas` (status v1) | **Mergeado** em 2026-08-30 19:46:01 UTC, com 9 threads de revisão Codex **não resolvidas** | merge `ce5dd167954f` |
| PR desta revisão (v2/v2.1/v2.2) | Continuação que substitui o conteúdo deste arquivo: v2 respondeu às 9 threads do #68 (§9.2); v2.1 às 14 do #69 (§9.3); v2.2 atende às 20 correções do operador (§9.4) e às 2 threads Codex adicionais | este PR |

A v1 foi escrita quando o PR #67 ainda estava aberto e não declarava essa dependência; ambos foram mergeados em sequência. Nada na v1 alterou código — 1 arquivo, 233 adições, 0 remoções.

---

## 1. Resumo executivo

1. **Condição de parada do §17 do handoff permanece acionada**: o único banco acessível (self-hosted PG 15.8 @ `10.0.1.132`) **não é o destino** e a Management API responde **HTTP 403** para destino e origem com o token atual (evidências em §2). Nenhuma etapa dependente de banco foi executada.
2. **Revalidação P0 no escopo repo foi aprofundada nesta revisão**: varredura de segredos com **baseline fixado** (§3.1/§3.2): HEAD materializado = **8 achados** (`gitleaks dir` em checkout do commit `ce5dd16`) e histórico da `main` = **32 ocorrências** (`gitleaks git --log-opts='--full-history ce5dd16'`; gitleaks 8.30.1, sem configuração própria; `--all` rejeitado como baseline por instável). A v1 afirmava "histórico limpo" com base em `git log -S` parciais — **incorreto**: o histórico contém o segredo service_role nos 12 scripts (commit `b722848dd5`, ancestral de `main`). O HEAD está limpo nesses arquivos porque os scripts foram **parametrizados** (leem env via `scripts/lib/requireSupabaseAdminEnv`), não removidos.
3. **A rotação das credenciais (etapas 5–7) segue não verificável pelo repositório** e pendente de autorização/janela (§7).
4. **A matriz da §4 reproduz fielmente as 100 etapas canônicas de 26/08** (números, títulos, saídas e gates). Atividades que não pertencem à numeração canônica — inclusive o plano re-renumerado da auditoria de 30/08 — foram movidas para §5.
5. Nenhuma escrita foi executada em qualquer banco ou painel. Todas as ações foram leitura (`SELECT` de catálogo, `git log`, gitleaks, greps locais, chamadas GET de API) **e duas chamadas POST somente leitura** (`/v1/projects/{ref}/database/query` com `SELECT` de catálogo — ambas rejeitadas com HTTP 403; v2.2.1).

---

## 2. Condição de parada acionada — identidade de ambiente (§17 do handoff)

> §17: "se o projeto/ambiente não puder ser identificado de forma inequívoca" e "sem acesso ao painel" → parar e escalar. Acionada nas duas condições.

**Evidências coletadas (2026-08-30, somente leitura):**

| Verificação | Resultado |
|---|---|
| MCP `connection_info` / `overview` | Self-hosted PG 15.8 @ `10.0.1.132:5432`, db `postgres`, ~2,3 GB |
| Catálogo `public` do banco acessível | 1 tabela, 440 views, 46 funções, 0 policies, 0 triggers de negócio |
| Destino medido na auditoria canônica | 423 tabelas, 2.288 funções, 363 policies, 9 triggers críticos |
| Tabelas-chave do destino no banco acessível | `clients`, `sales`, `quotes_inbound`, `race_leaderboard` **ausentes** |
| Ledger do banco acessível | 792 versões; nomes de outro(s) sistema(s) (`sicoob_*`, `team_messages`, `contact_tags`) misturados a nomes do domínio Promo Champions; topo `20260825093000` |
| Migrations do repo ausentes nesse ledger | as 4 posteriores ao topo: `20260827000001`, `20260830000000`, `20260830000001`, `20260830000002` (lista corrigida — §9, Codex-5) |
| Management API `POST /v1/projects/usyxfpqlsspldubptrdl/database/query` | **HTTP 403** — "The bearer token does not have privileges" |
| Management API `POST /v1/projects/rapjswienfhkobhlamxb/database/query` | **HTTP 403** — idem |
| `supabase projects list` (conta CLI `adm01@promobrindes.com.br`) | 12 projetos listados; **nenhum** é o destino ou a origem |

**Decisão:** nenhuma ação remota ou DDL até que o operador forneça acesso inequívoco ao destino (§7).


---

## 3. Revalidação dos achados P0 (somente leitura)

A numeração **P0-001…P0-006 foi introduzida na v1 deste documento**; as auditorias de 26/08 e 30/08 **não usam esses identificadores** — a coluna "Origem na fonte" mapeia cada item à seção real de onde o tema procede.

| Ref. | Achado | Origem na fonte | Status | Evidência |
|---|---|---|---|---|
| P0-001 | RLS/policies do destino | 30/08 §"P0 — views adicionais do destino podem contornar RLS e estão abertas a anon"; 30/08 §"P1 — RLS existe, porém policies permissivas expõem dados"; 26/08 §"P0 de triagem — exposição SECURITY DEFINER no destino" | 🔶 **Bloqueado — acesso** | Destino inacessível (§2) |
| P0-002 | Grants/privilégios excessivos (guards ausentes em funções mutating) | 26/08 e 30/08 §"P0/P1 — funções SECURITY DEFINER executáveis por anon" | 🔶 **Bloqueado — acesso** | Idem |
| P0-003 | Funções sem `search_path` fixo — a v1 citava "563", **número sem fonte nas auditorias** (tema correlato: 30/08 etapa 49 e §"30 funções SECURITY DEFINER", que informa search_path configurado nelas) | v1 deste documento (valor interno, não confirmado) | 🔶 **Bloqueado — acesso; quantidade a recontar no destino** | Sem fonte rastreável; recontar quando acessível |
| P0-004 | Rotação de credenciais + exposição de chaves | 26/08 §"P0 — chave service_role versionada e ativa" e §"P0 — migrate-helper exfiltra credenciais"; 30/08 §"P0 — migrate-helper foi reintroduzida e continua implantada na origem" | 🟡 **Triagem repo concluída com baseline fixado (§3.1/§3.2); rotação não verificável; painéis pendentes** | HEAD fixado (`dir`) = 8 triados; histórico da `main` fixado (`--full-history ce5dd16`) = **32 ocorrências** triadas (service_role real no histórico); laço `git log -S` × 7 padrões externos (`sk_live_`, `rk_live_`, `key-`, `sbp_`, `sk-or-`, `mlsn.`, `re_`) = 0 credenciais reais (acertos apenas em documentos que citam o padrão como texto) |
| P0-005 | Mocks/simulação persistida | 26/08 §"mocks produtivos silenciosos"; 30/08 §"Dados fabricados apresentados como reais" | ⚠️ **Divergente — alvos corrigidos na v2.2** | **Cinco caminhos originais citados pela v1** (procedentes da própria v1; não rastreáveis nas auditorias): `components/admin/funnel/FunnelSettingsTab.tsx`, `components/achievements/Achievements.tsx`, `pages/Leaderboard.tsx`, `pages/Suppliers.tsx` — **inexistentes** — e `components/competitive/PrizeWheel.tsx` (citado como `gamification/`; **existe** e não contém mock). Suspeitos `PremiumPrizeWheel.tsx`/`SlotMachine.tsx`/`DEMO_MODE`: `git grep -c -E 'PremiumPrizeWheel[|]SlotMachine[|]DEMO_MODE' -- src supabase` = **0 acertos** (v2.2.2 — pipes escapados em `[|]` para não quebrar a tabela; regex equivalente). **Alvos atuais confirmados** (30/08 L193–208/607; reverificados): `src/components/dashboard/FuturisticSpeedometerDashboard.tsx:277/285` (`mockRevenueHistory`/`mockSalesHistory`), `src/components/conversational/SentimentTimelineChart.tsx:191` (`battleCardId="mock-id"`), `src/lib/bi/mockData.ts` — além dos demais casos nominais da fonte (enrich-lead, UsageAnalytics, LiveIntelligenceFeed, RecordingSummaryDrawer, PriceElasticityChart, ArenaAITips, EnhancedActivityCard, useWhatsApp, pipeline-pulse-aggregator; **casos vivos adicionais confirmados no HEAD (v2.2.2):** `src/hooks/bi/useClientVsIndustry.ts:39/49` (valor de cliente fixo `85`) e `src/hooks/bi/useClientBI.ts:54` (`confidence: 90` fabricada) — **o catálogo permanece incompleto até o inventário nominal integral da etapa 54**). `FollowUpAudit.tsx` **fora** da lista atual (`mockLogs` eliminado em `648dcc9d4`); `RevenueForecastV2.tsx`/`FollowUpInteligente.tsx` reclassificados (funcionalidade/pré-visualização) |
| P0-006 | Divergência ledger × migrations | 26/08 (L67/L458-466: **592 arquivos locais × 2.354 entradas**); 30/08 (L297/L484: **595 arquivos × 242 entradas** do ledger vivo) | ⚠️ **Divergente — contagens por método** | Repo `main` (`ce5dd16`): **595 arquivos** `.sql` / **586 versões** (até o 1º `_`; **582 marcações de data** — método no §10); 3 pares 14d duplicados (`20260104143930`, `20260104170152`, `20260104181000` ×2); 15 fora do padrão; **4 pós-topo** (`20260827000001`, `20260830000000/1/2`); `20260827202206` da v1 não existe. Ledger do destino inacessível (§2) |

### 3.1 Triagem dos 8 achados gitleaks no HEAD (`main` = `ce5dd16`)

Comandos (v2.2 — **baseline fixado**; execução em *checkout limpo do commit* `ce5dd16`; gitleaks **8.30.1**; **sem arquivo de configuração próprio**, regras padrão embutidas na versão; `git fsck --full --no-reflogs` executado antes como **pré-condição de integridade** — código 0 neste clone): `gitleaks dir --no-banner --report-format json --report-path <out> <checkout>` → **8** no HEAD materializado; `gitleaks git <checkout> --log-opts='--full-history ce5dd167954f6ef20855c31a02675657f1169e32' --no-banner --report-format json --report-path <out>` → **32** no histórico da `main`. **`--all` não é baseline estável** (varre branches de trabalho; neste PR elevou a contagem a 33 porque o próprio documento v2 reproduzia uma constante — falso positivo registrado e eliminado). Em clones com objetos ausentes (`fsck` ≠ 0), a triagem fica **bloqueada** até recuperar os objetos — a validade declarada vale para o clone íntegro onde foi executada. Nenhum valor reproduzido.

| # | Arquivo:linha | Regra | Classificação | Ação |
|---|---|---|---|---|
| 1 | `supabase/functions/migrate-helper/index.ts:5` | generic-api-key | **Verdadeiro — credencial real versionada** (ACCESS_KEY fixa; P0 canônico, etapa 5). Nota: `d150ec2ee` removeu apenas a seção `[functions.migrate-helper]` do `config.toml`; o arquivo segue no repo | Rotação (etapa 5, gate segredo) + remoção do arquivo (etapa 93/97, gate aprovação nominal) |
| 2 | `supabase/migrations/20260418124334_2874267c-...sql:56` | jwt | Verdadeiro — **anon JWT** do projeto legado `saejqkojleeaxzrslzfg` (terceiro); privilégio **nominal** baixo (papel anon); **proteção por RLS não verificada** — projeto legado inacessível (§2; v2.2.1) | **Migration permanece imutável** (handoff L35/42): rotação dos tokens anon do legado + expurgo autorizado do histórico (etapa 52, gate) ou migration corretiva nova com gate próprio |
| 3 | `supabase/migrations/20260512213243_8e4190b5-...sql:74` | jwt | Verdadeiro — mesmo token do item 2 (duplicata) | Idem |
| 4 | `supabase/migrations/20260512214007_64196e26-...sql:37` | jwt | Verdadeiro — **anon JWT** da origem `rapjswienfhkobhlamxb` | Idem |
| 5 | `supabase/migrations/20260726202421_0e6c60a8-...sql:15` | jwt | Verdadeiro — mesmo token do item 4 (duplicata) | Idem |
| 6 | `supabase/migrations/20260726202545_ba25ae3a-...sql:12` | jwt | Verdadeiro — mesmo token do item 4 (duplicata) | Idem |
| 7 | `docs/reports/BACKEND_ANALYSIS_REPORT.md:39` | generic-api-key | **Falso positivo documental** — publishable key truncada com `...` no próprio relatório (pública por design) | Opcional: mascarar para silenciar o scanner |
| 8 | `src/hooks/win-loss/useInsightExplanation.ts:5` | generic-api-key | **Falso positivo** — constante literal de chave de cache local de armazenamento (identificador interno, não credencial; valor não reproduzido nesta revisão porque a reprodução literal na v2 fazia o próprio documento disparar a regra `generic-api-key` em varreduras posteriores — corrigido na v2.1) | Nenhuma (ou renomear a constante) |

Síntese HEAD: **1 credencial real crítica** (migrate-helper) + 5 ocorrências de **2 anon JWTs** distintos (baixo privilégio por design) + 2 falsos positivos. **Nenhum service_role no HEAD** — os 12 scripts foram parametrizados (ver §3.2).

### 3.2 Triagem das 32 ocorrências do histórico da `main` (baseline fixado em `ce5dd16`)

Comando (v2.2, baseline fixado): `gitleaks git <checkout> --log-opts='--full-history ce5dd167954f6ef20855c31a02675657f1169e32' --no-banner --report-format json --report-path <out>` — gitleaks **8.30.1**, sem configuração própria. **Pré-condição:** `git fsck --full --no-reflogs` no mesmo checkout (código 0 neste clone — apenas objetos soltos). A varredura de `--all` **não** é baseline estável (varre branches de trabalho). Em clones com objetos ausentes (`fsck` ≠ 0 — como relatado pelo revisor no ambiente dele), **a triagem fica bloqueada** até a recuperação dos objetos; a validade aqui declarada vale para o clone íntegro onde foi executada. O objeto `96e8b744` é legível (`tree`) neste clone — o resultado contradiz a alegação da v1 de "histórico limpo".

| Grupo | **Ocorrências históricas** | Commits | Classificação | Ação |
|---|---|---|---|---|
| 12 scripts operacionais (`remove-demos*.ts` ×5, `seed-*.ts` ×6, `run-win-loss-analysis.ts`) — JWT **service_role do destino** | 12 | `b722848dd5` (2026-08-24) — **ancestral de `main`** | **Verdadeiro — segredo privilegiado no histórico**. No HEAD os arquivos existem parametrizados via `scripts/lib/requireSupabaseAdminEnv` (sem segredo); remediação de HEAD verificável em `648dcc9d4` (ancestral de `main`; v2.2.2 — o hash `22e447f6a` citado antes existe apenas em branch não mergeada e foi removido por não reproduzível em clone de `main`) | Rotação da chave (etapa 6, gate segredo/janela) + expurgo do histórico (etapa 52, gate reescrita) |
| `supabase/functions/migrate-helper/index.ts:5` — ACCESS_KEY | 3 | `0c11341b85` (08-04), `0d52e9ea44` (08-26), `79f0ed63c9` (08-28) | Verdadeiro — persiste no HEAD (§3.1 #1) | Etapas 5 e 93/97 |
| Migrations com anon JWT — 5 arquivos × 2 commits | **10** | Arquivos: `20260418124334`, `20260512213243`, `20260512214007`, `20260726202421`, `20260726202545`; commits introdutores `5c5bd1de24`, `70e1b6d166`, `38ce5e80a4`, `66e1432417`, `033c7ebb13` (04–07/2026) e os segundos commits que re-toque cada arquivo | Verdadeiro — 2 tokens anon do projeto legado (privilégio **nominal** baixo; **proteção por RLS não verificada** — acesso bloqueado). **Classificação das 5 ocorrências além dos 5 arquivos:** são re-aparições dos mesmos 2 tokens em segundos commits — mesma classificação e mesma ação dos pares originais. **Migrations permanecem imutáveis** (handoff L35/42 proíbe editar migrations aplicadas) | Rotação dos tokens + expurgo autorizado do histórico (etapa 52, gate de reescrita) ou migration corretiva nova com gate próprio; a etapa 51 **não** cobre migrations |
| `.env:2` — fragmento casado pela regra `jwt` | 2 | `3b8fbe9ae3` (2025-12-12), `d0a4a2983` (2026-05-11) | **Provável falso positivo parcial** — o segredo capturado tem apenas 8 caracteres e não forma um JWT completo; ainda assim o `.env` foi commitado e **removido do tracking em `13c31aa8e`** ("fix: CRITICAL - remove .env from git tracking") | Manter expurgo do `.env` no runbook da etapa 52; verificação nominal do conteúdo histórico do arquivo |
| `docs/reports/BACKEND_ANALYSIS_REPORT.md:39` | 3 | `c334bbc936`, `d8e57bc90a` (05-20), `b722848dd5` (08-24) | Falso positivo documental (§3.1 #7) | Opcional |
| `src/hooks/win-loss/useInsightExplanation.ts:5` | 2 | `a84135a305` (04-20), `b722848dd5` (08-24) | Falso positivo (§3.1 #8) | Nenhuma |

**Fechamento aritmético (v2.2):** 12 (scripts) + 3 (migrate-helper) + **10 (migrations)** + 2 (`.env`) + 3 (relatório documental) + 2 (`useInsightExplanation`) = **32 ocorrências históricas** no baseline fixado. **Série de medições:** 26/08 "20/31"; revisor 32; v2 = 8+32 (método não fixado); v2.1 = 33 com `--all` (instável — incluiu o branch deste PR e o falso positivo do próprio documento, eliminado); **v2.2 = baseline estável: 8 (`dir`) + 32 (`--full-history ce5dd16`)**, gitleaks 8.30.1, sem config própria. D-03 permanece **Aberta** até a etapa 87 fixar a config no CI e reproduzir (§9.4, item 13).

**Conclusão P0-004:** o segredo service_role do destino **existe no histórico de `main`** e sua rotação não é verificável pelo repo. As etapas 5–7 (rotações) e 52 (expurgo) seguem **pendentes e com gate**; a parametrização dos scripts (parte da etapa 51) já está refletida no HEAD.

---

## 4. Matriz de status das 100 etapas canônicas (fonte: plano de 26/08)

Numeração, títulos, saídas e gates reproduzem a fonte canônica (linhas 651–783). **Legenda de estado:** ✅ concluída com evidência · 🟡 parcialmente atendida (evidência anexa, verificação pendente) · 🔵 em andamento · ⬜ não iniciada, executável no repo local · 🔶 aguardando decisão/autorização do operador · 🔒 bloqueada por acesso (§7). Etapas 81 e 82 estão ✅ com evidência (revalidadas no baseline `ce5dd16`, código inalterado por este PR — v2.2.2); as demais seguem nos estados indicados.

### Fase A — contenção, custódia e linha de base

| # | Etapa canônica | Saída canônica | Gate canônico | Estado | Próxima ação |
|---|---|---|---|---|---|
| 1 | Abrir incidente de credenciais (dois P0, owners, horário, custódia sem copiar valores sensíveis) | ticket de incidente | nenhum | 🔶 | Operador abre ticket formal; este doc + §3 servem de insumo |
| 2 | Congelar deploys destrutivos (migrations, deleções, grants, deploy não emergencial) | janela de mudança registrada | autorização operacional | 🔶 | Decisão do operador |
| 3 | Confirmar a função de cada projeto (origem=catálogo? destino=CRM? réplica?) | ADR de topologia | decisão do proprietário | 🔶 | Aguarda decisão |
| 4 | Desativar migrate-helper na origem (sem chamar credentials) | rota 404 + evidência de deploy | autorização explícita (Edge implantada) | 🔒 | Origem inacessível; nota: seção removida do `config.toml` em `d150ec2ee`, arquivo segue versionado (§3.1) |
| 5 | Rotacionar a chave fixa da migrate-helper | chave antiga rejeitada | autorização de segredo | 🔒 | Credencial ainda versionada em `main` (§3.1 #1) |
| 6 | Rotacionar service_role do destino (presente nos 12 scripts) + atualizar consumidores via cofre de segredos | chave antiga rejeitada + smoke autorizado | autorização de segredo/janela | 🔒 | Segredo confirmado no histórico de `main` (§3.2) |
| 7 | Rotacionar credenciais potencialmente exfiltráveis da origem | credenciais antigas rejeitadas | autorização de segredo/janela | 🔒 | Depende de logs da origem |
| 8 | Investigar uso indevido (Auth, API, Edge, PostgREST, banco; LGPD) | relatório de impacto | acesso a logs | 🔒 | Aguarda acesso |
| 9 | Bloquear login WebAuthn (login-options/login-verify) até verificação criptográfica completa | feature flag/rota bloqueada | autorização de runtime | 🔒 | Aguarda autorização |
| 10 | Criar scorecard de prontidão real (substituir "10/10") | painel baseline vermelho/amarelo/verde | nenhum | 🔵 | Esta matriz é o embrião do scorecard |

### Fase B — acesso auditável e identidade dos ambientes

| # | Etapa canônica | Saída canônica | Gate canônico | Estado | Próxima ação |
|---|---|---|---|---|---|
| 11 | Reparar o conector SQL somente leitura do destino (exec_sql seguro ou token Management API de leitura) | SELECT de catálogo aprovado | autorização de infraestrutura | 🔒 | Pedir token/DSN RO (§7) |
| 12 | Capturar snapshots de catálogo (metadados, nunca dados pessoais; origem+destino no mesmo instante) | manifests assinados | acesso RO | 🔒 | Depende de 11 |
| 13 | Registrar fingerprints dos projetos (ref, região, Postgres/PostgREST, schemas, owners) | inventário canônico | nenhum | 🔒 | Refs conhecidos; versões exigem acesso |
| 14 | Reconciliar referências de projeto (config.toml, .temp, index.html, envs, scripts e CI) | matriz ambiente→ref | decisão de topologia | 🔶 | **Aguarda decisão de topologia do operador** (gate não atendido; o reponte do `config.toml` em `d150ec2ee` não o satisfaz — v2.2.2 usa 🔶, pois o bloqueio é decisão, não acesso) |
| 15 | Definir fonte de verdade das migrations (ledger canônico; 592 arquivos vs 2.354 entradas citados em 26/08) | ADR de migrations | decisão de arquitetura | 🔶 | Insumo repo-local pronto: 595 arquivos / 586 versões (P0-006) |
| 16 | Gerar tipos por ambiente (origem/destino separados, commit/ref e PostgREST versionados) | contratos reproduzíveis | acesso RO | 🔒 | Depende de 11 |
| 17 | Isolar toolchains Node/Bun/Deno (Deno não altera node_modules; versões = CI) | setup reproduzível | nenhum | ⬜ | Propor no Lote 2 |
| 18 | Escolher gerenciador de pacotes canônico (package-lock vs Bun; não apagar locks ainda) | ADR e CI piloto | aprovação do lote de limpeza | ⬜ | Verificar `yarn.lock`/`bun.lock` presentes |
| 19 | Criar baseline automatizado de presença Edge (local × origem × destino) | manifest por ambiente | acesso RO | 🔒 | Depende de 11 |
| 20 | Criar baseline de tráfego e erros (rotas, RPCs, relações, funções, jobs usados por 30–90 dias) | inventário de consumidores | retenção/logs disponíveis | 🔒 | Aguarda acesso |

### Fase C — reconciliação integral dos bancos

| # | Etapa canônica | Saída canônica | Gate canônico | Estado | Próxima ação |
|---|---|---|---|---|---|
| 21 | Comparar schemas e relações (classificar cada diferença 564/410: intencional, faltante, renomeada, obsoleta) | matriz assinada por owner | catálogo destino completo | 🔒 | Depende de 11 |
| 22 | Comparar todas as colunas (tipo, nullable, default, identity, generated, comentário, posição) | diff de 386/118 nomes e demais estruturas | nenhum DDL | 🔒 | Depende de 11 |
| 23 | Comparar constraints (PK, FK, UNIQUE, CHECK, deferrability, ação referencial, **validação** — `NOT VALID`/convalidated) | diff com severidade | catálogo destino completo | 🔒 | Depende de 11 |
| 24 | Comparar índices (definição, include, parcial, expressão, validade, tamanho, uso) | matriz de equivalência/perda | catálogo destino completo | 🔒 | Depende de 11 |
| 25 | Comparar RLS e FORCE RLS (cobertura por tabela/partição, efeito por role) | mapa deny/allow real | catálogo destino completo | 🔒 | Depende de 11 |
| 26 | Comparar policies (roles, comando, permissiva/restritiva, USING/WITH CHECK normalizados) | diff revisável | catálogo destino completo | 🔒 | Depende de 11 |
| 27 | Comparar rotinas (assinatura, body hash, owner/responsável, volatility, **parallel**, **SECURITY DEFINER/INVOKER**, search_path, grants) | diff das 965/199 diferenças | catálogo destino completo | 🔒 | Depende de 11 |
| 28 | Comparar triggers, views e MVs (consumers, security_invoker, dependências, refresh, **índices únicos das MVs**) | grafo de impacto | catálogo destino completo | 🔒 | Depende de 11 |
| 29 | Comparar enums, extensões e publicações (valores/ordem, versões, **schemas**, tabelas Realtime) | diff de infraestrutura | catálogo destino completo | 🔒 | Depende de 11 |
| 30 | Comparar privilégios, jobs e ledger (ACL/default ACL, sequences, cron, Vault, checksums) | reconciliação completa, sem aplicar nada | autorização apenas para leitura | 🔒 | Depende de 11 |

### Fase D — hardening de banco

| # | Etapa canônica | Saída canônica | Gate canônico | Estado | Próxima ação |
|---|---|---|---|---|---|
| 31 | Corrigir a partição p2026_11 (habilitar RLS, alinhar grants/policies ao pai) | teste de acesso direto e pelo pai | autorização DDL explícita | 🔒 | Aguarda acesso + autorização |
| 32 | Corrigir o job 297 (VACUUM fora de transação ou manutenção suportada) | execução bem-sucedida | autorização de job | 🔒 | Idem |
| 33 | Implementar o log de preço (fn_log_price_change/trg_log_price_change: payload, retenção, idempotência) | teste de mudança auditada | autorização de função/trigger | 🔒 | Idem |
| 34 | Fechar default ACLs (revogar grants futuros excessivos de `postgres`/`supabase_admin`, **preservando os privilégios gerenciados do Supabase** — plataforma continua criando/mantendo objetos) | teste de criação de objeto | autorização de privilégios | 🔒 | Idem |
| 35 | Reduzir grants de tabelas e sequences (remover MAINTAIN/REFERENCES/TRIGGER e escrita de anon injustificada) | matriz mínima por role | autorização por lote | 🔒 | Idem |
| 36 | Revisar policies literais true (classificar 176 USING e 48 CHECK; substituir só as não intencionais) | testes anon/authenticated/service_role | autorização RLS por lote | 🔒 | Idem |
| 37 | Minimizar façades públicas (reduzir v_products_public; revisar 9 views owner-context) | contrato público aprovado | decisão funcional e DDL | 🔒 | Idem |
| 38 | Rever MVs/publicações (internal.mv_product_leaf_category; auth.users no Realtime) | testes Realtime/API | autorização de grants/publicação | 🔒 | Idem |
| 39 | Endurecer SECURITY DEFINER (10 da origem, 217 do destino; search_path, ownership, EXECUTE mínimo) | zero rotina mutável perigosa para anon | autorização função/grants | 🔒 | Idem |
| 40 | Resolver stubs de banco (no-ops e 11 rotinas marcadas; começar pelas com consumidor) | decisão nominal e teste por rotina | autorização de função/trigger | 🔒 | Idem |

### Fase E — estabilização das Edge Functions

> Baseline real medido em `main` (`ce5dd16`): **171 diretórios** em `supabase/functions/`, **170 entrypoints `index.ts`**, **283 arquivos `.ts`** no total. O "597 Edge Functions" da v1 estava incorreto (§9, Codex-4).

| # | Etapa canônica | Saída canônica | Gate canônico | Estado | Próxima ação |
|---|---|---|---|---|---|
| 41 | Eliminar os sete erros de parser (bytes U+0001, imports, fechamentos, type query; diff mínimo) | sete deno check verdes | nenhum DDL | ⬜ | **Lote 1** (§6) |
| 42 | Corrigir `_shared/retry.ts` (telemetry coerente; validar os 5 consumidores quebrados) | testes unitários de retry + 5 checks verdes | nenhum | ⬜ | **Lote 1** (§6) |
| 43 | Zerar as outras 33 falhas TypeScript (por domínio, sem casts que escondam drift) | 169/169 deno check | nenhum DDL | ⬜ | **Lote 1** (§6) — meta canônica referencia 169 entrypoints de 26/08; hoje são 170 |
| 44 | Tornar check de tipos bloqueante no CI (qualquer erro TS, sintaxe, import não versionado, byte de controle) | teste negativo do workflow | nenhum | ⬜ | **Lote 1** (§6) |
| 45 | Reconciliar tabelas/RPCs/campos usados pelas Edges (leads, lead_routing_assignments, team_members, enqueue_email, 76 usos incompatíveis) | contratos gerados sem escape untyped | DDL somente se aprovado | ⬜ | Inventário repo-local; reconciliação final exige BD |
| 46 | Unificar sales.status (enum/vocabulário canônico; migrar filtros/fixtures/constraint) | testes de cada funil | decisão de negócio e possível DDL | 🔶 | Inventário repo-local possível |
| 47 | Projetar autenticação dos endpoints externos (JWT, HMAC/provider signature, state/PKCE, anti-replay, rate limit) | modelagem de ameaças e testes negativos | mudança de config/deploy | ⬜ | A modelagem de ameaças é trabalho de design repo-local |
| 48 | Aplicar autorização/ownership nas funções service-role (priorizar as 74 que escrevem) | matriz função→papel→escopo e testes | deploy Edge autorizado | ⬜ | Matriz repo-local; aplicação exige deploy |
| 49 | Consertar envio de quote (serviço transacional real; payload/auth multicanal; idempotência) | quote→e-mail/WhatsApp em staging | credenciais/provider e deploy | 🔒 | Aguarda provedores (§7) |
| 50 | Remover simulação persistida como sucesso (enrich-lead, workflow-executor, mock multicanal; provenance) | nenhum dado fabricado em tabelas reais | decisão de produto | 🔶 | Inventário repo-local; decisão do operador |

### Fase F — integridade do frontend e produto

| # | Etapa canônica | Saída canônica | Gate canônico | Estado | Próxima ação |
|---|---|---|---|---|---|
| 51 | Parametrizar os 12 scripts secretos (env/Vault; negar execução sem project ref explícito; dry-run) | gitleaks limpo no HEAD | nenhum segredo novo | 🟡 | Parametrização já presente no HEAD (§3.2); **pendente:** verificar dry-run e recusa sem project ref; validação formal |
| 52 | Planejar expurgo do histórico (mapear clones, branches, tags, CI, consumidores antes de git-filter-repo) | runbook e janela | autorização explícita para reescrita | ⬜ | Insumo pronto: mapa dos 32 achados (§3.2) |
| 53 | Mover a roleta para RPC atômica (sorteio, saldo, prêmio, ledger; idempotência) | testes concorrentes/adversariais | autorização DDL/RLS | 🔒 | Aguarda acesso + autorização |
| 54 | Isolar todos os mocks produtivos (dados reais ou modo DEMO não persistente com banner) | catálogo dos 15 casos e testes | decisão produto por módulo | 🔶 | Alvos reais corrigidos em P0-005 (§3) |
| 55 | Consertar assinatura digital (provedor/e-mail, callbacks assinados, estado verificável) | fluxo E2E em staging | custo/provedor | 🔒 | Aguarda decisão de provedor |
| 56 | Consertar contratos do frontend (auth_users_view, orders→profiles; regenerar tipos; remover casts) | testes de Configurações e histórico | possível DDL | 🔒 | Regenerar tipos exige acesso (etapa 16) |
| 57 | Ligar lead routing ao backend (auto_assign_lead consumido; round-robin transacional) | teste concorrente multiusuário | autorização RPC/trigger | 🔒 | Aguarda acesso + autorização |
| 58 | Corrigir navegação de pedidos (criar /meus-pedidos ou ajustar retorno; separar real de demo) | E2E de lista→detalhe→volta | nenhum | ⬜ | Executável repo-local (frontend) |
| 59 | Resolver privacidade da rota espectador (campos públicos, pseudonimização, grants; link seguro/expirável) | teste anon e privacy review | decisão de negócio/RLS | 🔶 | Aguarda decisão |
| 60 | Unificar semântica de venda ganha (completed/won/closed; KPIs/LTV/Edge/DB) | contrato e fixtures canônicas | decisão de negócio | 🔶 | Aguarda decisão |

### Fase G — completar funcionalidades parciais

| # | Etapa canônica | Saída canônica | Gate canônico | Estado | Próxima ação |
|---|---|---|---|---|---|
| 61 | Inventariar cada ação sem efeito (16 módulos: implementar, ocultar ou "em breve") | matriz botão→efeito→owner | decisão produto | 🔶 | Inventário repo-local; decisão do operador |
| 62 | Persistir onboarding (ownership, etapas, auditoria — ou remover a promessa da rota) | reload/multiusuário preserva estado | autorização de modelo DB | 🔒 | Aguarda autorização |
| 63 | Corrigir Follow-up Audit (remover mistura/fallback silencioso; erro/estado vazio honestos) | testes sucesso, vazio e falha | nenhum DDL se view existir | ⬜ | Correção frontend repo-local; validação com dados exige BD |
| 64 | Corrigir Usage Analytics (eventos reais com privacidade/retenção; remover aleatoriedade) | métricas rastreáveis | modelo de telemetria/LGPD | 🔶 | Aguarda decisão |
| 65 | Completar BI, SDR e pricing (fontes/provenance ou modo demo) | cada card informa fonte e timestamp | decisão de dados | 🔶 | Aguarda decisão |
| 66 | Completar Conversational Intelligence (upload, transcrição, diarização, feed, coaching) | chamada→transcrição→insight E2E | provedor/custo e storage | 🔒 | Aguarda decisão de provedor |
| 67 | Criar os três buckets faltantes (call-recordings, quote-pdfs, report-snapshots; policies, limites, MIME, retenção, antivírus) | testes por role | autorização Storage | 🔒 | Aguarda acesso + autorização |
| 68 | Completar workflows e multicanal (ações reais, callbacks assinados, retries/DLQ, estados truthful) | E2E de sucesso/falha/retry | provedores e deploy | 🔒 | Aguarda provedores |
| 69 | Reconciliar integrações externas (Bitrix24, Twilio, ElevenLabs, e-mail, webhooks; secret inventory, health checks) | matriz configured/degraded/disabled | credenciais/custo | 🔒 | Aguarda painéis (§7) |
| 70 | Criar Definition of Done por rota (174 rotas: UI, contrato, auth, estados, testes, observabilidade, tráfego) | catálogo 174/174 sem "pronta" por inferência | responsáveis | ⬜ | **Recontagem v2.1:** o HEAD `ce5dd16` mede **175 rotas declaradas** (`src/routes/AppRoutes.tsx`; 175 `<Route path>` únicos) — usar 175 como denominador de execução (o 174 é a fonte de 26/08; §9.3, Codex L218) |

### Fase H — dados, performance e confiabilidade

| # | Etapa canônica | Saída canônica | Gate canônico | Estado | Próxima ação |
|---|---|---|---|---|---|
| 71 | Paginar consultas ilimitadas (clientes, produtos, atividades, ranking; colunas mínimas) | limites e cursor testados | nenhum DDL inicial | ⬜ | Código repo-local; validação final exige BD |
| 72 | Corrigir filtros .in de alta cardinalidade (4 violações → join/RPC/batching) | testes unitários verdes e carga limite | possível RPC | ⬜ | Casos já cobertos por testes que falham (auditoria 26/08) |
| 73 | Eliminar N+1 e agregações no cliente (ranking, carga de vendedores, KPIs → queries/RPCs indexáveis) | orçamento de queries por tela | possível DDL | ⬜ | Código repo-local; validação exige BD |
| 74 | Validar índices por workload (159 sem scan × query plans e sazonalidade; criar/drop individual) | parecer por índice | autorização explícita por índice | 🔒 | Exige catálogo/plans do destino |
| 75 | Revisar partições e retenção (criação futura com RLS/grants herdados, archival, vacuum/analyze) | teste de próxima partição | autorização DDL/job | 🔒 | Aguarda acesso + autorização |
| 76 | Tornar jobs observáveis (owner, SLA, timeout, idempotência, retry, alerta — 137 jobs) | catálogo e zero falha silenciosa | mudança de job autorizada | 🔒 | Idem |
| 77 | Implementar concorrência segura (locks/constraints/idempotency: prêmio, lead routing, cadências, quotes, workflows, webhooks) | testes de corrida | possível DDL | ⬜ | Testes de corrida repo-local; constraints exigem DDL |
| 78 | Definir retenção de auditoria e telemetria (segurança/negócio/debug; LGPD) | política e jobs testados | aprovação jurídica/negócio | 🔶 | Aguarda decisão |
| 79 | Criar SLOs e tracing ponta a ponta (request_id browser→Edge→PostgREST/provider; métricas RED) | dashboards e runbook | infraestrutura | 🔒 | Aguarda infraestrutura |
| 80 | Testar backup e restauração (PITR, Storage, secrets, migrations; restore drill isolado) | RPO/RTO medidos | ambiente/custo | 🔒 | Aguarda ambiente |

### Fase I — qualidade e segurança contínuas

| # | Etapa canônica | Saída canônica | Gate canônico | Estado | Próxima ação |
|---|---|---|---|---|---|
| 81 | Zerar lint atual (corrigir 5 erros e revisar 19 warnings, sem refatoração ampla) | npm run lint verde | nenhum | ✅ | **Concluída no baseline `ce5dd16`** (v2.2.2): `npm run lint` = código 0, 0 erros/0 avisos; `npx tsc --noEmit` = 0; código inalterado por este PR (evidência no §6/§11) |
| 82 | Corrigir testes unitários (3 falhas + 4 casos de cardinalidade, sem afrouxar asserts) | Vitest 100% verde | nenhum | ✅ | **Concluída no baseline `ce5dd16`** (v2.2.2): `vitest run` = 458 aprovados / 2 ignorados / 0 falhas (51 arquivos); código inalterado por este PR (evidência no §6/§11) |
| 83 | Medir cobertura real (todo src elegível; separar generated/UI trivial; elevar até 85% significativo) | relatório não-curado | política de qualidade | ⬜ | Baseline de cobertura é repo-local |
| 84 | Executar E2E autenticado no CI (contas/fixtures isoladas; falhar quando auth não configurada; **segredos protegidos no workflow**; **limpeza das fixtures pós-execução**) | fluxos críticos não pulados | ambiente de teste | 🔒 | Aguarda ambiente |
| 85 | Expandir acessibilidade (174 rotas por amostragem; remover supressões justificadas; nomear 82 botões) | gates de axe/teclado/leitor de tela | nenhum | ⬜ | Parcialmente repo-local; **denominador de execução = 175 rotas no HEAD (recontagem v2.1 — §9.3, Codex L218)** |
| 86 | Automatizar testes Edge (por entrypoint: contratos, auth negativa, CORS, SSRF, webhooks, service-role) | cobertura por função | ambiente isolado | 🔒 | Aguarda ambiente |
| 87 | Endurecer a cadeia de suprimentos (15 vulnerabilidades, fixar Deno/npm, SBOM, Dependabot, gitleaks em pre-receive/CI) | zero crítica/alta sem aceite | upgrades avaliados | ⬜ | Parcialmente repo-local; config de gitleaks resolve divergência de contagens (§3.2) |
| 88 | Endurecer CSP e armazenamento do navegador (remover unsafe-eval/inline progressivamente; reduzir JWT persistido) | CSP report-only→enforced | plano de compatibilidade | ⬜ | Plano é repo-local |
| 89 | Definir orçamentos de desempenho (chunks, LCP/INP/CLS, consultas, memória, PWA; detalhar por ponto crítico medido) | gate de regressão | nenhum | ⬜ | **Lote 1** (§6) — **não** é "criar npm run ci" (erro da v1 corrigido; §9, Codex-9) |
| 90 | Executar carga e caos controlados (rate limits, retries, DLQ, providers fora, DB lento; nunca em produção sem janela) | relatório e capacidade | ambiente/custo | 🔒 | Aguarda ambiente |

### Fase J — limpeza governada e liberação

| # | Etapa canônica | Saída canônica | Gate canônico | Estado | Próxima ação |
|---|---|---|---|---|---|
| 91 | Publicar manifesto de candidatos (hash, tamanho, owner, último uso, motivo; sem deletar) | checklist aprovável | nenhum | ⬜ | Repo-local |
| 92 | Validar os 131 módulos, 21 hooks, 2 services e 2 páginas (imports, flags, telemetria, docs, owners) | manter/migrar/deprecar por item | nenhum | ⬜ | Cruzamento repo-local; telemetria exige BD |
| 93 | Consolidar duplicatas e scripts (atoms/ui; um remove-demos seguro por lote pequeno) | imports migrados e testes verdes | aprovação nominal de arquivos | 🔶 | Inclui decisão sobre os scripts parametrizados (§3.2) |
| 94 | Limpar artefatos de tooling (bundle-stats, supabase/.temp, manifests stale) | redução mensurada do Git | aprovação nominal de arquivos | 🔶 | Aguarda aprovação |
| 95 | Normalizar locks e documentação histórica (lock canônico; alegações antigas → history com validade) | onboarding/CI reproduzível | aprovação nominal | 🔶 | Depende da etapa 18 |
| 96 | Deprecar antes de remover objetos de banco (revogar consumidores em staging; observar ≥1 ciclo) | zero chamada no período acordado | autorização por objeto | 🔒 | Aguarda acesso + autorização |
| 97 | Submeter lote de remoção ao proprietário (evidência, impacto, rollback, backup por item) | aprovação/rejeição explícita nominal | obrigatório | 🔶 | Aguarda lote |
| 98 | Fazer canário com rollback automático (staging/canário; SLOs; tráfego real) | evidência de estabilidade | autorização de release | 🔒 | Aguarda release |
| 99 | Executar smoke ponta a ponta em produção (login, quote→sale, pedido, webhook, gamificação, relatórios, jobs) — **sem fabricar dados** (nenhum registro fictício em produção) | evidência assinada e sem PII | janela/tráfego autorizado | 🔒 | Aguarda janela |
| 100 | Certificar ou rejeitar prontidão (P0/P1 fechados, CI verde, reconciliação, restore, tráfego saudável) | ata go/no-go e backlog residual | proprietário, engenharia e operação | 🔒 | Última etapa do programa |

---

## 5. Atividades auxiliares (fora da numeração canônica)

### 5.1 Plano re-renumerado da auditoria de 30/08 (divergente — não confundir com o canônico)

A auditoria de 30/08 traz seu próprio plano com numeração diferente da canônica de 26/08. A v1 misturou as duas numerações na mesma matriz (erro apontado pelo Codex-1). Itens do plano de 30/08 citados na v1, agora fora da matriz canônica:

| Item (numeração 30/08) | Correspondência no plano canônico | Disposição |
|---|---|---|
| Inventário de secrets/env do destino | Etapa 8 (investigação) + etapas 5–7 (rotação) | Absorvido como sub-tarefa quando houver acesso |
| Inventário Stripe/Resend/MailerSend/OpenRouter + rotação | Etapas 6/69 (integrações externas) | Painéis pendentes (§7) |
| Inventário/congelamento/snapshots da origem Lovable | Etapas 2, 7, 12 | Aguarda acesso Lovable |
| Export `auth.users` da origem | **Atividade própria — não é a etapa 12** (catálogo = metadados, "nunca dados pessoais"; export contém dados de identidade) | **Gate AUTH-DATA:** autorização nominal de dados + justificativa LGPD + escopo mínimo + retenção especificada + proteção em trânsito/repouso + cópia de segurança/pré-execução (v2.2) |
| Painel de status com proprietário/validação | Etapa 10 (scorecard) | Este documento é o embrião |
| Acesso RO/escrita controlada ao destino | Etapa 11 | §7 |
| Confirmar Top 20 e contadores (mínimos reais) | Etapas 12/13/20 | Aguarda acesso |
| Catálogo das 423 tabelas; rotas × persistência; mapa buckets×Edge×crons | Etapas 12, 19, 20 e Fase C | Aguarda acesso |
| Confirmar `meta_criadores` vs `meta_creators`; testar 5 RPCs dos gráficos | Fase C (21–30) | Aguarda acesso |
| Formalizar decisão `reprocess_confidence=0.4` | Decisão de negócio avulsa | Aguarda operador |

### 5.2 Atividades operacionais desta sessão (não são etapas do plano)

- Triagem gitleaks HEAD (8 achados) e histórico completo (32 achados) — §3.1/§3.2; insumo para as etapas 51/52/87.
- Verificação dos 7 padrões de chaves externas no histórico (`git log -S`) — P0-004, §3.
- Medição de contagens de repo (migrations 595/586; Edge 171/170/283) — corrige v1; insumo para etapas 15/19/41–44.
- Verificação de acesso (Management API 403 × 2; lista de 12 projetos) — §2.

---

## 6. Lote 1 proposto (executável sem banco) — corrigido

Escopo fechado, somente etapas canônicas repo-locais. **Critério de aceite do lote:** nenhuma falha nova introduzida e melhoria mensurável do baseline; o lote não se declara concluído com falhas remanescentes (§9, Codex-8).

| # | Etapa canônica | Trabalho | Validação |
|---|---|---|---|
| 41 | Eliminar os sete erros de parser | Varredura sintática das **170 Edge Functions** (entrypoints `index.ts`; baseline: 171 dirs / 170 index.ts / 283 .ts) com `deno check` — **Deno obrigatório: sem o binário a validação fica bloqueada** (ambiente reproduzível = etapa 17; **sem fallback `deno lint`**, v2.2) + relatório nominal em `docs/execucao/`. Contagem atual do baseline: **7 erros de parser presentes** (§11) | **Sete `deno check` verdes + 0 erros de parser no relatório final** (v2.2 — validação não aceita lista residual; §9.3, Codex L301) |
| 42 | Corrigir `_shared/retry.ts` | Correção dos arquivos com erro de parser **e do módulo compartilhado `supabase/functions/_shared/retry.ts`** com seus **cinco consumidores nominais**: `deal-risk-digest`, `wal-health-alert`, `notify-quote-conversion`, `edge-retry-threshold-alert`, `forecast-narrative` (importam `withRetry`/`RetryError`; `email-bulk-*` importam `retry-policy`, fora do escopo); telemetria coerente | Verificador **restrito aos cinco consumidores** (filtro ONLY) com 0 falhas + testes unitários de retry; o gate 170/170 pertence à etapa 43 (v2.2.1) |
| 43 | Zerar as outras 33 falhas TypeScript (**escopo: Edge Functions/Deno**; `tsc --noEmit` do aplicativo verde no HEAD) | Correção por domínio, sem conversões de tipo que escondam divergência. **Recontagem v2.2 (ambiente local sem `deno install`):** 7 erros de parser + 158 falhas de resolução de dependência npm (ambientais — etapa 17) + 5 aprovados; as "33 falhas de tipo" são linha de base de 26/08 **a revalidar em ambiente Deno dedicado antes de manter o número** | `deno check` 170/170 entrypoints |
| 44 | Tornar check de tipos bloqueante no CI | Adicionar gate de typecheck Edge aos workflows (hoje: `lint.yml`, `pr-checks.yml`, `qa-exhaustive.yml`, `edge-functions-bundle.yml`, `codeql.yml`, `quote-to-sale-e2e.yml`, `cron-monitoring.yml`) | Teste negativo do workflow |
| 81 | Zerar lint atual | **Revalidação v2.1 (HEAD `ce5dd16`, reexecutado localmente):** `npm run lint` encerra com código 0 (0 erros, 0 avisos) e `npx tsc --noEmit` também 0 — a linha de base de 26/08 (5 erros/19 avisos) foi superada; o trabalho passa a ser **manter o verde** sob o gate `--max-warnings 0` já vigente (§9, Codex-7; §9.3, Codex L306) | `npm run lint` com 0 erros e 0 avisos (já atendido; garantir por regressão) |
| 82 | Corrigir testes unitários | **Revalidação v2.1 (HEAD `ce5dd16`, reexecutado localmente):** `vitest run` = 458 aprovados / 2 ignorados / 0 falhas (51 arquivos) — a linha de base de 26/08 (3 falhas/4 casos) foi superada; trabalho = manter 100% verde sem afrouxar asserções (§9, Codex-8; §9.3, Codex L306) | `npm run test` (vitest run) 100% verde (já atendido; garantir por regressão) |
| 89 | Definir orçamentos de desempenho | Registrar linha de base (chunks, LCP/INP/CLS, pré-cache PWA ~683 KiB medido em 26/08) e propor gates de regressão | Documento de orçamentos + gate proposto |

**Sobre `npm run ci` (correção da v1):** "criar `npm run ci`" **não é etapa canônica** (a v1 o rotulou erroneamente como etapa 89). Se o operador quiser um agregador local, a proposta é `ci = lint + typecheck + test + build` — **incluindo `npm run typecheck`** (`tsc --noEmit`), pois o build do Vite transpila sem typecheck completo e os workflows rodam verificação TS separada (§9, Codex-9). Fica como **atividade auxiliar** (§5), não como etapa.

**Sobre CI — falhas preexistentes vs introduzidas:** antes do lote, registrar o baseline de cada workflow obrigatório em `main` (quais já falham). O gate do lote é: (a) nenhum check que estava verde fica vermelho; (b) falhas preexistentes são citadas no PR com evidência de que não foram introduzidas pelo diff. O lote não é responsável por zerar falhas preexistentes fora de escopo, mas deve registrá-las. **Registro v2.2 (estado do CI — sem alegação de verde):** `Lighthouse Performance Audit` = **FALHA** no commit `8e0d8d609` e **já falhava no PR #68** (tarefa 99291438246, também doc-only); `e2e-simulation` falha no `main` (execução 33331779618); `E2E Tests` pendente/cancelado após falhas ambientais de autenticação — **todas preexistentes, nenhuma introduzida por diff documental**. Verde apenas em: Lint & Type Check, Build, Unit Tests, Bundle Size, quality, quality-gate. **Este PR não se declara com CI verde enquanto Lighthouse falhar ou E2E estiver pendente** (§9.4, item 19).

---

## 7. Pendências de acesso (bloqueiam Fases A–D e parte de E–H)

1. **Token Management API ou DSN read-only do destino** (`usyxfpqlsspldubptrdl`) e da origem (`rapjswienfhkobhlamxb`) — o token atual recebe **HTTP 403** nos dois; ou execução guiada das queries de leitura pelo operador.
2. **Alternativa:** DSN read-only do destino (pooler porta 6543, role `readonly`).
3. **Identidade do banco self-hosted** `10.0.1.132`: qual projeto ele representa, por que o ledger mistura domínios diferentes e quem o provisionou — necessário para encerrar D-01/D-05.
4. **Confirmação de qual banco foi medido** na auditoria de 26/08 — é essa linha de base (2.354 entradas, topo `20260825093000`) que coincide com o topo do banco self-hosted desta sessão (D-05); a 30/08 (242 entradas; última `20260802150910`, L477-481) é ambiente distinto e não partilha a coincidência.
5. **Acesso Lovable** (painel/API) — congelamento e snapshots da origem.
6. **Painéis Stripe, Resend, MailerSend, OpenRouter** — verificação de exposição e rotação de chaves (P0-004).
7. **Autorizações com gate:** rotações (etapas 5–7), desativação da migrate-helper implantada (etapa 4), bloqueio WebAuthn (etapa 9) — ver §"Próximas autorizações recomendadas" da fonte canônica.

---

## 8. Divergências registradas

| ID | Divergência | Estado |
|---|---|---|
| D-01 | Banco acessível ≠ destino (§2) | Aberta — aguarda §7 item 3 |
| D-02 | Baseline canônica 26/08: **592 migrations locais × 2.354 entradas no ledger**; atual (`ce5dd16`): **595 arquivos / 586 versões** (582 marcações de data — método no §10); 30/08 mediu 242 entradas no ledger vivo (L477-481: última `20260802150910` — ambiente distinto do self-hosted, ver D-05). "263/275" removido (sem fonte) | Aberta — confirmar em reconciliação (Fase C) |
| D-03 | Contagens gitleaks: 20/31 (26/08) vs 32 (revisor) vs 8+32 (v2) vs 33 `--all` (v2.1, instável) vs **baseline fixado 8+32** (v2.2; commit `ce5dd16`, gitleaks 8.30.1, sem config própria) | **Aberta** — etapa 87 (fixar config no CI) pendente; reproduzir contagens e só então reavaliar |
| D-04 | Plano de 30/08 re-renumera as etapas canônicas | Resolvida nesta v2 — §4 segue a canônica; §5.1 mapeia a divergente |
| D-05 | **Esclarecida (v2.2.2):** a coincidência de topo (`20260825093000`) é entre a linha de base de **26/08** (2.354 entradas) e o banco self-hosted desta sessão (§2); a auditoria de **30/08** (L477-481: 242 versões; última `20260802150910`) é **ambiente distinto** e não partilha a coincidência — a v1 atribuiu incorretamente a coincidência à 30/08 | A suspeita de ambiente errado restringe-se à linha de base de 26/08 | Confirmar com o operador qual banco foi medido em 26/08 e qual é a identidade do self-hosted (§7 itens 3–4) |
| D-06 | "597 Edge Functions" (v1 e docs antigas) vs 171 dirs/170 index.ts/283 .ts medidos | Resolvida nesta v2 — baseline corrigido (§4 Fase E) |

---

## 9. Matriz alegação → evidência → resultado → correção

Consolidação das correções exigidas pelo operador à v1 (15 pontos) e das 9 threads Codex do PR #68, com o resultado verificado nesta sessão e a correção aplicada nesta v2.

### 9.1 Correções exigidas pelo operador

| # | Alegação sobre a v1 | Evidência verificada | Resultado | Correção nesta v2 |
|---|---|---|---|---|
| O-1 | Dependência do PR #67 não declarada | PR #67 mergeado 19:45:54 UTC; PR #68 mergeado 19:46:01 UTC, 1 arquivo | Confirmada | §0 com linha do tempo e merges explícitos |
| O-2 | Matriz não seguia a numeração/títulos canônicos | v1 usava numeração do plano de 30/08 | Confirmada | §4 reproduz 1–100 da fonte canônica (linhas 651–783) |
| O-3 | Etapas 3–20 e 60 fora de posição / tabela quebrada | v1 renderizava 41–100 como texto solto; 3–20 e 60 após o log | Confirmada | Tabelas por fase, contíguas, 100 linhas na §4 |
| O-4 | Atividades auxiliares misturadas às etapas | v1 misturava plano de 30/08 com o canônico | Confirmada | §5 (seção separada) |
| O-5 | "597 Edge Functions" incorreto | Medido em `main`: 171 dirs / 170 index.ts / 283 .ts | Confirmada | Baseline corrigido (§4 Fase E, §6) |
| O-6 | Contagem/inventário de migrations incorretos | 595 arquivos/586 versões; `20260827202206` não existe; 4 pós-topo reais listadas | Confirmada | P0-006 corrigido (§3) |
| O-7 | P0 credencial citava scripts como se o segredo estivesse vivo no HEAD | Scripts existem parametrizados; segredo está no histórico (`b722848dd5`) | Confirmada com correção de enredo | §3.1/§3.2; etapas 5/6/51/52 |
| O-8 | P0-004 sem triagem nominal | Triagem concluída: 8 HEAD + 32 histórico classificados | Resolvida | §3.1/§3.2 com tabelas |
| O-9 | CI sem distinção preexistente vs introduzido | — | Confirmada | §6 "Sobre CI" |
| O-10 | Sem apêndice de evidências reproduzível | — | Confirmada | §10 |
| O-11 | Sem matriz alegação→evidência→resultado→correção | — | Confirmada | Esta seção |
| O-12 | Alvos inexistentes (PremiumPrizeWheel/SlotMachine) | Busca nominal = 0 ocorrências | Confirmada | P0-005 corrigido (§3); alvos reais listados |
| O-13 | Lote 1 com numeração errada (89 = "npm run ci"; 597 Edges) | Etapa 89 canônica = budgets de performance; `ci` não existe no package.json | Confirmada | §6 corrigido (41, 42, 43, 44, 81, 82, 89) |
| O-14 | "Objeto git 96e8b744 corrompido" (revisor) | Objeto existe e é legível neste clone; varredura full-history concluída | Refutada para este clone; ambiente do revisor com objeto ausente | §3.2 (nota de reprodutibilidade) |
| O-15 | Plano divergente de 30/08 não documentado | Numerações distintas confirmadas | Confirmada | §5.1 com mapeamento |

### 9.2 Threads de revisão Codex (PR #68)

| # | Thread (ID) | Alegação | Correção nesta v2 |
|---|---|---|---|
| C-1 | #3889994556 (P1) | Matriz redefine a numeração canônica; etapa 1 virou "snapshot do destino" | §4 fiel ao canônico; plano de 30/08 isolado em §5.1 |
| C-2 | #3889994560 (P2) | Linha em branco encerra a tabela após etapa 40; etapas 3–20 e 60 fora da matriz | Tabelas contíguas por fase; 100 linhas na posição correta |
| C-3 | #3889994563 (P2) | `PremiumPrizeWheel.tsx`/`SlotMachine.tsx` não existem; sem `DEMO_MODE` atribuído | Removidos; alvos reais em P0-005 (§3) |
| C-4 | #3889994565 (P2) | Contagem real: 171 dirs / 170 index.ts / 283 .ts, não 597 | Baseline corrigido (§4 Fase E, §6) |
| C-5 | #3889994567 (P2) | `20260827202206` inexistente; 4 pós-topo reais omitidas | P0-006 corrigido (§3) |
| C-6 | #3889994572 (P1) | "Histórico limpo" declarado com varredura interrompida (git exit 128, tree 96e8b744) | Varredura completa concluída nesta sessão: **histórico NÃO está limpo** — 32 achados triados (§3.2) |
| C-7 | #3889994574 (P2) | Etapa de lint ignorava warnings, mas `lint` usa `--max-warnings 0` | §6 etapa 81: 0 erros **e** 0 warnings |
| C-8 | #3889994578 (P2) | Aceite de testes com falhas remanescentes contradiz a etapa 82 | §6 etapa 82: etapa permanece pendente até `vitest run` verde |
| C-9 | #3889994580 (P2) | `npm run ci` proposto sem `typecheck` | §6: agregador inclui `typecheck` e deixa de ser apresentado como etapa canônica |

### 9.3 Threads de revisão deste PR #69 — veredictos e correções (14 da v2.1 + 2 da v2.2; 16 registros)

Todas as threads foram verificadas contra o código antes da correção; nenhuma resposta é "por cortesia".

| Thread (autor, linha) | Veredicto v2.1 | Correção aplicada |
|---|---|---|
| CodeRabbit L23 — estrangeirismos | Procedente | Termos editoriais trocados por pt-BR (continuação, cofre de segredos, gerenciador de pacotes, responsável, desempenho, navegador, cadeia de suprimentos, orçamentos, modelagem de ameaças); nomes de arquivos/rotas/funcionalidades preservados |
| CodeRabbit L70 — P0-005 inconsistente | Procedente | P0-005 reescrito: alvos confirmados no HEAD (`FuturisticSpeedometerDashboard.tsx:277/285`, `SentimentTimelineChart.tsx:191`, `src/lib/bi/mockData.ts`); `FollowUpAudit.tsx` removido (`mockLogs` eliminados em `648dcc9d4`); busca restrita a `src supabase` com comando registrado |
| CodeRabbit L333 — D-03 "Mitigada" indevido | Procedente | D-03 reaberta até a etapa 87 fixar config de gitleaks no CI e reproduzir contagens |
| CodeRabbit L406 — apêndice não executa os 7 padrões | Procedente | §10 agora usa laço `for` com os sete padrões e saída identificada |
| Codex L92 — clone do revisor sem o objeto `96e8b744` | Refutada para este clone; registrada | `git fsck --full --no-reflogs` encerra com código 0 (apenas objetos soltos normais) e `git cat-file -t 96e8b744…` = tree; evidência adicionada ao §10; a varredura de histórico é completa NESTE clone — o ambiente do revisor permanece divergente e foi registrado |
| Codex L103 — soma 27 ≠ 32 | Procedente | §3.2 explicita: 27 agrupamentos por arquivo + 5 duplicações por commit nas migrations = 32/33 impressões digitais; tabela atualizada (linha "5 arquivos — 10 impressões") |
| Codex L70 — `FollowUpAudit.tsx` já corrigido | Procedente | Alvo removido de P0-005 com evidência (`648dcc9d4`; HEAD consulta `follow_up_audit_view`) |
| Codex L135 — etapa 14 sem gate canônico | Procedente | Saída "matriz ambiente→ref" e gate "decisão de topologia" restaurados; estado 🟡→🔶 |
| Codex L218 — denominador 174 vs 175 | Procedente | Recontagem no HEAD: 175 rotas (`src/routes/AppRoutes.tsx`, 175 `<Route path>` únicos); etapas 70/85 usam 175 como denominador de execução, com a fonte 26/08 (174) citada |
| Codex L278 — export `auth.users` como etapa 12 | Procedente | Reclassificado como atividade própria com gates de autorização de dados + cópia de segurança + análise LGPD |
| Codex L302 — etapa 42 proíbe `retry.ts` | Procedente | Escopo da 42 inclui `supabase/functions/_shared/retry.ts` e seus 5 consumidores |
| Codex L306 — linha de base do lote defasada | Procedente | Reexecução local no HEAD `ce5dd16`: `npm run lint` código 0; `npx tsc --noEmit` código 0; `vitest run` 458/2 ignorados/0 falhas — etapas 81/82/43 atualizadas para "manter o verde" |
| Codex L332 — linha de base de migrations errada | Procedente | D-02 corrigida: 592 arquivos (26/08, fonte canônica L67) → 595; "263/275" não tinha fonte |
| Codex L80 — editar migrations históricas | Procedente | Ação dos JWT em migrations reescrita: imutabilidade preservada (handoff L35/42); tratamento via expurgo (etapa 52, gate) e/ou migration corretiva autorizada |
| Codex L431 — "não declare integridade histórica como comprovada" (clone do revisor com fsck código 2) | Parcialmente procedente | §3.1/§3.2 reescritas na v2.2: `fsck` é **pré-condição** declarada; linguagem "integridade total" substituída por "clone íntegro onde foi executada"; em clones com objetos ausentes a triagem fica **bloqueada**. A divergência do ambiente do revisor permanece registrada (verossimilmente checkout sem histórico completo) |
| Codex L301 — validação da etapa 41 aceitava lista residual | Procedente | Validação da etapa 41 endurecida: **sete `deno check` verdes + 0 erros de parser**; contagem atual (7 presentes) registrada no §6/§11 |

**Efeitos colaterais positivos da revisão:** (i) o documento v2 disparava a regra `generic-api-key` ao reproduzir literalmente a constante do §3.1 #8 — a v2.1 elimina essa reprodução e, com isso, o 33º achado desaparece das próximas varreduras; (ii) o modo correto de varredura do HEAD (`gitleaks dir`) ficou documentado no §10; (iii) as falhas de CI do PR (Lighthouse/E2E) foram demonstradas preexistentes (PR #68 e `main`).


### 9.4 Matriz das 20 correções do operador → ação → evidência (v2.2)

| # | Exigência do operador | Ação v2.2 | Evidência |
|---|---|---|---|
| 1 | Responder nominalmente os comentários Codex/CodeRabbit | 16 threads: 4 CR confirmadas; 10 CX respondidas na v2.1; 2 CX novas respondidas na v2.2 (§9.3) | Threads do PR |
| 2 | Triagem histórica: total 32; tabela fechando; migrations = 10; classificar as 5 omitidas | Tabela §3.2 reescrita por **ocorrências históricas** (12+3+10+2+3+2=32); as 5 extras das migrations classificadas como re-aparições dos mesmos tokens | §3.2 |
| 3 | Separar comandos HEAD (`dir` em checkout fixado) × histórico (`--full-history ce5dd16`); registrar versão/config/commit; rejeitar `--all` | Feito em §3.1 e §10; gitleaks **8.30.1**, **sem config própria**, commit `ce5dd16`; `--all` marcado como não estável | §3.1, §10 |
| 4 | P0-005: remover FollowUpAudit; 5 caminhos nominais; busca só em `src`/`supabase`; sem alegar zero na árvore | Feito (v2.2) | §3, P0-005 |
| 5 | Etapa 14: saída/gate canônicos; aguardando decisão | Restaurado; estado 🔒 "Aguarda decisão de topologia" | §4 |
| 6 | D-02: 592×2.354 → 595/586; remover 263/275 | Feito (D-05 esclarecida na v2.2.2: suspeita de banco errado aplica-se apenas à linha de base 26/08) | §8 |
| 7 | Revalidar Lote 1; reexecutar e registrar; estados 81/82; recontar Deno antes de manter 7+33 | Reexecutado (lint/tsc/vitest verdes — §6/§11); Deno recontado: 7 parser + 158 resolução npm + 5 ok; "33" marcada como linha de base a revalidar em ambiente dedicado | §6, §11 |
| 8 | Etapa 42: permitir `retry.ts`; nomear os 5 consumidores; sem "somente etapa 41" | Feito — 5 consumidores nominais | §6 |
| 9 | Remover fallback `deno lint`; ausência de Deno bloqueia | Feito | §6, etapa 41 |
| 10 | Não orientar edição/parametrização de migrations históricas | §3.1 #2 e §3.2 reescritas; imutabilidade + rotação/expurgo/corretiva | §3.1, §3.2 |
| 11 | Export `auth.users` fora do snapshot; gate AUTH-DATA + LGPD + escopo + retenção + proteção | Feito | §5 |
| 12 | Denominadores 175 | Etapas 70/85 com 175 de execução | §4 |
| 13 | D-03 Aberta/Pendente | Mantida Aberta com série de medições | §8 |
| 14 | Laço real dos 7 padrões (sem "idem") | Laço com `--full-history` fixado | §10 |
| 15 | pt-BR editorial | Termos convertidos; identificadores preservados | todo o documento |
| 16 | Descrição do PR conforme modelo do repositório | Body reescrito segundo `.github/pull_request_template.md` | PR #69 |
| 17 | Reconciliar P0-001…006 com os P0s reais das fontes; não atribuir IDs inexistentes | Tabela §3 com "Origem na fonte" nominal; "563" e os 5 caminhos declarados como provenientes da v1 | §3 |
| 18 | Registrar o falso positivo `generic-api-key` do próprio documento | Mantido e detalhado (sem allowlist) | §3.1 #8, §3.2 |
| 19 | Aguardar todos os checks; não declarar CI verde | Estado real registrado (Lighthouse FALHA, E2E pendente); sem alegação de verde | §6 "Registro v2.2", §11 |
| 20 | Validações finais completas + nova matriz | 100 etapas, Markdown, `git diff --check`, gitleaks fixado, revisores reexecutados, threads resolvidas, esta matriz | §10, §11, PR |

---

## 10. Apêndice de evidências reproduzíveis (sanitizado)

Comandos exatos executados nesta sessão. Nenhum valor de segredo é reproduzido; achados são referenciados por arquivo:linha:commit.

```bash
# Contagens de repo (em main = ce5dd16)
ls supabase/migrations/*.sql | wc -l                    # 595
ls -d supabase/functions/*/ | wc -l                     # 171
ls supabase/functions/*/index.ts | wc -l                # 170
find supabase/functions -name '*.ts' | wc -l            # 283
ls supabase/migrations/ | grep -c 20260827202206        # 0 (versão inexistente)
ls supabase/migrations/*.sql | xargs -n1 basename | grep -oE '^[0-9]+' | sort -u | wc -l   # 582 marcações de data distintas
ls supabase/migrations/*.sql | xargs -n1 basename | cut -d_ -f1 | sort -u | wc -l          # 586 identificadores de versão (até o 1º _)
# Verificação estrutural de rotas (v2.2.2) — extrai os Route.path, conta e falha em duplicatas (verificado: 175/175, nenhuma duplicata)
python3 -c "import re,collections; s=open('src/routes/AppRoutes.tsx').read(); o=re.findall(r'<Route\\b(?=[\\s\\S]*?>)([\\s\\S]*?)>',s); p=[m.group(1) for a in o if (m:=re.search(r'\\bpath\\s*=\\s*\"([^\"]*)\"',a))]; c=collections.Counter(p); print(len(o),len(p),len(c)); assert len(p)==175 and len(c)==175, c"

# Varredura de segredos — HEAD (8 achados) e histórico completo (32 achados)
# Baseline fixado (v2.2.2) — checkout limpo do commit; gitleaks 8.30.1; sem config própria
git worktree add <dir> ce5dd167954f6ef20855c31a02675657f1169e32 --detach
# Isolamento de config (v2.2.2): unset GITLEAKS_CONFIG GITLEAKS_CONFIG_TOML; confirmar ausência de <dir>/.gitleaks.toml (verificado: ausente; 0 vars de ambiente)
# Pré-condições: raso? fsck?
[ "$(git -C <dir> rev-parse --is-shallow-repository)" = false ] || git -C <dir> fetch --unshallow   # verificado: false (não raso)
git -C <dir> fsck --full --no-reflogs    # código de saída 0 (verificado neste clone)
gitleaks dir --no-banner --redact --report-format json --report-path <out1> <dir>   # 8 — HEAD materializado
gitleaks git <dir> --log-opts='--full-history ce5dd167954f6ef20855c31a02675657f1169e32' --no-banner --redact --report-format json --report-path <out2>   # 32 — histórico da main (NÃO usar --all como baseline)
# Pós-análise: proteger ou remover <out1>/<out2> (contêm caminhos/commit mesmo com --redact)

# Segredo service_role no histórico: commit introdutor é ancestral de main
git merge-base --is-ancestor b722848dd5 main            # exit 0 (é ancestral)

# .env removido do tracking (segredo persiste no histórico)
git log --full-history ce5dd167954f6ef20855c31a02675657f1169e32 --oneline -- .env   # 13c31aa8e (remoção), d0a4a2983, 3b8fbe9ae

# Objeto citado pelo revisor como corrompido — íntegro neste clone
git cat-file -t 96e8b744b6faadffc94a18cf7f717656075fec21   # tree
git fsck --full --no-reflogs                              # código de saída 0; apenas objetos soltos — clone íntegro (pré-condição da triagem; clones com objetos ausentes ficam bloqueados)

# Padrões de chaves externas sem ocorrência real (2 hits são docs de auditoria)
# 7 padrões — dois métodos (v2.2.2): (a) substring p/ prefixos longos; (b) regex estrutural p/ padrões curtos (evita falso positivo de substring como "score_"/"monkey-")
for padrao in 'sk_live_' 'rk_live_' 'sbp_' 'sk-or-' 'mlsn.'; do printf '\n== %s ==\n' "$padrao"; git log -S "$padrao" --full-history ce5dd167954f6ef20855c31a02675657f1169e32 --oneline; done   # acertos apenas em documentos que citam o padrão
for rx in '\bre_[A-Za-z0-9_-]{15,}' 'key-[A-Za-z0-9_-]{15,}'; do printf '\n== %s ==\n' "$rx"; git log -G"$rx" --full-history ce5dd167954f6ef20855c31a02675657f1169e32 --oneline; done   # 0 commits em ambos (verificado)
```

**Notas de reprodutibilidade:** (i) as contagens gitleaks dependem da versão e da config — a divergência D-03 só se fecha fixando a config no CI (etapa 87); (ii) a contagem "por commit" (modo `git`) difere da contagem "por arquivo no HEAD" (modo `dir`) — por isso o baseline fixa commit e modo; (iii) o acesso ao banco segue bloqueado (§2) — nenhuma evidência de banco foi coletada nesta sessão.

---

## 11. Log da sessão (2026-08-30)

| Ação | Resultado |
|---|---|
| Revalidação P0 no escopo repo (v1) | P0-001/002/003 bloqueados; P0-004/005/006 parciais — superada pela revalidação desta v2 |
| Condição de parada §17 | Acionada e mantida (§2) |
| gitleaks HEAD (`ce5dd16`) | 8 achados triados (§3.1): 1 credencial real (migrate-helper), 5 anon JWTs (2 tokens), 2 falsos positivos |
| gitleaks histórico completo | 32 achados triados (§3.2): segredo service_role presente nos 12 scripts em `b722848dd5` (ancestral de main) |
| Verificação de scripts no HEAD | Existem e estão parametrizados (`requireSupabaseAdminEnv`); a alegação da v1 de "histórico limpo" estava incorreta |
| Medição de contagens | migrations 595 arquivos / 586 identificadores de versão (582 marcações de data — método no §10); Edge 171/170/283; rotas declaradas 175 (`AppRoutes.tsx`); workflows de CI listados; `package.json` conferido (`--max-warnings 0`, `typecheck`) |
| **Revisão v2.1 (14 threads do PR #69)** | Todas triadas e respondidas (§9.3); evidências reexecutadas: `git fsck` código 0; lint/tsc/vitest verdes no HEAD; rotas 175; migrations 582/586; D-02 592→595; FollowUpAudit limpo; gitleaks `dir`=8 / `git --all`=33 impressões |
| Simulação da etapa 41 (v2.1/v2.2) | `deno check` nos 170 pontos de entrada (Deno 2.9.5; sem `deno install`): 5 aprovados; **7 erros de parser** (quantidade da lista canônica da 41 — presentes no baseline); 158 falhas de resolução de dependência npm (ambientais — etapa 17); 0 expirados |
| **v2.2 — atendimento das 20 correções do operador** | Baseline fixado: `dir`=8 e `--full-history ce5dd16`=**32** (gitleaks 8.30.1, sem config própria; fsck código 0 no checkout fixado); 5 caminhos originais do P0-005 listados e verificados; 5 consumidores de `retry.ts` nomeados; P0s reconciliados com as seções reais das fontes; descrição do PR conforme o modelo do repositório |
| Estado do CI (v2.2 — sem alegação de verde) | Lighthouse **FALHA** (preexistente: PR #68) e E2E pendente/cancelado; verdes: Lint/Build/Unit/Bundle/quality/quality-gate; aguardar todos os checks antes de qualquer declaração |
| PR #68 | Mergeado com 9 threads não resolvidas; esta v2 responde nominalmente (§9.2) e é entregue em PR de continuação |
| Escrita em bancos/painéis remotos | **Nenhuma** (modo somente leitura respeitado) |

> Documento vivo: atualizar a §4 a cada etapa concluída, anexando evidência conforme o modelo do §16 do handoff.

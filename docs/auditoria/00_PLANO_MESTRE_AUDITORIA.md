# Plano Mestre de Auditoria — Promo Champions v2.1

> **Data:** 2026-07-18
> **Escopo:** Auditoria técnica exaustiva (segurança, correção, performance, qualidade, acessibilidade)
> **Dimensão do sistema:** ~1.941 arquivos TS/TSX · ~284k linhas · 162 Edge Functions (Deno) · 553 migrations SQL · 71 arquivos de teste
> **Stack:** React 18 + TypeScript + Vite · Supabase (Postgres + Edge Functions + RLS) · TanStack Query · Tailwind/Radix
> **Metodologia:** Fan-out de investigação por domínio + verificação adversarial + varredura automatizada (tsc/eslint/tests/deps)

Este documento define **(A)** a divisão da missão global em **30 módulos de auditoria** e **(B)** o **plano de execução em 50 etapas**. Os achados são registrados em `docs/auditoria/RELATORIO_FALHAS.md`.

---

## A) Divisão da missão em 30 módulos de auditoria

Cada módulo tem um responsável (frente), superfície-alvo e o tipo de falha caçada.

### Frente 1 — Segurança de Fronteira & Identidade
| # | Módulo | Superfície-alvo | Falhas caçadas |
|---|--------|-----------------|----------------|
| 01 | Autenticação & Sessão | `src/lib/auth`, `src/hooks/auth`, `src/components/auth`, `Auth.tsx` | bypass de login, refresh de token, flash de conteúdo protegido, persistência insegura |
| 02 | Autorização / RBAC | guards de rota, `AccessDenied`, checagem de role | role só no client, OR/AND invertido, rota sem guard |
| 03 | Roteamento & Navegação | `src/routes`, `App.tsx`, lazy loading | rota protegida exposta, open redirect, 404 handling |
| 04 | Cliente Supabase & Config de Ambiente | `src/integrations/supabase`, `.env.example` | divergência de env vars, chave hardcoded, storage de sessão |

### Frente 2 — Núcleo Transacional (impacto financeiro)
| # | Módulo | Superfície-alvo | Falhas caçadas |
|---|--------|-----------------|----------------|
| 05 | Quote-to-Sale (idempotência) | `src/services`, `supabase/functions/*quote*` | dupla conversão, pedido duplicado, falta de lock/constraint |
| 06 | Cálculo Financeiro | totais, impostos, arredondamento | divisão por zero, moeda, total negativo |
| 07 | Comissões | `Comissoes`, `CommissionRules`, hooks revenue | regra sobreposta, RBAC de alteração, retroatividade |
| 08 | Pedidos & Order Tracking | `src/components/orders`, `order-tracking`, `src/lib/orderTracking` | estado parcial, rastreio inconsistente |
| 09 | Pricing & Cotações | `src/components/pricing`, `quotes` | preço manipulável, validação client-side |

### Frente 3 — CRM & Dados de Cliente
| # | Módulo | Superfície-alvo | Falhas caçadas |
|---|--------|-----------------|----------------|
| 10 | Clientes / Fornecedores / Produtos | `clients`, `fornecedores`, `products` | IDOR, vazamento entre times, dedupe frágil |
| 11 | Pipeline & Deal Intelligence | `pipeline`, `deal-intelligence` | transição de stage sem validação, perda de histórico |
| 12 | Atividades & Tarefas | `activities`, `tasks` | atribuição incorreta, sync |
| 13 | Lead Scoring & Routing | `lead-scoring`, `lead-routing` | divisão por zero, regra que nunca dispara |
| 14 | Cadências / Sequências / Follow-up | `cadences`, `sequences`, `follow-up` | envio duplicado, opt-out/compliance, timezone |
| 15 | Territórios | `territories`, `territory-optimization` | otimização instável, atribuição |

### Frente 4 — Inteligência & Análise
| # | Módulo | Superfície-alvo | Falhas caçadas |
|---|--------|-----------------|----------------|
| 16 | BI & Relatórios | `src/lib/bi`, `src/lib/reports`, `components/bi` | agregação errada, timezone, período |
| 17 | Forecast & Revenue Intelligence | `src/lib/revenueForecast`, `forecast` | modelo quebra em dado esparso, confiança falsa |
| 18 | Win/Loss & Analytics | `src/lib/winloss`, `analytics` | viés de amostra, off-by-one |
| 19 | IA — Copilot & Agentes | `components/ai`, `copilot`, `ai-agent-orchestrator` | prompt injection, loop de agente sem limite, custo |
| 20 | NLQ (Natural Language Query) | `components/nlq`, `hooks/nlq`, edge `nlq` | SQL gerado por IA sem allowlist (injeção) |
| 21 | Exportação (PDF/Excel/CSV) | `jspdf`, `exceljs`, export utils | CSV/formula injection, vazamento de dados |

### Frente 5 — Backend Supabase
| # | Módulo | Superfície-alvo | Falhas caçadas |
|---|--------|-----------------|----------------|
| 22 | Edge Functions — AuthN/AuthZ | `_shared/auth-client`, `verify_jwt` | função sem verificação de JWT/role |
| 23 | Edge Functions — Service Role & IDOR | uso de `SERVICE_ROLE_KEY` | burla de RLS com input não validado |
| 24 | CORS & Cabeçalhos | `_shared/cors` | `Allow-Origin: *` em endpoint autenticado |
| 25 | Webhooks & Integrações | `dispatch-webhook`, `bitrix24-*`, pix | assinatura ausente, replay, idempotência |
| 26 | Rate Limit / Circuit Breaker / Retry | `_shared/rate-limit`, `circuit-breaker`, `retry` | endpoint caro sem limite, retry sem idempotência |
| 27 | RLS Policies | `supabase/migrations/*.sql` | `USING (true)`, tabela sensível sem RLS |
| 28 | SECURITY DEFINER & Grants | funções definer, `GRANT` | `search_path` ausente, grant a anon |

### Frente 6 — Qualidade Transversal
| # | Módulo | Superfície-alvo | Falhas caçadas |
|---|--------|-----------------|----------------|
| 29 | Hooks, Estado & Realtime | `src/hooks/**`, React Query, canais realtime | deps de efeito, memory leak, race, invalidação |
| 30 | Testes, Build, Deps, CI, A11y & Perf | configs, `.github`, `tests`, `components/ui` | cobertura ilusória (skips), tsconfig frouxo, XSS, a11y, bundle |

---

## B) Plano de execução em 50 etapas

### Fase 0 — Preparação & Reconhecimento (etapas 1–6)
1. Mapear árvore do repositório, métricas de tamanho e stack.
2. Levantar sinais automáticos: contagem de `any`, `console.*`, `eslint-disable`, `dangerouslySetInnerHTML`, `.skip/.only`, TODO/FIXME.
3. Inventariar Edge Functions (162), migrations (553) e helpers `_shared`.
4. Ler configs de segurança de fronteira: `client.ts`, `.env.example`, `config.toml` (`verify_jwt`).
5. Inventariar workflows de CI e documentação/auditorias prévias em `docs/`.
6. Definir contrato de achado (severidade, local, impacto, evidência) e criar diretório `docs/auditoria/`.

### Fase 1 — Descoberta paralela por domínio (etapas 7–20)
7. Auditar Módulos 01–04 (Auth/RBAC/Rotas/Config). *(agente)*
8. Auditar Módulo 05–06 (Quote-to-Sale + Financeiro). *(agente)*
9. Auditar Módulos 22–24 (Edge Functions segurança/CORS/service role). *(agente)*
10. Auditar Módulos 27–28 (RLS + SECURITY DEFINER + Grants). *(agente)*
11. Auditar Módulo 29 (Hooks/Estado/Realtime). *(agente)*
12. Auditar Módulo 30 parte A (UI/A11y/Perf/XSS). *(agente)*
13. Auditar Módulos 16–21 (BI/Forecast/IA/NLQ/Export). *(agente)*
14. Auditar Módulo 30 parte B (Testes/Build/Deps/CI). *(agente)*
15. Auditar Módulos 07–09 + gamificação + integrações (Comissões/Pedidos/Race/Bitrix). *(agente)*
16. Auditar Módulos 10–15 (CRM/Clientes/Pipeline/Cadências/Territórios). *(agente)*
17. Varredura automatizada: `tsc --noEmit` (typecheck) e coleta de erros de tipo.
18. Varredura automatizada: `eslint` completo e coleta de warnings/erros suprimidos.
19. Varredura de dependências: `npm audit` / lockfiles divergentes (npm + bun + deno).
20. Consolidar todos os achados dos agentes num backlog bruto.

### Fase 2 — Verificação & Triagem (etapas 21–30)
21. Deduplicar achados sobrepostos entre agentes.
22. Verificar adversarialmente cada achado CRÍTICO/ALTO lendo o código-fonte diretamente (confirmar reprodutível vs. falso positivo).
23. Classificar por severidade final (CRÍTICO/ALTO/MÉDIO/BAIXO/INFO) e por módulo.
24. Mapear cada falha a CWE/OWASP quando aplicável.
25. Estimar impacto de negócio (financeiro, vazamento de dados, disponibilidade, compliance/LGPD).
26. Estimar esforço de correção (S/M/L) e risco de regressão.
27. Identificar "quick wins" (alto impacto, baixo esforço).
28. Identificar dívidas estruturais (exigem refatoração).
29. Registrar cobertura da auditoria (o que foi lido vs. amostrado) e limitações.
30. Publicar `RELATORIO_FALHAS.md` exaustivo. **← entrega da fase de descoberta**

### Fase 3 — Bateria de testes E2E dirigida (etapas 31–40)
31. Instalar dependências e validar build reproduzível (`build`).
32. Inventariar testes existentes e medir quantos realmente executam (sem `HAS_AUTH`).
33. Provisionar sessão/credenciais de teste para destravar E2E autenticados de Quote-to-Sale.
34. Rodar suíte unitária (`vitest`) e registrar falhas/flakes.
35. Rodar suíte E2E (`playwright`) do fluxo crítico e registrar gaps.
36. Escrever E2E faltantes para cada CRÍTICO/ALTO sem cobertura (prova de existência da falha).
37. Testar RLS/authorization com múltiplos papéis (matriz de acesso por role).
38. Testar Edge Functions de escrita com payloads maliciosos (fuzz de contrato).
39. Testar exportações com payloads de CSV/formula injection.
40. Registrar `RELATORIO_E2E.md` com resultados por ferramenta/função.

### Fase 4 — Remediação priorizada (etapas 41–48)
41. Corrigir CRÍTICOS de segurança de fronteira (auth/RBAC/env).
42. Corrigir CRÍTICOS transacionais (idempotência/financeiro).
43. Corrigir CRÍTICOS de backend (RLS/service role/webhook signature).
44. Corrigir ALTOS de vazamento de dados (IDOR/CORS/logs de PII).
45. Corrigir XSS/injeção (SQL/prompt/CSV).
46. Endurecer testes: remover cobertura ilusória, adicionar guards em CI.
47. Corrigir MÉDIOS (hooks/leaks/perf/a11y bloqueante).
48. Regressão: rodar `typecheck + lint + test + e2e` verde.

### Fase 5 — Verificação Final & Entrega (etapas 49–50)
49. Revisão de segurança pós-correção (`/security-review`) e recontagem de riscos residuais.
50. Consolidar relatório final, changelog, e abrir PR (draft) com trilha de auditoria.

---

## Estado atual
- ✅ Fase 0 concluída (etapas 1–6).
- 🔄 Fase 1 em andamento (descoberta paralela — etapas 7–20).
- ⏳ Fases 2–5 pendentes.

> Conforme solicitado, a **primeira entrega é a descoberta e documentação exaustiva das falhas** (Fases 0–2). As fases de teste E2E e remediação (3–5) ficam para aprovação/execução subsequente.

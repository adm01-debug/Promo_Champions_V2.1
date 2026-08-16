# Lote 14 — Verificação da própria auditoria

> Auditoria da auditoria. Objetivo: encontrar erros e lacunas **no trabalho desta auditoria**,
> não no sistema. Medição: 2026-08-16, após a conclusão dos 13 lotes.
> Método: recontagem independente, reexecução de queries e conferência aritmética documento a
> documento.

---

## Veredito

A auditoria **se sustenta nos achados estruturais**, mas **errou em números de apresentação** —
inclusive em documentos meus. Nenhum risco estrutural caiu na reverificação; três contagens
publicadas estavam erradas e foram corrigidas; e **uma lacuna do prompt-mestre que eu não havia
cumprido foi executada agora**, produzindo um achado novo e grave.

| Categoria | Qtd |
|---|---:|
| Achados estruturais reverificados e **confirmados** | 12 |
| Achados estruturais **refutados** nesta rodada | 0 |
| Erros numéricos **meus**, corrigidos | 6 |
| Erros numéricos **dos lotes**, corrigidos | 4 |
| Lacunas do prompt não cumpridas, agora executadas | 1 |
| Achados **novos** produzidos pela verificação | 1 |

---

## 1. Erros que eu mesmo cometi

Registrados primeiro, de propósito.

### 1.1 🔴 Contagem errada no meu próprio lote 13 — **propagada para todo lugar**

Escrevi no lote 13: *"Contagem do lote: 0 ✅ / 11 🟨 / 5 🟦 / 0 ⬛ de 16 integrações"*.

Contando as 16 linhas numeradas da minha própria tabela: **0 ✅ / 13 🟨 / 3 🟦 / 0 ⬛**.

Eu havia contado como 🟦 quatro itens que estão numa **tabela separada** (Sentry, PostHog, flags
de build, `VITE_USE_MOCK_DATA` — os "mencionados mas inexistentes"), misturando duas populações.
O erro entrou no `ESTADO_ATUAL.md`, na descrição da PR e no resumo que apresentei. **Corrigido em
todos.**

### 1.2 Fase A: contei 169 Edge Functions — são **168**

Rodei `ls -d supabase/functions/*/ | wc -l`, que inclui o diretório `_shared`. O lote 10 apontou
o número certo e eu não voltei para corrigir o que havia reportado.

### 1.3 Fase A: contei 80 arquivos de teste — são **140**

Usei o padrão `*.test.*`/`*.spec.*` e ignorei a convenção Deno `*_test.ts` (50 arquivos).
Verificado agora: 90 + 50 = **140**. O lote 12 estava certo.

### 1.4 Recontagem publicada estava desatualizada

Publiquei "587 arquivos citados, 4 inexistentes (0,7%)". Aquela medição foi feita **antes de o
lote 04 terminar**. Números finais, com os 15 documentos:

- **673 arquivos distintos citados**
- **2 não existem** — e ambos se explicam: `src/main.ts` é achado legítimo (o `deno.json` manda
  checar arquivo inexistente) e `src/pages/Webhooks.tsx` só aparece **dentro do meu próprio texto
  de errata**, como o caminho errado que foi corrigido.
- Taxa efetiva de citação inválida: **0**.

### 1.5 Pontos cegos publicados estavam desatualizados

Publiquei "40 de 104 domínios de componentes sem citação". Medido também antes do lote 04.
Número correto: **28 de 104**.

### 1.6 Meu primeiro teste de exposição anônima usou filtro estreito demais

Já registrado na errata do lote 08, repetido aqui para o inventário ficar completo: filtrei
policies por predicado literal `'true'` e descartei `((deleted_at IS NULL) AND true)`, o que quase
me fez absolver um achado verdadeiro.

---

## 2. Erros nos lotes, corrigidos

| # | Lote | O que estava errado | Correto |
|---|---|---|---|
| 2.1 | 04 | "`sales.stage` é NULL em **765/765** linhas" | `sales` tem **954** linhas; `stage` é NULL em **954/954**. A conclusão está certa (100%), o denominador não |
| 2.2 | 09 | "front referencia 323/**432** tabelas" | 432 é `information_schema.tables`, que **inclui as 35 views**. Tabelas reais: **397** |
| 2.3 | 10 | "o schema `public` tem **398** tabelas" | **397** |
| 2.4 | 05 | Declara base de **38** funcionalidades, mas as linhas somam **39** | Inconsistência interna; um item de infraestrutura aparece entre parênteses no ✅ |

Nenhum desses altera um veredito. Todos alteram um número que alguém poderia citar.

---

## 3. Achados estruturais reverificados — **todos confirmados**

Reexecutei as medições que sustentam o documento executivo.

| Afirmação publicada | Método de reverificação | Resultado |
|---|---|---|
| 302 de 397 tabelas vazias (76,1%), 33.636 linhas | `count(*)` real de todas as 397 tabelas via `query_to_xml` | **Exato** |
| `sales.status = 'completed'` não existe | `group by status` | **Exato** — `won` 461, `lost` 103, `pending` 90, `cancelled` 86, `proposal` 86, `closed` 86, `lead` 42 |
| `deal_stage_history` vazia, dado real em `deal_stage_transitions` | `count(*)` | **Exato** — 0 e 1.254 |
| RLS em 397/397 tabelas, 1.019 policies | `pg_class.relrowsecurity`, `pg_policies` | **Exato** |
| 12 de 174 rotas visitadas, 75 pageviews, 2 pessoas | `page_analytics` | **Exato** (23/07 a 15/08) |
| Webhooks Win/Loss = 7.707 linhas | `wc -l` das 5 funções | **Exato** (5646+608+725+430+298) |
| `src/components/race` = 11.930 linhas | `wc -l` | **Exato** |
| 168 Edge Functions | `ls` excluindo `_shared` | **Exato** |
| 140 arquivos de teste | busca por 3 padrões | **Exato** (90 + 50) |
| ~44 de 60 testes Deno sem runner | cruzei `vitest.config.ts:9` (`include` só cobre `src/**`) com os alvos `deno test` dos workflows | **Confirmado dentro de ±1**: 60 arquivos, 13 cobertos por `_shared/`, 2 por alvo explícito |
| `nlq-query` e `ai-copilot` não compilam | parser + varredura do padrão no repo inteiro | **Exato**, e são **os 2 únicos** |
| Exposição anônima de `products`/`suppliers`/`teams` | `SET LOCAL ROLE anon` + `count(*)` | **Exato** (17/6/3) |

---

## 4. Lacuna do prompt-mestre que eu não havia cumprido

O prompt pede explicitamente, na seção de armadilhas:

> **Evidência fabricada em inventário anterior.** Amostre nomes de componentes/objetos citados
> como prova em documentos existentes e verifique se existem.

Eu havia conferido **um único documento** (`FUNCIONALIDADES_COMPLETAS.md`) e **apenas seus
contadores de resumo**. Os outros 47 documentos de `docs/` nunca foram checados. Executado agora.

### 🔴 ACHADO NOVO — evidência fabricada na documentação pré-existente

Extraí todos os caminhos de arquivo citados como prova nos 48 documentos de `docs/`
(excluindo `docs/estado/`) e cruzei com a árvore real:

**165 arquivos citados · 10 não existem (6,1%)**

E o agravante: **`git log --all` mostra que os 10 nunca existiram**. Não são arquivos removidos
depois — são citações de código que jamais foi escrito.

| Arquivo citado como prova | Documento que o cita | Histórico no git |
|---|---|---|
| `src/pages/admin/AdminTelemetriaPage.tsx` | `TELEMETRY_MODULE_DOCS.md` | **nunca existiu** |
| `tests/pages/AdminTelemetriaPage.test.tsx` | `TELEMETRY_MODULE_DOCS.md` | **nunca existiu** |
| `tests/components/TelemetryCharts.test.tsx` | `TELEMETRY_MODULE_DOCS.md` | **nunca existiu** |
| `tests/lib/telemetry-logic.test.ts` | `TELEMETRY_MODULE_DOCS.md` | **nunca existiu** |
| `tests/lib/external-db-bridge-telemetry.test.ts` | `TELEMETRY_MODULE_DOCS.md` | **nunca existiu** |
| `src/hooks/useAuditLogs.ts` | `AUDIT_REPORT.md`, `auditoria_enterprise_v5.md` | **nunca existiu** |
| `src/components/layout/SystemHealthBadge.tsx` | `AUDIT_REPORT.md` | **nunca existiu** |
| `src/services/activityService.ts` | `BACKEND_ANALYSIS_REPORT.md` | **nunca existiu** |
| `src/test/test-utils.tsx` | `DOCUMENTACAO_SISTEMA.md` | **nunca existiu** |
| `src/main.ts` | `RELATORIO_FALHAS.md` | **nunca existiu** (é o mesmo do `deno.json`) |

**Cinco dos dez estão em `TELEMETRY_MODULE_DOCS.md`** — um documento que descreve um módulo com
uma página administrativa e três suítes de teste que nunca foram escritas. Isso casa exatamente
com o padrão que o prompt-mestre previu: a evidência fabricada se concentra nas linhas de
*feature*, e os documentos de auditoria anteriores (`AUDIT_REPORT.md`,
`auditoria_enterprise_v5.md`, `BACKEND_ANALYSIS_REPORT.md`) também contêm citações vazias.

**Consequência prática:** os relatórios de auditoria anteriores deste repositório **não podem ser
usados como fonte** — nem para decidir, nem para alimentar outra auditoria. Já havia evidência
disso nos contadores errados em 3x; agora há prova de citação fabricada.

---

## 5. Contagem agregada — corrigida

Substitui a tabela publicada no `ESTADO_ATUAL.md`.

### Funcionalidades de domínio de negócio — **451** avaliadas

| Classificação | Publicado antes | **Correto** | % |
|---|---:|---:|---:|
| ✅ IMPLEMENTADO_TOTAL | 110 | **110** | 24,4% |
| 🟨 IMPLEMENTADO_PARCIAL | 258 | **260** | 57,6% |
| 🟦 SUGERIDO_OU_INICIADO | 46 | **44** | 9,8% |
| ⬛ MORTO_OU_ABANDONADO | 37 | **37** | 8,2% |
| **Total** | 450 | **451** | 100% |

Diferença: os 2 itens do erro 1.1 (lote 13) e o item do erro 2.4 (lote 05).

Rotas (174) e Edge Functions (168) permanecem inalterados: 97/48/9/20 e 54/81/9/24.

---

## 6. Lacunas que **permanecem** após esta verificação

Honestidade sobre o que ainda não sei:

1. **28 de 104 domínios de componentes sem citação em nível de arquivo.** Os maiores:
   `portfolio` (11 arq), `shared` (10), `navigation` (8), `closer` (8), `conversation-intelligence`
   (6), `icp` (5), `lead-routing` (6), `playbooks` (5), `skeletons` (5). Foram tratados em altitude
   ou caíram na costura entre lotes.
2. **`components.json` e `tailwind.config.ts` não foram auditados** por nenhum lote.
3. **As afirmações de "quem chama" das Edge Functions continuam sendo análise estática.** Sem
   logs de invocação, "24 sem chamador" significa "nenhum call site encontrado no repositório" —
   não posso descartar um agendador externo.
4. **Os órfãos de hook (49 de 857) não foram reverificados por mim.** O lote 09 declarou o
   critério e mediu a própria taxa de falso-positivo, o que é bom método, mas eu não reexecutei.
5. **Nenhuma suíte foi executada** — segue valendo. Exceto os 2 arquivos reprovados em parser,
   nada foi afirmado sobre compilação, lint ou testes.
6. **Não reverifiquei os documentos de detalhe linha a linha.** Reverifiquei as afirmações que
   sustentam o executivo e os achados graves. Uma célula isolada de tabela num lote de detalhe
   pode conter erro do mesmo tipo dos listados na seção 2.

---

## 7. O que muda para quem lê

Nada nos riscos. O ordenamento do documento executivo continua válido:

1. Ambiente não reconstruível a partir do repositório
2. Nenhum portão de qualidade executa
3. Dois arquivos não compilam
4. Automação de backend quase inexistente
5. Três crons falhando em silêncio
6. Dado fictício chegando à tela
7. Métricas zeradas por raiz de dado
8. Exposição anônima

Muda um número na tabela de contagem, e **acrescenta-se um nono risco**: a documentação
pré-existente contém evidência fabricada e não deve ser usada como base para decisão.

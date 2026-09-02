# Validação adversarial pós-auditoria e correções — 2026-09-02

Continuação da linha de auditoria em `docs/auditoria/` e `docs/execucao/`. Escopo: re-validar
achados de uma auditoria técnica de 20 dimensões contra o banco canônico ao vivo
(`usyxfpqlsspldubptrdl`, confirmado por conexão em `supabase/config.toml` e pelos últimos
`schema_migrations` aplicados em 31/08/2026), com 5 agentes especializados rodando em
paralelo. Nenhuma correção foi aplicada antes da validação adversarial confirmar o achado.

## Achados corrigidos nesta sessão (aplicados e verificados ao vivo)

1. **`REVOKE TRUNCATE ON ALL TABLES IN SCHEMA public FROM anon, authenticated`** — TRUNCATE
   não é filtrado por RLS; era concedido por padrão (comportamento default do Supabase na
   criação de tabela) em todas as 398 tabelas de `public`, não só nas de audit log. PostgREST
   nunca emite TRUNCATE via API REST, então não era explorável pela superfície pública hoje,
   mas violava o princípio de menor privilégio sem nenhum custo de correção. Simulado em
   transação com sentinela de rollback antes de aplicar. Verificado ao vivo: 0 grants
   remanescentes.
2. **`public.sync_battle_score()` corrigida de verdade em produção.** A migration
   `20260814190000_fix_broken_sales_triggers.sql` já continha a correção, mas nunca havia sido
   aplicada no banco canônico — a função ao vivo ainda escrevia em
   `battle_participants.updated_at` (coluna inexistente). Bug dormente: só falha quando existe
   `sales_battles` ativa com participante dentro da janela de tempo (não havia nenhuma no
   momento da checagem, por isso não foi detectado por monitoramento). Reaplicada a versão já
   revisada. Verificado ao vivo: função não referencia mais `updated_at`.
   Migration: `supabase/migrations/20260902120000_revoke_anon_truncate_and_fix_battle_score.sql`,
   registrada em `supabase_migrations.schema_migrations` (versão `20260902120000`).
3. **`TEST_QUALITY_REPORT.md` reescrito** com números reais medidos (eslint 0/0, tsc 0 erros,
   vitest 469 passando/2 skip, cobertura real restrita a 16 arquivos Tier-1 = ~0,76% de `src/`,
   82 arquivos de teste Deno cobrindo 28/171 diretórios de edge function). A versão anterior
   (19/05/2026) afirmava "10/10 Enterprise Perfection" e 97,6%/100% de cobertura sem nenhuma
   saída de ferramenta real por trás — confirmado com prova documental em `vitest.config.ts`.
4. **Validação de CPF/CNPJ** (`src/lib/validators/brDocuments.ts`, dígito verificador módulo 11)
   adicionada e conectada ao formulário de novo fornecedor (`src/pages/Fornecedores.tsx`) —
   antes o campo aceitava qualquer string sem checagem.
5. **`SECURITY.md`** — canal de contato de segurança preenchido (era placeholder).

## Achados confirmados, NÃO corrigidos nesta sessão (motivo explícito)

- **CORS em wildcard `Access-Control-Allow-Origin: *` em 100% das edge functions testadas ao
  vivo** (incluindo as que já usam `getCorsHeaders()`), porque a env var `ALLOWED_ORIGINS`
  nunca foi configurada em produção. Corrigir exige (a) definir a allowlist real de origens de
  produção e (b) migrar as ~155 functions restantes de `corsHeaders` estático para
  `getCorsHeaders()`. Não teria como confirmar a lista de origens legítimas sem risco de
  travar a própria aplicação — depende de decisão/confirmação humana.
- **Deploy de Edge Functions está estruturalmente bloqueado**: o CLI/Management API retorna
  HTTP 403 para listar ou implantar functions neste projeto (confirmado de forma independente
  por esta sessão e pela sessão de hardening de 31/08). Qualquer mudança de código em
  `supabase/functions/*/index.ts` (circuit breaker em Twilio/ElevenLabs/Bitrix24, migração de
  CORS) fica pronta no PR mas não tem efeito em produção até alguém com privilégio de
  Management API publicar.
- **`20260831130003_fix_campaign_health_cron.sql`** permanece deliberadamente não aplicada
  (decisão da sessão de 31/08, reconfirmada aqui): depende do deploy prévio da Edge Function
  `campaign-health-alert` compatível com `X-Cron-Secret`, que está bloqueado pelo mesmo motivo
  acima.
- **Consolidação dos ~31 triggers ativos de `public.sales`** (sobreposição funcional real
  entre notificação de vitória, recomputo de LTV e sincronização de apostas) — mudança de
  comportamento com risco real de regressão em gamificação; não deve ser feita sem plano de
  teste dedicado.
- **Validação de transição de stage do pipeline** (`PipelineBoard.tsx` permite qualquer
  transição, sem proteção equivalente no banco) — decisão de modelagem de negócio (quais
  transições são válidas), não só técnica.
- **Reimplementação real do WebAuthn** — escopo grande (verificação criptográfica completa de
  assinatura/challenge/origin/RP ID/counter), fora do que cabe como correção pontual.

## Achados da auditoria original CORRIGIDOS/REFINADOS pela validação adversarial

A validação ao vivo por 5 agentes encontrou que vários números da auditoria original estavam
imprecisos (nem sempre na direção "mais grave"):

| Achado original                                             | Realidade confirmada ao vivo                                                                                                                             |
| ----------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| "4 tabelas sem RLS"                                         | Falso — as 4 têm RLS + policies reais em produção; o problema real é que essas policies não existem em nenhum arquivo do repo git (drift, não exposição) |
| "RLS com gaps pontuais"                                     | 398/398 tabelas com RLS, sem exceção                                                                                                                     |
| "CORS wildcard em ~154/170"                                 | Pior: 100% das functions testadas retornam wildcard ao vivo, porque `ALLOWED_ORIGINS` nunca foi setada                                                   |
| "SECURITY DEFINER 383 vs INVOKER 7"                         | Números inflados por recriações repetidas nas migrations; contagem real ao vivo é 227 DEFINER / 65 INVOKER                                               |
| "44 triggers em `sales`"                                    | 34 triggers reais hoje, sendo 3 já desabilitados (não removidos)                                                                                         |
| "107 FKs sem ON DELETE (~23%)"                              | 78 FKs reais sem `ON DELETE` explícito (18,9%)                                                                                                           |
| "Zod em só 1 de 172 edge functions (receive-quote-webhook)" | Refutado — usado em pelo menos 4 functions (`winloss-webhook-*`), não em `receive-quote-webhook`                                                         |
| "10 de 172 edge functions com teste (~6%)"                  | Refutado — 82 arquivos de teste cobrindo 28/171 diretórios (~16%)                                                                                        |
| "Só 1 exceção de tabela sem ON DELETE" etc.                 | ver linhas acima                                                                                                                                         |

Achado **novo**, não previsto na auditoria original: `anon`/`authenticated` tinham TRUNCATE
grantado em todas as tabelas de `public` (corrigido nesta sessão, item 1 acima).

## Metodologia

Cada correção seguiu: simulação em transação com sentinela de erro forçando rollback →
confirmação de pós-condições dentro da própria transação → aplicação real → verificação
independente via query somente-leitura após commit. Nenhuma tabela, coluna, índice, bucket ou
registro foi removido. Nenhuma alteração de CORS, deploy de Edge Function ou mudança de
comportamento de negócio (transição de stage, triggers de gamificação) foi feita sem decisão
explícita, seguindo a mesma régua de preservação estabelecida em
`docs/execucao/HARDENING_CANONICO_2026-08-31.md`.

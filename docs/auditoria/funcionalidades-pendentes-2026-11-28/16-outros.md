# Outros

[Voltar ao índice](README.md)

26 itens não implementados, parciais ou não verificáveis neste domínio.

## Não implementado (19)

### F2316 · Auditoria dos 28 domínios de componentes sem citação

- **Tipo:** Doc/config
- **O que os docs afirmam:** NÃO INICIADO (portfolio, shared, navigation, closer, conversation-intelligence, icp, lead-routing, playbooks, skeletons).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:295`
- **O que falta:** Produzir o lote complementar de auditoria dos 28 domínios de componentes citados em docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:295.
- **Evidência:** ausente: `find docs -iname '*cobertura*dominio*' -o -iname '*28-dominios*'` → 0 resultados correspondentes. O único arquivo próximo, docs/estado/15_PLANO_COBERTURA_MODULOS.md, trata do ratchet de cobertura de testes (scripts/check-coverage-ratchet.mjs), não da auditoria dos 28 domínios de componentes citados (portfolio, shared, navigation, closer, conversation-intelligence, icp, lead-routing, playbooks, skeletons). Esses diretórios existem com componentes reais (confirmado via `ls src/components/<dir>`), mas nenhum lote de auditoria dedicado os cobre.
- **Revisão:** sem contestação cética concluída.

### F2319 · Contagem de falsos 🟨 (/auth, /reset-password) ajustada

- **Tipo:** Doc/config
- **O que os docs afirmam:** DIVERGENTE (doc).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:70`
- **O que falta:** Subtrair os 2 falsos positivos da contagem de 🟨 (e recalcular o total de 174) ou reclassificar /auth e /reset-password para ✅ na tabela de 01_FRONTEND_ROTAS.md.
- **Evidência:** docs/estado/01_FRONTEND_ROTAS.md:36 documenta narrativamente 'São 2 falsos 🟨 conhecidos' (/auth, /reset-password), mas a tabela de contagem em 01_FRONTEND_ROTAS.md:306-312 ainda soma 48 🟨 (inclui essas 2 rotas no grupo 'somente leitura') sem subtrair os falsos positivos do total.
- **Revisão:** sem contestação cética concluída.

### F2320 · Contagens corrigidas (451/260/44) propagadas a README

- **Tipo:** Doc/config
- **O que os docs afirmam:** DIVERGENTE (doc).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:294`
- **O que falta:** Propagar as contagens corrigidas (451/260/44) para a tabela de docs/estado/README.md:11-23.
- **Evidência:** As contagens corrigidas (451 funcionalidades/260 parciais/44 mortas) já existem em docs/estado/14_VERIFICACAO_DA_AUDITORIA.md:160-168 e docs/estado/ESTADO_ATUAL.md:38-43, mas docs/estado/README.md:11-23 ainda lista apenas as contagens antigas por domínio (ex.: 60, 50, 106, 38, 42, 86, 52, 16; 174 rotas; 168 EF), sem o total consolidado 451/260/44.
- **Revisão:** sem contestação cética concluída.

### F2321 · Contagens de rotas/EF no README de docs/estado

- **Tipo:** Doc/config
- **O que os docs afirmam:** DIVERGENTE: AppRoutes.tsx 175 path=; 174 entradas em supabase/functions.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:46`
- **O que falta:** Recontar as unidades do README (180 rotas, 173 EF) ou marcar explicitamente a tabela como snapshot de 2026-08-16, não contagem atual.
- **Evidência:** docs/estado/README.md:11,20 cita '174 rotas' e '168' edge functions. Real hoje: `grep -c 'path=' src/routes/AppRoutes.tsx` = 180; `ls supabase/functions| wc -l` = 173. Nenhuma marca de 'snapshot' datado na tabela do README.
- **Revisão:** sem contestação cética concluída.

### F2324 · Contatos "Lead Dev" preenchidos no RUNBOOK

- **Tipo:** Doc/config
- **O que os docs afirmam:** NÃO INICIADO: placeholder.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:354`
- **O que falta:** Preencher o contato real do Lead Dev em docs/RUNBOOK.md:175.
- **Evidência:** docs/RUNBOOK.md:175 ainda tem '\| Lead Dev| Configurar no README \|' — placeholder não preenchido.
- **Revisão:** sem contestação cética concluída.

### F2327 · Docs com evidência fabricada arquivados/carimbados

- **Tipo:** Doc/config
- **O que os docs afirmam:** NÃO INICIADO: TELEMETRY_MODULE_DOCS, reports/AUDIT_REPORT, auditoria_enterprise_v5, reports/BACKEND_ANALYSIS_REPORT, DOCUMENTACAO_SISTEMA, auditoria/RELATORIO_FALHAS seguem sem aviso; 6 caminhos citados inexistentes.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:292`
- **O que falta:** Mover para docs/_obsoleto ou carimbar cabeçalho de 'obsoleto/histórico' em docs/reports/AUDIT_REPORT.md, docs/auditoria_enterprise_v5.md, docs/reports/BACKEND_ANALYSIS_REPORT.md e docs/auditoria/RELATORIO_FALHAS.md.
- **Evidência:** docs/_obsoleto não existe. Dos 6 docs citados: docs/TELEMETRY_MODULE_DOCS.md e docs/DOCUMENTACAO_SISTEMA.md ganharam nota 'Revisado contra o HEAD em 2026-10-18' (mas sem carimbo de 'obsoleto'); docs/reports/AUDIT_REPORT.md, docs/auditoria_enterprise_v5.md, docs/reports/BACKEND_ANALYSIS_REPORT.md e docs/auditoria/RELATORIO_FALHAS.md não têm nenhuma menção a 'obsoleto'/aviso (ausente: `grep -ni obsolet` nesses 4 arquivos → 0 resultados). docs/reports/AUDIT_REPORT.md ainda abre com o título '... 10/10' sem ressalva.
- **Revisão:** sem contestação cética concluída.

### F2329 · Etapa 100 do plano: Certificar ou rejeitar prontidão

- **Tipo:** Doc/config
- **O que os docs afirmam:** Só declarar pronto quando P0/P1 estiverem fechados, CI verde, reconciliação aprovada, restore testado e tráfego real saudável. Saída esperada: ata go/no-go e backlog residual. Gate: proprietário, engenharia e operação.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:783-783`
- **O que falta:** Produzir e publicar a ata go/no-go e o backlog residual da etapa 100 (requer P0/P1 fechados, CI verde, reconciliação, restore testado — decisão de negócio do dono).
- **Evidência:** docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:265 e docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:99 marcam a Etapa 100 como '🔒'/'NI' (não iniciado), saída 'ausente'. ausente: `find docs -iname '*go-no-go*' -o -iname '*ata*certific*'` → nenhum arquivo de ata go/no-go encontrado.
- **Revisão:** sem contestação cética concluída.

### F2330 · Etapa 97 do plano: Submeter lote de remoção ao proprietário

- **Tipo:** Doc/config
- **O que os docs afirmam:** Mostrar evidência, impacto, rollback e backup de cada item. Saída esperada: aprovação/rejeição explícita nominal. Gate: obrigatório.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:780-780`
- **O que falta:** Submeter o lote de remoção ao proprietário (evidência, impacto, rollback, backup por item) e registrar aprovação/rejeição explícita nominal.
- **Evidência:** docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:262 marca '🔶 Aguarda lote'; docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:96 marca a Etapa 97 como 'NI', saída 'ausente'.
- **Revisão:** sem contestação cética concluída.

### F2332 · Inconsistência de contagem Race (38 vs 39) corrigida

- **Tipo:** Doc/config
- **O que os docs afirmam:** DIVERGENTE (doc).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:166`
- **O que falta:** Corrigir a base de 38 para 39 (ou ajustar as linhas que somam além de 38) em docs/estado/05_DOMINIO_GAMIFICACAO_RACE.md:274-281.
- **Evidência:** docs/estado/ESTADO_ATUAL.md:80-81 confirma explicitamente: 'O lote 05 declara base 38 mas suas linhas somam 39 ... Inconsistência registrada, não corrigida em silêncio.' docs/estado/05_DOMINIO_GAMIFICACAO_RACE.md:274-281 ainda usa base 38 em todas as linhas da tabela de contagem.
- **Revisão:** sem contestação cética concluída.

### F2333 · Numeração duplicada ADR-010 (service-layer e webauthn-simplewebauthn)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Existem dois arquivos ADR-010 (docs/decisions/ADR-010-service-layer.md e ADR-010-webauthn-simplewebauthn.md), ambos datados 2026-10-01.
- **Fontes:** `docs/decisions/ADR-010-webauthn-simplewebauthn.md:1-1`
- **O que falta:** Renumerar um dos dois ADRs para ADR-011 (próximo número livre) e atualizar as referências em docs/ARCHITECTURE.md:52,134.
- **Evidência:** docs/decisions/ADR-010-service-layer.md e docs/decisions/ADR-010-webauthn-simplewebauthn.md continuam ambos numerados ADR-010 (confirmado via `ls docs/decisions/`), ambos datados 2026-10-01. docs/ARCHITECTURE.md:52,134 continua referenciando 'ADR-010' de forma ambígua (sem indicar qual dos dois).
- **Revisão:** sem contestação cética concluída.

### F2335 · Próximo passo: decidir destino do código dormente (Race Arena, webhooks Win/Loss, 24 EFs órfãs, 16 integrações)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Ativar, arquivar ou manter.
- **Fontes:** `docs/estado/ESTADO_ATUAL.md:319-323`
- **O que falta:** Decidir e aplicar (ativar deployando/agendando, ou arquivar removendo do bundle e do cron) para Race Arena, webhooks Win/Loss, EFs órfãs e integrações não configuradas; hoje nada foi decidido nem aplicado.
- **Evidência:** src/components/race/ (102 arquivos) continua montado em produção via src/routes/AppRoutes.tsx (import RaceTransitionWrapper em AppRoutes.tsx:9; rotas /race-arena/*, /race-arena/closer, /sdr, /garage, /career, /admin/race-arena). As 5 functions `winloss-webhook-*` existem no repo mas nenhuma está na allowlist ACTIVE de .github/workflows/deploy.yml:144 (só `detect-winloss-at-risk` e `export-winloss-pdf` aparecem). Nenhum ADR documenta a decisão (ver F2325).
- **Revisão:** sem contestação cética concluída.

### F2336 · README de docs/estado carimbado como histórico

- **Tipo:** Doc/config
- **O que os docs afirmam:** DIVERGENTE: ESTADO_ATUAL cita banco rapjswienfhkobhlamxb; repo tem 644 migrations (doc 584) e 174 dirs de functions (doc 168).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:45`
- **O que falta:** Adicionar ao topo de docs/estado/README.md um carimbo explícito marcando a medição de 2026-08-16 como superada, com ponteiro para as remediações pós-2026-08-30, e corrigir a referência ao banco em ESTADO_ATUAL.md:3.
- **Evidência:** docs/estado/README.md:1-3 e docs/estado/ESTADO_ATUAL.md:3 continuam datados '2026-08-16' sem carimbo de 'superado'/'histórico'. ESTADO_ATUAL.md:3 ainda cita o banco `rapjswienfhkobhlamxb` (deveria ser `usyxfpqlsspldubptrdl`, AGENTS.md §7). Contagens seguem defasadas (ver F2320/F2321).
- **Revisão:** sem contestação cética concluída.

### F2337 · Reclassificação das 9 rotas 🟦 (falso positivo em 7)

- **Tipo:** Doc/config
- **O que os docs afirmam:** DIVERGENTE: heurística não segue re-export; real 🟦 só /onboarding-tracking; /docs estática.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:69`
- **O que falta:** Reclassificar na tabela as 7 rotas que são falsos 🟦 (todas exceto /onboarding-tracking e /docs) em docs/estado/01_FRONTEND_ROTAS.md:53-186, não apenas citar a ressalva em texto.
- **Evidência:** docs/estado/01_FRONTEND_ROTAS.md:53-186 ainda classifica as 9 rotas (/docs, /calendario, /playbooks, /inteligencia-compras, /inteligencia, /race-arena/closer, /race-arena/sdr, /onboarding-tracking, /busca-inteligente) como 🟦 na tabela principal, sem reclassificação; só há uma nota de ressalva na linha 331 ('os 🟦 são o grupo menos confiável... 6 dos 9 são wrappers finos'), sem mudar o símbolo de nenhuma delas.
- **Revisão:** sem contestação cética concluída.

### F2338 · Relatórios históricos que declaram 10/10, 97,6% ou produção

- **Tipo:** Doc/config
- **O que os docs afirmam:** Documentos históricos de prontidão (10/10, 97,6%, production) contradizem o estado atual; proposta: mover para docs/history com cabeçalho "histórico".
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:617-617`
- **O que falta:** Mover os relatórios históricos de prontidão (10/10, 97,6%, produção) para docs/history/ com cabeçalho 'histórico', conforme proposto em docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:617.
- **Evidência:** Nenhum diretório docs/history/ ou docs/_obsoleto existe (ausente: `find docs -type d -iname history -o -iname _obsoleto` → 0 resultados). docs/reports/AUDIT_REPORT.md segue com o título '... Inventário e Análise Técnica 10/10' sem nenhum cabeçalho de aviso histórico; docs/FUNCIONALIDADES_SISTEMA.md e docs/ENGINEERING_MANIFESTO.md ainda citam '10/10'/'97,6%' sem mover para pasta histórica (embora FUNCIONALIDADES_SISTEMA.md tenha nota de revisão 2026-10-18 rebaixando o claim — ver F2317).
- **Revisão:** sem contestação cética concluída.

### F2339 · TEMPLATE-regras-de-negocio.md ainda não preenchido como regras.md

- **Tipo:** Doc/config
- **O que os docs afirmam:** Template pede cópia para regras.md (atores, estados, cálculos, prazos, integrações, exceções).
- **Fontes:** `docs/contexto/regras/manual/TEMPLATE-regras-de-negocio.md:1-27`
- **O que falta:** Criar docs/contexto/regras/manual/regras.md a partir do TEMPLATE e preencher atores, estados, cálculos, prazos, integrações e exceções. Opcional: aproveitar o conteúdo de analise-prs/regras-de-negocio.md como base.
- **Evidência:** docs/contexto/regras/manual/ contém apenas README.md e TEMPLATE-regras-de-negocio.md (ls confirmado); TEMPLATE-regras-de-negocio.md:3 pede 'Copie este arquivo para regras.md ... e preencha'; nenhum regras.md ou outro .md preenchido existe (find docs/contexto/regras -maxdepth 2 -type f → só README.md e TEMPLATE-regras-de-negocio.md).| cético: ls docs/contexto/regras/manual/ → só README.md (299 B) e TEMPLATE-regras-de-negocio.md (1085 B), em main e no snapshot da branch contexto (scratchpad/contexto/docs/contexto/regras/manual/). README.md diz que arquivos desta pasta entram na seção A de 07-REGRAS-DE-NEGOCIO.md. Existe analise-prs/regras-de-negocio.md:1-3 ('Extraido de: migrations, edge functions...'), mas ele foi extraído automaticamente e está fora da pasta manual/, então não atende ao critério (arquivo preenchido em docs/contexto/regras/manual/).

### F2341 · Vertical Financial Services (KYC, AML)

- **Tipo:** Outro
- **O que os docs afirmam:** Gap vertical: KYC/AML.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:204`
- **O que falta:** Tudo: o fluxo KYC/AML no cadastro, as tabelas com RLS, a UI e as checagens de listas restritivas. Fica fora do domínio atual (CRM de brindes).
- **Evidência:** docs/GAPS_CLASSE_MUNDIAL.md:204 lista 'Financial Services (KYC, AML)' na seção '18. Vertical-Specific' (lista de gaps/wishlist, não funcionalidade existente); grep -rliE 'kyc\|\baml\b\|anti.money' src/ supabase/ → 0 resultados.| cético: docs/GAPS_CLASSE_MUNDIAL.md:204 ('Financial Services (KYC, AML)') está na seção 18 'Vertical-Specific', que é uma lista de desejos. Ausente: grep -rliE 'kyc\|\baml\b' src supabase → 0 resultados; grep -iE 'kyc\|aml' supabase/tables.md do snapshot → 0 resultados.

### F2342 · Vertical Healthcare (HIPAA)

- **Tipo:** Outro
- **O que os docs afirmam:** Gap vertical: HIPAA.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:203`
- **O que falta:** Tudo: controles e documentação HIPAA. O domínio atual não tem dado de saúde.
- **Evidência:** docs/GAPS_CLASSE_MUNDIAL.md:203 lista 'Healthcare (HIPAA compliance)' na mesma lista de gaps/wishlist; grep -rliE 'hipaa' src/ supabase/ → 0 resultados.| cético: docs/GAPS_CLASSE_MUNDIAL.md:203 ('Healthcare (HIPAA compliance)'). Ausente: grep -rliE 'hipaa' src supabase → 0 resultados; tables.md do snapshot → 0 resultados.

### F2343 · Vertical Manufacturing (BOM, configuration)

- **Tipo:** Outro
- **O que os docs afirmam:** Gap vertical: BOM/configuração.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:202`
- **O que falta:** Tudo: a entidade BOM e o configurador de produto (tabela com RLS, UI, hooks).
- **Evidência:** docs/GAPS_CLASSE_MUNDIAL.md:202 lista 'Manufacturing (BOM, configuration)' na mesma lista de gaps/wishlist; grep -rliE 'bill.of.materials\|\bbom\b.*config\|product.?configurator' src/ supabase/ → 0 resultados.| cético: docs/GAPS_CLASSE_MUNDIAL.md:202 ('Manufacturing (BOM, configuration)'). Ausente: grep -rliE 'bill.of.materials' src supabase → 0 resultados; grep -iE 'bom' supabase/tables.md do snapshot → 0 resultados.

### F2344 · Vertical Real Estate (listings, showings)

- **Tipo:** Outro
- **O que os docs afirmam:** Gap vertical: imóveis.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:205`
- **O que falta:** Tudo: as entidades de listagem de imóveis e de visitas, com UI e backend. Fica fora do domínio atual.
- **Evidência:** docs/GAPS_CLASSE_MUNDIAL.md:205 lista 'Real Estate (listings, showings)' na mesma lista de gaps/wishlist; grep -rliE '\blisting\b\|\bshowing\b\|real.estate\|imovel\|imóvel' src/ supabase/ → único hit é src/hooks/useGlobalKeyboardShortcuts.ts:172 ('Hook for showing keyboard shortcut hints'), sem relação com imóveis.| cético: docs/GAPS_CLASSE_MUNDIAL.md:205 ('Real Estate (listings, showings)'). Ausente: grep -rliE 'real.estate\|imóve\|imove' src supabase → 0 resultados; grep -iE 'listing\|imove' supabase/tables.md do snapshot → 0 resultados.

## Parcial (6)

### F2314 · ARCHITECTURE: contagens (644 migrations, 172 functions)

- **Tipo:** Doc/config
- **O que os docs afirmam:** DIVERGENTE: diz 612/~170.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:434`
- **O que falta:** Atualizar a contagem de migrations em docs/ARCHITECTURE.md:13,36 de 656 para 700 (ou carimbar o número como snapshot datado em vez de valor absoluto).
- **Evidência:** docs/ARCHITECTURE.md:13,35-36,96 diz '173 Edge Functions... 656 migrations (2026-10-18)'. Real hoje: `ls supabase/migrations| grep -c '\.sql$'` = 700; `ls supabase/functions \| wc -l` = 173 (confirmado 20/11/2026). O número de EF bate (173=173); o de migrations está defasado (656 vs 700).
- **Revisão:** sem contestação cética concluída.

### F2318 · Comparativo: Conversation Intelligence, Email Sync, Marketplace, Mobile nativo e Data Enrichment ausentes

- **Tipo:** Doc/config
- **O que os docs afirmam:** Tabela marca essas 5 capacidades como ❌ ausentes.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:254-261`
- **O que falta:** Corrigir a linha 'Conversation Intelligence' da tabela em docs/GAPS_CLASSE_MUNDIAL.md:254 (existe e usa dado real, não é ❌); as demais 4 linhas da tabela continuam corretas.
- **Evidência:** docs/GAPS_CLASSE_MUNDIAL.md:254-261 marca 'Conversation Intelligence ❌', mas src/components/conversation-intelligence/ConversationHub.tsx é montado em src/components/revenue-intelligence/RevenueIntelligenceHub.tsx:80-82,212 e consome dado real via src/hooks/conversation-intelligence/useConversationInsights.ts (usa useConversationAnalyses, sem Math.random/mock). 'Data Enrichment ❌' é majoritariamente correto: supabase/functions/enrich-lead/index.ts:33-48 retorna 503 'enrichment_provider_not_configured' deliberadamente (comentário no código: versão anterior inventava dados). Email/Calendar Sync, Marketplace e Mobile App Nativo seguem de fato ausentes (ausente: `grep -rliE 'gmail\|imap\|google.?calendar\|outlook\|marketplace\|capacitor\|react-native' src/ supabase/functions package.json` → nenhum resultado real).
- **Revisão:** sem contestação cética concluída.

### F2322 · Contagens dos docs (88 páginas, 35 functions, 150+ tabelas) vs real

- **Tipo:** Doc/config
- **O que os docs afirmam:** Real: 175 path= em AppRoutes.tsx, 172 functions, 397 tabelas. Docs DIVERGENTES.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:40`
- **O que falta:** Regenerar as contagens de docs/GAPS_CLASSE_MUNDIAL.md:282 para bater com AppRoutes.tsx/supabase/functions/banco, como já foi feito em FUNCIONALIDADES_COMPLETAS.md.
- **Evidência:** docs/FUNCIONALIDADES_COMPLETAS.md:12-16 já foi regenerado com contagens próximas do real (175 rotas, 173 EF, ~414 tabelas; real hoje: 180 `path=`, 173 dirs de functions, tables.md do snapshot do banco tem 414 linhas). Mas docs/GAPS_CLASSE_MUNDIAL.md:282 ainda cita '88 páginas, 35 Edge Functions, 182 hooks' — não regenerado.
- **Revisão:** sem contestação cética concluída.

### F2323 · Contato de segurança ([e-mail omitido]) e telefone de emergência

- **Tipo:** Doc/config
- **O que os docs afirmam:** Canal de reporte de incidentes: e-mail [e-mail omitido] e telefone +1 (555) 123-4567 (placeholder evidente).
- **Fontes:** `docs/SECURITY.md:124-127`
- **O que falta:** Remover ou atualizar o contato e o telefone fictício em docs/SECURITY.md:126-127 (a política publicada no GitHub, na raiz, já está correta).
- **Evidência:** SECURITY.md na raiz (o que o GitHub publica por padrão, sem .github/SECURITY.md) tem contato real: '[e-mail omitido]' (SECURITY.md:120), sem telefone fictício. Mas docs/SECURITY.md:126-127 (duplicata interna) ainda tem '[e-mail omitido]' e '+1 (555) 123-4567' (placeholder evidente).
- **Revisão:** sem contestação cética concluída.

### F2325 · Decisão documentada sobre Race, webhooks Win/Loss, 24 EF órfãs e 16 integrações

- **Tipo:** Doc/config
- **O que os docs afirmam:** PARCIAL: winloss-webhook-health-monitor agendado; Race recebeu correções; sem decisão documentada de arquivar.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:39`
- **O que falta:** Registrar ADR/decisão formal sobre Race Arena, webhooks Win/Loss, 24 EFs órfãs e 16 integrações; e corrigir a allowlist do deploy.yml para incluir `winloss-webhook-health-monitor` (hoje o cron chama uma function não deployada).
- **Evidência:** O cron `winloss-webhook-health-monitor-15min` está ativo (cron.md:32, a cada 15min, chama `trigger_internal_edge_job('winloss-webhook-health-monitor')`), mas a função `winloss-webhook-health-monitor` NÃO está na allowlist ACTIVE de .github/workflows/deploy.yml:144 (só `detect-winloss-at-risk` e `export-winloss-pdf` aparecem; nenhuma das 5 `winloss-webhook-*` está lá) — ou seja, o cron chama uma function não deployada em produção. Nenhum ADR em docs/decisions/ (11 arquivos, nenhum sobre Race/webhooks Win-Loss/EFs órfãs/integrações) documenta decisão formal.
- **Revisão:** sem contestação cética concluída.

### F2331 · FEATURE_SUMMARY desatualizado (feature flags, A/B, WhatsApp, E2E, strict)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Diz que não existem feature flags/A-B/WhatsApp/E2E, mas existem useFeatureFlags, cadence_ab_tests, send-multichannel-message, tests/e2e; diz strict 100% mas há 882 erros. DIVERGENTE.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:183`
- **O que falta:** Corrigir as linhas de Feature Flags e A/B Testing em docs/FEATURE_SUMMARY.md:88-89 — ambos existem e estão em uso real.
- **Evidência:** docs/FEATURE_SUMMARY.md:90-94 já corrige WhatsApp ('⚠️ implementada via send-multichannel-message'), E2E ('✅ suite Playwright existe... 2026-10-18') e strict mode ('882 erros congelados'). Mas FEATURE_SUMMARY.md:88-89 ainda diz '❌ Feature flags — No runtime feature flag system' e '❌ A/B testing — No framework in place', enquanto src/hooks/useFeatureFlags.ts existe e é usado em src/components/templates/MainLayout.tsx e src/pages/FeatureFlagsAdmin.tsx, e a tabela `cadence_ab_tests` (tables.md:44) tem hook real src/hooks/cadences/useABTests.ts.
- **Revisão:** sem contestação cética concluída.

## Não verificável (1)

### F2334 · pixels-with-personality-09.lovable.app responde HTML sem ref supabase

- **Tipo:** Doc/config
- **O que os docs afirmam:** Frontend publicado sem Supabase compilado.
- **Fontes:** `docs/estado/IDENTIDADE_BANCO_2026-09-13.md:76`
- **O que falta:** Acesso de rede ao host externo pixels-with-personality-09.lovable.app (não permitido nesta sessão) para confirmar se o bundle publicado referencia Supabase.
- **Evidência:** Tentativa de WebFetch a https://pixels-with-personality-09.lovable.app falhou: 'getaddrinfo ENOTFOUND pixels-with-personality-09.lovable.app' — host fora da allowlist de rede desta sessão (ambiente cloud).
- **Revisão:** sem contestação cética concluída.

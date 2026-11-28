# Vendas, cotações e pedidos

[Voltar ao índice](README.md)

90 itens não implementados, parciais ou não verificáveis neste domínio.

## Não implementado (49)

### F2969 · ClientPurchaseHistory: botão "Ver Nota Fiscal"

- **Tipo:** Ação/botão
- **O que os docs afirmam:** Doc: botão sem ação.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/D_frontend.md:79-79`
- **O que falta:** Adicionar onClick que abra/baixe a NF real do pedido.
- **Evidência:** src/components/purchase-intelligence/ClientPurchaseHistory.tsx:513-515: botão 'Ver Nota Fiscal' sem onClick, diferente do botão 'Fechar' ao lado que tem handler.
- **Revisão:** sem contestação cética concluída.

### F2973 · DuplicateBlockAudit: botões "Filtros" e "Exportar"

- **Tipo:** Ação/botão
- **O que os docs afirmam:** Doc: botões sem ação.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/D_frontend.md:80-80`
- **O que falta:** Implementar filtro e exportação reais.
- **Evidência:** src/components/purchase-intelligence/DuplicateBlockAudit.tsx:44-57: botões 'Filtros' e 'Exportar' sem onClick; Input de busca (38-41) sem onChange.
- **Revisão:** sem contestação cética concluída.

### F2974 · EmptyStateGuide: "Começar Configuração" e "Ver Documentação"

- **Tipo:** Ação/botão
- **O que os docs afirmam:** Doc: botões sem ação.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/D_frontend.md:81-81`
- **O que falta:** Adicionar navegação real (useNavigate/Link) para configuração e documentação.
- **Evidência:** src/components/purchase-intelligence/EmptyStateGuide.tsx:69-78: botões 'Começar Configuração' e 'Ver Documentação' sem onClick nem navegação.
- **Revisão:** sem contestação cética concluída.

### F2977 · Pricing: "Exportar Auditoria" (PricingHealthBanner)

- **Tipo:** Ação/botão
- **O que os docs afirmam:** Doc: botão sem ação.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/D_frontend.md:84-84`
- **O que falta:** Implementar geração/download real do arquivo de auditoria.
- **Evidência:** src/components/pricing/PricingHealthBanner.tsx:68-70: botão 'EXPORTAR AUDITORIA' sem onClick.
- **Revisão:** sem contestação cética concluída.

### F2978 · Pricing: "Exportar Sugestões" (ProductRecommenderCard)

- **Tipo:** Ação/botão
- **O que os docs afirmam:** Doc: botão sem ação.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/D_frontend.md:84-84`
- **O que falta:** Implementar exportação real.
- **Evidência:** src/components/pricing/ProductRecommenderCard.tsx:99-104: botão 'Exportar Sugestões de Tabela de Preço' sem onClick.
- **Revisão:** sem contestação cética concluída.

### F2979 · Pricing: "Ver Ranking" (TopDiscountersCard)

- **Tipo:** Ação/botão
- **O que os docs afirmam:** Doc: botão sem ação.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/D_frontend.md:84-84`
- **O que falta:** Adicionar navegação real para tela/rota com ranking completo.
- **Evidência:** src/components/pricing/TopDiscountersCard.tsx:101-106: botão 'Ver Ranking Completo de Erosão' sem onClick nem Link.
- **Revisão:** sem contestação cética concluída.

### F2980 · PurchasePredictionCard: botões "Agendar" e "Proposta"

- **Tipo:** Ação/botão
- **O que os docs afirmam:** Doc: botões sem ação.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/D_frontend.md:78-78`
- **O que falta:** Implementar criação real de agendamento e proposta persistidos no banco.
- **Evidência:** src/components/purchase-intelligence/PurchasePredictionCard.tsx:292-304: botões 'Agendar' e 'Proposta' sem onClick.
- **Revisão:** sem contestação cética concluída.

### F2984 · Co-selling com split de comissão

- **Tipo:** Componente
- **O que os docs afirmam:** Múltiplos donos de deal e split de comissão; ausente (co_selling, commission_split, deal_split = 0).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:26`
- **O que falta:** Toda a funcionalidade (schema, UI e cálculo de comissão com split) está ausente.
- **Evidência:** grep -rln por 'commission_split','deal_split','co_selling' em src/, supabase/ e nos snapshots de tabelas do banco retorna vazio; não existem essas tabelas/colunas no banco real.
- **Revisão:** sem contestação cética concluída.

### F2985 · CPQ avançado (regras de produto, bundling)

- **Tipo:** Componente
- **O que os docs afirmam:** Falta configure-price-quote avançado.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:104`
- **O que falta:** Modelar product_bundles e implementar regras de empacotamento aplicadas de fato; hoje é só rótulo de UI.
- **Evidência:** Não existe public.product_bundles no snapshot de tabelas (só quote_items/quotes/quotes_inbound). src/pages/Orcamentos.tsx usa 'CPQ'/'bundles' apenas como texto de título/descrição da tela (248-269), sem lógica de regra de produto ou bundling.
- **Revisão:** sem contestação cética concluída.

### F2986 · CPQ e regras de preço

- **Tipo:** Componente
- **O que os docs afirmam:** Não iniciado.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:171`
- **O que falta:** Implementar motor de regras de preço aplicado ao orçamento.
- **Evidência:** Mesma base de F2985: não há motor de regras de preço aplicado à cotação (grep por pricing_rule/price_rule em Orcamentos.tsx vazio); a própria fonte do item já classifica como 'Não iniciado', sem artefatos_esperados.
- **Revisão:** sem contestação cética concluída.

### F3914 · Expiração automática de cotações por SQL (check_quote_expirations) agendada

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** check_quote_expirations foi movida para private e nunca agendada; o edge check-quote-expiration também não está agendado. Cotações nunca expiram automaticamente.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:87,157,175,292`
- **O que falta:** nenhum job em pg_cron para "check_quote_expirations" (cron.md, 45 jobs)
- **Evidência:** nenhum job em pg_cron para "check_quote_expirations" (cron.md, 45 jobs)
- **Revisão:** sem contestação cética concluída.

### F2989 · Buckets privados comprovantes-financeiro, nfe-xml e nfe-certificados no destino

- **Tipo:** Doc/config
- **O que os docs afirmam:** Buckets existentes no destino: comprovantes-financeiro, nfe-xml e nfe-certificados, todos privados.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:510-510`
- **O que falta:** Criar os 3 buckets privados no projeto oficial; hoje não existem.
- **Evidência:** storage.md (snapshot 20/11/2026) lista só avatars, call-recordings, quote-pdfs, report-exports, report-snapshots, winloss-reports. Nenhum bucket comprovantes-financeiro/nfe-xml/nfe-certificados existe. O doc citado (AUDITORIA_EXAUSTIVA_2026-08-26...:510) descreve um 'destino' de migração, não o Supabase oficial usyxfpqlsspldubptrdl.
- **Revisão:** sem contestação cética concluída.

### F3919 · S-08 BOLA no envio de orçamento: validar ownership/tenant no servidor

- **Tipo:** Edge function
- **O que os docs afirmam:** Doc: fluxo de envio de orçamento não comprova ownership completo do recurso.
- **Fontes:** `docs/auditoria/SIMULACAO_CENARIOS_ONDA_0_2026-08-26.md:33`
- **O que falta:** pasta supabase/functions/send-quote/index.ts ausente
- **Evidência:** pasta supabase/functions/send-quote/index.ts ausente
- **Revisão:** sem contestação cética concluída.

### F3920 · atomic_quote_sync_rpc e remoção do trg_convert_quote_to_order

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** L184/L190 P: 20261001200000_atomic_quote_sync_rpc.sql; trigger legado mantido (:22); total do webhook sem reconciliação.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:265-266`
- **O que falta:** função "trg_convert_quote_to_order" ausente do banco real (functions.md)
- **Evidência:** função "trg_convert_quote_to_order" ausente do banco real (functions.md)
- **Revisão:** sem contestação cética concluída.

### F2995 · Co-selling com split de comissão

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Não iniciado.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:171`
- **O que falta:** Implementar atribuição de múltiplos co-vendedores por venda com % configurável.
- **Evidência:** ausente: grep -rln 'co_seller\|co-seller\|coSeller\|co_selling' src supabase → 0 resultados. Existe split SDR/Closer fixo (migration 20261013130000_comissao_regras_e_split_sdr.sql:17-90), mas é regra estrutural de papel, não co-selling configurável.
- **Revisão:** sem contestação cética concluída.

### F3921 · fn_log_price_change (log de preço)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Etapa 33 NI: não está em nenhuma migration.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:39`
- **O que falta:** função "fn_log_price_change" ausente do banco real (functions.md)
- **Evidência:** função "fn_log_price_change" ausente do banco real (functions.md)
- **Revisão:** sem contestação cética concluída.

### F3922 · Pricing rules engine (volume, tier, contrato)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Falta motor de regras de preço.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:105`
- **O que falta:** função "engine" ausente do banco real (functions.md)
- **Evidência:** função "engine" ausente do banco real (functions.md)
- **Revisão:** sem contestação cética concluída.

### F3924 · status_transitions_state_machine

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** L635 C: 20261001213000_status_transitions_state_machine.sql.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:316`
- **O que falta:** função "status_transitions" ausente do banco real (functions.md)
- **Evidência:** função "status_transitions" ausente do banco real (functions.md)
- **Revisão:** sem contestação cética concluída.

### F3925 · Editar preço de produto do fornecedor atualiza o painel de alertas de preço (#437)

- **Tipo:** Hook
- **O que os docs afirmam:** Falha de severidade baixa registrada pela validação adversarial, sem correção nesta rodada.
- **Fontes:** `docs/prod-readiness.md:1006`
- **O que falta:** hook useSupplier ausente (hooks.json e arquivos src/)
- **Evidência:** hook useSupplier ausente (hooks.json e arquivos src/)
- **Revisão:** sem contestação cética concluída.

### F3926 · Hook órfão useApprovalDecisions

- **Tipo:** Hook
- **O que os docs afirmam:** Exportado em `src/hooks/admin/useApprovalWorkflows.ts` com zero referência em src/, tests/ e scripts/, inclusive dentro do próprio arquivo (critério rg -w).
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:167`
- **O que falta:** hook useApprovalDecisions ausente (hooks.json e arquivos src/)
- **Evidência:** hook useApprovalDecisions ausente (hooks.json e arquivos src/)
- **Revisão:** sem contestação cética concluída.

### F3927 · Hook órfão useSalesGoals

- **Tipo:** Hook
- **O que os docs afirmam:** Exportado em `src/hooks/sales/useSalespeople.ts` com zero referência em src/, tests/ e scripts/, inclusive dentro do próprio arquivo (critério rg -w).
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:203`
- **O que falta:** hook useSalesGoals ausente (hooks.json e arquivos src/)
- **Evidência:** hook useSalesGoals ausente (hooks.json e arquivos src/)
- **Revisão:** sem contestação cética concluída.

### F3929 · Hook useConversionAnalysis.ts

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `useConversionAnalysis.ts` — análise de conversão.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:281`
- **O que falta:** hook useConversionAnalysis ausente (hooks.json e arquivos src/)
- **Evidência:** hook useConversionAnalysis ausente (hooks.json e arquivos src/)
- **Revisão:** sem contestação cética concluída.

### F3930 · Hook useSalesForecast.ts

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `useSalesForecast.ts` — previsão de vendas.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:281`
- **O que falta:** hook useSalesForecast ausente (hooks.json e arquivos src/)
- **Evidência:** hook useSalesForecast ausente (hooks.json e arquivos src/)
- **Revisão:** sem contestação cética concluída.

### F3931 · S-11 Assinatura digital: hook altera status sem provedor/arquivo/callback

- **Tipo:** Hook
- **O que os docs afirmam:** Doc: hook de assinatura digital marcava concluído sem integração real; impedir sucesso enganoso.
- **Fontes:** `docs/auditoria/SIMULACAO_CENARIOS_ONDA_0_2026-08-26.md:36`
- **O que falta:** hook useDigitalSignature ausente (hooks.json e arquivos src/)
- **Evidência:** hook useDigitalSignature ausente (hooks.json e arquivos src/)
- **Revisão:** sem contestação cética concluída.

### F2998 · Billing/Invoicing integration (Stripe, Recurly)

- **Tipo:** Integração externa
- **O que os docs afirmam:** Falta integração de faturamento.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:108`
- **O que falta:** Implementar integração de faturamento; nada existe hoje.
- **Evidência:** ausente: grep -rn 'stripe\\b' src supabase -i → só falso-positivo em RaceCar.tsx:38 (comentário sobre faixa visual); grep 'recurly' → 0 resultados.
- **Revisão:** sem contestação cética concluída.

### F2999 · CLM, faturamento, reconhecimento de receita, MRR/ARR

- **Tipo:** Integração externa
- **O que os docs afirmam:** Nenhuma integração de contratos/faturamento/assinatura (stripe, recurly, contract_lifecycle, subscription_).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:33`
- **O que falta:** Construir módulo de CLM/MRR/ARR; não existe nenhum artefato.
- **Evidência:** ausente: grep -rln 'contract_lifecycle\|subscription_plan\|subscription_billing' src supabase → único hit é winloss-webhook-dispatcher (subscription de webhook, falso positivo).
- **Revisão:** sem contestação cética concluída.

### F3008 · Multi-moeda com FX

- **Tipo:** Outro
- **O que os docs afirmam:** Multi-moeda com taxa de câmbio; só aparece em src/test/factories.ts.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:34`
- **O que falta:** Usar currency/exchange_rate em algum cálculo/exibição real.
- **Evidência:** quotes.exchange_rate existe no banco (migration 20260513180157...:18) mas grep -rln 'exchange_rate' src fora de test/factories.ts e types.ts gerado → 0 resultados; nenhuma lógica de negócio usa.
- **Revisão:** sem contestação cética concluída.

### F3011 · Auto-aprovação abaixo de limite

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Pedidos abaixo do threshold aprovam automaticamente.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:256-256`
- **O que falta:** Implementar trigger que compare valor ao limite e aprove automaticamente.
- **Evidência:** approval_workflows.auto_approve_below existe (schema.sql:835) mas ausente: nenhuma trigger/função SQL a lê/compara; useApprovalWorkflows.ts:15 só declara o tipo. Tabela com 0 linhas (stats.md:342).
- **Revisão:** sem contestação cética concluída.

### F3932 · /inteligencia-compras: PurchaseIntelligence.tsx wrapper de PurchaseIntelligenceHub

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Wrapper fino; probe não achou camada de dados em 2 níveis.
- **Fontes:** `docs/estado/01_FRONTEND_ROTAS.md:322-322`
- **O que falta:** rota /inteligencia-compras: não existe em src/routes/AppRoutes.tsx (rotas.json)
- **Evidência:** rota /inteligencia-compras: não existe em src/routes/AppRoutes.tsx (rotas.json)
- **Revisão:** sem contestação cética concluída.

### F3022 · Deal rooms (espaço compartilhado com cliente)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Falta deal room para cliente.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:143`
- **O que falta:** tudo: tabela, rota pública com token, UI; o próprio doc-fonte (docs/GAPS_CLASSE_MUNDIAL.md:143) já lista isso como gap conhecido.
- **Evidência:** grep -rn 'deal_room' src supabase (case-insensitive) → 0 resultados; nenhuma tabela deal_rooms no schema; nenhuma rota pública tokenizada em AppRoutes.tsx.
- **Revisão:** sem contestação cética concluída.

### F3933 · Order tracking corrigido e consultando dados reais

- **Tipo:** Rota/tela
- **O que os docs afirmam:** order tracking já foi corrigido e consulta dados reais.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:245-245`
- **O que falta:** rota /OrderTracking não existe em src/routes/AppRoutes.tsx (rotas.json)
- **Evidência:** rota /OrderTracking não existe em src/routes/AppRoutes.tsx (rotas.json)
- **Revisão:** sem contestação cética concluída.

### F3937 · Rota /closer (6 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** API.md declara a rota `/closer` renderizando o componente CloserDashboard com acesso "autenticado".| Doc declara a rota `/closer` servida pela página `CloserDashboard.tsx` (acesso: Todos). Dashboard Closer. \| Rota /closer é uma das 8 cobertas por tests/e2e/pages-critical-routes.spec.ts. \| Dashboard específico para Closer. \| Dashboard Closer com métricas de fechamento, pipeline em andamento, orçamentos pendentes e receita gerada. \| Rota /closer (AppRoutes.tsx:114) renderiza src/pages/CloserDashboard.tsx; sem role explícito (só autenticação global). Classificação do doc: IMPLEMENTADO_TOTAL. Evidência: menu (sidebarMenuData.ts) · sb=5 useQuery=5 mut=2 (árvore 24 arq.)
- **Fontes:** `docs/API.md:291-291`, `docs/DOCUMENTACAO_SISTEMA.md:587-590`, `docs/prod-readiness.md:137`, `docs/testes/suites-ci.md:102-104`, `docs/FUNCIONALIDADES_COMPLETAS.md:63-63`, `docs/FUNCIONALIDADES_SISTEMA.md:61-66; docs/FUNCIONALIDADES_SISTEMA.md:475-475` e mais 1
- **O que falta:** rota /closer não existe em src/routes/AppRoutes.tsx (rotas.json)
- **Evidência:** rota /closer não existe em src/routes/AppRoutes.tsx (rotas.json)
- **Revisão:** sem contestação cética concluída.

### F3941 · Rota /vendas (6 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Rota /vendas testada no smoke Playwright (HTTP 200, 0 erros reais).| Página de vendas com CRUD de deals. \| Rota registrada em AppRoutes.tsx com acesso "autenticado", GET em produção 200, chamando as edge functions ai-email-composer, process-race-event, semantic-index-entity, send-multichannel-message, send-transactional-email. Status no doc: BLOQUEADO: edge semantic-index-entity indisponível \| Rota /vendas (AppRoutes.tsx:121) renderiza src/pages/Vendas.tsx; sem role explícito (só autenticação global). Classificação do doc: IMPLEMENTADO_TOTAL. Evidência: menu (sidebarMenuData.ts) · sb=5 useQuery=6 mut=4 (árvore 36 arq.) \| Listagem e registro de vendas/deals com vinculação a cliente e vend…
- **Fontes:** `docs/reports/QA_ONDA_L_FINAL.md:47-47`, `docs/FUNCIONALIDADES_COMPLETAS.md:117-119`, `docs/DOCUMENTACAO_SISTEMA.md:269-272`, `docs/prod-readiness.md:244`, `docs/estado/01_FRONTEND_ROTAS.md:54-54`, `docs/FUNCIONALIDADES_SISTEMA.md:105-110; docs/FUNCIONALIDADES_SISTEMA.md:479-479` e mais 1
- **O que falta:** rota /vendas não existe em src/routes/AppRoutes.tsx (rotas.json)
- **Evidência:** rota /vendas não existe em src/routes/AppRoutes.tsx (rotas.json)
- **Revisão:** sem contestação cética concluída.

### F3942 · Helper órfão suppliers

- **Tipo:** Service/lib
- **O que os docs afirmam:** suppliers: helper de fornecedores; arquivo de lógica pura nunca importado (ou quase).
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:120`
- **O que falta:** arquivo suppliers ausente em src/
- **Evidência:** arquivo suppliers ausente em src/
- **Revisão:** sem contestação cética concluída.

### F3946 · Co-selling com split de comissão

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Falta múltiplos owners por deal com split.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:141`
- **O que falta:** coluna co_owners ausente em tables/public/sales.md (tabela existe)
- **Evidência:** coluna co_owners ausente em tables/public/sales.md (tabela existe)
- **Revisão:** sem contestação cética concluída.

### F3947 · Estoque vinculado ao produto

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Produto possui estoque associado.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:126-126`
- **O que falta:** coluna stock ausente em tables/public/products.md (tabela existe)
- **Evidência:** coluna stock ausente em tables/public/products.md (tabela existe)
- **Revisão:** sem contestação cética concluída.

### F3948 · Limites críticos de estoque

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Threshold de estoque crítico.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:476-476`
- **O que falta:** coluna min_stock ausente em tables/public/products.md (tabela existe)
- **Evidência:** coluna min_stock ausente em tables/public/products.md (tabela existe)
- **Revisão:** sem contestação cética concluída.

### F3949 · Multi-currency com conversão histórica

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Falta conversão histórica de moeda.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:161`
- **O que falta:** tabela/view "exchange_rates" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "exchange_rates" ausente do banco real (tables.md, views.md)
- **Revisão:** sem contestação cética concluída.

### F3950 · src/types/sales.ts tem 7 campos de rentabilidade

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Tipo de venda com 7 campos de rentabilidade que a branch antiga não tinha.
- **Fontes:** `docs/agentes/branches-encerradas-261117.md:163`
- **O que falta:** coluna ts ausente em tables/public/sales.md (tabela existe)
- **Evidência:** coluna ts ausente em tables/public/sales.md (tabela existe)
- **Revisão:** sem contestação cética concluída.

### F3951 · Tabela deal_products (produtos do deal)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Produtos associados ao deal com quantidade, preço unitário, desconto e total.
- **Fontes:** `docs/FUNCIONALIDADES_SISTEMA.md:111-111`
- **O que falta:** tabela/view "deal_products" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "deal_products" ausente do banco real (tables.md, views.md)
- **Revisão:** sem contestação cética concluída.

### F3952 · Tabela orders_conversion_seq (3 afirmações nos docs)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Sequence deve ser monotônica e ≥ max sufixo; se atrás, setval.| Path accepted/won da RPC cria order via nextval() com formato ORC-YYYYMMDD-NNNNNNNN e avança a sequence +1. \| ADR-005: sequência monotônica orders_conversion_seq garante order_number único no formato ORC-<seq>.
- **Fontes:** `docs/RUNBOOK.md:347-355`, `docs/RUNBOOK.md:199-205`, `docs/decisions/ADR-005-quote-to-sale-idempotency.md:14-14`
- **O que falta:** tabela/view "orders_conversion_seq" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "orders_conversion_seq" ausente do banco real (tables.md, views.md)
- **Revisão:** sem contestação cética concluída.

### F3953 · Thresholds de aprovação por valor/desconto

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Limites que acionam aprovação.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:255-255`
- **O que falta:** coluna min_value ausente em tables/public/approval_workflows.md (tabela existe)
- **Evidência:** coluna min_value ausente em tables/public/approval_workflows.md (tabela existe)
- **Revisão:** sem contestação cética concluída.

### F3954 · Vinculação deal → cliente + vendedor + produtos

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Deal referencia cliente, vendedor e itens de produto.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:121-121`
- **O que falta:** tabela/view "client_id" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "client_id" ausente do banco real (tables.md, views.md)
- **Revisão:** sem contestação cética concluída.

### F3955 · Concorrência segura: dedupe webhooks, transition_expected_version, specs quote-to-sale

- **Tipo:** Teste
- **O que os docs afirmam:** Etapa 77 P: 20260827000001, 20261002010100, 6 specs E2E; faltam cadências/workflows.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:78`
- **O que falta:** arquivo de teste 20261002010100_transition_expected_version.sql ausente
- **Evidência:** arquivo de teste 20261002010100_transition_expected_version.sql ausente
- **Revisão:** sem contestação cética concluída.

### F3034 · E2E jornada de venda do lead ao fechamento

- **Tipo:** Teste
- **O que os docs afirmam:** Jornada de venda validada do lead ao fechamento com persistência de estado.
- **Fontes:** `docs/reports/STRESS_TEST_REPORT.md:9-9`
- **O que falta:** spec E2E real cobrindo lead→deal→venda; relatório-fonte não tem artefato de teste correspondente.
- **Evidência:** docs/reports/STRESS_TEST_REPORT.md (22 linhas) é narrativo sem nenhum arquivo/teste citado. find/grep por specs lead→deal→venda em tests/e2e → 0 resultados. Specs quote-to-sale-* cobrem só orçamento aprovado→venda, não a jornada desde o lead.
- **Revisão:** sem contestação cética concluída.

### F3058 · Testes das edge functions financeiras (comissões/premiações, email-bulk-send)

- **Tipo:** Teste
- **O que os docs afirmam:** Doc aponta ~16% das functions com teste, zero cobertura Deno, financeiras sem teste; ação: portar padrão de run-retry-tests para email-bulk-send e comissões.
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:368,374`
- **O que falta:** Testes Deno de supabase/functions/email-bulk-send/index.ts e testes do cálculo de comissão (trigger private.handle_sale_commissions, sem teste).
- **Evidência:** ausente: find supabase/functions/email-bulk-send -iname '_test_' → 0 resultados. ausente: find supabase/functions -iname '*commission*test*' -o -iname '*comiss*test*' → 0 resultados. Não há edge function de comissão/premiação (ls supabase/functions| grep -iE 'commission\|comiss\|premi' → 0); cálculo de comissão é trigger SQL, não edge function. email-bulk-send está na allowlist (.github/workflows/deploy.yml:144) mas sem teste. \| cético: ls supabase/functions/email-bulk-send/ → só index.ts. ls supabase/functions \| grep -iE 'commis\|bonus\|premi\|award' → 0. Único teste que cita email-bulk-send é supabase/functions/send-transactional-email/callers_test.ts:38 — checa estaticamente que process-cadence-tasks NÃO chama email-bulk-send; não testa a function. supabase/tests/rls_test_suite.sql:30 só cobre RLS de commission_rules/commissions, não o cálculo.

### F3956 · Variante quote-to-sale-stress-service.sql com SET LOCAL request.jwt.claim.sub

- **Tipo:** Teste
- **O que os docs afirmam:** P1: criar variante que impersona user via SET LOCAL role authenticated + request.jwt.claim.sub para rodar standalone.
- **Fontes:** `docs/reports/QUOTE_TO_SALE_QA_REPORT.md:93-128`
- **O que falta:** arquivo de teste quote-to-sale-stress-service.sql ausente
- **Evidência:** arquivo de teste quote-to-sale-stress-service.sql ausente
- **Revisão:** sem contestação cética concluída.

### F3065 · Profiling do UPDATE lento de sales (388 ms)

- **Tipo:** Trigger
- **O que os docs afirmam:** A.9 Hardening P.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:384`
- **O que falta:** Rodar e versionar o profiling: EXPLAIN ANALYZE do UPDATE de sales, medindo o custo de cada trigger e da RLS. Depois, decidir quais triggers consolidar.
- **Evidência:** docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:384 e docs/execucao/HARDENING_CANONICO_2026-08-31.md:85-87 registram que o UPDATE de `sales` tem custo em triggers/RLS (388 ms médios, PK já indexada) e que isso 'deve ser tratado em profiling próprio'. Busca por qualquer artefato de profiling (find -iname "_profil_" fora node_modules/dist/coverage; grep -rli "388 ms\\|388ms\\|profiling.*sales" docs/ scripts/) só retorna os dois docs que ORIGINAM o achado — nenhum script, query ou relatório de resultado. O snapshot real (.../contexto/docs/contexto/supabase/triggers.md:258-290) confirma que `public.sales` ainda tem ~20+ triggers AFTER/BEFORE UPDATE ativos (audit_business_changes, tr_handle_sale_commissions, tr_handle_stock_on_sale, tr_sync_territory, tr_update_client_ltv etc.), ou seja, a carga que gerou o 388 ms continua e nenhum diagnóstico foi feito.| cético: Sem…

### F3066 · Quote→Sale: falha de audit_logs registrada em edge_call_failures (não EXCEPTION NULL)

- **Tipo:** Trigger
- **O que os docs afirmam:** PARCIAL (aceito): mitigado por tests/e2e/quote-to-sale-audit-log.spec.ts.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:351`
- **O que falta:** Trocar o 'EXCEPTION WHEN OTHERS THEN NULL' de fn_convert_quote_to_sale (linha 139) por um INSERT em public.edge_call_failures que registre o erro. Cobrir com um teste que force a falha do INSERT de audit_logs.
- **Evidência:** docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:351 aceita o achado como PARCIAL alegando mitigação por tests/e2e/quote-to-sale-audit-log.spec.ts. Mas o teste (tests/e2e/quote-to-sale-audit-log.spec.ts:27-121) só verifica que o INSERT em audit_logs grava com as colunas corretas no caminho feliz (reuso, criação, idempotência) — nenhum caso força uma falha do INSERT. A função real de produção (.../contexto/docs/contexto/supabase/functions/public/fn_convert_quote_to_sale__7014f3da0d296da6.sql:133-139, idêntica a supabase/migrations/20260710142606_502f6e24-0b43-463f-9cc3-202ff44796a6.sql:134-139) ainda tem `BEGIN INSERT INTO public.audit_logs (...) ... EXCEPTION WHEN OTHERS THEN NULL; END;` — qualquer falha no INSERT de auditoria continua sendo engolida silenciosamente. grep -rl "edge_call_failures" supabase/migrations/ src/ supabase/functions/ mostra que essa tabel…

## Parcial (41)

### F2966 · Botão "Enviar" cotação dispara envio real ao cliente

- **Tipo:** Ação/botão
- **O que os docs afirmam:** Doc: o botão só muda status para `sent`; a edge `send-quote-to-client` existe e nada no front a chama, então a cotação não chega ao cliente.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/D_frontend.md:13-13`
- **O que falta:** Incluir 'send-quote-to-client' na allowlist ACTIVE de deploy.yml:144 e confirmar deploy real/entrega.
- **Evidência:** src/components/quotes/QuoteCard.tsx:58-92 (handleSend) já invoca supabase.functions.invoke('send-quote-to-client') de verdade (claim antigo do doc, de que só muda status, está desatualizado); supabase/functions/send-quote-to-client/index.ts:238-244 só marca status 'sent' após envio com sucesso real (email/whatsapp via edges). Mas 'send-quote-to-client' NÃO está na allowlist ACTIVE de .github/workflows/deploy.yml:144 (string ausente), logo não é deployada em produção e a chamada do front falha.
- **Revisão:** sem contestação cética concluída.

### F2967 · Botão Enviar da cotação chama send-quote-to-client

- **Tipo:** Ação/botão
- **O que os docs afirmam:** O "Enviar" em QuoteCard.tsx:113-120 só faz onUpdateStatus(sent); send-quote-to-client não tem chamador.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:118`
- **O que falta:** Adicionar à allowlist e verificar entrega real (log do provedor) pós-deploy.
- **Evidência:** Mesma evidência de F2966: QuoteCard.tsx:61 chama send-quote-to-client de fato (não é mais só onUpdateStatus(sent)). Gap atual é a function estar fora da allowlist de deploy.yml:144, então não roda em produção.
- **Revisão:** sem contestação cética concluída.

### F2975 · Envio de orçamento ao cliente (send-quote-to-client) plugado em /orcamentos

- **Tipo:** Ação/botão
- **O que os docs afirmam:** send-quote-to-client não tem chamador real (só authz_test/cors_lint_test). DIVERGENTE.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:133`
- **O que falta:** Incluir na allowlist de deploy e validar entrega real.
- **Evidência:** Claim do doc ('sem chamador real') desatualizado: QuoteCard.tsx:61 chama a function de fato; docs/contexto/codigo/edge-functions.json confirma 'chamada_pelo_front':['src/components/quotes/QuoteCard.tsx']. Gap atual: function fora da allowlist ACTIVE de deploy.yml:144, não deployada em produção.
- **Revisão:** sem contestação cética concluída.

### F2976 · Faltam handlers para visualizar/baixar assinatura

- **Tipo:** Ação/botão
- **O que os docs afirmam:** Faltam handlers para visualizar e baixar assinatura digital.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:234-234`
- **O que falta:** Implementar upload de arquivo real no fluxo de criação/edição para popular file_url; adicionar ação de download se distinta de visualizar.
- **Evidência:** AssinaturaDigital.tsx:412-434: botão Eye abre doc.file_url em nova aba quando existe; disabled com aria-label quando não. Mas nenhum fluxo grava file_url: useDigitalSignatures.ts (handleCreateDocument) só grava title/description/status, sem upload — grep 'file_url' em src/ nunca aparece em INSERT/UPDATE de digital_signatures. Logo o botão nunca tem o que abrir na prática; não há ação separada de 'baixar'.
- **Revisão:** sem contestação cética concluída.

### F2983 · Approval matrix visual (existe básico)

- **Tipo:** Componente
- **O que os docs afirmam:** Existe aprovação básica; falta matriz visual.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:106`
- **O que falta:** Construir matriz visual multi-nível de aprovação; hoje é só um contador simples de aprovadores.
- **Evidência:** Rota /aprovacoes com CRUD completo (ver F2970), mas só tem campo numérico 'required_approvers' exibido como texto (ApprovalWorkflowsPage.tsx:543); não há matriz visual multi-nível (níveis distintos com aprovadores por nível, visualização em grade) — grep por 'level'/'multi-nível' não mostra tal UI.
- **Revisão:** sem contestação cética concluída.

### F2987 · Bucket quote-pdfs privado com URL assinada

- **Tipo:** Doc/config
- **O que os docs afirmam:** receive-quote-webhook/index.ts:253 usa getPublicUrl; PDFs de orçamento acessíveis por URL.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:150`
- **O que falta:** Trocar getPublicUrl() por createSignedUrl() em receive-quote-webhook/index.ts:285, removendo a URL pública inválida armazenada e o fallback frágil.
- **Evidência:** Bucket quote-pdfs É privado em produção (storage.md: 'quote-pdfs| não \| 20.0 MB \| application/pdf'). QuoteDetailDialog.tsx:103-124 e send-quote-to-client/index.ts:143-158 já extraem o path e usam createSignedUrl com expiração. Mas receive-quote-webhook/index.ts:279-288 ainda chama getPublicUrl() (não signed) ao salvar quotes.pdf_url, e send-quote-to-client/index.ts tem fallback que usa a URL pública direto se a extração do path falhar.
- **Revisão:** sem contestação cética concluída.

### F2990 · Etapa canônica 26/08 nº 60: Unificar semântica de venda ganha (completed/won/closed)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa canônica 60 (plano 26/08, matriz de status 30/08, estado 🔶): KPIs/LTV/Edge/DB; contrato e fixtures canônicas.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:205-205`
- **O que falta:** Criar fonte única de 'venda ganha' e substituir comparações hardcoded em todos os hooks/KPIs.
- **Evidência:** src/components/analytics/LTVBySegment.tsx:45 usa .eq('status','completed'); src/hooks/useLeadRouting.ts:124 usa ['won','completed']; migration 20260830000000_fix_race_leaderboard_status.sql:1-25 é patch pontual na view, não unificação de semântica.
- **Revisão:** sem contestação cética concluída.

### F2992 · Webhook externo receive-quote-webhook ausente do config.toml (verify_jwt=true por padrão)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Função com papel "webhook externo (valida QUOTE_SYNC_API_KEY)" não está em supabase/config.toml, logo fica com verify_jwt=true e rejeitaria 401 chamadores externos sem JWT Supabase. Doc marca como pendente de correção.
- **Fontes:** `docs/estado/10_EDGE_FUNCTIONS.md:67-74`
- **O que falta:** Adicionar receive-quote-webhook à allowlist de deploy.yml:144.
- **Evidência:** supabase/config.toml:46-47 já tem [functions.receive-quote-webhook] verify_jwt=false e o handler (index.ts:95-106) valida x-api-key — gap específico do doc já corrigido. Mas a função não está na allowlist ACTIVE de deploy.yml:144 (grep → 0), logo não é deployada em produção de qualquer forma.
- **Revisão:** sem contestação cética concluída.

### F2993 · Assinatura digital: criação de rascunho mantida, envio/status desabilitados

- **Tipo:** Edge function
- **O que os docs afirmam:** digital signatures mantém criação de rascunho, mas envio/status estão honestamente desabilitados.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:242-242`
- **O que falta:** Integrar provedor real de assinatura.
- **Evidência:** src/hooks/useDigitalSignatures.ts:65-106 cria rascunho real; linhas 123-146 (sendForSignature/updateSignerStatus) lançam DIGITAL_SIGNATURE_INTEGRATION_MESSAGE sem chamar provedor — desabilitado honestamente. Rota /assinatura-digital montada (AppRoutes.tsx:62,411) e no menu.
- **Revisão:** sem contestação cética concluída.

### F3915 · Edge function check-quote-expiration (9 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** 88 linhas; chamador: **nenhum**; verify_jwt true (default); tabelas tocadas (linhas em produção): notifications(6), quotes(301). Classificação do doc: MORTO_OU_ABANDONADO (sem chamador).| PARCIAL (14/24 ainda órfãs): check-quote-expiration segue com 0 chamadores. \| 14 functions acionadas por cron mantêm service_role. \| Catálogo API.md lista a edge function `check-quote-expiration` na categoria "CRM / Pipeline" com auth "nenhuma detectada no handler · verify_jwt", método "qualquer", payload "—" e resposta "JSON {error, success, processed, request_id}". \| Cotações: expiração automática via check-quote-expiration (cron, sem chamador de navegador). \| Doc classifica como ÓRFÃ. Chamador(es): …
- **Fontes:** `docs/estado/10_EDGE_FUNCTIONS.md:339-339`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:267`, `docs/SEC-08_SERVICE_ROLE_AUDIT.md:27-28`, `docs/API.md:63-63`, `docs/agentes/mapa-do-sistema.md:14`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:68-68` e mais 3
- **O que falta:** supabase/functions/check-quote-expiration/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)
- **Evidência:** supabase/functions/check-quote-expiration/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)
- **Revisão:** sem contestação cética concluída.

### F3916 · Edge function receive-quote-sync (13 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Doc: 9 functions são webhooks/callbacks externos.| Doc classifica como REAL. Chamador(es): webhook externo (V4/PromoGifts, HMAC). PROMOGIFTS_WEBHOOK_SECRET, QUOTE_SYNC_WEBHOOK_SECRET. \| O config local marca receive-quote-sync sem JWT (verify_jwt=false). \| Fluxo PromoGifts verifica header x-webhook-signature com HMAC-SHA256 usando PROMOGIFTS_WEBHOOK_SECRET. \| Fluxo V4 autentica por secret no body, exige correlation_key e dedupa idempotentemente. \| Automações N8N chamam receive-quote-sync (verify_jwt=false) com verificação de assinatura própria. \| Catálogo API.md lista a edge function `receive-quote-sync` na categoria "CRM / Pipeline" com auth "assinatura do provedor · verify_jwt off", m…
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:15-15`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:152-152`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:190-190`, `docs/SECURITY_HARDENING.md:87`, `docs/SECURITY_HARDENING.md:82-86`, `docs/runbooks/n8n.md:12-14,22` e mais 7
- **O que falta:** supabase/functions/receive-quote-sync/index.ts existe; está na allowlist de deploy (.github/workflows/deploy.yml:144); ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)
- **Evidência:** supabase/functions/receive-quote-sync/index.ts existe; está na allowlist de deploy (.github/workflows/deploy.yml:144); ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)
- **Revisão:** sem contestação cética concluída.

### F3917 · Edge function receive-quote-webhook (20 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Outros contratos de provider/callback/iframe/pré-login continuam atrás do JWT padrão embora tenham autenticação própria ou precisem ser públicos.| Doc classifica como REAL. Chamador(es): webhook externo (gift_store, x-api-key). QUOTE_SYNC_API_KEY. \| Recebe orçamentos da GIFT STORE via webhook. \| receive-quote-webhook é contrato de provider/iframe/pré-login mas permanece com verify_jwt padrão, o que bloqueia o uso legítimo; torná-lo público sem assinatura criaria escrita forjável. \| Superior. \| Etapa canônica 47 (plano 26/08, matriz de status 30/08, estado ⬜): JWT, HMAC/provider signature, state/PKCE, anti-replay, rate limit; modelagem de ameaças e testes negativos. \| Catálogo API.md li…
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:190-190`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:153-153`, `docs/FUNCIONALIDADES_COMPLETAS.md:240-240`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:184-186`, `docs/benchmark/RAMPER_2026-07.md:131`, `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:187-187` e mais 14
- **O que falta:** supabase/functions/receive-quote-webhook/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)
- **Evidência:** supabase/functions/receive-quote-webhook/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)
- **Revisão:** sem contestação cética concluída.

### F3918 · Edge function send-quote-to-client (14 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** PARCIAL (14/24 ainda órfãs): send-quote-to-client segue com 0 chamadores.| Doc: sem UI e com cara de feature: send-quote-to-client, ai-copilot, generate-loss-coaching, generate-coaching-actions, analyze-pipeline-coverage, elevenlabs-stt, ranking-api, deal-risk-digest, send-push-notification. \| Catálogo API.md lista a edge function `send-quote-to-client` na categoria "CRM / Pipeline" com auth "JWT do usuário (RLS) + papel admin/gestor · verify_jwt", método "só POST", payload "quote_id, channels, custom_message" e resposta "JSON {error, success}". \| Envio da cotação ao cliente por e-mail via edge function. \| 174 linhas; chamador: **nenhum**; verify_jwt true (default); tabelas tocadas (linh…
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:267`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/D_frontend.md:196-197`, `docs/API.md:81-81`, `docs/agentes/mapa-do-sistema.md:14`, `docs/estado/10_EDGE_FUNCTIONS.md:449-449`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:180-180` e mais 8
- **O que falta:** supabase/functions/send-quote-to-client/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/components/quotes/QuoteCard.tsx
- **Evidência:** supabase/functions/send-quote-to-client/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/components/quotes/QuoteCard.tsx
- **Revisão:** sem contestação cética concluída.

### F3923 · RPC/função SQL `fn_backfill_orders_conversion_seq`

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** API.md lista a function SQL `fn_backfill_orders_conversion_seq` com última definição em 20260708134842_fd3e5f78-b315-4078-8bb1-315778671975.sql, grants "authenticated, service_role" e uso no front "—".
- **Fontes:** `docs/API.md:573-573`
- **O que falta:** função public.fn_backfill_orders_conversion_seq existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)
- **Evidência:** função public.fn_backfill_orders_conversion_seq existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)
- **Revisão:** sem contestação cética concluída.

### F3928 · Hook useCommissions (2 afirmações nos docs)

- **Tipo:** Hook
- **O que os docs afirmam:** useCommissions seta status/approved_by/paid_by client-side; manager-vendedor pode auto-aprovar.| L743 C.
- **Fontes:** `docs/auditoria/RELATORIO_FALHAS.md:743-746`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:316`
- **O que falta:** arquivo src/hooks/useCommissions.ts existe mas hook não consta em hooks.json (não exportado/indexado)
- **Evidência:** arquivo src/hooks/useCommissions.ts existe mas hook não consta em hooks.json (não exportado/indexado)
- **Revisão:** sem contestação cética concluída.

### F2997 · Assinatura digital integrada a provedor

- **Tipo:** Integração externa
- **O que os docs afirmam:** Doc: envio e confirmação de assinatura lançam `DIGITAL_SIGNATURE_INTEGRATION_MESSAGE`; falta integrar provedor de assinatura.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/D_frontend.md:18-18`
- **O que falta:** Integrar provedor real; mesmo gap de F2993/F3006.
- **Evidência:** useDigitalSignatures.ts:33-34,123-146 lança DIGITAL_SIGNATURE_INTEGRATION_MESSAGE em vez de chamar provedor; AssinaturaDigital.tsx roteado (AppRoutes.tsx:62,411).
- **Revisão:** sem contestação cética concluída.

### F3001 · Edge function receive-quote-webhook sem functions.invoke literal no front

- **Tipo:** Integração externa
- **O que os docs afirmam:** Uma das 64/168 funções sem invocador literal em src/. Grupo: Webhook de entrada (INFERIDO). Classificação por grupo deduzida do nome; pg_cron/config.toml não verificados.
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:291-311`
- **O que falta:** Adicionar à allowlist de deploy.yml:144.
- **Evidência:** Função e config.toml:46-47 (verify_jwt=false) existem, mas 'receive-quote-webhook' ausente da allowlist ACTIVE de deploy.yml:144 (grep → 0) — não deployada em produção. Sem invocador literal em src/ (esperado, é webhook externo).
- **Revisão:** sem contestação cética concluída.

### F3002 · Etapa 55 do plano: Consertar assinatura digital

- **Tipo:** Integração externa
- **O que os docs afirmam:** Integrar provedor/e-mail, callbacks assinados e estado verificável; não declarar envio antes da entrega. Saída esperada: fluxo E2E em staging. Gate: custo/provedor.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:726-726`
- **O que falta:** Integrar provedor com callback assinado.
- **Evidência:** Mesma evidência de F2993/F3006: useDigitalSignatures.ts:123-146 sem provedor integrado; sem callback assinado; sem fluxo E2E em staging.
- **Revisão:** sem contestação cética concluída.

### F3003 · Etapa canônica 26/08 nº 55: Consertar assinatura digital (provedor/e-mail, callbacks assinados)

- **Tipo:** Integração externa
- **O que os docs afirmam:** Etapa canônica 55 (plano 26/08, matriz de status 30/08, estado 🔒): estado verificável; fluxo E2E em staging.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:200-200`
- **O que falta:** Mesma pendência de provedor real.
- **Evidência:** Idêntico a F3002: useDigitalSignatures.ts:123-146 sem provedor; tabelas digital_signatures e document_signers com 0 linhas (stats.md:271-272) — nunca exercitado em produção.
- **Revisão:** sem contestação cética concluída.

### F3004 · Integração externa: Promogifts / quote sync (webhooks)

- **Tipo:** Integração externa
- **O que os docs afirmam:** 3 funções; 2/3 publicadas; receive-quote-webhook indisponível. Chamada real ao provedor não exercida (B4).
- **Fontes:** `docs/prod-readiness.md:868`
- **O que falta:** Deployar receive-quote-webhook; chamada real ao provedor não verificável sem acesso a logs externos.
- **Evidência:** receive-quote-sync e notify-quote-conversion estão na allowlist ACTIVE (deploy.yml:144); receive-quote-webhook não está (grep → 0) — exatamente 2/3 publicadas, como o doc afirma.
- **Revisão:** sem contestação cética concluída.

### F3006 · Provedor de assinatura digital

- **Tipo:** Integração externa
- **O que os docs afirmam:** Envio e confirmação de assinatura bloqueados (useDigitalSignatures.ts:123-146); sem provedor.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:137`
- **O que falta:** Integrar provedor com callback de assinatura.
- **Evidência:** useDigitalSignatures.ts:123-146 confirma exatamente o citado pelo doc: send/confirm bloqueados, sem provedor.
- **Revisão:** sem contestação cética concluída.

### F3007 · Gap "classe mundial" já existente: Aprovações

- **Tipo:** Outro
- **O que os docs afirmam:** Doc afirma que o gap "Aprovações" de GAPS_CLASSE_MUNDIAL já existe no código.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:208`
- **O que falta:** Nunca foi usado em produção; falta dado real ou decisão de arquivar.
- **Evidência:** useApprovalWorkflows.ts:36-60 e AdminComercial.tsx (roteada, AppRoutes.tsx:179,1024) são reais, mas approval_workflows/approval_requests/approval_decisions têm 0 linhas no banco real (stats.md:178,243,342) — falha o critério 'com dados reais'.
- **Revisão:** sem contestação cética concluída.

### F3009 · Status de venda ganha diverge entre completed/won/closed

- **Tipo:** Outro
- **O que os docs afirmam:** Status de venda ganha diverge entre completed/won/closed e filtros que consideram somente completed.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:250-250`
- **O que falta:** Corrigir LTVBySegment.tsx:45 e centralizar semântica.
- **Evidência:** Idêntico a F2990: LTVBySegment.tsx:45 só conta 'completed'; migration 20260830000000...:2 admite explicitamente 'o banco só usa won em sales.status' — confirma desalinhamento ainda presente.
- **Revisão:** sem contestação cética concluída.

### F3012 · Ciclo de cotação completo (expiração automática + envio ao cliente)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Doc top-6: check-quote-expiration e send-quote-to-client órfãs; cotação não expira e envio pela function nunca é usado.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:348-348`
- **O que falta:** Adicionar check-quote-expiration e send-quote-to-client à allowlist de deploy.yml:144.
- **Evidência:** Cron ativo (cron.md:43, check-quote-expiration-daily, 0 8 * * *) e botão wired (QuoteCard.tsx:61, invoke('send-quote-to-client')), mas nenhuma das 2 functions está na allowlist ACTIVE de deploy.yml:144 (grep → 0 para ambas) — não deployadas, cron e botão falhariam em produção.
- **Revisão:** sem contestação cética concluída.

### F3013 · Domínio dormente: Aprovações / assinatura digital (7 tabelas zeradas)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Agrupamento funcional com 7 tabelas todas com 0 linhas; indica módulo construído e nunca usado.
- **Fontes:** `docs/estado/11_DADOS_BANCO.md:221-233`
- **O que falta:** Exercitar com fluxo real ou decidir arquivar o módulo.
- **Evidência:** stats.md:178,243,258,271,272,342 confirma 0 linhas em approval_workflows, approval_requests, approval_decisions, commercial_approval_requests, digital_signatures e document_signers — domínio dormente confirmado. UI/hooks reais existem (useApprovalWorkflows.ts, AdminComercial.tsx, useDigitalSignatures.ts) mas sem dado real.
- **Revisão:** sem contestação cética concluída.

### F3015 · Fila/integração quotes_inbound com tráfego (154 linhas, último 2026-07-19 03:30:05)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Uma das 7 (de 36) tabelas de fila/integração que já receberam registro; último em 2026-07-19 03:30:05.
- **Fontes:** `docs/estado/11_DADOS_BANCO.md:554-554`
- **O que falta:** query real de max(received_at)/updated_at em quotes_inbound, não disponível nos snapshots estáticos.
- **Evidência:** quotes_inbound é upsert por quote_id (UNIQUE, tables/public/quotes_inbound.md:21), alimentado por receive-quote-sync/index.ts:371-396. Contagem estável (~150, stats.md:45) é esperada num upsert, não prova nem refuta fluxo recente. Sem acesso a max(received_at) real na tabela.
- **Revisão:** sem contestação cética concluída.

### F3016 · Fluxo de assinatura: upload de arquivo + envio a signatários

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Assinatura digital com file_url, signatários ordenados (sign_order) e status por signatário; implica storage e envio de e-mail.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:829-845`
- **O que falta:** integrar provedor de assinatura/e-mail real para envio e confirmação, e upload de arquivo (storage bucket) para file_url; hoje é CRUD de rascunho apenas.
- **Evidência:** src/hooks/useDigitalSignatures.ts:36-37,123-147,290: sendForSignature e updateSignerStatus sempre lançam erro (DIGITAL_SIGNATURE_INTEGRATION_MESSAGE); signatureIntegrationConfigured:false. src/pages/AssinaturaDigital.tsx:412-420 só mostra file_url se existir, sem upload. document_signers.sign_order funciona como CRUD real (linhas 88-101,174-201).
- **Revisão:** sem contestação cética concluída.

### F3934 · Rota /admin/quote-conversions (3 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Rota registrada em AppRoutes.tsx com acesso "admin", GET em produção 200. Status no doc: OK| Rota /admin/quote-conversions (AppRoutes.tsx:277) renderiza src/pages/admin/AdminQuoteConversionsPage.tsx; role: admin. Classificação do doc: IMPLEMENTADO_PARCIAL. Evidência: link src/components/admin/AdminQuickLinks.tsx:68 · sb=1 useQuery=1 mut=0 (árvore 7 arq.) · somente leitura — nenhuma mutação/persistência na árvore \| API.md declara a rota `/admin/quote-conversions` renderizando o componente AdminQuoteConversionsPage com acesso "admin".
- **Fontes:** `docs/prod-readiness.md:90`, `docs/estado/01_FRONTEND_ROTAS.md:195-195`, `docs/API.md:436-436`
- **O que falta:** rota /admin/quote-conversions → src/pages/admin/AdminQuoteConversionsPage.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Evidência:** rota /admin/quote-conversions → src/pages/admin/AdminQuoteConversionsPage.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Revisão:** sem contestação cética concluída.

### F3935 · Rota /admin/quote-sync-inbound (4 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** NÃO INICIADO (20/20): rota /admin/quote-sync-inbound existe mas sem link/menu; só mapas de título/prefetch.| Rota registrada em AppRoutes.tsx com acesso "admin", GET em produção 200. Status no doc: OK \| Rota /admin/quote-sync-inbound (AppRoutes.tsx:276) renderiza src/pages/admin/AdminQuoteSyncInboundPage.tsx; role: admin. Classificação do doc: MORTO_OU_ABANDONADO. Evidência: SEM link/menu em todo src/ · sb=3 useQuery=2 mut=2 (árvore 10 arq.) \| API.md declara a rota `/admin/quote-sync-inbound` renderizando o componente AdminQuoteSyncInboundPage com acesso "admin".
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:52`, `docs/prod-readiness.md:91`, `docs/estado/01_FRONTEND_ROTAS.md:194-194`, `docs/API.md:435-435`
- **O que falta:** rota /admin/quote-sync-inbound → src/pages/admin/AdminQuoteSyncInboundPage.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Evidência:** rota /admin/quote-sync-inbound → src/pages/admin/AdminQuoteSyncInboundPage.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Revisão:** sem contestação cética concluída.

### F3936 · Rota /admin/regras-comissao (3 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Rota registrada em AppRoutes.tsx com acesso "admin_ou_gestor", GET em produção 200. Status no doc: OK| Rota /admin/regras-comissao (AppRoutes.tsx:168) renderiza src/pages/CommissionRules.tsx; role: admin ou manager. Classificação do doc: IMPLEMENTADO_TOTAL. Evidência: link src/pages/AdminComissoes.tsx:119 · sb=2 useQuery=2 mut=2 (árvore 13 arq.) \| API.md declara a rota `/admin/regras-comissao` renderizando o componente CommissionRules com acesso "admin ou gestor".
- **Fontes:** `docs/prod-readiness.md:93`, `docs/estado/01_FRONTEND_ROTAS.md:97-97`, `docs/API.md:338-338`
- **O que falta:** rota /admin/regras-comissao → src/pages/CommissionRules.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Evidência:** rota /admin/regras-comissao → src/pages/CommissionRules.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Revisão:** sem contestação cética concluída.

### F3938 · Rota /comparador-precos (7 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** NÃO INICIADO (20/20): rota /comparador-precos existe mas sem link/menu; só mapas de título/prefetch.| Rota /comparador-precos é uma das 8 cobertas por tests/e2e/pages-critical-routes.spec.ts. \| Análise comparativa de preços de fornecedores. \| Doc declara a rota `/comparador-precos` servida pela página `ComparadorPrecos.tsx` (acesso: Admin/Manager). Comparador de preços de fornecedores. \| Rota /comparador-precos (AppRoutes.tsx:164) renderiza src/pages/ComparadorPrecos.tsx; role: admin ou manager. Classificação do doc: MORTO_OU_ABANDONADO. Evidência: SEM link/menu em todo src/ · sb=2 useQuery=2 mut=2 (árvore 12 arq.) \| Doc: só aparece em breadcrumb, sem item de menu. \| API.md declara a r…
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:52`, `docs/testes/suites-ci.md:102-104`, `docs/FUNCIONALIDADES_COMPLETAS.md:248-250`, `docs/DOCUMENTACAO_SISTEMA.md:773-776`, `docs/prod-readiness.md:140`, `docs/estado/01_FRONTEND_ROTAS.md:93-93` e mais 2
- **O que falta:** rota /comparador-precos → src/pages/ComparadorPrecos.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Evidência:** rota /comparador-precos → src/pages/ComparadorPrecos.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Revisão:** sem contestação cética concluída.

### F3939 · Rota /fornecedores (5 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** NÃO INICIADO (20/20): rota /fornecedores existe mas sem link/menu; só mapas de título/prefetch.| Gestão de fornecedores. \| Doc declara a rota `/fornecedores` servida pela página `Fornecedores.tsx` (acesso: Admin/Manager). Fornecedores. \| Rota /fornecedores (AppRoutes.tsx:163) renderiza src/pages/Fornecedores.tsx; role: admin ou manager. Classificação do doc: MORTO_OU_ABANDONADO. Evidência: SEM link/menu em todo src/ · sb=0 useQuery=0 mut=0 (árvore 12 arq.) \| API.md declara a rota `/fornecedores` renderizando o componente Fornecedores com acesso "admin ou gestor".
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:52`, `docs/FUNCIONALIDADES_COMPLETAS.md:479-481`, `docs/DOCUMENTACAO_SISTEMA.md:766-769`, `docs/prod-readiness.md:174`, `docs/estado/01_FRONTEND_ROTAS.md:92-92`, `docs/API.md:333-333`
- **O que falta:** rota /fornecedores → src/pages/Fornecedores.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Evidência:** rota /fornecedores → src/pages/Fornecedores.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Revisão:** sem contestação cética concluída.

### F3940 · Rota /produtos (5 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Rota /produtos é uma das 8 cobertas por tests/e2e/pages-critical-routes.spec.ts.| Catálogo de produtos. \| Doc declara a rota `/produtos` servida pela página `Produtos.tsx` (acesso: Todos). Grid/lista de produtos. \| Rota /produtos (AppRoutes.tsx:123) renderiza src/pages/Produtos.tsx; sem role explícito (só autenticação global). Classificação do doc: IMPLEMENTADO_TOTAL. Evidência: menu (sidebarMenuData.ts) · sb=1 useQuery=1 mut=1 (árvore 24 arq.) \| API.md declara a rota `/produtos` renderizando o componente Produtos com acesso "autenticado".
- **Fontes:** `docs/testes/suites-ci.md:102-104`, `docs/FUNCIONALIDADES_COMPLETAS.md:123-125`, `docs/DOCUMENTACAO_SISTEMA.md:317-320`, `docs/prod-readiness.md:207`, `docs/estado/01_FRONTEND_ROTAS.md:56-56`, `docs/API.md:297-297`
- **O que falta:** rota /produtos → src/pages/Produtos.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Evidência:** rota /produtos → src/pages/Produtos.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Revisão:** sem contestação cética concluída.

### F3024 · Function `receive-quote-webhook` autenticada por API key

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Catálogo marca `receive-quote-webhook` como 'API key · verify_jwt' recebendo action, quote, pdf_base64, timestamp.
- **Fontes:** `docs/API.md:76-76`
- **O que falta:** adicionar a função à allowlist ACTIVE em deploy.yml:144, ou confirmar que foi substituída por receive-quote-sync (que está na allowlist).
- **Evidência:** Código correto: receive-quote-webhook/index.ts:9,102-106 compara x-api-key com QUOTE_SYNC_API_KEY (401 se inválido). PORÉM 'receive-quote-webhook' NÃO está na allowlist ACTIVE de .github/workflows/deploy.yml:144 (0 ocorrências) — não roda em produção apesar de existir no repo.
- **Revisão:** sem contestação cética concluída.

### F3028 · Etapa 60 do plano: Unificar semântica de venda ganha

- **Tipo:** Service/lib
- **O que os docs afirmam:** Centralizar completed/won/closed e adaptar KPIs/LTV/Edge/DB. Saída esperada: contrato e fixtures canônicas. Gate: decisão de negócio.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:731-731`
- **O que falta:** fonte única (função SQL + constante reusável por Edge Functions) e fixtures canônicas que a etapa 60 pede.
- **Evidência:** Centralização parcial no frontend (WON_SALE_STATUSES, ver F3027), mas sem contrato/fixtures canônicas cross-stack: nenhuma função SQL equivalente, nenhum arquivo de fixtures; Edge functions Deno e a migration 20261013130000_comissao_regras_e_split_sdr.sql:31 continuam com listas próprias hardcoded ('completed','won').
- **Revisão:** sem contestação cética concluída.

### F3943 · scripts/pack-quote-to-sale-artifacts.ts invocado por tests/e2e/helpers/quote-to-sale-failure-reporter.ts

- **Tipo:** Service/lib
- **O que os docs afirmam:** Empacota artefatos de falha do fluxo quote→sale; chamado só pelo reporter Playwright.
- **Fontes:** `docs/estado/12_INFRA_CI_TESTES.md:304`
- **O que falta:** scripts/pack-quote-to-sale-artifacts.ts existe mas nenhum import encontrado (grep)
- **Evidência:** scripts/pack-quote-to-sale-artifacts.ts existe mas nenhum import encontrado (grep)
- **Revisão:** sem contestação cética concluída.

### F3945 · Service/lib verify-quote-to-sale-invariants (2 afirmações nos docs)

- **Tipo:** Service/lib
- **O que os docs afirmam:** Diagnóstico do exit 2.| Script de invariantes quote→sale, auto-pula sem secret (linhas 55-58 do workflow).
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:103`, `docs/estado/12_INFRA_CI_TESTES.md:295`
- **O que falta:** scripts/verify-quote-to-sale-invariants.ts existe mas nenhum import encontrado (grep)
- **Evidência:** scripts/verify-quote-to-sale-invariants.ts existe mas nenhum import encontrado (grep)
- **Revisão:** sem contestação cética concluída.

### F3030 · Split de comissão do SDR em uso

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Split de comissão do SDR existe só como coluna sem uso; dinheiro em 4 precisões na cadeia venda→pedido→comissão.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:180`
- **O que falta:** padronizar escala numérica (ex. numeric(14,2) uniforme) em toda a cadeia venda→pedido→comissão.
- **Evidência:** Migration 20261013130000 l.77-98 cria linha de comissão separada para o SDR (sale_id, NEW.sdr_id) com regra e cálculo próprios quando há ativação — split está em uso, não é coluna morta (doc-fonte é anterior à migration de 13/10). Precisão numérica ainda inconsistente: quotes.total_value numeric sem escala, sales.amount/commissions numeric(12,2), commissions.sdr_commission_amount numeric sem escala, margin_amount numeric(14,2).
- **Revisão:** sem contestação cética concluída.

### F3059 · Testes Vitest de useSalesData, useProductRecommendations, useDashboardKPIs

- **Tipo:** Teste
- **O que os docs afirmam:** Vitest cobre hooks useSalesData, useProductRecommendations, useDashboardKPIs.
- **Fontes:** `docs/reports/QA_ONDA_L_FINAL.md:31-32`
- **O que falta:** Testes diretos de src/hooks/sales/useSalesData.ts e src/hooks/dashboard/useDashboardKPIs.ts.
- **Evidência:** useProductRecommendations testado de fato: src/hooks/useProductRecommendations.test.tsx:76,91 (renderHook do hook real). useDashboardKPIs NÃO tem teste próprio: src/hooks/dashboard/**tests**/useDashboardKPIs.contract.test.ts:1-30 testa só o contrato da RPC get_dashboard_kpis (sem importar o hook); o teste que importa um hook de dashboard é useDashboardKPIsPeriod.test.tsx:4, hook distinto. useSalesData NÃO tem teste próprio: ausente busca por tests em src/hooks/sales/; único hit é src/components/tasks/CreateTaskDialog.test.tsx:19, que apenas faz vi.mock('@/hooks/sales/useSalesData', ...) (mocka, não testa).| cético: src/hooks/useProductRecommendations.test.tsx existe. src/hooks/dashboard/**tests**/useDashboardKPIs.contract.test.ts só mocka supabase.rpc e importa o client (:46,70,97), nunca importa o hook useDashboardKPIs; useDashboardKPIsPeriod.test.tsx:4 testa outro hook. useSalesData: …

### F3957 · Trigger de baixa de estoque handle_stock_on_sale anexado a sales

- **Tipo:** Trigger
- **O que os docs afirmam:** Trigger function handle_stock_on_sale existe mas nunca foi anexada; estoque não baixa ao vender.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:87-88,45`
- **O que falta:** função handle_stock_on_sale existe mas nenhum trigger a executa (triggers.md)
- **Evidência:** função handle_stock_on_sale existe mas nenhum trigger a executa (triggers.md)
- **Revisão:** sem contestação cética concluída.

### F3958 · Trigger notify_sale_completion removido (substituído por broadcast_sale_completed)

- **Tipo:** Trigger
- **O que os docs afirmam:** notify_sale_completion nunca anexada; substituída por broadcast_sale_completed.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:88`
- **O que falta:** função notify_sale_completion existe mas nenhum trigger a executa (triggers.md)
- **Evidência:** função notify_sale_completion existe mas nenhum trigger a executa (triggers.md)
- **Revisão:** sem contestação cética concluída.

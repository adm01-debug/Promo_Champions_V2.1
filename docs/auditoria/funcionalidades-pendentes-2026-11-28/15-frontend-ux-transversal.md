# Frontend transversal e UX

[Voltar ao índice](README.md)

195 itens não implementados, parciais ou não verificáveis neste domínio.

## Não implementado (75)

### F0627 · Etapa 61 do plano: Inventariar cada ação sem efeito

- **Tipo:** Ação/botão
- **O que os docs afirmam:** Para os 16 módulos, decidir implementar, ocultar ou marcar “em breve”. Saída esperada: matriz botão→efeito→owner. Gate: decisão produto.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:735-735`
- **O que falta:** Produzir em docs/ a matriz botão→efeito→owner dos 16 módulos (casos conhecidos: EmptyStateGuide.tsx:69-78, ApprovalQueue citado em A_planos_execucao.md:65).
- **Evidência:** ausente: grep -rln 'matriz botão\|botão→efeito\|ação sem efeito' docs scripts → só o próprio plano (AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:735), o status (STATUS_100_ETAPAS_2026-08-30.md:211, estado 🔶 'Inventário repo-local; decisão do operador') e menções genéricas em docs/estado/01_FRONTEND_ROTAS.md:368 e docs/prod-readiness.md:907. Nenhum documento com matriz botão→efeito→owner por módulo.| cético: Confirmado e reforçado: docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:65 registra a etapa 61 como 'NI \| sem matriz'; docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:211 está 🔶 sem artefato. grep -rlniE 'matriz.*botão\|botão.*efeito.*owner' docs → só o plano, o status e A_planos_execucao.md (que declara a ausência).

### F0636 · Branding multi-tenant

- **Tipo:** Componente
- **O que os docs afirmam:** A.13 NI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:456`
- **O que falta:** Tabela de branding por tenant com RLS, hook de leitura e aplicação de CSS vars no ThemeProvider.
- **Evidência:** ausente: grep -rln 'tenant_branding\|tenantBranding\|branding\|Branding' src supabase/functions supabase/migrations → 0; grep -in 'branding\|tenant' snapshot supabase/tables.md → 0; src/contexts só tem DashboardThemeContext.tsx sem 'tenant'. Claim 'NI' CONFIRMADA.| cético: Confirmado: grep -ciE 'brand\|tenant\|franq\|franchise\|white.?label\|logo_url' snapshot supabase/tables.md → 0. Nenhuma tabela _\_settings de tema ou organização no banco real (só settings funcionais: user_app_settings, portfolio_settings etc.). Os hits de primary_color em src/components/race/_ são livery de carro, não tema por tenant.

### F3435 · Componente/tela SettingsPanel (2 afirmações nos docs)

- **Tipo:** Componente
- **O que os docs afirmam:** Doc lista o componente `SettingsPanel.tsx` — painel principal de configurações.| Doc: construídos e não usados.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:972-986`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/D_frontend.md:169-169`
- **O que falta:** componente inteiro: criar src/components/settings/SettingsPanel.tsx, rota/menu e montagem, ou remover a afirmação do doc
- **Evidência:** componente SettingsPanel ausente (componentes.json e src/)| cético: ausente: find src -iname "SettingsPanel*" → 0 resultados; grep -rli settingspanel src → 0 resultados (só aparece em docs/DOCUMENTACAO_SISTEMA.md, docs/auditoria/..., nunca em src/)

### F3436 · Componente/tela SlideOverPanel (4 afirmações nos docs)

- **Tipo:** Componente
- **O que os docs afirmam:** Doc lista o componente `SlideOverPanel.tsx` — painel lateral deslizante.| Apêndice A lista 1 módulo(s) de molecules não alcançados pelo grafo determinístico a partir de src/main.tsx. \| SlideOverPanel não move/restaura foco, sem trap, sem Escape, sem role/aria-modal; backdrop sem teclado. \| L84/L90 NI.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1350-1363`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:849-849`, `docs/auditoria/RELATORIO_FALHAS.md:84-88`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:286`
- **O que falta:** componente inteiro: criar o painel lateral com Radix Dialog (role=dialog, aria-modal, foco, Escape) ou remover a afirmação do doc
- **Evidência:** componente SlideOverPanel ausente (componentes.json e src/)| cético: ausente: find src -iname "SlideOverPanel*" → 0 resultados; grep -rli "slideover\\|slide-over" src → 0 resultados; src/components/ui/level-up-celebration.tsx:1-20 é um modal de celebração não relacionado

### F3437 · Componente/tela ThemeProvider (2 afirmações nos docs)

- **Tipo:** Componente
- **O que os docs afirmam:** UX/A11y 10/10 cita dark mode.| Tema escuro e 8 cores de destaque.
- **Fontes:** `docs/reports/QA_ONDA_L_FINAL.md:87-87`, `docs/FUNCIONALIDADES_COMPLETAS.md:612-612`
- **O que falta:** componente ThemeProvider ausente (componentes.json e src/)
- **Evidência:** componente ThemeProvider ausente (componentes.json e src/)| CONTESTADO pelo cético (PARCIAL): src/hooks/useTheme.ts:1-24 (toggle real: aplica classList 'dark'/'light' na raiz e persiste em localStorage); src/components/atoms/ThemeToggle.tsx:8-50 usa useTheme e troca o tema via triggerHaptic+toggleTheme; componente montado em src/components/templates/MainLayout.tsx e src/components/organisms/DesktopTopBar.tsx (grep -rln ThemeToggle src). Isso refuta 'NAO_IMPLEMENTADO': o toggle de tema existe e funciona em produção.
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F3438 · Componentes não alcançados em src/components/atoms (5)

- **Tipo:** Componente
- **O que os docs afirmam:** Apêndice A lista 5 módulo(s) de atoms não alcançados pelo grafo determinístico a partir de src/main.tsx.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:823-823`
- **O que falta:** os 5 módulos citados (SmartImage.tsx e os 4 'atoms' que na verdade são componentes shadcn de src/components/ui) não existem em src/components/atoms; decisão nominal manter/migrar/deprecar nunca foi tomada
- **Evidência:** componente SmartImage ausente (componentes.json e src/)| cético: ausente: find src -iname "SmartImage*" → 0 resultados; src/components/atoms/ contém apenas LanguageToggle.tsx, LazySection.tsx, SearchTrigger.tsx, SystemHealthBadge.tsx, ThemeToggle.tsx, skeleton.tsx — nenhum dos 5 citados (SmartImage, badge, button, card, input) está nessa pasta

### F3439 · Componentes não alcançados em src/components/errors (2)

- **Tipo:** Componente
- **O que os docs afirmam:** Apêndice A lista 2 módulo(s) de errors não alcançados pelo grafo determinístico a partir de src/main.tsx.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:843-843`
- **O que falta:** PageErrorBoundary.tsx e withErrorBoundary.tsx citados nunca existiram nesse diretório; só há o ErrorBoundary genérico
- **Evidência:** componente PageErrorBoundary ausente (componentes.json e src/)| cético: src/components/errors/ contém só ErrorBoundary.tsx (confirmado por ls); grep -rln "withErrorBoundary\\|PageErrorBoundary" src → 0 resultados

### F3440 · Componentes não alcançados em src/components/ui (13)

- **Tipo:** Componente
- **O que os docs afirmam:** Apêndice A lista 13 módulo(s) de ui não alcançados pelo grafo determinístico a partir de src/main.tsx.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:869-869`
- **O que falta:** componente-âncora do item (Microinteractions.tsx) e 10 dos 13 arquivos citados não existem em lugar nenhum do repo; accordion.tsx e stepper.tsx também ausentes apesar de @radix-ui/react-accordion estar instalado e não usado (package.json:76)
- **Evidência:** componente Microinteractions ausente (componentes.json e src/)| cético: ls src/components/ui (46 arquivos) não contém nenhum dos 13 nomes citados (Microinteractions, accordion, command-palette, enhanced-select, expandable-card, floating-action-button, password-input, password-strength, premium-empty-state, ripple-button, sonner, stepper, swipeable-card); grep -rln para cada termo em src → 0 para 11 deles. Duas funcionalidades equivalentes existem sob outro nome/pasta mas não resgatam o artefato citado: toast via lib 'sonner' direto (package.json:145, usado em src/components/closer/CloserHandoffs.tsx e outros) em vez de wrapper ui/sonner.tsx; command palette existe em src/components/command/CommandPalette.tsx e É montado em src/App.tsx (diferente do ui/command-palette.tsx citado).

### F0646 · Etapa 92 do plano: Validar os 131 módulos, 21 hooks, 2 services e 2 páginas

- **Tipo:** Componente
- **O que os docs afirmam:** Cruzar imports, flags, telemetria, docs e owners. Saída esperada: manter/migrar/deprecar por item. Gate: nenhum.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:775-775`
- **O que falta:** Gerar inventário (pode partir de codigo/componentes.json e hooks.json do contexto) com decisão manter/migrar/deprecar por módulo/hook/service/página.
- **Evidência:** docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:257 etapa 92 estado ⬜. ausente: grep -rln 'manter/migrar/deprecar' docs → só o plano e o status; grep -rln '131 módulos' docs → só os mesmos dois arquivos. Nenhuma tabela de decisão manter/migrar/deprecar por item.| CONTESTADO pelo cético (PARCIAL): A etapa foi executada em parte. docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:91 registra a etapa 92 como 'P \| 7 dos ~27 listados removidos (useAICopilot, useRevenueIntelligence, useGoals, sessionHelpers, useSessionManagement, lib/bi/mockData, utils/fuzzing)'. Depois, o commit 89aacaff8 (PR #285) removeu '128 arquivos de produção inalcançáveis a partir de main.tsx ... re-derivados por grafo de imports', ou seja, a decisão 'deprecar' foi aplicada a um lote grande de módulos não alcançados. Falta a tabela formal manter/migrar/deprecar por item, e o STATUS_100_ETAPAS_2026…
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F0649 · Global Multi-Tenant Branding (cores e logos por franquia)

- **Tipo:** Componente
- **O que os docs afirmam:** Backlog: franquias com cores e logos próprias (prioridade baixa).
- **Fontes:** `docs/auditoria_enterprise_v5.md:72`
- **O que falta:** Tabela tenant_branding (cores, logos) com RLS e aplicação no ThemeProvider/CSS vars por tenant.
- **Evidência:** ausente: grep -rln 'tenant_branding\|branding\|franquia\|franchise' src supabase → 0; snapshot supabase/tables.md sem tabela de branding/tenant; src/contexts/DashboardThemeContext.tsx sem 'tenant'. Backlog de prioridade baixa (docs/auditoria_enterprise_v5.md:72) CONFIRMADO como não iniciado.| cético: Confirmado: grep -ciE 'brand\|tenant\|franq\|franchise\|white.?label\|logo_url' snapshot supabase/tables.md → 0. grep -rliE 'tenant_branding\|whitelabel\|franquia' src supabase/functions → 0; os hits de primary_color em src/components/race/* são cores de carro.

### F0658 · Próximo passo: selo visível de "dado de exemplo" onde houver mock

- **Tipo:** Componente
- **O que os docs afirmam:** Planejado: marcar ou remover dado fictício.
- **Fontes:** `docs/estado/ESTADO_ATUAL.md:303-304`
- **O que falta:** Criar componente de selo 'dado de exemplo' (ex. src/components/ui/SampleDataBadge.tsx) e aplicá-lo onde há dado fictício/Math.random no caminho principal (WorkflowsPage.tsx, MetasAtividades.tsx, PipelineBoard.tsx, DailyActivityRanking.tsx), ou remover o mock.
- **Evidência:** ausente: grep -rniE 'dados? de exemplo\|DemoBadge\|SampleDataBadge' src/components src/pages → só 2 rótulos ad hoc em previews (src/components/sales/cadence/CadenceTemplateManager.tsx:251 'Exemplo com dados fictícios', src/components/cadences/MergeTagPicker.tsx:89), nenhum componente/selo reutilizável. docs/estado/ESTADO_ATUAL.md:300-305 não contém o item citado (texto é sobre amostragem de achados). Math.random segue em 19 arquivos não-teste (ex. src/pages/WorkflowsPage.tsx, src/pages/MetasAtividades.tsx, src/components/pipeline/PipelineBoard.tsx, src/components/activities/DailyActivityRanking.tsx), sem selo.| CONTESTADO pelo cético (PARCIAL): O selo existe em parte. Badge 'Exemplo com dados fictícios' em src/components/sales/cadence/CadenceTemplateManager.tsx:250-252 e Badge 'dados de exemplo' em src/components/cadences/MergeTagPicker.tsx:88-89. Algumas páginas removeram o mock: src/p…
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F0665 · UI primitivo src/components/ui/accordion.tsx

- **Tipo:** Componente
- **O que os docs afirmam:** Doc lista `accordion` entre os 60+ componentes shadcn/Radix do design system.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1326-1340`
- **O que falta:** Gerar o primitivo (npx shadcn add accordion) se necessário, ou remover @radix-ui/react-accordion do package.json e o item de docs/DOCUMENTACAO_SISTEMA.md:1326-1340.
- **Evidência:** ausente: ls src/components/ui/accordion.tsx → não existe; grep -rn 'Accordion\|react-accordion' src/ → 0 resultados. package.json:76 ainda declara @radix-ui/react-accordion sem uso.| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): O commit 89aacaff8 (2026-10-18, PR #285, 'chore(ui): remove código morto — arquivos inalcançáveis e exports sem consumidor') apagou src/components/ui/accordion.tsx (52 linhas). ausente: grep -rln 'Accordion' src → só preserveAspectRatio/outros, nenhum uso. A dependência @radix-ui/react-accordion ficou em package.json:76.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F0669 · UI primitivo src/components/ui/aspect-ratio.tsx

- **Tipo:** Componente
- **O que os docs afirmam:** Doc lista `aspect-ratio` entre os 60+ componentes shadcn/Radix do design system.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1326-1340`
- **O que falta:** Gerar o primitivo (npx shadcn add aspect-ratio) se necessário, ou remover a dependência e corrigir docs/DOCUMENTACAO_SISTEMA.md:1326-1340.
- **Evidência:** ausente: ls src/components/ui/aspect-ratio.tsx → não existe; grep -rn 'AspectRatio\|react-aspect-ratio' src/ → 0 resultados (só preserveAspectRatio de SVG). package.json:78 declara @radix-ui/react-aspect-ratio sem uso.| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): O commit 577723004 (2026-03-17) apagou src/components/ui/aspect-ratio.tsx num lote de limpeza de primitivos sem uso (carousel, context-menu, hover-card, menubar, navigation-menu, touch-carousel) e tirou a dependência embla-carousel-react do package.json. A mensagem ('Realigned build with TS checks') é vaga, mas o diff é só remoção de código sem uso. ausente: grep -rn AspectRatio src → só preserveAspectRatio de SVG.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F0728 · @deprecated removidos

- **Tipo:** Doc/config
- **O que os docs afirmam:** NÃO VERIFICADO.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:248`
- **O que falta:** Remover o alias Task (types.ts:33-34) migrando consumidores para TaskRecord, e a função legada em useWinLossScenarios.ts:240 migrando para tCritical.
- **Evidência:** grep -rn '@deprecated' src/ supabase/functions/ → 2 ocorrências, as mesmas registradas em docs/estado/09_HOOKS_SERVICES.md §5.4: src/hooks/tasks/types.ts:33 ('@deprecated Use TaskRecord instead') e src/hooks/win-loss/useWinLossScenarios.ts:240 ('@deprecated Use tCritical(dof, 0.95)'). docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:248 marca 'NÃO VERIFICADO'; verificado agora: nada foi removido.| cético: Confirmado. grep -rn '@deprecated' src supabase/functions → as mesmas 2 marcações de docs/estado/09_HOOKS_SERVICES.md:387-390: src/hooks/tasks/types.ts:33-34 (type Task = TaskRecord) e src/hooks/win-loss/useWinLossScenarios.ts:240. Nenhuma foi removida.

### F0739 · Arquivo src/components/layout/SystemHealthBadge.tsx citado em AUDIT_REPORT.md nunca existiu

- **Tipo:** Doc/config
- **O que os docs afirmam:** Citado como prova em AUDIT_REPORT.md; git log --all mostra que nunca existiu no repositório.
- **Fontes:** `docs/estado/14_VERIFICACAO_DA_AUDITORIA.md:143`
- **O que falta:** Corrigir docs/reports/AUDIT_REPORT.md:30 para src/components/atoms/SystemHealthBadge.tsx (ou carimbar o doc como obsoleto) e corrigir docs/estado/14_VERIFICACAO_DA_AUDITORIA.md:139 ('nunca existiu' → 'existiu 15-16/05/2026 e foi movido para atoms/').
- **Evidência:** Arquivo ausente hoje (ls src/components/layout/SystemHealthBadge.tsx → não existe), porém a afirmação 'nunca existiu' é falsa: git log --all -- src/components/layout/SystemHealthBadge.tsx → 62cf4ced7 (2026-05-15, +118 linhas) criou e 8a4445e0f (2026-05-16, −118) removeu. docs/reports/AUDIT_REPORT.md:30 continua citando o caminho layout/ sem aviso de obsoleto (cabeçalho :1-8 sem carimbo); existe componente real em src/components/atoms/SystemHealthBadge.tsx:12, montado em src/components/organisms/DesktopTopBar.tsx:25,266. A ação pendente (carimbar/arquivar docs com evidência inválida — C_estado_runbooks.md:292) não foi feita.| CONTESTADO pelo cético (NAO_APLICAVEL): O item é uma afirmação sobre histórico de git e precisão de doc, não uma funcionalidade. Mesmo assim, NAO_IMPLEMENTADO ('nenhum artefato') está errado. O artefato funcional existe em outra pasta: src/components/atoms/SystemHea…
- **Revisão:** em disputa. O cético propõe Não aplicável e o juiz ainda não decidiu.

### F0745 · Catálogo DoD por rota (175/175)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 70 NI: 01_FRONTEND_ROTAS de 08-16.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:72`
- **O que falta:** Criar docs/estado/01_FRONTEND_ROTAS.md (ou novo arquivo) com DoD por rota para as 180 rotas atuais (rota, componente, dados, mutações, estados loading/erro/vazio, testes, evidência).
- **Evidência:** docs/estado/01_FRONTEND_ROTAS.md:1-5 é medição de 2026-08-16 (commit d44e3db, 174 rotas) classificando alcançabilidade/camada de dados, não um catálogo de DoD; grep -rl 'DoD' docs/ → só docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md (linha 72, 'NI'); ls docs/estado| grep -i dod → 0. AppRoutes.tsx hoje tem 180 <Route path=> (defasagem de 6 rotas). \| CONTESTADO pelo cético (PARCIAL): Existe um catálogo por rota, embora não seja de DoD. docs/estado/01_FRONTEND_ROTAS.md:30 traz '## 1. Rotas (174) — tabela completa' (214 linhas de tabela iniciando em '\| `/'), com critério mecânico por rota em :17-24 (alcançável, camada de leitura, mutação, dado fictício). Seções :233 (inalcançáveis), :276 (guardas/RBAC) e :335 (dados fictícios). Faltam os campos de DoD (estados loading/erro/vazio, testes, evidência) e as rotas novas: são 174 medidas em 2026-08-16 (:4) contra 180 '…
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F0748 · Classe shadow-soft adaptativa light/dark e token --card-shadow multicamada

- **Tipo:** Doc/config
- **O que os docs afirmam:** Sombra suave e --card-shadow de 3 camadas no light mode.
- **Fontes:** `docs/DESIGN_SYSTEM.md:300-302,890-901`
- **O que falta:** Definir --card-shadow (3 camadas) em :root/.dark no src/index.css e @utility shadow-soft usando o token; ou remover da docs/DESIGN_SYSTEM.md.
- **Evidência:** ausente: grep -rn 'shadow-soft' src/ tailwind.config.ts → 0 resultados; grep -rn -- '--card-shadow' src/ tailwind.config.ts → 0 resultados. docs/DESIGN_SYSTEM.md:300-302 e :890-901 documentam classe e token que não existem no código.| CONTESTADO pelo cético (PARCIAL): Os nomes shadow-soft e --card-shadow não existem (grep -rln em src tailwind.config.ts → 0), mas existe o equivalente funcional com outro nome: tokens de sombra adaptativos light/dark e multicamada --shadow-sm/md/lg/xl. Light em src/index.css:1993-2001 (ex.: --shadow-sm: '0 2px 4px -1px ..., 0 1px 2px -1px ...'), dark em :2217-2221; expostos em @theme :132-136 e tailwind.config.ts:166-170. Estão em uso no Card padrão (src/components/ui/card.tsx:12 'shadow-sm hover:shadow-md'). Diferenças: 2 camadas em vez das 3 documentadas e nomes diferentes de docs/DESIGN_SYSTEM.md:300-302,890-901.
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F0776 · Etapa 70 do plano: Criar Definition of Done por rota

- **Tipo:** Doc/config
- **O que os docs afirmam:** Para as 174 rotas, exigir UI, contrato, auth, estados, testes, observabilidade e tráfego. Saída esperada: catálogo 174/174 sem “pronta” por inferência. Gate: owners.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:744-744`
- **O que falta:** Criar o catálogo DoD por rota (175 rotas de src/routes/AppRoutes.tsx, uma linha por rota com os 7 critérios e evidência), ex. docs/rotas-dod.md, e marcar a etapa 70 como feita.
- **Evidência:** Etapa segue ⬜ em docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:220 e 'NI — ausente' em docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:72. Catálogo ausente: `ls docs/rotas-dod*` → 0; `grep -rli 'definition of done' docs/` só retorna os 3 docs de plano/postmortem, nenhum catálogo por rota. docs/estado/01_FRONTEND_ROTAS.md existe mas é inventário de rotas (08-16), sem DoD (UI/contrato/auth/estados/testes/observabilidade/tráfego).
- **Revisão:** sem contestação cética concluída.

### F0777 · Etapa canônica 26/08 nº 70: Definition of Done por rota (175 rotas)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa canônica 70 (plano 26/08, matriz de status 30/08, estado ⬜): UI, contrato, auth, estados, testes, observabilidade, tráfego; catálogo sem "pronta" por inferência.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:220-220`
- **O que falta:** Idem F0776: gerar catálogo 175/175 (ou 180 paths atuais) com DoD por rota em docs/ e ligá-lo a um script de verificação estrutural.
- **Evidência:** Mesmo artefato de F0776: docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:220 (⬜, denominador 175); `ls docs/rotas-dod*` → 0 resultados; AppRoutes.tsx tem 180 `path=` únicos extraídos (grep -oE 'path="[^"]*"'| sort -u), mas nenhum catálogo de DoD os referencia.
- **Revisão:** sem contestação cética concluída.

### F0791 · Literais de status soltos (~35) em goals/tasks/activities/orders/battles/bets/quote_cadence_items/onboarding_tracks → constantes por domínio

- **Tipo:** Doc/config
- **O que os docs afirmam:** Domínios ainda comparam literal solto (=== 'completed'/'won'); criar constante por domínio no padrão SALE_STATUS. pipeline_stages.id === 'won' e AudioContext.state são exceções.
- **Fontes:** `docs/TYPE_DEBT.md:92-103`
- **O que falta:** Criar TASK_STATUS, GOAL_STATUS, ACTIVITY_STATUS, ORDER_STATUS, BATTLE_STATUS, BET_STATUS, QUOTE_CADENCE_ITEM_STATUS, ONBOARDING_TRACK_STATUS em src/constants/index.ts (padrão SALE_STATUS) e substituir os ~45 literais nos arquivos acima.
- **Evidência:** src/constants/index.ts só define DEAL_STATUS (:28) e SALE_STATUS (:95); `grep -n 'TASK_STATUS\\|GOAL_STATUS\\|ORDER_STATUS\\|BATTLE_STATUS\\|BET_STATUS\\|ACTIVITY_STATUS' src/constants/index.ts` → 0 e `grep -rln 'export const TASK_STATUS\\|GOAL_STATUS\\|ORDER_STATUS' src` → 0. Literais soltos persistem (45 ocorrências de `=== 'completed'`/`=== 'won'` fora de testes), ex.: src/hooks/bi/useChurnTaskCompletion.ts:43, src/hooks/useSDRMetrics.ts:366, src/hooks/cadences/useQuoteCadenceComparison.ts:55, src/components/competitive/BattleArena.tsx:77, PerformanceBets.tsx:281, src/components/clients/OrderDetailsDialog.tsx:47-150, OrdersTable.tsx:72. Confere com docs/TYPE_DEBT.md:92-103 (pendente).
- **Revisão:** sem contestação cética concluída.

### F0793 · Matriz botão→efeito (ações sem efeito)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 61 NI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:65`
- **O que falta:** Produzir a matriz botão→efeito (ex. docs/auditoria/matriz-botao-efeito.md ou script scripts/inventory-actions.mjs que liste onClick sem mutation/navigation) para fechar a etapa 61.
- **Evidência:** `grep -rln 'botão→efeito\\|matriz.*bot[aã]o' docs/ scripts/` só retorna os docs de plano (AUDITORIA_EXAUSTIVA_2026-08-26, A_planos_execucao.md:65 'NI — sem matriz', STATUS_100_ETAPAS); nenhum arquivo de matriz ou script de inventário de ações. (O exemplo citado 'aprovada e enviada' em ApprovalQueue.tsx não existe mais: `grep -rn 'aprovada e enviada' src` → 0.)
- **Revisão:** sem contestação cética concluída.

### F0838 · Storybook / Component-Driven Development

- **Tipo:** Doc/config
- **O que os docs afirmam:** Componentes isolados via Storybook ou equivalente.
- **Fontes:** `docs/ENGINEERING_MANIFESTO.md:15`
- **O que falta:** Configurar Storybook (ou equivalente) ou documentar a alternativa formal.
- **Evidência:** ausente: `ls -d .storybook` → não existe; `grep -i 'storybook\|ladle\|histoire' package.json` → 0 resultados; `grep -rni storybook docs/` → só docs/ENGINEERING_MANIFESTO.md:15 (diretriz aspiracional: 'Storybook ou padrões de isolamento total'), nenhuma alternativa documentada.| cético: ausente: `ls -d .storybook` → não existe; `grep -ci storybook package.json` → 0; `grep -rli 'storybook\|ladle' docs` → só docs/ENGINEERING_MANIFESTO.md.

### F0863 · VITE_USE_MOCK_DATA em .env.example não implementado

- **Tipo:** Doc/config
- **O que os docs afirmam:** .env.example:44 sugere flag de mock sem implementação.
- **Fontes:** `docs/estado/13_INTEGRACOES.md:90`
- **O que falta:** Nenhum artefato (nem no .env.example citado). Corrigir docs/estado/13_INTEGRACOES.md:90 que aponta linha inexistente; não há flag de mock a implementar.
- **Evidência:** Flag inexistente em todo o repo: `grep -n VITE_USE_MOCK_DATA .env.example` → 0; `grep -rn VITE_USE_MOCK_DATA src/ supabase/ scripts/ vite.config.ts` → 0; `grep -rln USE_MOCK .` → só docs/estado/13_INTEGRACOES.md e docs/estado/14_VERIFICACAO_DA_AUDITORIA.md; `git log -S VITE_USE_MOCK_DATA -- .env.example src` → 0 commits. .env.example:12-23 lista só VITE_SUPABASE_URL/PUBLISHABLE_KEY/ANON_KEY/SENTRY_DSN.
- **Revisão:** sem contestação cética concluída.

### F3443 · Haptics

- **Tipo:** Hook
- **O que os docs afirmam:** Feedback háptico.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:618-618`
- **O que falta:** hook useHaptics ausente (hooks.json e arquivos src/)
- **Evidência:** hook useHaptics ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (IMPLEMENTADO): src/lib/haptics.ts:16-22 implementa triggerHaptic() usando navigator.vibrate (o próprio item já listava 'navigator.vibrate' como artefato esperado alternativo ao hook); usado em interações reais: src/components/atoms/ThemeToggle.tsx (import e chamada em handleToggle), src/components/ui/button.tsx e src/components/race/ReactionBar.tsx (grep -rln navigator.vibrate src).
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3444 · Helper órfão useAnnounce

- **Tipo:** Hook
- **O que os docs afirmam:** useAnnounce: A11y announcer não plugado em rotas; arquivo de lógica pura nunca importado (ou quase).
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:127`
- **O que falta:** arquivo src/hooks/useAnnounce.ts não existe no HEAD atual
- **Evidência:** hook useAnnounce ausente (hooks.json e arquivos src/)| cético: ausente: find src -iname "useAnnounce*" → 0 resultados; grep -rln useAnnounce src → 0 resultados

### F3445 · Helper órfão useCursorPagination

- **Tipo:** Hook
- **O que os docs afirmam:** useCursorPagination: paginação cursor-based não adotada nas listas grandes; arquivo de lógica pura nunca importado (ou quase).
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:122`
- **O que falta:** arquivo src/hooks/useCursorPagination.ts não existe no HEAD atual
- **Evidência:** hook useCursorPagination ausente (hooks.json e arquivos src/)| cético: ausente: find src -iname "useCursorPagination*" → 0 resultados; grep -rln useCursorPagination src → 0 resultados

### F3446 · Helper órfão useOptimisticMutation

- **Tipo:** Hook
- **O que os docs afirmam:** useOptimisticMutation: wrapper de mutations otimistas não aplicado em CRUDs; arquivo de lógica pura nunca importado (ou quase).
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:123`
- **O que falta:** arquivo src/hooks/useOptimisticMutation.ts não existe no HEAD atual
- **Evidência:** hook useOptimisticMutation ausente (hooks.json e arquivos src/)| cético: ausente: find src -iname "useOptimisticMutation*" → 0 resultados; grep -rln useOptimisticMutation src → 0 resultados

### F3447 · Helper órfão usePrefetchRoute

- **Tipo:** Hook
- **O que os docs afirmam:** usePrefetchRoute: prefetch de rotas não usado; arquivo de lógica pura nunca importado (ou quase).
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:128`
- **O que falta:** arquivo src/hooks/usePrefetchRoute.ts não existe no HEAD atual
- **Evidência:** hook usePrefetchRoute ausente (hooks.json e arquivos src/)| cético: ausente: find src -iname "usePrefetchRoute*" → 0 resultados; grep -rln usePrefetchRoute src → 0 resultados

### F3448 · Helper órfão useUnsavedChanges

- **Tipo:** Hook
- **O que os docs afirmam:** useUnsavedChanges: guard de mudanças não salvas não plugado em forms; arquivo de lógica pura nunca importado (ou quase).
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:126`
- **O que falta:** arquivo src/hooks/useUnsavedChanges.ts não existe no HEAD atual
- **Evidência:** hook useUnsavedChanges ausente (hooks.json e arquivos src/)| cético: ausente: find src -iname "useUnsavedChanges*" → 0 resultados; grep -rln useUnsavedChanges src → 0 resultados

### F3449 · Hook órfão useIsDesktop

- **Tipo:** Hook
- **O que os docs afirmam:** Exportado em `src/hooks/useMediaQuery.ts` com zero referência em src/, tests/ e scripts/, inclusive dentro do próprio arquivo (critério rg -w).
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:187`
- **O que falta:** símbolo useIsDesktop não existe em src/hooks/useMediaQuery.ts nem em nenhum outro arquivo
- **Evidência:** hook useIsDesktop ausente (hooks.json e arquivos src/)| cético: src/hooks/useMediaQuery.ts:1-38 (arquivo lido inteiro) só exporta useMediaQuery, useIsMobile e usePrefersReducedMotion — useIsDesktop não existe mais nesse arquivo, mais grave que 'órfão' (nem a definição está presente)

### F3450 · Hook órfão useIsTablet

- **Tipo:** Hook
- **O que os docs afirmam:** Exportado em `src/hooks/useMediaQuery.ts` com zero referência em src/, tests/ e scripts/, inclusive dentro do próprio arquivo (critério rg -w).
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:188`
- **O que falta:** símbolo useIsTablet não existe em src/hooks/useMediaQuery.ts nem em nenhum outro arquivo
- **Evidência:** hook useIsTablet ausente (hooks.json e arquivos src/)| cético: src/hooks/useMediaQuery.ts:1-38 (arquivo lido inteiro) só exporta useMediaQuery, useIsMobile e usePrefersReducedMotion — useIsTablet não existe nesse arquivo

### F3451 · Hook órfão useIsTouchDevice

- **Tipo:** Hook
- **O que os docs afirmam:** Exportado em `src/hooks/useMediaQuery.ts` com zero referência em src/, tests/ e scripts/, inclusive dentro do próprio arquivo (critério rg -w).
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:189`
- **O que falta:** símbolo useIsTouchDevice não existe em src/hooks/useMediaQuery.ts nem em nenhum outro arquivo
- **Evidência:** hook useIsTouchDevice ausente (hooks.json e arquivos src/)| cético: src/hooks/useMediaQuery.ts:1-38 (arquivo lido inteiro) só exporta useMediaQuery, useIsMobile e usePrefersReducedMotion — useIsTouchDevice não existe nesse arquivo

### F3452 · Hook órfão usePrefersDarkMode

- **Tipo:** Hook
- **O que os docs afirmam:** Exportado em `src/hooks/useMediaQuery.ts` com zero referência em src/, tests/ e scripts/, inclusive dentro do próprio arquivo (critério rg -w).
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:195`
- **O que falta:** símbolo usePrefersDarkMode não existe em src/hooks/useMediaQuery.ts nem em nenhum outro arquivo
- **Evidência:** hook usePrefersDarkMode ausente (hooks.json e arquivos src/)| cético: src/hooks/useMediaQuery.ts:1-38 (arquivo lido inteiro) só exporta useMediaQuery, useIsMobile e usePrefersReducedMotion — usePrefersDarkMode não existe nesse arquivo

### F3453 · Hook useAsync.ts

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `useAsync.ts` — async wrapper.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1274-1322`
- **O que falta:** arquivo src/hooks/useAsync.ts (wrapper async genérico) não existe no HEAD atual
- **Evidência:** hook useAsync ausente (hooks.json e arquivos src/)| cético: ausente: find src -iname "useAsync.ts" → 0 resultados; único achado parecido é src/hooks/win-loss/useAsyncReplayQueue.ts, hook de domínio (fila de replay de win-loss) não relacionado a um wrapper async genérico

### F3454 · Hook useAutoSave.ts

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `useAutoSave.ts` — auto-save.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1274-1322`
- **O que falta:** arquivo src/hooks/useAutoSave.ts não existe no HEAD atual
- **Evidência:** hook useAutoSave ausente (hooks.json e arquivos src/)| cético: ausente: find src -iname "useAutoSave*" → 0 resultados; grep -rln useAutoSave src → 0 resultados

### F3455 · Hook useBulkSelection.ts

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `useBulkSelection.ts` — seleção em massa.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1274-1322`
- **O que falta:** arquivo src/hooks/useBulkSelection.ts não existe no HEAD atual
- **Evidência:** hook useBulkSelection ausente (hooks.json e arquivos src/)| cético: ausente: find src -iname "useBulkSelection*" → 0 resultados; grep -rln useBulkSelection src → 0 resultados

### F3457 · Hook useCopyToClipboard.tsx

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `useCopyToClipboard.tsx` — copiar para clipboard.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1274-1322`
- **O que falta:** arquivo src/hooks/useCopyToClipboard.tsx não existe no HEAD atual
- **Evidência:** hook useCopyToClipboard ausente (hooks.json e arquivos src/)| cético: ausente: find src -iname "useCopyToClipboard*" → 0 resultados; grep -rln useCopyToClipboard src → 0 resultados

### F3458 · Hook useDataExport.ts

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `useDataExport.ts` — exportação de dados.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1274-1322`
- **O que falta:** arquivo src/hooks/useDataExport.ts não existe no HEAD atual
- **Evidência:** hook useDataExport ausente (hooks.json e arquivos src/)| cético: ausente: find src -iname "useDataExport*" → 0 resultados; grep -rln useDataExport src → 0 resultados

### F3459 · Hook useDataImport.ts

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `useDataImport.ts` — importação de dados.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1274-1322`
- **O que falta:** arquivo src/hooks/useDataImport.ts não existe no HEAD atual
- **Evidência:** hook useDataImport ausente (hooks.json e arquivos src/)| cético: ausente: find src -iname "useDataImport*" → 0 resultados; grep -rln useDataImport src → 0 resultados

### F3460 · Hook useDebounce.ts

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `useDebounce.ts` — debounce.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1274-1322`
- **O que falta:** hook useDebounce ausente (hooks.json e arquivos src/)
- **Evidência:** hook useDebounce ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (IMPLEMENTADO): não existe arquivo literal useDebounce.ts, mas a funcionalidade de debounce está implementada sob outro nome e amplamente integrada: src/hooks/useDebouncedValue.ts (hook completo) é importado em 5 pontos reais — src/components/bi/ClientSelector.tsx, src/components/win-loss/ScenarioForecastChart.tsx, src/hooks/conversational/useCallLibrarySearch.ts, src/pages/Clientes.tsx, src/pages/Vendas.tsx (grep -rln useDebouncedValue src).
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3461 · Hook useEnhancedToast.ts

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `useEnhancedToast.ts` — toast aprimorado.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1274-1322`
- **O que falta:** arquivo src/hooks/useEnhancedToast.ts não existe no HEAD atual
- **Evidência:** hook useEnhancedToast ausente (hooks.json e arquivos src/)| cético: ausente: find src -iname "useEnhancedToast*" → 0 resultados; grep -rln useEnhancedToast src → 0 resultados

### F3462 · Hook useFilter.ts

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `useFilter.ts` — filtros genéricos.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1274-1322`
- **O que falta:** um hook de filtro genérico (src/hooks/useFilter.ts) não existe; só há implementações de filtro duplicadas por domínio
- **Evidência:** hook useFilter ausente (hooks.json e arquivos src/)| cético: ausente como hook genérico: find src -iname "useFilter.ts" → 0 resultados. Existem apenas hooks de domínio com nome parecido mas não equivalentes — src/hooks/customer-success/useFilteredCS360Data.ts:12 e src/hooks/win-loss/useWinLossData.ts:22 (useFilteredWinLossAnalyses) — ambos acoplados a uma entidade específica, não um 'useFilter' genérico reutilizável como descrito.

### F3463 · Hook useFuzzySearch.ts

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `useFuzzySearch.ts` — busca fuzzy (Fuse.js).
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1274-1322`
- **O que falta:** hook useFuzzySearch ausente (hooks.json e arquivos src/)
- **Evidência:** hook useFuzzySearch ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (PARCIAL): não existe hook src/hooks/useFuzzySearch.ts, mas a funcionalidade de busca fuzzy com Fuse.js existe e funciona, implementada inline (sem hook compartilhado) em 6 arquivos: src/components/molecules/GlobalSearch.tsx:11,50 (`import Fuse from 'fuse.js'`, `new Fuse(...)`), src/components/settings/PermissionMatrix.tsx, src/components/activities/ActivityList.tsx, src/components/security/PasswordResetApproval.tsx, src/components/analytics/ObjectionsLibrary.tsx, src/pages/Produtos.tsx (grep -rln fuse.js src); dependência fuse.js@7.5.0 em package.json:121.
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F3464 · Hook useHapticFeedback.ts

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `useHapticFeedback.ts` — feedback háptico.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1274-1322`
- **O que falta:** não há hook useHapticFeedback.ts em src/hooks; a função equivalente mora em src/lib/haptics.ts e não é um hook React
- **Evidência:** hook useHapticFeedback ausente (hooks.json e arquivos src/)| cético: ausente como hook: find src/hooks -iname "useHapticFeedback*" → 0 resultados; o critério deste item exige arquivo em src/hooks (diferente de F3443, cujo próprio artefato esperado já previa 'navigator.vibrate' como alternativa). Existe utilitário relacionado mas fora de src/hooks: src/lib/haptics.ts:16-22 (triggerHaptic/navigator.vibrate), que não satisfaz o critério específico deste item ('arquivo existe em src/hooks... exporta o hook').

### F3465 · Hook useIdleDetection.ts

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `useIdleDetection.ts` — detecção de ociosidade.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1274-1322`
- **O que falta:** hook useIdleDetection ausente (hooks.json e arquivos src/)
- **Evidência:** hook useIdleDetection ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): git show --stat 98d848e3b (2026-03-05, 'Cleaned up orphaned codebase') → 'src/hooks/useIdleDetection.ts \| 108 -------'. Hoje: find src -iname '_useIdleDetection_' → 0; grep -rl 'useIdleDetection' src → 0.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3466 · Hook useInfiniteQuery (2 afirmações nos docs)

- **Tipo:** Hook
- **O que os docs afirmam:** Doc aponta 4 .range( para 1.022 .select( (truncamento silencioso em 1.000 linhas); ação: pagedQuery + useInfiniteQuery nas 20 páginas de maior volume.| T9 P: só 2 lugares.
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:306,313,551-557,576`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:330`
- **O que falta:** hook useInfiniteQuery ausente (hooks.json e arquivos src/)
- **Evidência:** hook useInfiniteQuery ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (PARCIAL): Existe helper de paginação: src/lib/supabase/fetchAllRows.ts:21 (export async function fetchAllRows), usado em 9 arquivos de src. useInfiniteQuery existe em src/hooks/conversational/useCallRecordings.ts:2,105 com .range(), em uso por src/components/conversational/RecordingSummaryDrawer.tsx. Há 19 chamadas .range( (ex.: src/services/clientService.ts:69, src/services/salesService.ts:211), contra 1.028 .select( em src. src/lib/db/pagedQuery: ausente (grep -rl pagedQuery src → 0).
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F3467 · Hook useIntersection.ts

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `useIntersection.ts` — Intersection Observer.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1274-1322`
- **O que falta:** hook useIntersection ausente (hooks.json e arquivos src/)
- **Evidência:** hook useIntersection ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): git show --stat c2a66d92b ('Refactored codebase cleanup', 2026-03-05) → 'src/hooks/useIntersection.ts \| 144 ----------'. Hoje 0 arquivos e 0 referências em src. O IntersectionObserver ficou em src/components/common/LazyVisible.tsx.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3468 · Hook useLocalStorage.ts

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `useLocalStorage.ts` — local storage.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1274-1322`
- **O que falta:** hook useLocalStorage ausente (hooks.json e arquivos src/)
- **Evidência:** hook useLocalStorage ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): git show --stat 98d848e3b ('Cleaned up orphaned codebase') → 'src/hooks/useLocalStorage.ts \| 31 --'. Hoje: find src -iname '_useLocalStorage_' → 0; grep 'useLocalStorage' src → 0.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3469 · Hook useOnboarding.ts

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `useOnboarding.ts` — onboarding.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1274-1322`
- **O que falta:** hook useOnboarding ausente (hooks.json e arquivos src/)
- **Evidência:** hook useOnboarding ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): git show --stat 58526ab8a → 'src/hooks/useOnboarding.ts \| 70 ------' e 'src/components/onboarding/OnboardingWizard.tsx \| 286 ---'. O onboarding hoje é feito por src/hooks/useOnboardingChecklist.ts:20-34, que lê dado real (salespeople, sales, sales_goals). Ele é consumido por src/components/onboarding/OnboardingChecklist.tsx, montado em src/pages/Index.tsx:189 (rota /dashboard).
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3470 · Hook useOnlineStatus.ts

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `useOnlineStatus.ts` — status online.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1274-1322`
- **O que falta:** hook useOnlineStatus ausente (hooks.json e arquivos src/)
- **Evidência:** hook useOnlineStatus ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): git show --stat 98d848e3b ('Cleaned up orphaned codebase') → 'src/hooks/useOnlineStatus.ts \| 103 -------'. Hoje 0 arquivos e 0 referências. navigator.onLine é lido direto em src/components/atoms/SystemHealthBadge.tsx e src/components/arena/ArenaStatusBadge.tsx.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3471 · Hook usePageAnalytics (tracking de páginas visitadas)

- **Tipo:** Hook
- **O que os docs afirmam:** Backend/hook pronto para tracking de páginas visitadas; UI atual: 2 imports.
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:88`
- **O que falta:** hook usePageAnalytics ausente (hooks.json e arquivos src/)
- **Evidência:** hook usePageAnalytics ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): git show --stat ed46bc02b (2026-05-31, 'refactor: delete 22 more orphaned hook files') → 'src/hooks/usePageAnalytics.ts \| 85 -----'. Hoje: grep -rl usePageAnalytics src → 0.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3472 · Hook usePrefetch.ts

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `usePrefetch.ts` — prefetch de dados.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1274-1322`
- **O que falta:** hook usePrefetch ausente (hooks.json e arquivos src/)
- **Evidência:** hook usePrefetch ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): git show --stat 98d848e3b → 'src/hooks/usePrefetch.ts \| 121 --------'. ed46bc02b → 'src/hooks/usePrefetchRoute.ts \| 36 ---'. O prefetch hoje fica em src/routes/lazyPages.ts:19 (lazyWithPrefetch) e src/pages/Index.tsx:138-143 (preload no idle).
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3473 · Hook useProductTour.ts

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `useProductTour.ts` — tour do produto.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1274-1322`
- **O que falta:** hook useProductTour ausente (hooks.json e arquivos src/)
- **Evidência:** hook useProductTour ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): git show --stat 98d848e3b ('Cleaned up orphaned codebase') → 'src/hooks/useProductTour.ts \| 131 --------'. Hoje: grep -rliE 'useProductTour\|joyride\|driver.js' src → 0 (só aparecem 'tournament' e similares, sem relação).
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3474 · Hook usePWA (2 afirmações nos docs)

- **Tipo:** Hook
- **O que os docs afirmam:** usePWA: controles PWA não expostos em UI; arquivo de lógica pura nunca importado (ou quase).| Doc lista o hook `usePWA.ts` — Progressive Web App.
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:129`, `docs/DOCUMENTACAO_SISTEMA.md:1274-1322`
- **O que falta:** hook usePWA ausente (hooks.json e arquivos src/)
- **Evidência:** hook usePWA ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): git show --stat ed46bc02b ('refactor: delete 22 more orphaned hook files') → 'src/hooks/usePWA.ts \| 159 -----'. O próprio doc já o dava como órfão e candidato a remoção. O PWA continua sem hook: vite.config.ts:12-45 (VitePWA, injectRegister:false) e index.html:100 carrega public/register-sw.js:18, que registra /pwa-sw.js.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3476 · Hook useRetry.ts

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `useRetry.ts` — retry pattern.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1274-1322`
- **O que falta:** hook useRetry ausente (hooks.json e arquivos src/)
- **Evidência:** hook useRetry ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): git show --stat 98d848e3b → 'src/hooks/useRetry.ts \| 96 ------' (também em 018359428, 'Clean up orphan components and hooks'). O retry hoje fica em src/hooks/useRetryMutation.ts:14-25, consumido em src/hooks/sales/useSalesData.ts:4,54, e no retry global do QueryClient em src/App.tsx:40-64.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3477 · Hook useScrollPosition.ts

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `useScrollPosition.ts` — posição de scroll.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1274-1322`
- **O que falta:** hook useScrollPosition ausente (hooks.json e arquivos src/)
- **Evidência:** hook useScrollPosition ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): git show --stat 98d848e3b → 'src/hooks/useScrollPosition.ts \| 134 --------'. Quem sucede é src/hooks/useScrollRestoration.ts:1-15, que guarda posições de scroll em sessionStorage e é montado em src/components/templates/MainLayout.tsx.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3478 · Hook useSoundEffects.ts

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `useSoundEffects.ts` — efeitos sonoros.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:988,1237-1249`
- **O que falta:** hook useSoundEffects ausente (hooks.json e arquivos src/)
- **Evidência:** hook useSoundEffects ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): git show --stat 98d848e3b → 'src/hooks/useSoundEffects.ts \| 222 --------------'. Os sons hoje ficam em src/hooks/useSoundSettings.ts (AudioContext), consumido em src/components/settings/SoundSettings.tsx e src/hooks/useCelebration.ts, e em src/hooks/race/useRaceSounds.ts.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3479 · Hook useThrottle.ts

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `useThrottle.ts` — throttle.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1274-1322`
- **O que falta:** hook useThrottle ausente (hooks.json e arquivos src/)
- **Evidência:** hook useThrottle ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): git show --stat 98d848e3b ('Cleaned up orphaned codebase') → 'src/hooks/useThrottle.ts \| 102 -------'. Hoje: grep -rl useThrottle src → 0. O throttle ficou inline em src/hooks/useSessionManagement.ts:109.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3480 · Hook useTimer.ts

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `useTimer.ts` — timer.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1274-1322`
- **O que falta:** hook useTimer ausente (hooks.json e arquivos src/)
- **Evidência:** hook useTimer ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): git show --stat 98d848e3b → 'src/hooks/useTimer.ts \| 197 ------------' (também em 018359428, 'Clean up orphan components and hooks'). Hoje: grep -rl '\buseTimer\b' src → 0.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3481 · Hook useUndoable.ts

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `useUndoable.ts` — undo/redo.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1274-1322`
- **O que falta:** hook useUndoable ausente (hooks.json e arquivos src/)
- **Evidência:** hook useUndoable ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): git show --stat 98d848e3b ('Cleaned up orphaned codebase') → 'src/hooks/useUndoable.ts \| 120 --------'. Hoje: grep -rl useUndoable src → 0.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3482 · Keyboard shortcuts globais

- **Tipo:** Hook
- **O que os docs afirmam:** Atalhos de teclado.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:637-637`
- **O que falta:** hook useKeyboardShortcuts ausente (hooks.json e arquivos src/)
- **Evidência:** hook useKeyboardShortcuts ausente (hooks.json e arquivos src/)| CONTESTADO pelo cético (PARCIAL): Os atalhos existem com outro nome: src/hooks/useGlobalKeyboardShortcuts.ts:24 é usado em src/components/keyboard/KeyboardShortcutsProvider.tsx:149-156, montado globalmente em src/App.tsx:105-120. Funcionam de verdade: as sequências G+tecla com navigate (Provider.tsx:83-142), Alt+← para voltar, alternar tema, e o diálogo 'Atalhos de Teclado' (Provider.tsx:237). Problema: os atalhos de busca (Ctrl+K e /), nova venda (Ctrl+N) e novo cliente chamam searchHandlerRef/newSaleHandlerRef/newClientHandlerRef (Provider.tsx:47-61). Esses handlers só são preenchidos via registerSearchHandler e similares, expostos por um contexto que nunca é exportado (Provider.tsx:32, createContext sem export; o único export é a l.38). grep -rn 'register(Search\|NewSale\|NewClient)Handler' src fora do Provider → 0.
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F0883 · App nativo iOS/Android (hoje PWA)

- **Tipo:** Outro
- **O que os docs afirmam:** Hoje é PWA; falta app nativo.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:114`
- **O que falta:** Projeto nativo (Capacitor ou React Native) com build iOS/Android e publicação nas lojas; hoje nenhum artefato.
- **Evidência:** Só PWA: package.json:185 vite-plugin-pwa, vite.config.ts:4,12 VitePWA, public/manifest.json. `rg -i 'capacitor\|react-native\|expo' package.json vite.config.ts` → 0 resultados.
- **Revisão:** sem contestação cética concluída.

### F0884 · App nativo/offline/scanner de cartão/notas de voz/check-in geo/rotas

- **Tipo:** Outro
- **O que os docs afirmam:** Só PWA via VitePWA; geolocation, MediaRecorder e OCR = 0.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:37`
- **O que falta:** Implementar check-in por geolocalização, notas de voz (MediaRecorder) e scanner de cartão (OCR) — nenhum existe além do PWA.
- **Evidência:** vite.config.ts:12 VitePWA presente; `rg -n 'geolocation\|MediaRecorder\|getUserMedia\|tesseract' src/` → 0 resultados (nenhum check-in geo, nota de voz ou OCR).
- **Revisão:** sem contestação cética concluída.

### F0886 · Custom Apps (mini-apps internos)

- **Tipo:** Outro
- **O que os docs afirmam:** Falta mini-apps internos.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:148`
- **O que falta:** Mecanismo de registro de mini-apps (tabela + renderização dinâmica no menu/rotas); nenhum artefato existe.
- **Evidência:** ausente: `rg -i 'mini-?app\|custom.?app\|miniApp' src/` → 0 resultados; src/components/layout/sidebar/sidebarMenuData.ts é menu estático sem registro dinâmico.
- **Revisão:** sem contestação cética concluída.

### F0888 · i18n / multi-idioma

- **Tipo:** Outro
- **O que os docs afirmam:** UI hardcoded em pt-BR; nenhum framework multi-idioma.
- **Fontes:** `docs/FEATURE_SUMMARY.md:87-87`
- **O que falta:** Framework i18n instalado e strings extraídas; hoje UI toda em pt-BR hardcoded (confirmado conforme o doc).
- **Evidência:** ausente: `rg 'i18next\|react-intl\|lingui\|formatjs' package.json` → 0 resultados; `ls src/locales src/i18n` → não existem.
- **Revisão:** sem contestação cética concluída.

### F0889 · Lightning App Builder equivalente

- **Tipo:** Outro
- **O que os docs afirmam:** Falta construtor de apps/páginas drag-and-drop.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:152`
- **O que falta:** Construtor de páginas/apps drag-and-drop genérico; o DashboardLayoutEditor cobre só layout de widgets do Win/Loss.
- **Evidência:** Só existe @dnd-kit (package.json:71-73) usado em src/components/tasks/TaskQueue.tsx:14 (fila de tarefas) e src/components/win-loss/DashboardLayoutEditor.tsx (reordenar widgets de um dashboard, montado em src/pages/WinLossIntelligence.tsx:525); `rg -i 'page.?builder\|app.?builder'` src/ → 0 resultados.
- **Revisão:** sem contestação cética concluída.

### F3483 · 19 rotas citadas em FUNCIONALIDADES_COMPLETAS inexistentes em AppRoutes

- **Tipo:** Rota/tela
- **O que os docs afirmam:** 19 rotas do doc não existem (ex.: /smart-search, /client-health, /approval-workflows, /forecast-ponderado, /security); único Navigate em AppRoutes.tsx:275. Doc DIVERGENTE.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:39`
- **O que falta:** rota /smart-search não existe em src/routes/AppRoutes.tsx (rotas.json)
- **Evidência:** rota /smart-search não existe em src/routes/AppRoutes.tsx (rotas.json)| CONTESTADO pelo cético (NAO_APLICAVEL): O item é uma divergência de documentação, e ela já foi resolvida: docs/FUNCIONALIDADES_COMPLETAS.md:4 diz 'Revisado contra o HEAD em 2026-10-18 (rotas corrigidas para os paths reais de src/routes/AppRoutes.tsx)'. grep -n 'smart-search\|client-health\|approval-workflows\|forecast-ponderado\|/security' docs/FUNCIONALIDADES_COMPLETAS.md → 0. As 84 rotas citadas no doc (em backticks) batem 100% com os path= de AppRoutes.tsx (comm -23 → 0 faltando).
- **Revisão:** em disputa. O cético propõe Não aplicável e o juiz ainda não decidiu.

### F3485 · Rota /dashboard (8 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** API.md declara a rota `/dashboard/*` renderizando o componente NotFound com acesso "autenticado".| API.md declara a rota `/dashboard` renderizando o componente Index com acesso "autenticado". \| Rota registrada em AppRoutes.tsx com acesso "autenticado", GET em produção 200, chamando as edge functions enrich-lead, generate-executive-briefing, nlq-query, notify-ranking-position, revenue-forecast-ai, rotate-daily-challenges. Status no doc: BLOQUEADO: edge nlq-query, rotate-daily-challenges indisponível \| Rota registrada em AppRoutes.tsx com acesso "autenticado", GET em produção 200. Status no doc: OK \| Rota /dashboard (AppRoutes.tsx:109) renderiza src/pages/Index.tsx; sem role explícito (só …
- **Fontes:** `docs/API.md:289-289`, `docs/API.md:287-287`, `docs/prod-readiness.md:149`, `docs/prod-readiness.md:152`, `docs/estado/01_FRONTEND_ROTAS.md:46-46`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:203-205` e mais 2
- **O que falta:** rota /dashboard não existe em src/routes/AppRoutes.tsx (rotas.json)
- **Evidência:** rota /dashboard não existe em src/routes/AppRoutes.tsx (rotas.json)| CONTESTADO pelo cético (PARCIAL): A rota existe: AppRoutes.tsx:252 (/dashboard → Index), :254 (/dashboard/* → NotFound) e :249-251 (/ → Navigate /dashboard/visao-geral), dentro de <ProtectedRoute> (l.241). Menu: sidebarMenuData.ts:246-251. Index.tsx:120-131 lê dado real (useDashboardKPIsPeriod, useGoalsDashboard, useSalesChartData, useSalesRealtime). Mas duas edge functions chamadas na árvore estão fora da allowlist em deploy.yml:144 (100 itens). (1) nlq-query: src/hooks/nlq/useNLQ.ts:53, via DashboardNLQWidget em src/components/dashboard/modules/AnalyticsModule.tsx:1,15. (2) rotate-daily-challenges: src/components/gamification/DailyChallengesCard.tsx:58, montado em CompetitionModule.tsx:53. enrich-lead, generate-executive-briefing, notify-ranking-position e revenue-forecast-ai estão na allowlist.
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F3486 · Rota /dashboard/:section (5 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** API.md declara a rota `/dashboard/:section` renderizando o componente Index com acesso "autenticado".| Rota registrada em AppRoutes.tsx com acesso "autenticado", GET em produção 200, chamando as edge functions enrich-lead, generate-executive-briefing, nlq-query, notify-ranking-position, revenue-forecast-ai, rotate-daily-challenges. Status no doc: BLOQUEADO: edge nlq-query, rotate-daily-challenges indisponível \| Menu usa visao-geral, performance, analises, competicao, inteligencia, engajamento; doc não enumerou quais sections o Index.tsx trata. \| Rota /dashboard/:section (AppRoutes.tsx:110) renderiza src/pages/Index.tsx; sem role explícito (só autenticação global). Classificação do doc: IM…
- **Fontes:** `docs/API.md:288-288`, `docs/prod-readiness.md:151`, `docs/estado/01_FRONTEND_ROTAS.md:398-398`, `docs/estado/01_FRONTEND_ROTAS.md:47-47`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:203-205`
- **O que falta:** rota /dashboard/:section não existe em src/routes/AppRoutes.tsx (rotas.json)
- **Evidência:** rota /dashboard/:section não existe em src/routes/AppRoutes.tsx (rotas.json)| CONTESTADO pelo cético (PARCIAL): A rota existe: AppRoutes.tsx:253 (/dashboard/:section → Index), sob ProtectedRoute (l.241). Index.tsx:105-111 trata as sections performance, analises, competicao, inteligencia e engajamento, mais visao-geral (l.135). Section desconhecida vai para Navigate /404 (l.146-147), que cai no path='*' → NotFound (AppRoutes.tsx:1143). O menu tem as 6 sections em sidebarMenuData.ts:246-251. Mesma lacuna de edges da F3485: nlq-query (useNLQ.ts:53, seção análises) e rotate-daily-challenges (DailyChallengesCard.tsx:58, seção competição) estão fora da allowlist em deploy.yml:144.
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F0914 · Multi-timezone awareness

- **Tipo:** Service/lib
- **O que os docs afirmam:** Falta tratamento de fuso horário por usuário.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:162`
- **O que falta:** Coluna de fuso por usuário com RLS, mais um hook que o aplique nas datas da UI e nos agendamentos.
- **Evidência:** Banco real: tabela profiles não existe (grep 'public.profiles' tables.md → 0; tables/public/ só tem send_time_profiles, contact_send_time_profile); nenhuma tabela de usuário tem fuso (grep timezone em tables.md → 0; colunas timezone só em auto_task_queue_settings.md:23, cadence_alert_templates.md:30, cadence_outcome_rules.md:30, default 'America/Sao_Paulo'). Front: src/types/index.ts:71 timezone?: string no tipo Profile, mas rg '\.timezone' em src/hooks e src/contexts → 0; usos de timezone são por regra de cadência/fila (src/components/sales/cadence/CadenceOutcomeConfig.tsx:81, src/pages/AdminFilaTarefasAutomaticas.tsx:64), não por usuário. src/utils/dateHelpers.ts usa o fuso do navegador.| cético: Banco real: grep timezone em tables/public/*.md → só auto_task_queue_settings, cadence_alert_templates, cadence_outcome_rules e send_time_profiles. send_time_profiles é por venda (policy em s…

### F3487 · Retry com exponential backoff (React Query)

- **Tipo:** Service/lib
- **O que os docs afirmam:** Retentativas com backoff.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:646-646`
- **O que falta:** arquivo QueryClient ausente em src/
- **Evidência:** arquivo QueryClient ausente em src/| CONTESTADO pelo cético (IMPLEMENTADO): src/App.tsx:33-64: o QueryClient define retry nas queries (até 2 tentativas, sem retry em 401/403) e nas mutations (só erro de rede ou 5xx). Não há retryDelay no App, então vale o padrão do TanStack v5 (package.json:106 ^5.105.1). Esse padrão é exponencial: node_modules/@tanstack/query-core/build/modern/retryer.js:11-13 'Math.min(1e3 * 2 ** failureCount, 3e4)', aplicado na l.130 'config.retryDelay ?? defaultRetryDelay'. A pré-checagem procurou um arquivo QueryClient, mas a configuração fica em App.tsx.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3491 · Service/lib config (3 afirmações nos docs)

- **Tipo:** Service/lib
- **O que os docs afirmam:** A.13 P: só shell offline (vite.config.ts:17-30).| Doc afirma vite manualChunks com 17 buckets, PWA com precache seletivo e chunked-in.ts contra estouro de URL do PostgREST. \| Backlog: SDR registra atividades offline com sincronização posterior (prioridade média).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:455`, `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:302`, `docs/auditoria_enterprise_v5.md:71`
- **O que falta:** arquivo config ausente em src/
- **Evidência:** arquivo config ausente em src/| CONTESTADO pelo cético (PARCIAL): vite.config.ts:145 define manualChunks. vite.config.ts:12-45 configura VitePWA com precache seletivo (globPatterns l.24-29), navigateFallback e runtimeCaching NetworkFirst para *.supabase.co. O SW é registrado por index.html:100 → public/register-sw.js:18. chunked-in existe: supabase/functions/_shared/chunked-in.ts (usado em 40 arquivos de edge) e src/lib/supabase/chunkedIn.ts (28 arquivos de src). A fila offline para o SDR não existe: grep -rliE 'indexedDB\|idb-keyval\|offlineQueue' src → 0.
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F3494 · Colunas fantasmas de notifications (is_read, severity, read)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Segundo CREATE (mig/20260509113031) declara is_read/severity/read que não existem.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:246`
- **O que falta:** coluna is_read ausente em tables/public/notifications.md (tabela existe)
- **Evidência:** coluna is_read ausente em tables/public/notifications.md (tabela existe)| CONTESTADO pelo cético (IMPLEMENTADO): O critério é 'colunas reais em types.ts e UI usa as corretas', e está cumprido. O banco real (tables/public/notifications.md, colunas 1-15) tem read_at, archived_at e priority, sem is_read/severity/read. A tabela notifications em src/integrations/supabase/types.ts também tem read_at, sem is_read/severity. A UI usa as colunas certas: src/hooks/useNotifications.ts:104 (.update read_at), :139 (archived_at), src/hooks/useUnreadNotificationsCount.ts:77 (.is('read_at', null)) e src/pages/AdminHistoricoAlertasChurn.tsx:151 (priority). O único .eq('is_read') de src (src/hooks/useRankNotifications.ts:87) é em outra tabela, rank_change_notifications. As colunas fantasmas só existem na migration histórica supabase/migrations/20260509113031_f3e3c4a8-cc05-4aa1-bd73-799a8931113b.sql:8,10.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3495 · Preferências granulares de notificação (notification_preferences.push_enabled, deal_updates, task_reminders, team_mentions, daily_digest)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Colunas fantasmas: declaradas num segundo CREATE TABLE IF NOT EXISTS (mig/20260104182000:35) que virou no-op; não estão em types.ts.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:212,245`
- **O que falta:** Tudo: criar as 5 colunas por migration nova (ALTER TABLE notification_preferences ADD COLUMN), regenerar types.ts, montar a UI de preferências que grave essas flags e fazer os envios (push, lembretes de tarefa, menções, resumo diário) respeitarem cada uma.
- **Evidência:** coluna push_enabled ausente em tables/public/notification_preferences.md (tabela existe)| cético: Banco real: snapshot tables/public/notification_preferences.md, tabela de colunas linhas 18-33, tem só id, email, is_active, frequency, notify_stagnant_deals, notify_inactive_clients, notify_at_risk_goals, stagnant_threshold_days, inactive_threshold_days, preferred_time, created_at, updated_at, consecutive_days_threshold e user_id. Nenhuma das 5 colunas aparece. grep -rl 'push_enabled\|team_mentions\|daily_digest\|task_reminders\|deal_updates' no diretório tables do snapshot → 0 resultados, ou seja, não estão em nenhuma tabela de produção. Código: o mesmo grep em src e supabase/functions → 0 resultados, e as variantes camelCase (pushEnabled, teamMentions, dailyDigest, taskReminders, dealUpdates) em src → 0 resultados. Quem usa notification_preferences (src/hooks/useNotificationPreferences.t…

### F0928 · Chaos Engineering Suite para resiliência de UI

- **Tipo:** Teste
- **O que os docs afirmam:** Suíte de Chaos Engineering implementada para resiliência de UI.
- **Fontes:** `docs/reports/AUDIT_REPORT.md:53-53`
- **O que falta:** Nenhum artefato existe; criar suíte (ex.: tests/chaos/*.spec.ts com falhas injetadas de rede/RLS via page.route) ou corrigir docs/reports/AUDIT_REPORT.md:53 que afirma algo inexistente.
- **Evidência:** ausente: grep -rli chaos --exclude-dir=node_modules --exclude-dir=dist --exclude-dir=docs . → 0 resultados (nenhum arquivo em src/, tests/, e2e/, scripts/, supabase/). A única menção é a própria afirmação em docs/reports/AUDIT_REPORT.md:53.
- **Revisão:** sem contestação cética concluída.

## Parcial (118)

### F0626 · Botões/comandos sem handler real em EmptyStateGuide

- **Tipo:** Ação/botão
- **O que os docs afirmam:** A auditoria confirmou botões/comandos visíveis sem handler real no módulo EmptyStateGuide.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:234-234`
- **O que falta:** Dar handler real aos dois botões de EmptyStateGuide.tsx:69-78 ou ocultá-los/marcá-los como 'em breve'.
- **Evidência:** src/components/purchase-intelligence/EmptyStateGuide.tsx:69-80: dois <Button> ('Começar Configuração' e 'Ver Documentação') sem onClick, sem asChild/href e sem rótulo 'em breve'. Componente montado em PurchaseIntelligenceHub.tsx:19,103 → src/pages/PurchaseIntelligence.tsx:7 → AppRoutes.tsx:701, menu sidebarMenuData.ts:276 (/inteligencia-compras). Incompletude declarada CONFIRMADA.| cético: Confirmado: src/components/purchase-intelligence/EmptyStateGuide.tsx:69-78 tem dois <Button> ('Começar Configuração' e 'Ver Documentação') sem onClick/asChild/href e sem rótulo 'em breve'; o componente é montado em PurchaseIntelligenceHub.tsx:19,103.

### F0628 · Etapa canônica 26/08 nº 61: Inventariar cada ação sem efeito (16 módulos)

- **Tipo:** Ação/botão
- **O que os docs afirmam:** Etapa canônica 61 (plano 26/08, matriz de status 30/08, estado 🔶): implementar, ocultar ou "em breve"; matriz botão→efeito→owner.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:211-211`
- **O que falta:** Concluir o inventário da etapa 61 e corrigir ou ocultar os botões sem handler (pelo menos EmptyStateGuide.tsx:69-78).
- **Evidência:** Critério 'nenhum botão sem handler real sem rótulo em breve' falha: src/components/purchase-intelligence/EmptyStateGuide.tsx:69-80 tem dois botões sem onClick. Rótulos 'em breve' no src são só textos de estado vazio (DailyChallengesCard.tsx:108, WeeklyChallengesCard.tsx:322, TournamentBrackets.tsx:177). Status 🔶 em docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:211.| cético: Confirmado: o critério 'nenhum botão sem handler sem rótulo em breve' falha em src/components/purchase-intelligence/EmptyStateGuide.tsx:69-78 (dois botões sem onClick). A etapa está 🔶 em STATUS_100_ETAPAS_2026-08-30.md:211 e 'NI' em A_planos_execucao.md:65.

### F0633 · 82 botões icon-only sem nome acessível

- **Tipo:** Componente
- **O que os docs afirmam:** Há 82 botões icon-only alcançáveis sem nome acessível estático.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:269-269`
- **O que falta:** Injetar a sessão autenticada no a11y-sweep (ou storageState) para varrer as rotas internas, ampliar routes.ts e adicionar aria-label aos <Button size="icon"> sem nome.
- **Evidência:** Gate existe: tests/a11y/axe-sweep.spec.ts:106-146 roda AxeBuilder withTags (inclui button-name) e expect(blocking).toEqual([]) salvo A11Y_REPORT_ONLY; .github/workflows/a11y-sweep.yml dispara em pull_request paths src/** sem REPORT_ONLY (env só HUSKY/VITE placeholders, linhas 32-52); tests/a11y/routes.ts cobre 10 rotas (/auth, /, /pipeline, /clientes, /playbooks, /win-loss-intelligence, /bi-gestor, /admin/conexoes, /configuracoes, 404) e ignoreRules nunca inclui button-name. Heurística estática: 209 ocorrências de size="icon" em src, só 113 com aria-label em até 3 linhas → ~96 botões icon-only potencialmente sem nome estático fora das rotas cobertas. Contagem '82' não verificável sem executar axe no app.| cético: Confirmado e reforçado: a cobertura real no CI é ainda menor. tests/a11y/axe-sweep.spec.ts:5 define AUTH_INJECTED = LOVABLE_BROWSER_AUTH_STATUS==='injected' e :85-86 aplica tes…

### F0634 · Accordion com animate-accordion-down/up via Radix

- **Tipo:** Componente
- **O que os docs afirmam:** Animações automáticas no AccordionContent.
- **Fontes:** `docs/DESIGN_SYSTEM.md:487-493,571`
- **O que falta:** Recriar src/components/ui/accordion.tsx (shadcn) usando animate-accordion-down/up ou remover a dependência e corrigir docs/DESIGN_SYSTEM.md:487-493,571.
- **Evidência:** Keyframes/animações existem: tailwind.config.ts:196-215 (accordion-down/up) e :475-476, src/index.css:160-161,189-205. Mas o componente não existe: ausente: find src -iname '_accordion_' → 0; grep -rln 'Accordion' src → 0. Histórico raso (50 commits) não mostra o commit de remoção; template inicial bebc3a202 criou src/components/ui/accordion.tsx. Dependência @radix-ui/react-accordion segue em package.json:76 sem uso.| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): O commit de remoção existe e é deliberado: git log --diff-filter=D -- src/components/ui/accordion.tsx → 89aacaff8 'chore(ui): remove código morto — arquivos inalcançáveis e exports sem consumidor (#285)'; git show --stat 89aacaff8 lista 'src/components/ui/accordion.tsx \| 52 ---'. O corpo do commit justifica: '128 arquivos de produção inalcançáveis a partir de main.tsx'. Hoje: find src -iname '_accordion_' → 0. Os keyfram…
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F0635 · App mobile/offline

- **Tipo:** Componente
- **O que os docs afirmam:** Não iniciado; só shell offline PWA.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:171`
- **O que falta:** Fila offline persistente (IndexedDB e replay ao reconectar) para atividades, com indicação na UI.
- **Evidência:** Shell offline existe: vite.config.ts:12-45 VitePWA com precache, navigateFallback index.html e runtimeCaching NetworkFirst para *.supabase.co (maxAgeSeconds 300). Fila offline de atividades ausente: grep -rln 'offlineQueue\|useOfflineQueue\|BackgroundSync\|navigator.onLine' src → só src/components/atoms/SystemHealthBadge.tsx (indicador). Claim 'só shell offline PWA' CONFIRMADA.| cético: Confirmado: o shell PWA está em vite.config.ts:12-45. Não há fila offline persistente: grep -rliE 'offline\|indexeddb\|idb-keyval\|localforage' src → só badges, useSyncedSetting e App.tsx:47 (networkMode 'offlineFirst' de queries do TanStack, em memória e sem persistência); nenhuma dependência idb/dexie/localforage em package.json.

### F0637 · Button com variantes default, destructive, outline, secondary, ghost, link, glow, glow-secondary, glow-success, glow-accent, glow-pulse, glow-pulse-success, gl…

- **Tipo:** Componente
- **O que os docs afirmam:** @/components/ui/button com 13 variantes.
- **Fontes:** `docs/DESIGN_SYSTEM.md:129-163,466-471`
- **O que falta:** Adicionar as 3 variantes em buttonVariants ou corrigir docs/DESIGN_SYSTEM.md:129-163.
- **Evidência:** src/components/ui/button.tsx:12-25 define 10 variantes: default, destructive, outline, secondary, ghost, link, glow, glow-pulse, glow-pulse-success, glow-success. Ausentes: glow-secondary, glow-accent, glow-pulse-accent (grep -rn 'glow-secondary\|glow-accent' src → 0). Doc DESIGN_SYSTEM.md:129-163 afirma 13.| cético: Confirmado: src/components/ui/button.tsx:10-25 tem 10 variantes; faltam glow-secondary, glow-accent e glow-pulse-accent. git log -S 'glow-secondary' -- button.tsx → removidas em 2ee31b410 ('fix: button/ripple-button haptic+ripple...'), commit que não registra decisão de remover variantes, então não conta como REMOVIDO_INTENCIONALMENTE.

### F0639 · Centro de preferências de push (categorias, horários)

- **Tipo:** Componente
- **O que os docs afirmam:** Falta UI de preferências de push por categoria e horário.
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:104`
- **O que falta:** Preferências de push por categoria/horário (dado, UI e filtro em send-push-notification) e inclusão de push-subscribe/send-push-notification na allowlist de deploy.yml:144.
- **Evidência:** Tabela public.notification_preferences existe com RLS (snapshot tables.md:215, 5 policies; colunas notify_stagnant_deals/notify_inactive_clients/notify_at_risk_goals/frequency/preferred_time) e UI em src/components/notifications/NotificationPreferenceCard.tsx:142-211 via src/hooks/useNotificationPreferences.ts:26,44,67, montada em src/pages/Notificacoes.tsx (rota AppRoutes.tsx:952). Porém são preferências de e-mail/alertas: supabase/functions/send-push-notification/index.ts não lê notification_preferences (grep 'notification_preferences\|quiet\|categor' → 0); BrowserPushSettings.tsx só subscribe/unsubscribe (linhas 29-32,155-164). Além disso push-subscribe e send-push-notification NÃO estão na allowlist ACTIVE de .github/workflows/deploy.yml:144 (grep → 0) → não deployadas em produção, embora src/hooks/usePushNotifications.ts:58,136,187 as invoque.| cético: Confirmado: public.notificati…

### F0643 · Dois design systems coexistindo: components/atoms/card.tsx e components/ui/card.tsx

- **Tipo:** Componente
- **O que os docs afirmam:** Doc aponta duplicação de design system (atoms/ + ui/) e propõe codemod para eliminar atoms/.
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:51,57`
- **O que falta:** Migrar os 3 imports de atoms/skeleton para ui/skeleton, apagar atoms/skeleton.tsx e realocar os 5 componentes restantes para eliminar atoms/.
- **Evidência:** src/components/atoms/card.tsx não existe (ls src/components/atoms/ → 6 arquivos sem card/badge/input), mas o diretório atoms/ persiste com skeleton.tsx byte-idêntico a ui/skeleton.tsx (md5 82127afd ambos) e 3 imports de '@/components/atoms/skeleton', além de 5 componentes próprios (ThemeToggle, LanguageToggle etc.) importados por 7 arquivos.| cético: Confirmado: atoms/card.tsx foi removido em 89aacaff8 (git show --stat: 'src/components/atoms/card.tsx \| 144 ---'), mas o diretório atoms/ persiste: skeleton.tsx tem md5 idêntico a ui/skeleton.tsx (82127afd...) e é importado em BriefingHistoryTimeline.tsx:7, PersonalAssistantSummaryCard.tsx:8 e MeuAssistente.tsx:10; restam mais 5 componentes próprios importados por DesktopTopBar.tsx:14,16,25, MainLayout.tsx:5-6, CloserDashboard.tsx:27 e SDRDashboard.tsx:61.

### F0644 · Duplicações byte a byte atoms/ui (badge, input, skeleton)

- **Tipo:** Componente
- **O que os docs afirmam:** Há duplicações exatas entre atoms/badge e ui/badge, atoms/input e ui/input, atoms/skeleton e ui/skeleton; a variante atoms/skeleton ainda é usada.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:261-261`
- **O que falta:** Migrar os 3 imports para '@/components/ui/skeleton' e remover src/components/atoms/skeleton.tsx.
- **Evidência:** Pares badge e input consolidados (atoms/badge.tsx e atoms/input.tsx ausentes; só ui/badge.tsx e ui/input.tsx). Par skeleton ainda duplicado: md5sum src/components/atoms/skeleton.tsx = ui/skeleton.tsx (82127afd) e grep '@/components/atoms/skeleton' → 3 imports externos.| cético: Confirmado: os pares badge/input foram consolidados (removidos em 89aacaff8). O par skeleton segue byte-idêntico (md5sum 82127afd176a3c8f792341b8e988842c nos dois) e tem 3 imports de '@/components/atoms/skeleton' (BriefingHistoryTimeline.tsx:7, PersonalAssistantSummaryCard.tsx:8, MeuAssistente.tsx:10).

### F0645 · Etapa 54 do plano: Isolar todos os mocks produtivos

- **Tipo:** Componente
- **O que os docs afirmam:** Substituir por dados reais ou modo DEMO não persistente com banner. Saída esperada: catálogo dos 15 casos e testes. Gate: decisão produto por módulo.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:725-725`
- **O que falta:** Ligar os mocks 'NÃO INICIADO' a dado real ou isolá-los com banner DEMO explícito, com testes.
- **Evidência:** Catálogo existe como doc: docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:60-67 lista Mock #5..#13 com status (vários 'NÃO INICIADO'). Mocks produtivos persistem: src/hooks/bi/useClientVsIndustry.ts:39 'client: 85, // Mock client value'; src/components/security/GeoBlockingMap.tsx:8 'Mock paths'. Modo DEMO com banner ausente: grep -rln 'DemoBanner\|isDemoMode\|VITE_DEMO\|Modo Demo' src → 0. Math.random restante em src é visual/ids (race/, effects/, PipelineBoard confetti, useLeadAssignment sorteio ponderado).| cético: Confirmado: o catálogo existe em C_estado_runbooks.md:60-67, com vários itens 'NÃO INICIADO'. Os mocks persistem em src/hooks/bi/useClientVsIndustry.ts:38 ('client: 85, // Mock client value') e src/components/security/GeoBlockingMap.tsx:8 ('Mock paths'). A_planos_execucao.md:58 lista outros remanescentes (ApprovalQueue MOCK_PENDING, SDRConversationI…

### F0647 · Etapa 93 do plano: Consolidar duplicatas e scripts

- **Tipo:** Componente
- **O que os docs afirmam:** Escolher atoms/ui e um remove-demos seguro por lote pequeno. Saída esperada: imports migrados e testes verdes. Gate: aprovação nominal de arquivos.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:776-776`
- **O que falta:** Concluir a migração atoms/skeleton → ui/skeleton e registrar formalmente o descarte dos scripts remove-demos.
- **Evidência:** Status 🔶 em STATUS_100_ETAPAS_2026-08-30.md:258. Duplicatas atoms/ui: badge e input consolidados (arquivos atoms ausentes), skeleton ainda duplicado (md5 idêntico, 3 imports). Scripts remove-demos não existem: find -iname '_remove-demo_' → 0; docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:92 registra 'scripts remove-demos* não existem mais'; scripts/ contém só codemod-money.mjs e codemod-typography.mjs.| cético: Confirmado: A_planos_execucao.md:92 marca a etapa 93 'P \| scripts remove-demos* não existem mais'. badge/input/card/button de atoms/ foram removidos em 89aacaff8, mas atoms/skeleton.tsx segue idêntico a ui/skeleton.tsx (md5 82127afd...) e tem 3 imports.

### F0650 · Guard de mudanças não salvas plugado em formulários

- **Tipo:** Componente
- **O que os docs afirmam:** useUnsavedChanges deveria proteger forms contra saída com alterações pendentes.
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:126`
- **O que falta:** Ligar useFormGuard(isDirty) nos formulários de cliente e de orçamento; hoje só o diálogo de venda está protegido.
- **Evidência:** ausente: grep -rn useUnsavedChanges src/ → 0 resultados. Equivalente existe: src/hooks/useFormGuard.ts:20-54 (registerDirtySource + beforeunload), src/lib/navigationGuard.ts:5,65, src/components/navigation/NavigationGuard.tsx:86 (AlertDialog 'Alterações não salvas'), montado em src/components/templates/MainLayout.tsx:140 (NavigationGuardBridge). Único consumidor: src/components/sales/CreateSaleDialog.tsx:29,87.| cético: Confirmado: ausente: grep -rn useUnsavedChanges src/ → 0. O equivalente src/hooks/useFormGuard.ts:20,31,48 (registerDirtySource + beforeunload) só tem 1 consumidor: src/components/sales/CreateSaleDialog.tsx:29,87 (montado via src/pages/Vendas.tsx). src/hooks/useFormDraft.ts:113 só salva rascunho no beforeunload, não pede confirmação.

### F0652 · Layouts de página (registro) por perfil

- **Tipo:** Componente
- **O que os docs afirmam:** Layout de registro por perfil; só /dashboard-custom e layout do win-loss por usuário (useUserDashboardLayout).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:28`
- **O que falta:** Layout das telas de detalhe (deal e cliente) configurável por perfil: tabela com role e entidade, hook de leitura e editor. Hoje só existe layout de dashboard por usuário.
- **Evidência:** src/routes/AppRoutes.tsx:258 (/dashboard-custom) + src/hooks/dashboard/useDashboardLayout.ts:194,220 (tabela dashboard_layouts, RLS sim 1 policy em supabase/tables.md:116); src/hooks/win-loss/useUserDashboardLayout.ts:28-60 lê user_winloss_preferences por user_id (tables.md:373, RLS sim 4 policies), usado em src/components/win-loss/DashboardLayoutEditor.tsx e src/pages/WinLossIntelligence.tsx. ausente: grep -rniE 'page_?layout\|layoutByRole\|user_layout_preferences' src/ supabase/migrations/ → 0 resultados; grep role/perfil em useDashboardLayout.ts → 0.| cético: Confirmado: /dashboard-custom em src/routes/AppRoutes.tsx:258 e no menu em sidebarMenuData.ts:157,230,288. A tabela dashboard_layouts (snapshot tables/public/dashboard_layouts.md) tem só as colunas id, salesperson_id, layout_config, created_at e updated_at, sem role. ausente: grep -rlniE 'page_?layouts?\|record_?layout\|layout.*…

### F0655 · Notificações: sino com animate-bounce quando há alertas, badge com animate-pulse, Settings com animate-wiggle-loop quando há config pendente

- **Tipo:** Componente
- **O que os docs afirmam:** Padrão de uso em notificações.
- **Fontes:** `docs/DESIGN_SYSTEM.md:577-596`
- **O que falta:** Aplicar animate-bounce condicional no Bell (DesktopTopBar.tsx:233) e criar wiggle-loop para o ícone Settings quando há config pendente.
- **Evidência:** Badge com animate-pulse: src/components/ui/NotificationBadge.tsx:53 (pulse && count>0), ativado em src/components/organisms/DesktopTopBar.tsx:246 só quando unreadCount > 5. Sino: DesktopTopBar.tsx:233-241 muda apenas cor (text-warning/destructive), sem animate-bounce. ausente: grep -rn 'animate-wiggle-loop\|wiggle-loop' src/ tailwind.config.ts → 0 resultados (tailwind.config.ts:354,491 define só 'wiggle'); grep -rn animate-bounce em DesktopTopBar/notifications → 0.| cético: Confirmado: no Bell, DesktopTopBar.tsx:233-241 só troca a cor; o pulse do badge fica em :246 (unreadCount>5). ausente: grep -rn 'wiggle-loop' src tailwind.config.ts → 0 (tailwind.config.ts:354,491 tem só 'wiggle'). O único animate-bounce perto de um sino está no Badge de src/pages/ArenaCompetitiva.tsx:289, não no sino.

### F0657 · Page Layouts customizáveis por perfil

- **Tipo:** Componente
- **O que os docs afirmam:** Falta layouts de página por perfil.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:146`
- **O que falta:** Tabela de layouts por perfil (role) para páginas de detalhe + hook/editor; hoje a customização é por usuário e só em dashboards.
- **Evidência:** ausente: grep -rn user_layout_preferences src/ supabase/ snapshot/tables.md → 0 resultados. Existe só layout de dashboard por usuário: src/hooks/dashboard/useDashboardLayout.ts:194,220 (dashboard_layouts, tables.md:116) e src/hooks/win-loss/useUserDashboardLayout.ts:28-60 (user_winloss_preferences, tables.md:373); nenhum filtro por role/perfil (grep role\|perfil em useDashboardLayout.ts → 0).| CONTESTADO pelo cético (NAO_IMPLEMENTADO): Não existe nenhum artefato de layout de página de detalhe por perfil. ausente: grep -rn user_layout_preferences src supabase → 0; no snapshot, grep -niE 'layout' tables.md só acha dashboard_layouts (tables.md:116), cujas colunas são id, salesperson_id e layout_config, sem role. Layout de dashboard por usuário é outra funcionalidade, não um fio faltando desta. A fonte docs/GAPS_CLASSE_MUNDIAL.md:146 lista o item como gap.
- **Revisão:** em disputa. O cético propõe Não implementado e o juiz ainda não decidiu.

### F0661 · Skeletons em todo loading

- **Tipo:** Componente
- **O que os docs afirmam:** Estados de carregamento com skeleton.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:640-640`
- **O que falta:** Trocar o texto/spinner por Skeleton nas páginas sem Skeleton (ex. AIAgents.tsx:52).
- **Evidência:** Skeleton usado em 91 de 168 arquivos em src/pages (grep -rl Skeleton src/pages) e em 276 componentes; src/routes/AppRoutes.tsx:215 Suspense fallback={<SmartSkeleton />}; src/components/skeletons/PageLoadingSkeleton.tsx. Porém 31 páginas têm isLoading/isPending sem Skeleton (ex. src/pages/AIAgents.tsx, AccountBasedEngagement.tsx, AdminTelemetria.tsx, BulkComposer.tsx, CommissionRules.tsx, Competencias.tsx — usam spinner/Loader2 ou nada).| cético: Confirmado: src/pages/AIAgents.tsx:52 mostra o texto 'Carregando…' em isLoading, sem Skeleton (grep -ci skeleton → 0). AccountBasedEngagement.tsx e CommissionRules.tsx também não têm Skeleton (0). AdminTelemetria.tsx:419 delega isLoading ao TelemetryTable.

### F0663 · Tela de falha de inicialização usa role=alert em elemento incompatível

- **Tipo:** Componente
- **O que os docs afirmam:** A tela de falha de inicialização usa role="alert" num elemento incompatível e registra erro no console (achado Lighthouse a11y).
- **Fontes:** `docs/execucao/RECONCILIACAO_GITHUB_SUPABASE_2026-08-31.md:144`
- **O que falta:** Em src/main.tsx:44 usar <main> com um <div role="alert"> interno e repetir o Lighthouse a11y.
- **Evidência:** Defeito persiste: src/main.tsx:44 renderiza <main role="alert" ...> na falha de bootstrap — elemento <main> não aceita role diferente de 'main' (ARIA in HTML; regra axe aria-allowed-role). Comparar com src/components/shared/GlobalErrorBoundary.tsx:52-56, que usa <div role="alert" aria-live="assertive"> (correto). console.error em main.tsx:42.| cético: Confirmado: src/main.tsx:44 <main role="alert"> (role não permitido em <main>); console.error em src/main.tsx:42. A correção não foi aplicada.

### F0725 · UI useOnboardingChecklist: tour interativo passo-a-passo (não só checklist estática)

- **Tipo:** Componente
- **O que os docs afirmam:** Falta tour interativo passo-a-passo (não só checklist estática) para useOnboardingChecklist (UI atual: 1 import).
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:69`
- **O que falta:** Componente de tour passo a passo que use os data-tour existentes e seja disparado a partir de OnboardingChecklist.tsx.
- **Evidência:** Checklist estática existe e está integrada: src/hooks/useOnboardingChecklist.ts:16-92 (4 passos lidos de salespeople/sales/sales_goals via useQuery, sem mock); src/components/onboarding/OnboardingChecklist.tsx:2,11 importa o hook; montado em src/pages/Index.tsx:5,189. Tour interativo ausente: package.json sem react-joyride/driver.js/shepherd/react-tour (grep → 0); únicos vestígios são atributos sem consumidor: src/components/dashboard/modules/OverviewModule.tsx:62 data-tour="goals" e CompetitionModule.tsx:36 data-tour="gamification" (grep useTour\|Tour( em src/ → 0). Reivindicação de incompletude (docs/FUNCIONALIDADES_SEM_UI.md:69) confirmada.| cético: Confirmado. Checklist estática integrada (src/hooks/useOnboardingChecklist.ts; src/components/onboarding/OnboardingChecklist.tsx; montada em src/pages/Index.tsx). Tour interativo ausente: grep -rliE 'joyride\|driver\.js\|shepherd\|reactou…

### F0726 · UI useSavedFilters: UI de gerenciamento (renomear/excluir/compartilhar)

- **Tipo:** Componente
- **O que os docs afirmam:** Falta UI de gerenciamento (renomear/excluir/compartilhar) para useSavedFilters (UI atual: 1 import).
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:67`
- **O que falta:** Renomear na UI (ligar updateFilter em SavedFiltersBar.tsx); compartilhar exige coluna nova + policy em saved_filters e opção na UI.
- **Evidência:** Hook src/hooks/useSavedFilters.ts:18-134 lê/insere/atualiza/exclui em saved_filters (banco real: tables/public/saved_filters.md — RLS sim, 8 policies auth.uid()=user_id, sem coluna de compartilhamento). UI src/components/filters/SavedFiltersBar.tsx:22 usa só saveFilter e deleteFilter (salvar :27-39, excluir :58-67); montada em src/pages/Vendas.tsx:9,178 (rota /vendas em src/routes/AppRoutes.tsx:264) e src/components/cadences/quote/QuoteCadenceFilters.tsx:9,83 (QuoteCadencesPage.tsx:22). Renomear: updateFilter existe no hook (useSavedFilters.ts:85-111) mas nenhum componente o consome (grep updateFilter em src/components → só funções locais homônimas em ReportFilterBuilder/SDRAdvancedFilters). Compartilhar: ausente em código e no schema (grep compartilh\|share em SavedFiltersBar/useSavedFilters → 0).| cético: Confirmado. Só src/components/filters/SavedFiltersBar.tsx importa useSavedFilter…

### F0727 · Virtualização (react-window) nas 10 listas mais pesadas

- **Tipo:** Componente
- **O que os docs afirmam:** Doc aponta react-window em só 3 sites de uso; kanbans/tabelas renderizam listas inteiras.
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:308,313,576`
- **O que falta:** Virtualizar os kanbans (ClientKanban.tsx, boards de pipeline) e as tabelas de maior volume (Clientes, Vendas) até cobrir as 10 listas mais pesadas.
- **Evidência:** react-window ^2.5.3 em package.json:143; único uso: src/components/win-loss/VirtualDealsList.tsx:2 (import { List } from 'react-window'), :148 <List>, consumido por src/components/win-loss/WinLossDealsDrawer.tsx:8,128. Kanbans/tabelas principais sem virtualização: grep -rn 'virtual\|Virtual' em src/components/pipeline/*.tsx e src/components/clients/ClientKanban.tsx → 0; grep -rl react-window\|@tanstack/react-virtual\|react-virtuoso em src/ → 1 arquivo (não 3 nem 10).| cético: Veredito mantido, mas há MAIS virtualização do que o verificador disse ('1 arquivo'): além de src/components/win-loss/VirtualDealsList.tsx (react-window), existe virtualização própria em src/components/ui/virtualized-list.tsx:5-29 (List manual com startIndex/endIndex), usada em src/components/dashboard/modules/OverviewModule.tsx:11,86, src/pages/ConversationalIntelligence.tsx:28,181, src/pages/NPSDashboard.tsx:26,2…

### F0732 · 148 arquivos mortos removidos

- **Tipo:** Doc/config
- **O que os docs afirmam:** 148 arquivos sem ligação a main.tsx (~19 mil linhas); 264 exports nunca importados.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:296`
- **O que falta:** Remover ou ligar os 4 artefatos residuais e adicionar knip ao CI.
- **Evidência:** Grafo gerado (codigo/componentes.json) aponta 1 componente órfão (src/components/ui/level-up-celebration.tsx, orfao=true) e hooks.json 0 hooks órfãos em src/hooks/ — a maior parte dos exemplos do doc sumiu (grep useDealSummaries\|useCommandPalette\|LevelUpNotification\|ICPIndicator\|PageTransitionProvider em src/ → 0). Residual: src/hooks/orders/useOrderTracking.ts exporta useOrderTrackingDetail sem importador; src/components/race/RivalryBadge.tsx e TrackWeatherOverlay.tsx sem uso JSX. Critério 'knip/ts-prune sem órfãos' não verificável pelo repo: ls knip.json\|.knip* → inexistente; grep knip\|ts-prune em package.json → 0. Nenhum commit registra remoção em massa (git log --grep 'morto\|dead-code' → só docs/testes).| cético: Confirmado. Resíduo: src/hooks/orders/useOrderTracking.ts:96 exporta useOrderTrackingDetail, usado só em useOrderTracking.test.tsx:50,78; src/components/race/index.t…

### F0734 · 43 rotas com ação que chama edge function não publicada

- **Tipo:** Doc/config
- **O que os docs afirmam:** Cruzamento rota × edge function: 43 rotas com ação quebrada por função não publicada (seção 2).
- **Fontes:** `docs/prod-readiness.md:909`
- **O que falta:** Para cada function fora da allowlist: incluir em ACTIVE (teto de 100) ou remover a ação da UI.
- **Evidência:** Cruzamento codigo/rotas.json (170 urls, campo edges) × allowlist ACTIVE de .github/workflows/deploy.yml:144 (100 nomes): 176 pares rota→edge, dos quais 27 rotas chamam 35 edge functions fora da allowlist (ex.: winloss-webhook-replay ×4 rotas, schedule-optimal-send ×3, calculate-committee-coverage ×3, summarize-call-recording, send-time-optimizer, sdr-consecutive-alerts, report-builder-execute, recompute-stage-baselines, push-subscribe, extract-deal-stakeholders, workflow-executor, twilio-click-to-call). Caiu de 43 (docs/prod-readiness.md:909) para 27, mas não é 0.| cético: Amostra confirmada contra .github/workflows/deploy.yml:144: winloss-webhook-replay (fora da allowlist, 4 arquivos chamadores em src), schedule-optimal-send (fora, 1), calculate-committee-coverage (fora, 2), push-subscribe (fora, 1), twilio-click-to-call (fora, 1). Ainda há rotas que chamam functions não publicadas.

### F0736 · Animações de atenção/loading/feedback: bounce-attention, wiggle, wiggle-loop, pop, pulse-glow, spin-slow, ping-slow, pulse-ring, flash-success, flash-error, co…

- **Tipo:** Doc/config
- **O que os docs afirmam:** Keyframes adicionais em tailwind.config.ts.
- **Fontes:** `docs/DESIGN_SYSTEM.md:408-460,508-527,1017-1023`
- **O que falta:** Adicionar bounce-attention, wiggle-loop e subtle-pulse em src/index.css (@theme + @keyframes), e não em tailwind.config.ts, que é ignorado; ou corrigir docs/DESIGN_SYSTEM.md.
- **Evidência:** tailwind.config.ts keyframes/animation presentes: wiggle :354/:491, pop :362/:492, pulse-glow :426/:498, spin-slow :450/:501, ping-slow :458/:502, pulse-ring :216/:477, flash-success :434/:499, flash-error :442/:500, count-up :373/:493, float :330/:488. Ausentes: bounce-attention, wiggle-loop, subtle-pulse → grep em tailwind.config.ts e src/index.css → 0 resultados cada (docs/DESIGN_SYSTEM.md:413-414 documenta animate-bounce-attention inexistente).| cético: Veredito mantido, mas a fonte efetiva é outra. O projeto usa Tailwind v4 (src/index.css:8 @import 'tailwindcss'; postcss.config.js:3 @tailwindcss/postcss; package.json:180 tailwindcss ^4.3.5) sem @config (grep '@config' src → 0), então tailwind.config.ts não é carregado pelo build (só components.json:7 o referencia). As animações valem por src/index.css @theme: --animate-pulse-ring :162, float :173, wiggle :176, pop :177, count-up :1…

### F0737 · Animações de entrada: animate-fade-in, fade-in-up, fade-in-scale, slide-in, slide-in-right, slide-up, slide-down, scale-in, bounce-in

- **Tipo:** Doc/config
- **O que os docs afirmam:** Keyframes em tailwind.config.ts com durações 300-500ms.
- **Fontes:** `docs/DESIGN_SYSTEM.md:338-367,495-507,528-558`
- **O que falta:** Criar slide-in e slide-in-right em src/index.css, ou documentar que os nomes reais são slide-left/slide-right.
- **Evidência:** tailwind.config.ts: fade-in :286/:483, fade-in-scale :312/:486, slide-up :246/:479, slide-down :256/:480, scale-in :302/:485, bounce-in :191/:230/:478. fade-in-up não está em tailwind.config.ts (grep → 0) mas existe em src/index.css:1349 (@utility animate-fade-in-up) e :2671 (@keyframes). slide-in e slide-in-right ausentes: grep em tailwind.config.ts → 0; em src/index.css só race-broadcast-slide-in (:3253).| cético: Veredito mantido. Definições efetivas em src/index.css @theme: fade-in :168, scale-in :170, fade-in-scale :171, slide-up :164, slide-down :165, bounce-in :163; fade-in-up em @keyframes :2671. animate-slide-in e animate-slide-in-right (docs/DESIGN_SYSTEM.md:351,354,502-503) não existem: grep → 0 em src e tailwind.config.ts. Os equivalentes semânticos são --animate-slide-left/--animate-slide-right (index.css:166-167), com outro nome. tailwind.config.ts não é carregado (Tailwin…

### F0740 · Baseline as unknown: 155 ocorrências em 122 arquivos (de 219/138), cada uma suprimida por site

- **Tipo:** Doc/config
- **O que os docs afirmam:** Após o pacote: 155 ocorrências; todas com eslint-disable-next-line no-restricted-syntax; plano para zerar (leituras Supabase, casts de client, as never em .from(), mocks via vi.mocked + queryResult de src/pages/Index.test.tsx).
- **Fontes:** `docs/TYPE_DEBT.md:35-59`
- **O que falta:** Suprimir ou tipar as ocorrências sem supressão, voltar a ≤155 e criar gate de teto no CI.
- **Evidência:** grep -rn 'as unknown' src/ → 168 ocorrências em 128 arquivos (acima do baseline 155/122 de docs/TYPE_DEBT.md:35-59 → regressão). 34 ocorrências sem 'eslint-disable-next-line no-restricted-syntax' na linha anterior (ex.: src/hooks/useTerritories.ts:64 e :66, src/components/activities/ActivityItemRow.tsx:76, src/hooks/win-loss/useDeadLettersCounts.ts:15); regra em eslint.config:68-73 é 'warn' só para o padrão 'as unknown as T'. Helper queryResult existe em src/pages/Index.test.tsx:26.| cético: Contagens confirmadas: grep -rn 'as unknown' src \| wc -l → 168 em 128 arquivos (acima do baseline 155/122); só 126 linhas têm eslint-disable-next-line imediatamente antes. A regra eslint.config.js:68-73 está como 'warn'.

### F0742 · C11 dead-code (148 arquivos)

- **Tipo:** Doc/config
- **O que os docs afirmam:** LEDGER: A FAZER.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/LEDGER_EXECUCAO_2026-10-14.md:20`
- **O que falta:** Remover os 4 artefatos residuais e adicionar knip ao CI.
- **Evidência:** Mesmo escopo de F0732. codigo/componentes.json: 1 órfão (src/components/ui/level-up-celebration.tsx); hooks.json: 0 órfãos em src/hooks/; exemplos do doc (useDealSummaries, useCommandPalette, LevelUpNotification, ICPIndicator, PageTransitionProvider) já não existem em src/ (grep → 0). Residual exportado sem uso: useOrderTrackingDetail (src/hooks/orders/useOrderTracking.ts), RivalryBadge e TrackWeatherOverlay (src/components/race/index.ts). LEDGER_EXECUCAO_2026-10-14.md:20 segue 'A FAZER' e não há commit de remoção em massa (git log --grep → 0 relevantes); sem knip/ts-prune no repo.| cético: Mesmo resíduo confirmado em F0732: useOrderTracking.ts:96 (só no teste), race/index.ts:32,40 (sem uso) e ui/level-up-celebration.tsx (sem importador). Sem knip no package.json.

### F0743 · Cache React Query staleTime 2min / gcTime 10min

- **Tipo:** Doc/config
- **O que os docs afirmam:** QueryClient configurado com staleTime 2min e gcTime 10min (nota: §42 diz CACHE_TIMES.STALE_TIME 5min — divergência interna).
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1438,1512`
- **O que falta:** Alinhar o doc (1 min global / 5 min via CACHE_TIMES) ou App.tsx:36 ao valor desejado.
- **Evidência:** src/App.tsx:33-37 new QueryClient defaultOptions: staleTime 60*1000 (1 minuto, não 2) e gcTime 1000*60*10 (10 min — confere). src/constants/index.ts:8-12 CACHE_TIMES.STALE_TIME = 5 min, GC_TIME = 10 min, usado em 85 sites fora de constants (grep CACHE_TIMES). Vale: default global 1 min; 5 min nas queries que passam CACHE_TIMES. O '2min' de docs/DOCUMENTACAO_SISTEMA.md:1438 não corresponde a nenhum valor.| cético: Confirmado: src/App.tsx:36 staleTime 60*1000 (1 min, não 2), :37 gcTime 10 min; src/constants/index.ts:8-10 CACHE_TIMES STALE_TIME 5 min e GC_TIME 10 min. Nenhum valor é 2 min.

### F0744 · Cast as unknown as: 214 em src/ + 20 em supabase/functions → meta 0

- **Tipo:** Doc/config
- **O que os docs afirmam:** Tipagem contornada; tipar respostas do Supabase corretamente (TYPE_DEBT diz 155 após pacote).
- **Fontes:** `docs/TECH_DEBT.md:14`
- **O que falta:** Reduzir para ≤155 em src e ≤20 em supabase/functions, rumo a 0; promover a regra para 'error'.
- **Evidência:** grep -rn 'as unknown as' src/ → 161 (abaixo dos 214 de docs/TECH_DEBT.md:14, mas acima do teto 155 de TYPE_DEBT); supabase/functions/ → 32 (acima do teto 20; 39 contando 'as unknown' simples). Regra eslint.config:68-73 só 'warn'. Meta 0 não atingida e houve regressão em edge functions.| cético: grep -rn 'as unknown as' src \| wc -l → 161 (teto 155); em supabase/functions → 32 (teto 20). Meta 0 não atingida.

### F0746 · Checklist de acessibilidade (17 itens) validado

- **Tipo:** Doc/config
- **O que os docs afirmam:** Todos os 17 itens em [ ]. SkipLinks montado, FocusTrap em 2 usos, aria-live em 23 arquivos, ~28 <div onClick> em 27 arquivos; axe em tests/a11y/axe-sweep.spec.ts + a11y-sweep.yml.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:167`
- **O que falta:** Marcar os 17 itens com evidência e converter os 25 <div onClick> em <button> ou dar a eles role/tabIndex/onKeyDown.
- **Evidência:** Artefatos existem: docs/accessibility-checklist.md (17 itens, todos '[ ]': grep '\[x\]' → 0; ex. :4-6), SkipLinks importado e montado em src/components/templates/MainLayout.tsx:11,141, tests/a11y/axe-sweep.spec.ts e .github/workflows/a11y-sweep.yml:1 ('A11y Sweep (UI PRs)'). <div onClick> reduzido: 2 ocorrências em linha única (2 arquivos) + ~15 em JSX multilinha (grep aproximado), vs 28 no doc. Nenhum item do checklist marcado com evidência.| cético: docs/accessibility-checklist.md: 17 '[ ]' e 0 '[x]'. SkipLinks importado e montado em src/components/templates/MainLayout.tsx:11,141; tests/a11y/axe-sweep.spec.ts e .github/workflows/a11y-sweep.yml existem. Ainda há 25 '<div ... onClick=' em src (grep multilinha -Pzo).

### F0749 · Classes auxiliares card-elevated, card-depth, card-interactive e dark:border-glow

- **Tipo:** Doc/config
- **O que os docs afirmam:** Elevação, profundidade, hover refinado e glow de borda no dark mode (.dark .border-glow::after).
- **Fontes:** `docs/DESIGN_SYSTEM.md:112-123,916-931,1017-1019`
- **O que falta:** Definir @utility card-depth em src/index.css ou remover a variant 'depth' de card.tsx:18.
- **Evidência:** src/index.css:692 @utility card-elevated; :696 @utility card-interactive; border-glow: :557-584 (.dark & .border-glow::after) e :831 @utility border-glow, keyframe :341, token :175. card-depth não definido: grep -rn 'card-depth' src/ tailwind.config.ts → 1 resultado, apenas o uso em src/components/ui/card.tsx:18 (variant depth aplica classe sem CSS correspondente).| cético: Confirmado: src/index.css:692 @utility card-elevated, :696 @utility card-interactive, :561 '& .border-glow::after' (dark) e :831 @utility border-glow. card-depth só aparece em src/components/ui/card.tsx:18 (variant depth), sem nenhuma definição de CSS.

### F0750 · Classes hover-glow(-secondary/-success/-accent/-gold) e glow-primary/glow-secondary/glow-success

- **Tipo:** Doc/config
- **O que os docs afirmam:** Glow no hover e glow estático.
- **Fontes:** `docs/DESIGN_SYSTEM.md:200-230`
- **O que falta:** Criar @utility hover-glow-accent em src/index.css ou remover a classe de docs/DESIGN_SYSTEM.md:213.
- **Evidência:** src/index.css:622 @utility hover-glow; :630 hover-glow-primary; :637 hover-glow-secondary; :644 hover-glow-success; :651 hover-glow-gold; :669 glow-primary; :674 glow-secondary; :678 glow-success (box-shadow via --shadow-glow-_, definidos em :root index.css:2002-2005 e .dark :2222-2225). Ausente: grep -nE 'hover-glow-accent' src/index.css → 0 resultados; grep -rn 'hover-glow-accent' src → 0 (ninguém usa). docs/DESIGN_SYSTEM.md:208 documenta hover-glow-accent.| cético: Confirmado: src/index.css:622 hover-glow, :630 hover-glow-primary, :637 -secondary, :644 -success, :651 -gold, :669 glow-primary, :674 glow-secondary, :678 glow-success. Ausente: grep -rn 'hover-glow-accent' (css/ts/tsx, fora node_modules) → 0 resultados; documentado só em docs/DESIGN_SYSTEM.md:213. tailwind.config.ts não define utilitário equivalente (só boxShadow glow-_ :171-176, e o arquivo nem é carregado: Tailwind v4 …

### F0751 · Classes hover-scale-sm / hover-scale / hover-scale-lg / hover-lift / hover-border-glow

- **Tipo:** Doc/config
- **O que os docs afirmam:** Efeitos de hover (1.02x, 1.05x, 1.10x, lift, borda brilhante).
- **Fontes:** `docs/DESIGN_SYSTEM.md:169-194`
- **O que falta:** Criar @utility hover-border-glow em src/index.css ou apontar docs/DESIGN_SYSTEM.md:193 para border-glow.
- **Evidência:** src/index.css:519 @utility hover-lift (translate-y-1 + shadow-lg + border primary/0.15); :609 hover-scale (scale-105); :614 hover-scale-sm (scale-102); :618 hover-scale-lg (scale-110); :595 hover-lift-sm; :599 hover-lift-lg. Ausente: grep -nE '@utility hover-border-glow' src/index.css → 0 resultados (existe só @utility border-glow em :831, sem variante hover); grep -rn 'hover-border-glow' src → 0. docs/DESIGN_SYSTEM.md:189 documenta hover-border-glow.| cético: Confirmado: src/index.css:519 hover-lift, :609 hover-scale, :614 hover-scale-sm, :618 hover-scale-lg; existe só :831 @utility border-glow. Ausente: grep -rn 'hover-border-glow' (css/ts/tsx) → 0 resultados; documentado em docs/DESIGN_SYSTEM.md:193.

### F0754 · components.json e tailwind.config.ts auditados

- **Tipo:** Doc/config
- **O que os docs afirmam:** NÃO INICIADO.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:296`
- **O que falta:** Carregar tailwind.config.ts via @config ou removê-lo (ajustando components.json.tailwind.config) e registrar a auditoria em C_estado_runbooks.md:296.
- **Evidência:** Auditoria feita nesta verificação: components.json:1-20 (schema shadcn, style default, tailwind.config 'tailwind.config.ts', css 'src/index.css', cssVariables true, aliases @/components, @/lib/utils, @/hooks) é válido. tailwind.config.ts:4 darkMode ['class'], :44-52 colors hsl(var(--_)) (77 mapeamentos), :171-176 boxShadow glow-_. PORÉM o projeto usa Tailwind v4: package.json:158 @tailwindcss/postcss ^4.3.5, :180 tailwindcss ^4.3.5; postcss.config.js plugin @tailwindcss/postcss; src/index.css:8 @import 'tailwindcss', :12 @custom-variant dark, :25 @theme com --color-_: hsl(var(--_)). grep -rn '@config' src/ → 0 resultados → tailwind.config.ts NÃO é carregado pelo Tailwind v4 (config legada, duplicada em @theme). docs/auditoria/.../C_estado_runbooks.md:296 continua 'NÃO INICIADO'.| cético: Arquivos existem (components.json:1-20 aponta tailwind.config 'tailwind.config.ts'). Tailwind v4 em …

### F0755 · components.json e tailwind.config.ts não auditados

- **Tipo:** Doc/config
- **O que os docs afirmam:** Nenhum lote auditou esses dois arquivos de configuração.
- **Fontes:** `docs/estado/14_VERIFICACAO_DA_AUDITORIA.md:175`
- **O que falta:** Alinhar tailwind.config.ts/components.json ao Tailwind v4 e registrar a auditoria.
- **Evidência:** Arquivos existem: components.json (20 linhas, shadcn default, cssVariables true) e tailwind.config.ts (darkMode class :4, content :5-10, colors hsl(var()) :44+). Inconsistência com o Tailwind em uso: Tailwind v4 (package.json:158,180; postcss.config.js @tailwindcss/postcss; src/index.css:8 @import 'tailwindcss'; :25 @theme) e nenhum '@config' em src/ (grep → 0) → tailwind.config.ts é config v3 morta; a fonte efetiva de tokens/keyframes é src/index.css (@theme :25, @utility :519+). docs/agentes/branches-encerradas-261117.md:194 confirma 'migração para Tailwind v4'.| cético: Mesma evidência de F0754: components.json:7 referencia tailwind.config.ts, mas o build usa Tailwind v4 (package.json:180) sem @config (grep → 0); fonte efetiva é src/index.css:25 @theme. docs/estado/14_VERIFICACAO_DA_AUDITORIA.md:175 segue sem registro de auditoria.

### F0763 · Correção da tela branca do preview

- **Tipo:** Doc/config
- **O que os docs afirmam:** ONDA_0 #1 P: sem registro.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:406`
- **O que falta:** Registrar diagnóstico/correção (main.tsx:36-50) em A_planos_execucao.md:406 e validar o preview renderizando /auth (E2E/axe); remover o '\|\| echo' de qa-exhaustive.yml:117.
- **Evidência:** Correção técnica proposta em docs/auditoria/VALIDACAO_EXAUSTIVA_ONDA_1_2026-08-27.md:66 ('captura de exceção e fallback de bootstrap') existe: src/main.tsx:36-50 bootstrapApp().catch → recoverFromStaleAssetError ou render de <main role="alert"> 'Não foi possível iniciar a aplicação'; src/App.tsx:13,94 GlobalErrorBoundary. Causa raiz documentada em docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:22 (build do QA sem envs do Supabase → tela branca) segue aberta: grep -n 'VITE_SUPABASE' .github/workflows/qa-exhaustive.yml → 0 resultados e :117 'lhci autorun ...|\| echo ::warning' (Lighthouse nunca falha). Nenhum registro de correção em docs (A_planos_execucao.md:406 'sem registro de correção do preview'). \| cético: Fallback de bootstrap existe: src/main.tsx:36-50 (catch → recoverFromStaleAssetError ou <main role="alert">). Sem registro da correção: docs/auditoria/funcionalidades-pendentes-202…

### F0767 · Design tokens semânticos HSL sem cores hardcoded

- **Tipo:** Doc/config
- **O que os docs afirmam:** Cores via tokens HSL.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:610-610`
- **O que falta:** Migrar hex residuais para tokens ou corrigir a afirmação da doc.
- **Evidência:** Tokens HSL existem (src/index.css:1880+ e @theme :25+), mas 'sem cores hardcoded' é falso: grep -rnE '#[0-9a-fA-F]{6}\b' src --include=_.tsx --include=_.ts (sem testes) → 268 ocorrências; maiores: src/components/race/raceColors.ts (77), src/components/race/RaceCar.tsx (25), src/components/dashboard/widgets/PipelineFunnelWidget.tsx (14), src/components/auth/AuthFormCard.tsx (11), src/hooks/useSDRMetrics.ts (9). docs/FUNCIONALIDADES_COMPLETAS.md:610 afirma 'sem cores hardcoded'.| cético: grep -rnE '#[0-9a-fA-F]{6}\b' src (_.ts,_.tsx, sem testes) → 268; src/components/race/raceColors.ts → 77, src/components/auth/AuthFormCard.tsx → 11. Contradiz 'sem cores hardcoded' de docs/FUNCIONALIDADES_COMPLETAS.md:610.

### F0779 · Focus visible global ring-2 ring-primary/50 e classe focus-ring-animated (focus-ring-pulse 2s)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Focus states aplicados automaticamente; botões com glow, inputs com border-primary/60.
- **Fontes:** `docs/DESIGN_SYSTEM.md:315-330,984-1009`
- **O que falta:** Criar `.focus-ring-animated` + `@keyframes focus-ring-pulse` em src/index.css ou remover a seção 'Focus Animado' de docs/DESIGN_SYSTEM.md:324-330 e corrigir a descrição do ring global para refletir outline 2px.
- **Evidência:** Focus global existe: src/index.css:2325-2329 (`:focus-visible { outline: 2px solid hsl(var(--primary)); outline-offset: 2px }`), inputs 2332-2339 com box-shadow primary/0.25, e `:focus:not(:focus-visible)` 2342. Porém não é `ring-2 ring-primary/50` como docs/DESIGN_SYSTEM.md:315-322 descreve, e `grep -rn 'focus-ring-animated\\|focus-ring-pulse' src/` → 0 resultados (classe e keyframe documentados em DESIGN_SYSTEM.md:326-330 não existem; só `@utility focus-ring` em index.css:1408 e `focus-ring-premium` 1863).
- **Revisão:** sem contestação cética concluída.

### F0780 · Fontes Plus Jakarta Sans (body) e Space Grotesk (display) com h1-h4 em font-display automático

- **Tipo:** Doc/config
- **O que os docs afirmam:** h1, h2, h3, h4 e .font-display usam Space Grotesk com font-weight 600 e letter-spacing negativo.
- **Fontes:** `docs/DESIGN_SYSTEM.md:24-44,938-953`
- **O que falta:** Atualizar docs/DESIGN_SYSTEM.md:24-44 e 938-953 para Inter (body) + Sora (display, Space Grotesk fallback), ou trocar as fontes no código se a intenção for Plus Jakarta Sans.
- **Evidência:** Regra h1-h4 automática existe: src/index.css:2465-2471 (`h1,h2,h3,h4,.font-display { font-family: var(--font-display) }`). Mas `--font-display: Sora, Space Grotesk, ...` (index.css:28 e 1884) — Space Grotesk é apenas fallback; a fonte body é Inter (index.css:27; tailwind.config.ts:23). `grep -c 'Plus Jakarta' src/index.css index.html tailwind.config.ts` → 0 em todos. index.html:66 carrega Space Grotesk, Sora, Inter, JetBrains Mono. docs/DESIGN_SYSTEM.md:24-44 descreve Plus Jakarta Sans + Space Grotesk, divergente do código.
- **Revisão:** sem contestação cética concluída.

### F0784 · Glass morphism: classes glass e glass-hover (light card/0.9, dark card/0.75)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Light bg-card/80-90 com backdrop-blur; dark bg-card/70-75 com borda branca.
- **Fontes:** `docs/DESIGN_SYSTEM.md:236-247,1048-1063`
- **O que falta:** Definir `@utility glass-hover` em src/index.css (ou trocar o uso pelo glass-card-hover existente) e alinhar docs/DESIGN_SYSTEM.md:236-247 aos valores reais de --glass-bg.
- **Evidência:** `@utility glass` existe em src/index.css:758-763 (backdrop-blur-md + hsl(var(--glass-bg)) + --glass-border), com --glass-bg light `0 0% 100% / 0.8` (index.css:1965) e dark `230 20% 10% / 0.85` (index.css:2196); variantes glass-strong (765) e glass-card (771). Porém `glass-hover` não é definida: `grep -n 'glass-hover' src/index.css` → 0 (só glass-panel-hover/glass-card-hover em 2398/2406), e é usada em 1 arquivo .tsx sem efeito. Valores do doc (card/0.9 light, card/0.75 dark, docs/DESIGN_SYSTEM.md:246-247) não batem com 0.8/0.85.
- **Revisão:** sem contestação cética concluída.

### F0785 · Gradientes: gradient-primary/secondary/success/xp, gradient-text, gradient-border

- **Tipo:** Doc/config
- **O que os docs afirmam:** Backgrounds, texto e borda com gradiente.
- **Fontes:** `docs/DESIGN_SYSTEM.md:253-281`
- **O que falta:** Adicionar `@utility gradient-primary/secondary/success/xp` em src/index.css (ou alias para bg-gradient-*) — hoje 47 componentes usam uma classe inexistente.
- **Evidência:** Existem `@utility gradient-text` (src/index.css:498-502), gradient-text-secondary/success/gold (504-514), `@utility gradient-border` (1710-1717), `bg-gradient-primary` (1112) e `bg-gradient-success` (1116), e as vars --gradient-primary/secondary/xp (2019-2021, 2238-2241). Porém as classes documentadas `gradient-primary`, `gradient-secondary`, `gradient-success`, `gradient-xp` (docs/DESIGN_SYSTEM.md:253-266) NÃO são definidas: `grep -n 'utility gradient-primary\\|\.gradient-primary\s*{' src --include=*.css` → 0. `gradient-primary` é usada como className em 47 arquivos .tsx (ex. src/components/sales/CreateSaleDialog.tsx:158,416; src/components/admin/MergeConflictsResolver.tsx:174) sem nenhuma regra CSS correspondente — botões ficam sem o fundo gradiente.
- **Revisão:** sem contestação cética concluída.

### F0787 · Layout `src/components/<dominio>/` com `components/ui` como único diretório compartilhado

- **Tipo:** Doc/config
- **O que os docs afirmam:** ARCHITECTURE descreve components organizados por domínio (ai, analytics, bi, cadences, coaching, crm, deal-intelligence, dialer, gamification, race, revenue-intelligence, win-loss, customer-success...) e components/ui como primitivas shadcn.
- **Fontes:** `docs/ARCHITECTURE.md:22-27`
- **O que falta:** Corrigir docs/ARCHITECTURE.md:22-27: remover `crm` da lista e descrever os 18 SHARED_DIRS do check-domain-boundaries em vez de 'único diretório compartilhado'.
- **Evidência:** Dos diretórios citados em docs/ARCHITECTURE.md:22-27 existem ai, analytics, bi, cadences, coaching, deal-intelligence, dialer, gamification, race, revenue-intelligence, win-loss, customer-success e ui; `crm/` NÃO existe (`[ -d src/components/crm ]` falso). O doc diz 'components/ui (único diretório compartilhado)' (ARCHITECTURE.md:26), mas scripts/check-domain-boundaries.mjs:33-52 define SHARED_DIRS com 18 pastas compartilhadas (accessibility, atoms, common, debug, effects, errors, filters, icons, keyboard, layout, mobile, molecules, navigation, organisms, shared, skeletons, transitions, ui).
- **Revisão:** sem contestação cética concluída.

### F0789 · Lazy loading e chunks manuais com circularidade

- **Tipo:** Doc/config
- **O que os docs afirmam:** O build usa lazy loading/chunks manuais, mas módulos grandes e chunks circulares permanecem.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:268-268`
- **O que falta:** Garantir que vendor-excel (exceljs, 930 kB) só entre em import() dinâmico nas rotas de export e/ou ajustar manualChunks/chunkSizeWarningLimit para o aviso sumir.
- **Evidência:** manualChunks em vite.config.ts:145-...; comentário :150-159 explica a invariante que evita o ciclo vendor/vendor-core. Rodei `npx vite build` (EXIT=0, 6373 módulos): `grep -ci circular` no log → 0 avisos de circularidade. Porém persiste o aviso '(!) Some chunks are larger than 800 kB after minification' (log linha 486) por dist/assets/vendor-excel-*.js = 929.94 kB (gzip 256 kB). A metade 'chunks circulares' da afirmação do doc (AUDITORIA_EXAUSTIVA...:268) não se reproduz; a metade 'módulos grandes' sim.
- **Revisão:** sem contestação cética concluída.

### F0794 · Medição inicial: 152 arquivos com acesso direto ao client fora da camada de dados

- **Tipo:** Doc/config
- **O que os docs afirmam:** ADR-010 (service layer): antes da decisão havia 152 arquivos com supabase.from/rpc fora de hooks/services/lib; 18 migrados, 132 na baseline.
- **Fontes:** `docs/decisions/ADR-010-service-layer.md:9-12`
- **O que falta:** Migrar os 8 acessos novos para src/hooks\|services, remover as 6 entradas obsoletas (`node scripts/check-data-layer.mjs --update-baseline`) e incluir `check:data-layer` em .github/workflows/pr-checks.yml para o ratchet valer.
- **Evidência:** scripts/baselines/data-layer.txt tem 134 linhas = 3 comentários + 131 arquivos (≤132 da ADR-010, docs/decisions/ADR-010-service-layer.md:9-12). Porém `node scripts/check-data-layer.mjs` falha: 6 entradas obsoletas (DemandForecast.tsx, ProductMix.tsx, SalesForecast.tsx, MentionInput.tsx, ActivityChart.tsx não existem mais no HEAD; EliteCadenceAnalytics.tsx já migrado) e '❌ 8 arquivo(s) com acesso direto ao Supabase fora da camada de dados' (ex. src/components/admin/AdminSystemStatus.tsx:57-58, src/components/clients/Client360HealthNbaSection.tsx:27-28, src/components/intelligence/ActivityPulse.tsx:14, src/components/sdr/SDRIntelligenceHighlights.tsx:31, SDRSequenceOrchestrator.tsx:34). O script existe em package.json:37 (`check:data-layer`) mas não roda na CI (`grep data-layer .github/workflows/*.yml` → 0; não está em `npm run ci`, package.json:58).
- **Revisão:** sem contestação cética concluída.

### F0796 · Micro-interações: press-effect, press-scale, click-bounce

- **Tipo:** Doc/config
- **O que os docs afirmam:** Efeitos de pressionar e bounce no clique (keyframe click-bounce 0.96→1.02).
- **Fontes:** `docs/DESIGN_SYSTEM.md:474-485,1025-1042`
- **O que falta:** Criar `.press-effect`, `.click-bounce` e `@keyframes click-bounce (0.96→1.02)` em src/index.css, ou remover essas classes de docs/DESIGN_SYSTEM.md:474-485/1025-1042.
- **Evidência:** Só `@utility press-scale` (src/index.css:660-663, active:scale-95) e `press-scale-sm` (665) existem. `grep -n 'press-effect\\|click-bounce' src/index.css` → 0 resultados; `grep -rn 'press-effect\\|click-bounce' src --include=*.tsx` → 0 (sem uso). O doc docs/DESIGN_SYSTEM.md:474-485 e 1025-1042 documenta press-effect, click-bounce e @keyframes click-bounce inexistentes.
- **Revisão:** sem contestação cética concluída.

### F0797 · Migração para Tailwind v4 (sem bg-gradient-to-br)

- **Tipo:** Doc/config
- **O que os docs afirmam:** A main usa sintaxe Tailwind v4; branches antigas ainda usam bg-gradient-to-br.
- **Fontes:** `docs/agentes/branches-encerradas-261117.md:194-195`
- **O que falta:** Trocar `bg-gradient-to-*` por `bg-linear-to-*` nas 9 ocorrências (7 em src/components/pipeline/DealTimeline.tsx) para fechar a migração.
- **Evidência:** package.json:180 `tailwindcss ^4.3.5` (v4 confirmado; index.css usa `@utility`). Porém `grep -rn 'bg-gradient-to-br' src` → 7 ocorrências, todas em src/components/pipeline/DealTimeline.tsx:97,99,101,102,106,107,321 (9 ocorrências de bg-gradient-to-* no total; 378 já em `bg-linear-to-br`). A afirmação 'main sem bg-gradient-to-br' (docs/agentes/branches-encerradas-261117.md:194-195) não é exata — a sintaxe legada ainda funciona no v4 como alias, mas permanece.
- **Revisão:** sem contestação cética concluída.

### F0798 · Módulos não alcançados removidos (7 de ~27)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 92 P: removidos useAICopilot, useRevenueIntelligence, useGoals, sessionHelpers, useSessionManagement, lib/bi/mockData, utils/fuzzing.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:91`
- **O que falta:** Corrigir A_planos_execucao.md:91 (5 de 7 removidos; 2 estão em uso) e registrar decisão para os ~20 módulos restantes da etapa 92.
- **Evidência:** Ausentes (confirmado): src/hooks/useAICopilot.*, src/hooks/useRevenueIntelligence.ts, src/hooks/useGoals.ts, src/lib/bi/mockData.ts, src/utils/fuzzing.ts (`find src -iname '*AICopilot*' -o -iname 'useGoals*' -o -iname 'mockData*' -o -iname 'fuzzing*'` → 0). Porém `sessionHelpers` e `useSessionManagement`, listados como removidos em docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:91, EXISTEM em src/hooks/sessionHelpers.ts e src/hooks/useSessionManagement.ts e são alcançados: src/components/security/SessionManager.tsx:12,54 → montado em src/pages/SecurityDashboard.tsx:30,284. Decisão sobre os ~20 restantes não registrada (nenhum doc posterior).
- **Revisão:** sem contestação cética concluída.

### F0800 · noUncheckedIndexedAccess ligado

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc aponta noUncheckedIndexedAccess/exactOptionalPropertyTypes desligados; gap: ligar noUncheckedIndexedAccess.
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:386,390`
- **O que falta:** Zerar os 882 erros da baseline (scripts/typecheck-baseline.json) e passar `noUncheckedIndexedAccess: true` para tsconfig.app.json:19; corrigir o comentário de tsconfig.strict.json:1-3 que aponta para script/baseline inexistentes.
- **Evidência:** tsconfig.app.json:19 `"noUncheckedIndexedAccess": false` (config usada por `npm run typecheck`, package.json:32). Flag ligada só em tsconfig.strict.json:8, usada pelo ratchet scripts/check-typecheck-baseline.mjs:31 com baseline scripts/typecheck-baseline.json (`"total": 882` erros, flags noUncheckedIndexedAccess+noUnused*), rodado no CI em .github/workflows/pr-checks.yml:130-134 (reprova só erros novos). node_modules ausente: tsc não executado aqui.| cético: Confirmado: tsconfig.app.json:19 `"noUncheckedIndexedAccess": false` (é o config do `npm run typecheck`, package.json:32). A flag só está ligada em tsconfig.strict.json:8, usada pelo ratchet `typecheck:baseline` (package.json:33 → scripts/check-typecheck-baseline.mjs), rodado no CI em .github/workflows/pr-checks.yml:132-133; a baseline scripts/typecheck-baseline.json tem `"total": 882` e lista noUncheckedIndexedAccess em `flags`. De…

### F0801 · Padrão de camadas Página → Componentes → Hooks → Supabase/Edge

- **Tipo:** Doc/config
- **O que os docs afirmam:** Arquitetura declarada: páginas usam componentes que usam hooks que acessam Supabase Client ou Edge Functions.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:127-131`
- **O que falta:** Migrar para hooks/services os 41 arquivos de components/pages que acessam o Supabase direto (8 novos + o legado listado em scripts/baselines/data-layer.txt).
- **Evidência:** Camada de dados concentra a maioria: 235 chamadas `supabase.from/rpc(` em src/hooks\|services\|lib\|integrations vs 58 chamadas em 41 arquivos de src/components + src/pages (4 páginas de 168: src/pages/admin/AdminComercial.tsx, src/pages/CompetitiveSeasonsAdmin.tsx, src/pages/FollowUpInteligente.tsx, src/pages/RelatoriosExecutivos.tsx). `node scripts/check-data-layer.mjs` → `❌ 8 arquivo(s) com acesso direto ao Supabase fora da camada de dados` (ex.: src/components/admin/AdminSystemStatus.tsx:57-58, src/components/sdr/LeadScoreBreakdown.tsx:63) + 134 linhas de legado em scripts/baselines/data-layer.txt.| cético: Recontagem confirma: 240 chamadas `supabase.from/rpc(` em src/hooks\|services\|lib\|integrations contra 59 em src/components+src/pages, espalhadas por 41 arquivos; 4 páginas chamam direto (src/pages/admin/AdminComercial.tsx, src/pages/CompetitiveSeasonsAdmin.tsx, src/pages/Follow…

### F0802 · Padrão de refatoração abandonada identificado 5× (novo criado, antigo mantido)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Em pipeline/ e tasks/ o antigo está morto; no multi-pipeline (item 8) o antigo é o que roda e o novo está quebrado.
- **Fontes:** `docs/estado/02_DOMINIO_CRM_PIPELINE.md:146-148`
- **O que falta:** Unificar PipelineBoard.tsx em um caminho só (carregar o pipeline padrão via usePipelines e remover o legado das linhas 87-101) e atualizar docs/estado/02_DOMINIO_CRM_PIPELINE.md:130-148, que ainda cita arquivos já apagados.
- **Evidência:** Pares mortos de pipeline/ e tasks/ listados em docs/estado/02_DOMINIO_CRM_PIPELINE.md:130-148 já não existem: ausentes src/components/pipeline/{SLAIndicator,QuickActions,AIEmailWriter,DealAutoSummary,ExplainableWinProbability}.tsx e src/components/tasks/{TaskCard,TaskListAdvanced}.tsx (ls src/components/pipeline/ e src/components/tasks/). DealTimeline.tsx hoje é importado por src/components/pipeline/DealCard.tsx. deal-intelligence antigos continuam vivos: src/components/deal-intelligence/health/CriticalDealsTable.tsx:18-20,197-200 importa DealHealthCard/DealVelocityCard/StageVelocityCard. Multi-pipeline (item 8) segue coexistindo: src/components/pipeline/PipelineBoard.tsx:57 `DEFAULT_PIPELINE_ID = '00000000-0000-0000-0000-000000000001'` hardcoded, :69 estado inicial, :96-101 `isDefaultPipeline` escolhe o caminho legado `usePipelineDeals()` (:87-93) e o novo `usePipelineDealsByPipeline` …

### F0804 · Protocolo de mocks: estados loading/vazio/indisponível/demo/erro, feature flag e teste de ausência de provedor

- **Tipo:** Doc/config
- **O que os docs afirmam:** Todo valor exibido como real deve ter proveniência; definir estados loading, vazio, indisponível, demo e erro; impedir persistência de valor fabricado; feature flag para integração indisponível; teste que prova que falta de provedor não gera sucesso.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:244-254`
- **O que falta:** Listar as integrações sem provedor; dar a cada uma uma flag em feature_flags, os estados loading/vazio/indisponível/erro e um teste 'sem provedor → sem sucesso' no molde de useDigitalSignatures.test.tsx:55-98.
- **Evidência:** Peças do protocolo existem isoladas: tabela `public.feature_flags` no banco real com RLS (snapshot supabase/tables.md:162; tables/public/feature_flags.md:7 `RLS habilitado| sim`), hook src/hooks/useFeatureFlags.ts:36-45 lê `feature_flags`, admin em src/pages/FeatureFlagsAdmin.tsx montado em src/routes/AppRoutes.tsx:1037-1040 (`/feature-flags`), gate usado em src/components/templates/MainLayout.tsx:23. Teste de ausência de provedor existe para um fluxo: src/hooks/useDigitalSignatures.test.tsx:55-98 (`sem provedor configurado` → rejects, `update` não chamado, toast destrutivo). Não há protocolo transversal: 0 marcadores de estado `demo` em src/components\|pages (grep isDemo\|demoMode\|mockData → 0), nenhum lint/script exigindo estados loading/vazio/indisponível, e 29 arquivos não-teste em src/ ainda usam Math.random (não auditados aqui um a um). \| cético: Não achei evidência nova que con…

### F0808 · PWA instalável com service worker e manifest

- **Tipo:** Doc/config
- **O que os docs afirmam:** Sistema é PWA com prompt de instalação, indicador offline e prompt de atualização; hook usePWA.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1458-1467,1726`
- **O que falta:** Implementar o handler de beforeinstallprompt com botão de instalar e um prompt de atualização (ou tirar InstallPrompt/UpdatePrompt/usePWA de docs/DOCUMENTACAO_SISTEMA.md:1458-1467); corrigir index.html:15 e vite.config.ts:16 para ícones que existam.
- **Evidência:** Núcleo instalável existe (manifest index.html:18 → public/manifest.json:1-24 com display standalone e ícones 192/512; SW registrado em public/register-sw.js:18). Mas os componentes/hook declarados em docs/DOCUMENTACAO_SISTEMA.md:1458-1467 não existem: grep `usePWA\|InstallPrompt\|UpdatePrompt\|OfflineIndicator\|OfflineFallback\|useOnlineStatus\|beforeinstallprompt` em src/ → 0 resultados; `src/hooks/usePWA.ts` foi apagado no commit ed46bc02b `refactor: delete 22 more orphaned hook files` (159 linhas removidas); docs/FUNCIONALIDADES_SEM_UI.md:129 já registrava `usePWA — não exposto em UI`. Atualização é automática por reload (src/lib/swUpdater.ts:178-184), sem prompt. index.html:15 aponta apple-touch-icon para /icons/icon-192x192.png e public/icons/ não existe.| cético: Confirmado: `grep -rnE "usePWA\|InstallPrompt\|UpdatePrompt\|OfflineIndicator\|beforeinstallprompt\|useOnlineStatus" sr…

### F0816 · QueryClient com `gcTime` 15 min

- **Tipo:** Doc/config
- **O que os docs afirmam:** ADR-002: gcTime de 15 minutos para manter cache na navegação.
- **Fontes:** `docs/decisions/ADR-002-react-query-over-redux.md:18-18`
- **O que falta:** Alinhar src/App.tsx:37 com 15*60*1000 ou corrigir o ADR-002 linha 18 para 10 min.
- **Evidência:** Único QueryClient global em src/App.tsx:33-48; src/App.tsx:37 `gcTime: 1000 * 60 * 10, // 10 minutes` — diverge dos 15 min do ADR (docs/decisions/ADR-002-react-query-over-redux.md:18). Não há src/lib/queryClient.ts.| cético: src/App.tsx:37 `gcTime: 1000 * 60 * 10, // 10 minutes` no único QueryClient global (src/App.tsx:33), contra os 15 min do ADR-002:18.

### F0819 · QueryClient com `staleTime` 3 min

- **Tipo:** Doc/config
- **O que os docs afirmam:** ADR-002: configuração padrão do React Query com staleTime de 3 minutos.
- **Fontes:** `docs/decisions/ADR-002-react-query-over-redux.md:17-17`
- **O que falta:** Alinhar src/App.tsx:36 com 3*60*1000 ou corrigir o ADR-002 linha 17 para 1 min.
- **Evidência:** src/App.tsx:36 `staleTime: 60 * 1000, // 1 minute` — o ADR declara 3 minutos (docs/decisions/ADR-002-react-query-over-redux.md:17). Único `new QueryClient` em src/ fora de testes é src/App.tsx:33.| cético: src/App.tsx:36 `staleTime: 60 * 1000, // 1 minute`, contra os 3 min do ADR-002:17.

### F0821 · Regra "NUNCA use cores diretas" do Design System

- **Tipo:** Doc/config
- **O que os docs afirmam:** 614 ocorrências de text-white\|bg-black\|text-gray-_\|bg-gray-_ em 159 arquivos.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:168`
- **O que falta:** Migrar as 263 ocorrências para tokens e criar uma regra de lint ou um ratchet com baseline.
- **Evidência:** grep -rhoE '\b(text-white\|bg-black\|text-gray-[0-9]+\|bg-gray-[0-9]+)\b' src/ → 263 ocorrências em 117 arquivos (caiu de 614/159 citados em docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:168, mas não zerou). Nenhum lint impede: grep 'text-gray\|text-white\|cores diretas' em eslint.config.js, scripts/, .github/workflows/ → 0 resultados.| cético: `grep -rhoE '\b(text-white\|bg-black\|text-gray-[0-9]+\|bg-gray-[0-9]+)\b' src/ \| wc -l` → 263 ocorrências em 117 arquivos. `grep -rnE "text-gray\|text-white\|bg-black" eslint.config.js scripts/ .github/workflows/` → 0 resultados: nenhum lint ou ratchet impede regressão.

### F0822 · Regra de camada de dados: `supabase.from()/rpc()` só em hooks/services/lib/integrations

- **Tipo:** Doc/config
- **O que os docs afirmam:** ARCHITECTURE (ADR-010): supabase.from()/rpc() só pode ser chamado em src/hooks/, src/services/, src/lib/ e src/integrations/.
- **Fontes:** `docs/ARCHITECTURE.md:52-57`
- **O que falta:** Corrigir os 8 arquivos (mover para hooks ou marcar `// data-layer-ok`), limpar as entradas obsoletas da baseline e adicionar `npm run check:data-layer` em .github/workflows/pr-checks.yml.
- **Evidência:** scripts/check-data-layer.mjs:29-34 restringe a src/hooks\|services\|lib\|integrations, baseline scripts/baselines/data-layer.txt (134 linhas), script package.json:37 `check:data-layer`. Porém `node scripts/check-data-layer.mjs` FALHA hoje: `❌ 8 arquivo(s) com acesso direto ao Supabase fora da camada de dados` (src/components/admin/AdminSystemStatus.tsx:57-58, src/components/clients/Client360HealthNbaSection.tsx:27-28, src/components/intelligence/ActivityPulse.tsx:14, src/components/intelligence/PerformanceTrends.tsx:29, src/components/sales/AIEmailDialog.tsx:55, src/components/sdr/LeadScoreBreakdown.tsx:63, src/components/sdr/SDRIntelligenceHighlights.tsx:31, src/components/sdr/SDRSequenceOrchestrator.tsx:34) + 6 entradas obsoletas na baseline. Não roda em nenhum workflow: grep 'data-layer' em .github/workflows/ → 0 resultados; ausente também do script `ci` (package.json:58). 0 marcador…

### F0824 · Regras do design system: sem cores diretas (text-white/bg-black/text-gray-500), CTAs com variant glow, salvar com glow-success, labels uppercase tracking-wider

- **Tipo:** Doc/config
- **O que os docs afirmam:** 10 regras de uso obrigatório.
- **Fontes:** `docs/DESIGN_SYSTEM.md:845-856`
- **O que falta:** Migrar as cores diretas para tokens com lint anti-regressão e usar variant="glow-success" nos botões de salvar/confirmar.
- **Evidência:** Variantes existem em src/components/ui/button.tsx:19-24 (`glow`, `glow-pulse`, `glow-pulse-success`, `glow-success`) e são usadas: `variant="glow"` 23×, `glow-pulse` 4×, `glow-pulse-success` 3×, `glow-success` apenas 1× em src/**/\*.tsx; `uppercase tracking-wider` 234 ocorrências. Regra 1 (sem cores diretas) não é cumprida: `text-gray-N\|bg-black` 144 ocorrências em src/**/*.tsx (263 incluindo text-white/bg-gray), e não existe lint custom (grep em eslint.config.js/scripts/.github/workflows → 0).| cético: Regra 1 descumprida: 263 ocorrências de cores diretas em src/ (grep acima), sem lint (grep em eslint.config.js/scripts/.github/workflows → 0). `grep -rhoE 'variant="glow-success"' src --include=*.tsx \| wc -l` → 1 uso só; as variantes existem em src/components/ui/button.tsx:19-24.

### F0826 · Rotas declaradas em `App.tsx`/`MainLayout` com `React.lazy` (vs `src/routes/AppRoutes.tsx` em API.md)

- **Tipo:** Doc/config
- **O que os docs afirmam:** ARCHITECTURE diz que App.tsx/MainLayout declaram rotas com React.lazy; API.md e AGENTS.md dizem que as rotas estão em src/routes/AppRoutes.tsx.
- **Fontes:** `docs/ARCHITECTURE.md:79-83`
- **O que falta:** Corrigir docs/ARCHITECTURE.md:79 para apontar src/routes/AppRoutes.tsx (Routes) + src/routes/lazyPages.ts (React.lazy).
- **Evidência:** <Routes> real em src/routes/AppRoutes.tsx:216 e :246; páginas lazy em src/routes/lazyPages.ts:1 (import lazy) importadas em AppRoutes.tsx:194; src/App.tsx:17 importa AppRoutes e monta em :112; src/components/templates/MainLayout.tsx:27-65 usa lazy só para widgets de layout (GlobalSearch, Sidebar, MobileNavigation), não declara rotas; src/App.tsx não tem lazy( nem <Routes> (grep 'lazy\|Routes' src/App.tsx → só a linha 17/112). docs/ARCHITECTURE.md:79 afirma 'App.tsx/MainLayout declaram rotas com React.lazy'.| cético: Confirmado. src/App.tsx:17 importa AppRoutes e :112 monta <AppRoutes />; não há lazy( nem <Routes> em App.tsx. <Routes> real em src/routes/AppRoutes.tsx:216 e :246. React.lazy em src/routes/lazyPages.ts:13. src/components/layout/MainLayout.tsx não existe (o arquivo está em src/components/templates/MainLayout.tsx). docs/ARCHITECTURE.md:79 continua dizendo 'App.tsx/MainLayout …

### F0827 · RPCs não tipados com `as never` + comentário explícito

- **Tipo:** Doc/config
- **O que os docs afirmam:** ADR-010: RPCs sem tipo gerado ficam com `as never` e comentário, nunca cast silencioso; melhoria pendente nos tipos gerados.
- **Fontes:** `docs/decisions/ADR-010-service-layer.md:52-53`
- **O que falta:** Remover os `as never` de RPCs que types.ts já cobre e comentar os casts restantes. Opcional: regra de lint/check que exija comentário.
- **Evidência:** grep 'as never' src/hooks src/services → 64 ocorrências. Sem comentário explícito: src/hooks/admin/usePlatformSLO.ts:32, src/hooks/admin/useWebVitalsP75.ts:24, src/hooks/admin/useConnectionMetrics.ts:74,86, src/hooks/reporting/useScheduledReportRuns.ts:11, src/hooks/email/useCampaignOptOutRates.ts:27-28, src/hooks/email/useCampaignDeliveryStats.ts:19-20, src/hooks/email/useRecoveryRates.ts:43-44,66-67, src/hooks/useCompetitiveRanking.ts:33. RPCs já tipados em src/integrations/supabase/types.ts (fn_admin_platform_slo :24152, transition_sale_status :25130; sync_challenge_progress, claim_daily_challenge_reward, update_client_portfolio_status, transition_commission_status, fn_admin_web_vitals_p75, fn_admin_cron_alert_breakdown — 1 ocorrência cada) continuam com cast em usePipeline.ts:159, useQuotes.ts:229, useMultiplePipelines.ts:154, useDailyChallenges.ts:60,106 etc. scripts/check-data-lay…

### F0831 · Segredo VAPID_PUBLIC_KEY lido por 1 edge function(s)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Web Push. Doc extrai via grep de Deno.env.get; não verifica se o segredo está configurado no projeto.
- **Fontes:** `docs/estado/10_EDGE_FUNCTIONS.md:125-144`
- **O que falta:** Corrigir a contagem na doc (2 funções), colocar as duas funções na allowlist e confirmar o secret no painel.
- **Evidência:** Doc docs/estado/10_EDGE_FUNCTIONS.md:144 afirma 1 função; grep 'VAPID_PUBLIC_KEY' supabase/functions → 2 funções: supabase/functions/push-subscribe/index.ts:66 e supabase/functions/send-push-notification/index.ts:346. Nenhuma está na allowlist ACTIVE (.github/workflows/deploy.yml:144 → 0 ocorrências), portanto nenhuma executa em produção; chamador do front src/hooks/usePushNotifications.ts:58 invoca 'push-subscribe' e em :121-125 cai no fallback 'Notificações do navegador ativadas' quando não recebe a chave. Existência do secret não verificável (sem MCP de listagem; vault.md sem 'vapid').| cético: Confirmado. grep VAPID_PUBLIC_KEY supabase/functions → 2 funções: push-subscribe/index.ts:66 e send-push-notification/index.ts:346. A doc diz 1. Nenhuma das duas está na allowlist de .github/workflows/deploy.yml:144. O snapshot edge-functions.json confirma env VAPID_PUBLIC_KEY nas duas.

### F0835 · Service Worker para push

- **Tipo:** Doc/config
- **O que os docs afirmam:** SW registra handler de push.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:508-508`
- **O que falta:** Colocar push-subscribe, send-push-notification e um emissor com chamador real na allowlist; configurar as VAPID; ligar new-device-alert a um gatilho real.
- **Evidência:** public/sw.js:11-32 listener 'push' (showNotification) e :34-50 'notificationclick'; registrado em src/hooks/usePushNotifications.ts:40-42 ('/sw.js', scope '/push/'); hook montado via src/components/settings/BrowserPushSettings.tsx (importado em src/pages/Notificacoes.tsx:49) e src/components/security/PushNotificationSettings.tsx (src/pages/Configuracoes.tsx:15). Porém o fio backend está cortado: 'push-subscribe' (usePushNotifications.ts:58) e 'send-push-notification' (chamada só por supabase/functions/new-device-alert/index.ts:253) não estão na allowlist ACTIVE (.github/workflows/deploy.yml:144 → 0 ocorrências para push-subscribe, send-push-notification e new-device-alert); sem chave VAPID o hook cai em toast 'Notificações do navegador ativadas' (usePushNotifications.ts:121-125) sem assinar push real.| cético: Confirmado. public/sw.js tem os listeners push e notificationclick, e usePush…

### F0836 · Sourcemaps hidden no build (build.sourcemap hidden) com retenção local

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc aponta stacks ilegíveis porque o build não emite sourcemaps; ação: build.sourcemap: hidden.
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:216,221`
- **O que falta:** Garantir a retenção: token Sentry no build da Vercel ou upload-artifact dos .map no CI, com exclusão do deploy.
- **Evidência:** vite.config.ts:133 `sourcemap: 'hidden'` (implementado). Retenção: vite.config.ts:79-87 só envia maps ao Sentry se SENTRY_AUTH_TOKEN e então apaga ./dist/**/_.map; grep 'SENTRY_AUTH_TOKEN\|sourcemap\|\.map' .github/workflows/_.yml vercel.json → 0; sem .vercelignore (cat → inexistente); nenhum upload-artifact de maps. Logo, sem token os .map vão para dist/ publicado na Vercel e não há cópia retida localmente/CI. Doc: docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:221.| cético: vite.config.ts:133 tem `sourcemap: 'hidden'`. A retenção depende só de SENTRY_AUTH_TOKEN (vite.config.ts:79-87), e esse fluxo apaga ./dist/**/*.map após o upload. Não existe .vercelignore (ls → inexistente) nem passo de CI que guarde os maps. A doc docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:219-221 exige 'sourcemaps retidos fora do deploy'.

### F0837 · Stack frontend: Vite, React 18, TypeScript, Tailwind, shadcn/ui, framer-motion

- **Tipo:** Doc/config
- **O que os docs afirmam:** ARCHITECTURE declara a stack frontend Vite, React 18, TypeScript, Tailwind CSS, shadcn/ui e framer-motion.
- **Fontes:** `docs/ARCHITECTURE.md:9-11`
- **O que falta:** Atualizar docs/ARCHITECTURE.md:11 (e AGENTS.md §6) para React 19, Vite 8 e Tailwind 4.
- **Evidência:** package.json:184 vite ^8.3.8, :182 typescript ^5.9.3, :180 tailwindcss ^4.3.5 (+ src/index.css:8 `@import 'tailwindcss'`), :120 framer-motion ^14.13.0, components.json:1-10 (shadcn, tailwind.config.ts); porém package.json:133 react ^19.3.1 e :135 react-dom ^19.3.1, :164 @types/react ^19.3.0 — docs/ARCHITECTURE.md:11 declara 'React 18' (AGENTS.md §6 idem).| cético: package.json tem :133 react ^19.3.1, :135 react-dom ^19.3.1, :164 @types/react ^19.3.0, :184 vite ^8.3.8, :180 tailwindcss ^4.3.5, :120 framer-motion ^14.13.0; components.json e tailwind.config.ts existem. Mas docs/ARCHITECTURE.md:11 declara 'React 18'.

### F0851 · Token especial --busy

- **Tipo:** Doc/config
- **O que os docs afirmam:** Token CSS especial --busy (tempo real / presença / glow / card elevado).
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1616-1623`
- **O que falta:** Nenhum componente consome o token (classe status-busy/bg-busy nunca aplicada). Aplicar em um indicador de presença real (ex.: badge de status de vendedor) ou remover o token e documentar.
- **Evidência:** Definido: src/index.css:1941 `--busy: 0 84% 60%` (:root) e src/index.css:2172 (.dark); src/index.css:113 `--color-busy`; utilitário `@utility status-busy` em src/index.css:907-914; tailwind.config.ts:143 `busy`. Uso em componente: ausente — `grep -rnE '(bg\|text\|border\|ring\|fill)-busy\b\|status-busy\|var\(--busy' src --include=*.tsx --include=*.ts` → 0 resultados.
- **Revisão:** sem contestação cética concluída.

### F0854 · Token especial --offline

- **Tipo:** Doc/config
- **O que os docs afirmam:** Token CSS especial --offline (tempo real / presença / glow / card elevado).
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1616-1623`
- **O que falta:** Variante Badge `inactive` (única que usa --offline) não é usada em nenhuma página/componente; ligar a um indicador de presença real ou remover.
- **Evidência:** Definido: src/index.css:1940 `--offline: 220 10% 55%` (:root), src/index.css:2171 (.dark); tailwind.config.ts:142 `offline`. Único consumidor é a variante `inactive` em src/components/ui/badge.tsx:48, mas `grep -rnE "variant=\"(active\|inactive)\"\|\? 'active' : 'inactive'" src --include=*.tsx` → 0 usos da variante; `grep -rnE '(bg\|text\|border)-offline' src --include=*.tsx| grep -v badge.tsx` → 0.
- **Revisão:** sem contestação cética concluída.

### F0855 · Token especial --online

- **Tipo:** Doc/config
- **O que os docs afirmam:** Token CSS especial --online (tempo real / presença / glow / card elevado).
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1616-1623`
- **O que falta:** Variante Badge `active` (única que usa --online) não é montada em lugar nenhum; usar em indicador de presença ou remover token/variante.
- **Evidência:** Definido: src/index.css:1939 `--online: 152 76% 42%` (:root), src/index.css:2170 (.dark); tailwind.config.ts:141 `online`. Único consumidor é a variante `active` em src/components/ui/badge.tsx:47; `grep -rnE "variant=\"(active\|inactive)\"" src --include=*.tsx` → 0 usos; `grep -rnE '(bg\|text\|border)-online' src --include=*.tsx| grep -v badge.tsx` → 0.
- **Revisão:** sem contestação cética concluída.

### F0857 · Tokens de cor ajustados: --foreground 225 30% 10% / 0 0% 98%, --muted-foreground 220 20% 35% / 225 15% 65%, --border 220 20% 85% / 225 25% 20%, --success 142 7…

- **Tipo:** Doc/config
- **O que os docs afirmam:** Valores light/dark dos tokens após a sessão de melhorias.
- **Fontes:** `docs/DESIGN_SYSTEM.md:1094-1101`
- **O que falta:** Atualizar docs/DESIGN_SYSTEM.md:1094-1101 com os valores vigentes de src/index.css (ou registrar que foram alterados depois da sessão de melhorias).
- **Evidência:** Valores reais divergem dos documentados em docs/DESIGN_SYSTEM.md:1094-1101. Light (:root): src/index.css:1889 `--foreground: 230 25% 12%` (doc 225 30% 10%), :1914 `--muted-foreground: 220 12% 40%` (doc 220 20% 35%), :1925 `--border: 220 15% 88%` (doc 220 20% 85%), :1930 `--success: 152 76% 42%` (doc 142 70% 35%). Dark (.dark): :2123 `--foreground: 0 0% 98%` (confere), :2145 `--muted-foreground: 220 8% 82%` (doc 225 15% 65%), :2156 `--border: 230 15% 22%` (doc 225 25% 20%), :2161 `--success: 152 85% 48%` (doc 142 70% 50%). Só 1 de 8 valores bate.
- **Revisão:** sem contestação cética concluída.

### F0859 · Transições de tema suaves (300ms cubic-bezier) com no-transition e data-no-transition

- **Tipo:** Doc/config
- **O que os docs afirmam:** Transições light/dark de 250→300ms; elementos interativos 150ms; opt-out por classe ou data attribute.
- **Fontes:** `docs/DESIGN_SYSTEM.md:620-632,957-967`
- **O que falta:** Adicionar regras `.no-transition, [data-no-transition] { transition: none !important; }` em src/index.css ou remover a seção de docs/DESIGN_SYSTEM.md:625-632; alinhar doc (300ms/150ms) ao código (250ms/200ms).
- **Evidência:** Transição global existe: src/index.css:2367-2375 `*, *::before, *::after { transition-property: background-color, border-color, color, fill, stroke, box-shadow, opacity, transform, filter; transition-duration: 250ms; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1); }`; interativos em src/index.css:2377-2385 com 200ms (doc diz 150ms); prefers-reduced-motion em src/index.css:2420. Opt-out ausente: `grep -rnE 'no-transition' src/ .` → 0 resultados (nem `.no-transition` nem `[data-no-transition]`). Duração é 250ms, não os 300ms declarados em docs/DESIGN_SYSTEM.md:961.
- **Revisão:** sem contestação cética concluída.

### F0861 · tsconfig strict e zero any

- **Tipo:** Doc/config
- **O que os docs afirmam:** Ação concreta: habilitar strict e eliminar any.
- **Fontes:** `docs/ENGINEERING_MANIFESTO.md:67`
- **O que falta:** Eliminar os 3 `any` restantes e reduzir scripts/typecheck-baseline.json (882 erros) até zero, movendo as flags de tsconfig.strict.json para tsconfig.app.json conforme scripts/check-typecheck-baseline.mjs:13.
- **Evidência:** strict ativo: tsconfig.app.json:14 `"strict": true`. Mas `any` não é zero: src/global.d.ts:10, src/global.d.ts:19, src/lib/quotePdfExporter.ts:131. Baseline não está em zero: scripts/typecheck-baseline.json:5 `"total": 882` (flags noUncheckedIndexedAccess/noUnusedLocals/noUnusedParameters em tsconfig.strict.json, ver scripts/check-typecheck-baseline.mjs:5-13); package.json:33 `typecheck:baseline`.
- **Revisão:** sem contestação cética concluída.

### F0862 · vercel.json com rewrites de SPA e headers de segurança (CSP só em meta)

- **Tipo:** Doc/config
- **O que os docs afirmam:** vercel.json inexistente; CSP só em index.html:56.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:174`
- **O que falta:** Mover a CSP completa de index.html:56 para o header em vercel.json:22-24 (hoje só `frame-ancestors`); confirmar headers com `curl -I` em produção.
- **Evidência:** vercel.json existe (contradiz docs/auditoria/.../G_infra_ci_integracoes.md:174): vercel.json:3-8 rewrite `/(.*)`→`/index.html`; vercel.json:9-37 headers X-Content-Type-Options, X-Frame-Options, Referrer-Policy, HSTS e `Content-Security-Policy: frame-ancestors 'self'` (vercel.json:22-24). A CSP completa (default-src/script-src/connect-src) continua só na meta em index.html:56. Resposta HTTP de produção não verificável daqui: `curl -I https://promo-champions-v2-1.vercel.app/` → 403 do proxy do ambiente.
- **Revisão:** sem contestação cética concluída.

### F3441 · Edge function send-push-notification (10 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Catálogo API.md lista a edge function `send-push-notification` na categoria "Multichannel / Push" com auth "JWT do usuário · verify_jwt", método "qualquer", payload "supabaseServiceKey, title, body, icon, tag, data" e resposta "JSON {error, success}".| Doc lista a edge function `send-push-notification` (#24) — enviar push notification. Auth: Service. \| 179 linhas; chamador: edge: new-device-alert:250; verify_jwt true (default); tabelas tocadas (linhas em produção): push_subscriptions(0). Classificação do doc: PARCIAL. \| send-push-notification/index.ts:15-35 faz POST sem assinatura VAPID e sem criptografia; VAPID_PRIVATE_KEY nunca é lida; serviços de push rejeitam. \| Doc classifica como Ó…
- **Fontes:** `docs/API.md:220-220`, `docs/FUNCIONALIDADES_COMPLETAS.md:507-507`, `docs/FUNCIONALIDADES_SISTEMA.md:532-532; docs/FEATURE_SUMMARY.md:79-79`, `docs/DOCUMENTACAO_SISTEMA.md:992-1021`, `docs/estado/10_EDGE_FUNCTIONS.md:448-448`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:143` e mais 6
- **O que falta:** publicar send-push-notification E new-device-alert na allowlist ACTIVE do deploy.yml (ambas fora, ambas 100% inativas em produção mesmo com código pronto)
- **Evidência:** supabase/functions/send-push-notification/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: new-device-alert| cético: supabase/functions/send-push-notification/index.ts existe (451 linhas) e NÃO consta na allowlist ACTIVE de .github/workflows/deploy.yml:45 (lista integral não contém 'send-push-notification'); confirma a não-deploy. Adicionalmente, seu único chamador supabase/functions/new-device-alert/index.ts:251-253 TAMBÉM não consta nessa mesma allowlist (.github/workflows/deploy.yml:45) → cadeia inteira morta em produção, não só a function final. Uma sub-alegação do doc está desatualizada: 'VAPID_PRIVATE_KEY nunca é lida' é falsa hoje — o código lê Deno.env.get('VAPID_PRIVATE_KEY') em send-push-notification/index.ts:347 e implementa assinatura VAPID RFC 8292 completa (comentário em index.ts:15-21, 110, 343-350), ou s…

### F0870 · RPCs de agregação (ranking/portfólio) contra N+1

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Etapa 73 P.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:74`
- **O que falta:** Mover a soma semanal de src/hooks/gamification/useWeeklyRanking.ts:27-49 e os totais de src/hooks/crm/useClientPortfolio.ts:153,199 para RPC/view SQL; definir orçamento de queries por tela (doc A_planos_execucao.md:74 continua 'P').
- **Evidência:** Agregação no banco existe para ranking: view public.competitive_ranking (snapshot views.md:206) e mv_competitive_ranking, consumida em src/hooks/useCompetitiveRanking.ts:33 `.from('competitive_ranking')`; refresh via trigger public.trg_refresh_ranking_on_sale (functions.md). Portfólio: RPCs public.route_unassigned_client_portfolio e update_client_portfolio_status usadas em src/hooks/crm/useClientPortfolio.ts:66,224. Porém agregação no cliente persiste: src/hooks/gamification/useWeeklyRanking.ts:27-49 lê `sales(salesperson_id, amount)` e soma com `.reduce` por vendedor; src/hooks/crm/useClientPortfolio.ts:153 `totalValue = portfolio.reduce(...)` e :199 `from('clients').select('*')`.
- **Revisão:** sem contestação cética concluída.

### F0871 · `src/hooks/<dominio>/` com hooks TanStack Query por domínio

- **Tipo:** Hook
- **O que os docs afirmam:** ARCHITECTURE: hooks TanStack Query organizados por domínio em src/hooks/<dominio>/.
- **Fontes:** `docs/ARCHITECTURE.md:28-28`
- **O que falta:** Mover os 143 hooks da raiz de src/hooks para subpastas de domínio (ou atualizar docs/ARCHITECTURE.md:28 para refletir a organização mista).
- **Evidência:** Subpastas por domínio existem: `ls -p src/hooks| grep / \| wc -l` → 46 (crm, admin, reports, bi, pipeline...); hooks nelas usam TanStack Query com queryKey prefixada, ex.: src/hooks/crm/useClientPortfolio.ts:31 `queryKey: ['client_portfolio', salespersonId]`; 6/7 arquivos em src/hooks/crm usam useQuery/useMutation. Mas a convenção não é seguida na maioria: `ls -p src/hooks \| grep -v / \| grep -E '^use' \| grep -v .test.` → 143 hooks soltos na raiz (useCompetitiveRanking.ts, useCadences.ts, useCommissions.ts, useBitrix24.ts...), além de utilitários soltos (circuitBreakerUtils.ts, sessionHelpers.ts).
- **Revisão:** sem contestação cética concluída.

### F3442 · Duplicata local de useDebouncedValue em useCallLibrarySearch.ts

- **Tipo:** Hook
- **O que os docs afirmam:** Doc aponta debounce em só 4 buscas e duplicata de useDebouncedValue em useCallLibrarySearch.ts:16.
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:309`
- **O que falta:** arquivo src/hooks/conversational/useCallLibrarySearch.ts existe mas hook não consta em hooks.json (não exportado/indexado)
- **Evidência:** arquivo src/hooks/conversational/useCallLibrarySearch.ts existe mas hook não consta em hooks.json (não exportado/indexado)| CONTESTADO pelo cético (IMPLEMENTADO): src/hooks/conversational/useCallLibrarySearch.ts:3 importa `import { useDebouncedValue } from '@/hooks/useDebouncedValue';` e usa em :16/17 — NÃO redefine localmente o debounce, contrariando a descrição do doc ('duplicata local de useDebouncedValue em useCallLibrarySearch.ts:16'). O hook useSearchCallLibrary é consumido em src/components/conversational/CallLibrarySearch.tsx:7.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3475 · Hook useRateLimit.ts

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `useRateLimit.ts` — rate limiting genérico.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1274-1322`
- **O que falta:** arquivo src/hooks/useRateLimit.ts existe mas hook não consta em hooks.json (não exportado/indexado)
- **Evidência:** arquivo src/hooks/useRateLimit.ts existe mas hook não consta em hooks.json (não exportado/indexado)| CONTESTADO pelo cético (IMPLEMENTADO): src/hooks/useRateLimit.ts exporta useRateLimitSettings (l.27), useRateLimitLogs (l.79) e useRateLimitStats (l.107), com query e mutation reais em rate_limit_settings e rate_limit_logs (l.34,46,87,117,123). Consumido por src/components/security/RateLimitDashboard.tsx:39-43,69-72, montado em src/pages/SecurityDashboard.tsx:281. A página está na rota /seguranca (AppRoutes.tsx:1045-1050, com guarda Admin) e no menu (sidebarMenuData.ts:371). No banco real, rate_limit_settings e rate_limit_logs existem com RLS 'sim' (tables.md:289-290). A pré-checagem errou ao procurar um export literal 'useRateLimit'.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F0879 · Push notifications Web (VAPID) ponta a ponta

- **Tipo:** Integração externa
- **O que os docs afirmam:** push-subscribe registra inscrição; send-push-notification envia; VAPID_PUBLIC_KEY/PRIVATE_KEY; UI PushNotificationSettings/BrowserPushSettings.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:186,977,1013,1020,1697-1698`
- **O que falta:** Adicionar push-subscribe e send-push-notification (e new-device-alert, único chamador do send-push) à allowlist ACTIVE em .github/workflows/deploy.yml:144, removendo 2-3 functions mortas para caber no limite de 100; cadastrar VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY nos secrets (não verificável aqui).
- **Evidência:** Código completo: supabase/functions/push-subscribe/index.ts:66 (VAPID_PUBLIC_KEY), supabase/functions/send-push-notification/index.ts:343-350 (exige VAPID_PUBLIC_KEY/PRIVATE_KEY, assina RFC 8292), public/sw.js:11-32 (handler push), src/hooks/usePushNotifications.ts:58,130,136 (invoke push-subscribe + pushManager.subscribe), UI src/components/settings/BrowserPushSettings.tsx e src/components/security/PushNotificationSettings.tsx montadas em src/pages/Notificacoes.tsx e Configuracoes.tsx; tabela push_subscriptions com RLS (contexto/supabase/tables/public/push_subscriptions.md:7-9, 8 policies). MAS: `grep push-subscribe\|send-push-notification .github/workflows/deploy.yml` → 0 na allowlist ACTIVE (linha 144); docs/prod-readiness.md:372,403 confirmam `OPTIONS → 404 NOT_FOUND (não publicada)`.
- **Revisão:** sem contestação cética concluída.

### F0881 · VAPID_PUBLIC_KEY / VAPID_PRIVATE_KEY — Web Push

- **Tipo:** Integração externa
- **O que os docs afirmam:** Chaves VAPID para notificações push.
- **Fontes:** `docs/SECRETS_ROTATION.md:37`
- **O que falta:** Mesmo que F0879: publicar push-subscribe/send-push-notification via allowlist e confirmar secrets VAPID no painel Supabase (não verificável aqui).
- **Evidência:** supabase/functions/send-push-notification/index.ts:346-350 lê VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY e aborta com `vapid_not_configured` se ausentes; push-subscribe/index.ts:66 devolve a chave pública; src/hooks/usePushNotifications.ts:130 registra subscription; public/sw.js:11. Porém ambas as functions estão fora da allowlist ACTIVE (.github/workflows/deploy.yml:144 → 0 ocorrências) e docs/prod-readiness.md:372,403 registram 404 em produção.
- **Revisão:** sem contestação cética concluída.

### F0882 · 0 any no código-fonte (308 → 0)

- **Tipo:** Outro
- **O que os docs afirmam:** Onda C erradicou todos os any (308 → 0) com tipagem estrita.
- **Fontes:** `docs/reports/QA_EXHAUSTIVE_2026-07-15.md:13-32`
- **O que falta:** Tipar quotePdfExporter.ts:131 com `CellHookData` do jspdf-autotable e substituir `any` em global.d.ts por `unknown`/tipos do pacote para zerar a contagem.
- **Evidência:** `rg -e ': any\b' -e 'as any\b' -e '<any>' src/ --glob '!types.ts'` → 3 ocorrências: src/lib/quotePdfExporter.ts:131 (`data: any`), src/global.d.ts:10,19 (ambient module jspdf-autotable), todas com `eslint-disable-next-line @typescript-eslint/no-explicit-any` (quotePdfExporter.ts:130, global.d.ts:7,9,16,18).
- **Revisão:** sem contestação cética concluída.

### F0885 · ARCH-02: auditar 70 eslint-disable exhaustive-deps genéricos

- **Tipo:** Outro
- **O que os docs afirmam:** 70 diretivas `eslint-disable-next-line react-hooks/exhaustive-deps` com comentário boilerplate em race/_, security/_, lead-scoring/*; plano de converter para useEffectEvent/useRef ou justificar.
- **Fontes:** `docs/reports/AUDIT_2026-07-13.md:38-57`
- **O que falta:** Converter ou justificar individualmente as 48 diretivas com comentário genérico (concentradas em src/components/race/*), substituindo o boilerplate por motivo técnico específico ou refatorando com useRef/useEffectEvent.
- **Evidência:** Contagem atual `rg -c 'react-hooks/exhaustive-deps' src/` = 50 (doc docs/reports/AUDIT_2026-07-13.md:38 dizia 70); 48 ainda com o boilerplate 'dependencias intencionais (comportamento pre-existente verificado)' (ex.: src/components/race/RaceArena.tsx:152,179, src/components/race/PitStopPanel.tsx:52, src/components/lead-scoring/LeadScoringDashboard.tsx:59); race/* = 17, lead-scoring/* = 1, security/* = 1 (KnownDevices.tsx:94 com justificativa específica).
- **Revisão:** sem contestação cética concluída.

### F0887 · Hooks sem dados mockados ou hardcoded

- **Tipo:** Outro
- **O que os docs afirmam:** Doc afirma que todos os hooks em src/hooks/ estão conectados a dados reais do Supabase, nenhum usa mock ou hardcode.
- **Fontes:** `docs/FUNCIONALIDADES_SISTEMA.md:545-547`
- **O que falta:** Substituir o valor fixo 85 em useClientVsIndustry.ts:39 por RPC real de métrica do cliente (ou estado vazio honesto) e remover a derivação fictícia de `category` em usePurchaseHistory.ts:78.
- **Evidência:** Maioria real (Supabase), mas há dado fictício no caminho principal: src/hooks/bi/useClientVsIndustry.ts:39 `client: 85, // Mock client value for now` (consumido por src/pages/BusinessIntelligencePage.tsx); src/hooks/orders/usePurchaseHistory.ts:76-78 'Mocking some fields' (category derivada do nome do produto; consumido por src/components/purchase-intelligence/ClientPurchaseHistory.tsx). Math.random em src/hooks é só para ids/confetti/jitter (useRetryMutation.ts:47, useLevelUpCelebration.ts:121, useRaceDisplayEvents.ts:24), não dado de negócio.
- **Revisão:** sem contestação cética concluída.

### F0890 · Multi-fuso horário por usuário/conta

- **Tipo:** Outro
- **O que os docs afirmam:** timezone só na config de cadência (CadenceAlertConfig).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:35`
- **O que falta:** Coluna timezone em profiles (ou user_app_settings) com RLS, seletor na tela de configurações do usuário e aplicação em src/utils/dateHelpers.ts e agendamentos.
- **Evidência:** timezone só em configs de automação: src/components/sales/cadence/CadenceAlertConfig.tsx:38,59,223 (default 'America/Sao_Paulo'), src/components/sales/cadence/CadenceOutcomeConfig.tsx, src/pages/AdminFilaTarefasAutomaticas.tsx; no banco real a coluna `timezone` existe apenas em auto_task_queue_settings, cadence_alert_templates e cadence_outcome_rules (grep em contexto/supabase/tables/public/*.md); nenhuma coluna timezone em profiles/user_settings.
- **Revisão:** sem contestação cética concluída.

### F0893 · Envio centralizado de notificações de alerta (send-alert-notifications)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Edge send-alert-notifications (Service) despacha notificações de alerta (e-mail/push).
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1018`
- **O que falta:** Incluir send-alert-notifications na allowlist ACTIVE de .github/workflows/deploy.yml:144 (ou desagendar o job 85 que roda a cada 5 min contra 404); confirmar RESEND_API_KEY nos secrets (não verificável aqui).
- **Evidência:** Código completo: supabase/functions/send-alert-notifications/index.ts:1-20 (Resend, exige RESEND_API_KEY), :337 lê notification_preferences, :374 resend.emails.send, :232 insere em email_logs (tabela existe: contexto/supabase/tables/public/email_logs.md); cron real job 85 `send-alert-notifications-5min` */5 em contexto/supabase/cron.md:48 via trigger_internal_edge_job. MAS a function não está na allowlist ACTIVE (.github/workflows/deploy.yml:144 → 0 ocorrências) e docs/prod-readiness.md:399 registra `OPTIONS → 404 NOT_FOUND (não publicada)`; cron-runs.md:367-372 'succeeded 1 row' é só o enfileiramento pg_net, não o envio. Envia só e-mail, não push.
- **Revisão:** sem contestação cética concluída.

### F0894 · Migração incremental dos 132 arquivos da baseline da camada de dados

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** ADR-010: 132 arquivos permanecem na baseline; regra: ao tocar arquivo da baseline, migrar a query e removê-lo.
- **Fontes:** `docs/decisions/ADR-010-service-layer.md:67-70`
- **O que falta:** Adicionar `npm run check:data-layer` ao `ci` em package.json:58 e ao gate .github/workflows/pr-checks.yml para que a regra do ADR-010 (docs/decisions/ADR-010-service-layer.md:67-70) seja aplicada; sem isso a migração incremental depende de disciplina manual.
- **Evidência:** scripts/baselines/data-layer.txt tem 131 entradas (134 linhas), único commit 813f591b1 (2026-11-16) — sem histórico de redução; scripts/check-data-layer.mjs:13-27 implementa baseline + exceção `// data-layer-ok`; package.json:37 `check:data-layer`, porém ausente do script `ci` (package.json:58), de lint-staged (package.json:191) e de .github/workflows/pr-checks.yml (`rg data-layer` → 0).
- **Revisão:** sem contestação cética concluída.

### F0895 · Mobile push com deep links

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Falta push com deep link para a tela certa.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:121`
- **O que falta:** Publicar send-push-notification + new-device-alert (allowlist deploy.yml:144) e secrets VAPID; push mobile nativo depende de app nativo inexistente (F0883).
- **Evidência:** Deep link implementado no código: supabase/functions/send-push-notification/index.ts:359,416 (`data: { url: url|\| '/', ...data }`), public/sw.js:34-50 (notificationclick navega para data.url / openWindow), chamador supabase/functions/new-device-alert/index.ts:245,253 (url '/dashboard/seguranca'). Porém send-push-notification e new-device-alert estão fora da allowlist ACTIVE (.github/workflows/deploy.yml:144 → 0) e docs/prod-readiness.md:403 confirma 404 em produção; é Web Push, não push mobile nativo.
- **Revisão:** sem contestação cética concluída.

### F0897 · Etapa canônica 26/08 nº 62: Persistir onboarding (ownership, etapas, auditoria)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Etapa canônica 62 (plano 26/08, matriz de status 30/08, estado 🔒): ou remover a promessa da rota; reload/multiusuário preserva estado.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:212-212`
- **O que falta:** Ligar OnboardingTracking.tsx às tabelas onboarding_journeys/onboarding_steps (hook com useQuery/useMutation, estados loading/erro/vazio) ou remover a promessa da rota, como pede docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:212.
- **Evidência:** Rota /onboarding-tracking → src/pages/OnboardingTracking.tsx (src/routes/AppRoutes.tsx:925-926), mas a página (264 linhas) usa só useState/useMemo (imports :1-13); `rg 'localStorage\|supabase\|useQuery\|useMutation' src/pages/OnboardingTracking.tsx` → 0 — estado perdido no reload. Backend existe: tabelas onboarding_journeys/onboarding_steps com RLS (contexto/supabase/policies.md:520-523, tables/public/onboarding_steps.md:7-9), edge onboarding-launcher na allowlist escrevendo onboarding_journeys (index.ts:97,143), mas chamada só por src/components/customer-success/HelpdeskConnectorPanel.tsx:83; `rg onboarding_steps src/` (excl. types.ts) → 0.
- **Revisão:** sem contestação cética concluída.

### F0898 · UI usePageAnalytics: dashboard de heatmap de navegação para admin

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Falta dashboard de heatmap de navegação para admin para usePageAnalytics (UI atual: 2 imports).
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:88`
- **O que falta:** Se o requisito é heatmap (fluxo entre páginas/sequência de navegação), falta visualização de transições em UsageAnalytics.tsx; o doc docs/FUNCIONALIDADES_SEM_UI.md:88 está desatualizado quanto ao nome do hook.
- **Evidência:** `rg usePageAnalytics src/` → 0 (hook citado no doc não existe mais); tracking real em src/lib/analytics.ts:92 insere em page_analytics (tabela no banco real: contexto/supabase/tables/public/page_analytics.md); existe dashboard de uso src/pages/UsageAnalytics.tsx:3,30 com useUsageAnalytics (src/hooks/admin/useUsageAnalytics.ts:25 lê page_analytics agregado por rota) na rota /usage-analytics (AppRoutes.tsx:1029-1032) — é agregado por rota, não heatmap de navegação.
- **Revisão:** sem contestação cética concluída.

### F0900 · Nenhum dangerouslySetInnerHTML nem service_role no frontend

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** SEC-06 confirma via grep: 0 dangerouslySetInnerHTML e 0 service_role em src/.
- **Fontes:** `docs/reports/BACKEND_DEEP_AUDIT_V2_2026-07-11.md:49-49`
- **O que falta:** Zerar os 4 usos (CSS para index.css/Tailwind; BriefingNarrative com react-markdown) ou corrigir docs/reports/BACKEND_DEEP_AUDIT_V2_2026-07-11.md:49, que afirma 0.
- **Evidência:** rg dangerouslySetInnerHTML src/ → 4 usos reais: src/pages/MetasAtividades.tsx:183 (<style> CSS estático), src/components/ui/chart.tsx:80 (<style> CSS gerado de config), src/components/activities/DailyActivityRanking.tsx:373 (<style> keyframes estático), src/components/executive-briefing/BriefingNarrative.tsx:17 (__html: renderMarkdownSafe(narrative)); +1 comentário em src/components/conversational/CallLibrarySearch.tsx:23. service_role: só nome de coluna gerada (src/integrations/supabase/types.ts:23661,24197), testes (src/test/security/fn-cleanup-webhook-dedupe-privileges.test.ts:2,45,55) e comentários (src/hooks/engagement/useEngagementScore.ts:101, src/hooks/activities/activitiesSoftDelete.guard.test.ts:5) — nenhuma chave service_role no front.| cético: Confirmado: grep dangerouslySetInnerHTML src (sem testes) → src/components/ui/chart.tsx:80, src/components/executive-briefing/Briefin…

### F0901 · 317 ocorrências de .select("*") e consultas ilimitadas

- **Tipo:** Service/lib
- **O que os docs afirmam:** Há 317 ocorrências de .select("*"); consultas ilimitadas de todos os clientes/produtos, atividades sobrepostas e ranking agregado no cliente.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:265-265`
- **O que falta:** Colunas mínimas e paginação (.range + count) em atividades, produtos e ranking; demais select('*') seguem como dívida.
- **Evidência:** rg '.select("_")' em src/\**/_.ts(x) → 336 ocorrências em 212 arquivos (doc dizia 317). Clientes paginado: src/services/clientService.ts:52 .select(CLIENT_LIST_COLUMNS, { count: 'exact' }) e :69 .range(from, to), consumido por src/hooks/crm/useClients.ts:26-33 (useClientsPage). Produtos: src/hooks/useProducts.ts:63-66 .select('_') + .limit(limit). Atividades: src/hooks/activities/useActivities.ts:71-73 .select('_') + .limit(filters?.limit ?? 1000). Ranking: src/hooks/useCompetitiveRanking.ts:32-35 .from('competitive_ranking').select('_') sem limit/range (view agregada no servidor).| cético: Confirmado: src/hooks/activities/useActivities.ts:68-72 .from('activities').select('_')...limit(filters?.limit ?? 1000); src/hooks/useCompetitiveRanking.ts:32-34 .from('competitive_ranking').select('*').order('rank') sem limit/range. Clientes paginados em src/services/clientService.ts (select de colun…

### F0904 · Camada de serviço vestigial: 5 services vs 471 hooks diretos no Supabase

- **Tipo:** Service/lib
- **O que os docs afirmam:** Doc aponta 5 services (~20 KB) e 471 hooks falando direto com Supabase; propõe src/lib/db/ com helpers de query tipados e paginação (ADR-009).
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:50,57`
- **O que falta:** Criar src/lib/db/ com helpers tipados de paginação e migrar hooks quentes, ou registrar em ADR-010 que src/lib/db foi descartado.
- **Evidência:** src/services/ tem 6 services (biService, callFeedbackService, clientService, comboService, knownDeviceService, salesService; 43.390 bytes). src/lib/db/ → ausente (ls: No such file). docs/decisions/ADR-009-session-storage-e-csp.md trata de CSP, não da camada de dados; a decisão real é docs/decisions/ADR-010-service-layer.md (2026-10-01, Aceito): supabase.from/rpc só em hooks/services/lib/integrations, guardado por scripts/check-domain-boundaries.mjs (package.json:38). rg 'lib/db\|paginação' em ADR-010 → 0. 215 de 547 arquivos em src/hooks ainda chamam supabase.from/.rpc/.invoke diretamente.| cético: ls src/lib/db → No such file or directory; src/services/ tem 6 services (biService, callFeedbackService, clientService, comboService, knownDeviceService, salesService); docs/decisions/ADR-009-session-storage-e-csp.md trata de CSP; camada de serviço está em docs/decisions/ADR-010-service-layer…

### F0905 · Etapa 71 do plano: Paginar consultas ilimitadas

- **Tipo:** Service/lib
- **O que os docs afirmam:** Priorizar clientes, produtos, atividades e ranking; selecionar colunas mínimas. Saída esperada: limites e cursor testados. Gate: nenhum DDL inicial.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:748-748`
- **O que falta:** Paginar atividades e ranking com range+count, colunas mínimas em produtos e teste de limites/cursor (ex.: src/services/clientService.test.ts).
- **Evidência:** Clientes: src/services/clientService.ts:52-69 (select colunas mínimas, count exact, range) + src/hooks/crm/useClients.ts:26 useClientsPage. Produtos: src/hooks/useProducts.ts:64-66 select('_') com limit. Atividades: src/hooks/activities/useActivities.ts:71-73 select('_') limit 1000 sem cursor. Ranking: src/hooks/useCompetitiveRanking.ts:34 select('_') sem limite. Testes de cursor/limite: ls src/services/clientService.test.ts → ausente; só comboService/salesService/callFeedbackService têm .test.ts.| cético: src/hooks/activities/useActivities.ts:68-72 select('_') + limit 1000 sem cursor; src/hooks/useCompetitiveRanking.ts:32-34 select('*') sem limite; ls src/services → sem clientService.test.ts (só callFeedbackService/comboService/salesService .test.ts).

### F0906 · Etapa canônica 26/08 nº 92: Validar os 131 módulos, 21 hooks, 2 services e 2 páginas órfãos

- **Tipo:** Service/lib
- **O que os docs afirmam:** Etapa canônica 92 (plano 26/08, matriz de status 30/08, estado ⬜): imports, flags, telemetria, docs, owners; manter/migrar/deprecar por item.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:257-257`
- **O que falta:** Registrar manter/migrar/deprecar por item (ou citar #285 como fechamento da etapa 92 na matriz) e tratar exports mortos remanescentes como useOrderTrackingDetail.
- **Evidência:** deps:check nesta sessão → 0 erros (regra no-orphans), logo nenhum módulo órfão restante no grafo de imports. Mas não há registro de decisão por item: rg -i 'órf' CHANGELOG.md → 0; ls docs/decisions docs/execucao| grep -i orf → 0. A auditoria posterior docs/auditoria/funcionalidades-pendentes-2026-10-12/D_frontend.md:23,95,101,108 ainda listava ÓRFÃOs; parte foi resolvida (ConversationalIntelligence agora tem rota em src/routes/AppRoutes.tsx:349; EnrollCadenceDialog/CoachingProgressCard importados em src/pages/VendedorDashboard.tsx e src/components/sales/SaleHUDCard.tsx), mas D_frontend.md:23 aponta useOrderTrackingDetail exportado e nunca usado (src/hooks/orders/useOrderTracking.ts:104). \| cético: Reforço: commit 89aacaff8 (PR #285) removeu '128 arquivos de produção inalcançáveis a partir de main.tsx' e ~150 exports mortos, em bloco, sem decisão por item. docs/execucao/STATUS_100_ETAPA…

### F0907 · Etapa canônica 26/08 nº 93: Consolidar duplicatas e scripts (atoms/ui; remove-demos seguro)

- **Tipo:** Service/lib
- **O que os docs afirmam:** Etapa canônica 93 (plano 26/08, matriz de status 30/08, estado 🔶): imports migrados e testes verdes.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:258-258`
- **O que falta:** Apontar os 3 imports de '@/components/atoms/skeleton' para '@/components/ui/skeleton', apagar atoms/skeleton.tsx e atualizar STATUS_100_ETAPAS_2026-08-30.md:258 (remove-demos já removido em a24228771).
- **Evidência:** Duplicata atoms/ui persiste: src/components/atoms/skeleton.tsx e src/components/ui/skeleton.tsx são byte-a-byte idênticos (cat de ambos), com 3 arquivos importando 'atoms/skeleton'; componentes.json .nomes_duplicados = 19. scripts/remove-demos*: ls scripts| grep -i demo → só codemod-_.mjs; rg remove-demos fora de docs/ → 0 (não há nenhum script, nem 'um' consolidado). \| cético: Duplicata atoms/ui persiste: cmp src/components/atoms/skeleton.tsx src/components/ui/skeleton.tsx → idênticos; importado de atoms em src/components/assistant/BriefingHistoryTimeline.tsx, src/components/dashboard/PersonalAssistantSummaryCard.tsx, src/pages/MeuAssistente.tsx. Correção do verificador: remove-demos não 'falta': foi removido de propósito no commit a24228771 ('remove-demos_.ts ×5', deletou scripts/remove-demos{,-cleanup,-final,-v2,-v3}.ts). Outros duplicados atoms (badge,input,button,card,SmartImage) …

### F0909 · Handoff P088: Validar os oito módulos órfãos com o proprietário

- **Tipo:** Service/lib
- **O que os docs afirmam:** Fila canônica do handoff (onda 9): Validar os oito módulos órfãos com o proprietário. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:404-404`
- **O que falta:** Registrar a decisão (manter/remover) de cada um dos 8 módulos em um doc (ex.: docs/decisions/ADR-0xx-modulos-orfaos.md) ou marcar P088 como concluída com evidência 'deps:check 0 órfãos'.
- **Evidência:** Estado técnico: depcruise (package.json:36; regra no-orphans em .dependency-cruiser.cjs:28) rodado nesta sessão → 0 erros, nenhum órfão. Registro da decisão com o proprietário por módulo: rg -i 'órf\|orphan\|no-orphans' CHANGELOG.md → 0; ls docs/decisions docs/execucao| grep -i -E 'orf\|limpeza' → 0; docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:404 continua como pendente. \| CONTESTADO pelo cético (IMPLEMENTADO): A decisão por módulo existe no commit cc80002f7 (PR #209, co-autor '[dono] <[e-mail omitido]>' = dono): 'Remove 8 módulos órfãos sem consumidor: utils/fuzzing (+teste), schemas/commercial, bi/mockData, ui/sonner e 4 Animated*Indicator em effects/'; git show --stat cc80002f7 lista a deleção dos 8 arquivos (src/utils/fuzzing.ts, src/lib/schemas/commercial.ts, src/lib/bi/mockData.ts, src/components/ui/sonner.tsx, src/components/effects/AnimatedCoinsIndicator.…
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F0910 · i18n

- **Tipo:** Service/lib
- **O que os docs afirmam:** Não iniciado.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:171`
- **O que falta:** Consumir t() nos textos (menu sidebarMenuData.ts, páginas), senão a troca de idioma é cosmética.
- **Evidência:** src/contexts/I18nContext.tsx (233 linhas): Locale 'pt-BR'\|'en'\|'es', ~117 chaves, persistência em localStorage (:208,:217); I18nProvider montado em src/App.tsx:107-118; LanguageToggle (src/components/atoms/LanguageToggle.tsx:18) renderizado em src/components/organisms/DesktopTopBar.tsx:16,267; ThemeCustomizer.tsx:40 e CommandPalette.tsx:93 também trocam locale. Porém a função t() nunca é consumida: rg 'const { ... t } = useI18n' em src/ → 0; todos os consumidores pegam só { locale, setLocale }. Trocar idioma não altera nenhuma string na tela.| cético: Confirmado: os únicos consumidores de useI18n fora do contexto são src/components/settings/ThemeCustomizer.tsx:40, src/components/command/CommandPalette.tsx:93 e src/components/atoms/LanguageToggle.tsx:18, todos com { locale, setLocale }; grep -rnE "\bt\(['\"](nav|dashboard|action|common)\." src → 0. O toggle não muda nenhum texto.

### F0911 · i18n (framework e extração de strings)

- **Tipo:** Service/lib
- **O que os docs afirmam:** Nenhum framework i18n (i18next, react-intl, lingui = 0).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:36`
- **O que falta:** Framework (ou locales/*.json formal), extração de strings e uso de t() nos componentes.
- **Evidência:** rg 'i18next\|react-intl\|lingui\|react-i18next\|formatjs' package.json → 0 (nenhum framework). Existe só o contexto caseiro src/contexts/I18nContext.tsx com dicionário inline de ~117 chaves em 3 idiomas, sem extração de strings e com t() não usado por nenhum componente (rg → 0 consumidores de t).| cético: grep i18next\|react-intl\|lingui em package.json → 0; só o contexto caseiro src/contexts/I18nContext.tsx, cuja t() não tem consumidor (grep → 0).

### F0913 · Multi-language UI (hoje só pt-BR)

- **Tipo:** Service/lib
- **O que os docs afirmam:** UI só em pt-BR; falta i18n.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:160`
- **O que falta:** Ligar t() aos textos e mover os dicionários para locales/<lang>.json.
- **Evidência:** Dicionário com 3 idiomas em src/contexts/I18nContext.tsx (pt-BR, en, es; chaves 'nav._', 'dashboard._', 'action._', 'common._'), provider em src/App.tsx:107 e toggle em src/components/organisms/DesktopTopBar.tsx:267. Não há pasta locales/ (find src -iname '_locale_' → 0) e nenhum componente consome t() (rg → 0), logo a UI segue 100% pt-BR hardcoded.| cético: Dicionário de 3 idiomas em src/contexts/I18nContext.tsx sem nenhum consumidor de t() (ver F0910); não existe pasta locales/.

### F0915 · Offline-first robusto com resolução de conflitos

- **Tipo:** Service/lib
- **O que os docs afirmam:** Falta offline-first com sync conflict resolution.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:115`
- **O que falta:** Fila persistente de mutations (IndexedDB/persistQueryClient/background-sync) e resolução de conflito no servidor (updated_at/version).
- **Evidência:** Só cache de leitura: vite.config.ts:12-40 VitePWA (filename pwa-sw.js, precache do shell, navigateFallback index.html, runtimeCaching NetworkFirst para *.supabase.co com maxAgeSeconds 300); src/App.tsx:47 networkMode: 'offlineFirst'; src/components/atoms/SystemHealthBadge.tsx:20-23 só detecta online/offline. Nenhuma fila de mutations nem conflito: rg 'indexedDB\|idb\|localforage\|dexie' src/ → 0; rg 'backgroundSync\|BackgroundSync' vite.config.ts → 0; rg 'persistQueryClient\|onlineManager\|syncQueue\|offlineQueue\|pendingMutations' src/ → 0.| cético: grep -rliE 'offlineQueue\|indexedDB\|persistQueryClient\|onlineManager\|resumePausedMutations' src → 0. src/App.tsx:47 networkMode 'offlineFirst' só em queries; mutations (src/App.tsx:49+) têm só retry, sem persistência nem política de conflito. Só há cache PWA de leitura (vite.config.ts VitePWA).

### F0916 · Plano 30/08 etapa 88 (P088): Validar os oito módulos órfãos com o proprietário

- **Tipo:** Service/lib
- **O que os docs afirmam:** Etapa 88 do plano de 100 etapas (auditoria 30/08; = P088 do handoff): Decisão registrada para cada arquivo antes de mover ou excluir.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:758-758`
- **O que falta:** Registrar decisão por módulo (quais 8 eram, mantido/removido, quando) e fechar a etapa 88 na matriz de status.
- **Evidência:** Mesmo objeto de F0909: deps:check (package.json:36, regra no-orphans .dependency-cruiser.cjs:28-32) rodado nesta sessão → 0 erros/0 órfãos, mas 'decisão registrada para cada arquivo' não existe (rg -i 'órf\|orphan' CHANGELOG.md → 0; nenhum doc em docs/decisions ou docs/execucao sobre os 8 módulos; docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:758 segue como planejado).| CONTESTADO pelo cético (IMPLEMENTADO): Mesmo objeto de F0909. Commit cc80002f7 (PR #209, co-autor do dono [dono]) registra a decisão (remover) para cada um dos 8 módulos, nomeando-os: utils/fuzzing, schemas/commercial, bi/mockData, ui/sonner e 4 Animated*Indicator. Deleção confirmada por git show --stat. Gate no-orphans severity error em .dependency-cruiser.cjs:28-29. Nenhum dos arquivos existe hoje (ls → No such file).
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3488 · Sanitização de inputs e prevenção XSS

- **Tipo:** Service/lib
- **O que os docs afirmam:** Todos os inputs são sanitizados; prevenção XSS e SQL injection.
- **Fontes:** `docs/SECURITY.md:50-54`
- **O que falta:** As 120 edge functions da allowlist escrevem no banco sem validar a entrada. A afirmação 'todos os inputs sanitizados' só vale para as functions novas.
- **Evidência:** scripts/lint-input-validation.ts existe mas nenhum import encontrado (grep)| cético: A pré-checagem errou o motivo: scripts/lint-input-validation.ts É executado no CI (.github/workflows/edge-functions-input-validation.yml:54, 'deno run --frozen --allow-read scripts/lint-input-validation.ts'). Os usos de dangerouslySetInnerHTML estão OK: CSS estático em DailyActivityRanking.tsx:373 e MetasAtividades.tsx:183, chart.tsx:80 do shadcn, e BriefingNarrative.tsx:17 passa por renderMarkdownSafe. Mas a regra 'todos os inputs validados' é falsa: o lint isenta 120 functions legadas (scripts/input-validation-lint-allowlist.txt, 120 linhas úteis; lint-input-validation.ts:10-11). Zod é importado em só 1 index.ts de edge (grep → 1 de 171).

### F3489 · scripts/codemod-typography.mjs (codemod one-shot) sem chamador

- **Tipo:** Service/lib
- **O que os docs afirmam:** Codemod de tipografia sem invocador.
- **Fontes:** `docs/estado/12_INFRA_CI_TESTES.md:301`
- **O que falta:** É um codemod de uso único, sem chamador automático, só para execução manual. Decisão do dono: manter como ferramenta manual ou apagar (é candidato a remoção).
- **Evidência:** scripts/codemod-typography.mjs existe mas nenhum import encontrado (grep)| cético: scripts/codemod-typography.mjs existe e tem teste (scripts/codemod-typography.test.mjs, na suíte de scripts/automation.config.json:9). O próprio config confirma que não há chamador: automation.config.json:321-326 'Legado sem chamador literal no inventário; execução manual controlada… O dispatcher não executa esta operação.' Não aparece em package.json (grep codemod package.json → 0).

### F3490 · Service/lib App (2 afirmações nos docs)

- **Tipo:** Service/lib
- **O que os docs afirmam:** Doc afirma App.tsx:66-80 define onError global para mutations do TanStack Query.| `src/App.tsx:25` chama `initErrorTracking`; `src/lib/errorTracking.ts:76` grava em error_logs; RLS INSERT só anon → autenticado não grava.
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:322`, `docs/estado/08_ADMIN_SEGURANCA.md:132,208`
- **O que falta:** src/App.tsx existe mas nenhum import encontrado (grep)
- **Evidência:** src/App.tsx existe mas nenhum import encontrado (grep)| CONTESTADO pelo cético (IMPLEMENTADO): src/App.tsx é importado em src/main.tsx:22 (import('./App')), então o 'nenhum import' da pré-checagem está errado. O onError global de mutations está em App.tsx:66-79 (captureException + toast). initErrorTracking roda em App.tsx:25. src/lib/errorTracking.ts:100 insere em error_logs. A afirmação de que autenticado não grava foi superada: o banco real tem a policy 'authenticated can insert error logs' (INSERT, roles authenticated, WITH CHECK user_id IS NULL OR user_id = auth.uid()) em tables/public/error_logs.md:83-91. A coluna user_id tem default auth.uid() (l.10 das colunas), então o insert passa. Todas as colunas usadas existem.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3492 · Service/lib webVitals (2 afirmações nos docs)

- **Tipo:** Service/lib
- **O que os docs afirmam:** Doc afirma src/lib/webVitals.ts:23-29 normaliza rota, usa sendBeacon e batching; página admin de p75 (/admin/web-vitals) e function log-web-vitals.| webVitals.ts já presente; falta instrumentar coleta real em produção.
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:212,310,348`, `docs/reports/QA_EXHAUSTIVE_2026-07-15.md:74-74`
- **O que falta:** src/lib/webVitals.ts existe mas nenhum import encontrado (grep)
- **Evidência:** src/lib/webVitals.ts existe mas nenhum import encontrado (grep)| CONTESTADO pelo cético (IMPLEMENTADO): src/main.tsx:20-23,32: a função import('@/lib/webVitals') e reportWebVitals() rodam no bootstrap. src/lib/webVitals.ts:7 aponta para /functions/v1/log-web-vitals e usa sendBeacon com lote (l.48-81). log-web-vitals está na allowlist deploy.yml:144 e grava em web_vitals_samples (supabase/functions/log-web-vitals/index.ts:113). A tabela tem RLS 'sim' (tables.md:379) e ~15,8 mil linhas em produção (stats.md:18). Rota /admin/web-vitals em AppRoutes.tsx:1005-1010 (Admin) → AdminWebVitalsPage. useWebVitalsP75.ts:24 chama a RPC fn_admin_web_vitals_p75, que existe no banco (functions.md:174) sobre a view v_web_vitals_p75 (views.md:1331).
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F0923 · a11y sweep em 175 rotas

- **Tipo:** Teste
- **O que os docs afirmam:** Etapa 85 P: tests/a11y/routes.ts cobre 10 rotas; ignora color-contrast e svg-img-alt.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:84`
- **O que falta:** Ampliar A11Y_ROUTES a partir de AppRoutes.tsx/rotas.json, injetar sessão autenticada no CI e reduzir as regras ignoradas.
- **Evidência:** tests/a11y/routes.ts: grep -c 'path:' → 12 rotas (/auth, /404, /, /pipeline, /clientes ...), com ignoreRules ['color-contrast','svg-img-alt'] por rota (ex.: linhas 43-52); src/routes/AppRoutes.tsx tem 180 ocorrências de path=. Cobertura ≈ 12/175.| cético: tests/a11y/routes.ts: grep -c 'path:' → 12 rotas, só 2 com requiresAuth: false. tests/a11y/axe-sweep.spec.ts:5,85-86 pula as rotas com auth quando LOVABLE_BROWSER_AUTH_STATUS !== 'injected', e nenhum workflow define essa variável (grep em .github/workflows → 0). Na prática o CI varre 2 rotas de ~175.

### F0925 · Acessibilidade pública local parcial (2 aprovados, 8 autenticados pulados)

- **Tipo:** Teste
- **O que os docs afirmam:** Acessibilidade pública local: 2 aprovados e 8 autenticados pulados; a11y:sweep.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:87-87`
- **O que falta:** Injetar sessão Supabase gerenciada no CI (secrets LOVABLE_BROWSER_SUPABASE_SESSION_JSON/STORAGE_KEY + LOVABLE_BROWSER_AUTH_STATUS=injected) em a11y-sweep.yml e qa-exhaustive.yml para as 8 rotas autenticadas rodarem; ou reaproveitar o helper tests/e2e/helpers/auth.ts (E2E_TEST_EMAIL/PASSWORD) no axe-sweep.spec.ts.
- **Evidência:** tests/a11y/routes.ts:21-37 (2 rotas públicas) e :39-97 (8 rotas requiresAuth:true); tests/a11y/axe-sweep.spec.ts:5 e :85-91 pula toda rota autenticada quando LOVABLE_BROWSER_AUTH_STATUS !== 'injected'; ausente: grep -rn LOVABLE_BROWSER_AUTH_STATUS .github/workflows → 0 resultados (nenhum workflow injeta sessão). .github/workflows/a11y-sweep.yml:57-70 e qa-exhaustive.yml:120-133 rodam o sweep sem sessão → só as 2 públicas são avaliadas. Afirmação do doc confirmada.
- **Revisão:** sem contestação cética concluída.

### F0926 · ARIA labels

- **Tipo:** Teste
- **O que os docs afirmam:** Rotulagem acessível.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:638-638`
- **O que falta:** Rodar o sweep nas rotas autenticadas (ver F0925) e nomear os botões icon-only sem aria-label (ex.: lista via grep -rn -A3 'size="icon"' src| grep -v aria-label).
- **Evidência:** Sweep axe existe e bloqueia serious/critical (tests/a11y/axe-sweep.spec.ts:106-120,146) via npm run a11y:sweep (package.json:40), mas só em 2 rotas públicas (routes.ts:21-37; autenticadas puladas em axe-sweep.spec.ts:85-91). Heurística: grep -rn 'size="icon"' src → 209 botões icon-only; apenas ~132 têm aria-label/sr-only/title nas 3 linhas seguintes (grep -A3 ...| grep -c 'aria-label\|sr-only\|title=') → ~77 sem rótulo acessível evidente.
- **Revisão:** sem contestação cética concluída.

### F0927 · axe estrito ao selector-âncora (não aprovar DOM vazio)

- **Tipo:** Teste
- **O que os docs afirmam:** Doc: axe atual engole falha do seletor-âncora e pode aprovar DOM vazio.
- **Fontes:** `docs/auditoria/VALIDACAO_EXAUSTIVA_ONDA_1_2026-08-27.md:34,66`
- **O que falta:** Remover o fallback `body` do waitFor em tests/a11y/routes.ts:35 e acrescentar no spec uma asserção de que `#root` tem filhos antes de rodar o axe (ex.: expect(page.locator('#root > *').first()).toBeVisible()).
- **Evidência:** tests/a11y/axe-sweep.spec.ts:101 `await expect(page.locator(route.waitFor).first()).toBeVisible({timeout:15_000})` é asserção estrita (falha do seletor derruba o teste, não é engolida). Porém tests/a11y/routes.ts:35 usa waitFor 'main, [role="main"], body' — `body` é sempre visível, então a rota not-found aprova DOM vazio (#root sem conteúdo). Não há asserção explícita de #root não vazio (grep -n '#root' tests/a11y → 0 resultados).
- **Revisão:** sem contestação cética concluída.

### F3496 · Cobertura de componente para AuthFormCard/campo de senha

- **Tipo:** Teste
- **O que os docs afirmam:** Doc: não há teste de componente para AuthFormCard/password-input.
- **Fontes:** `docs/auditoria/VALIDACAO_EXAUSTIVA_ONDA_1_2026-08-27.md:55`
- **O que falta:** Criar src/components/auth/AuthFormCard.test.tsx (Vitest + Testing Library) cobrindo o toggle de visibilidade da senha (type password/text e aria-label 'Mostrar senha'/'Ocultar senha'), o envio do login, o modal de recuperação e os estados de erro e loading; opcionalmente teste do hook src/hooks/auth/useAuthForm.ts. Hoje só existe cobertura indireta por E2E.
- **Evidência:** Teste de componente (Vitest) ausente: ls src/components/auth/_.test._ e src/hooks/auth/_.test._ → nenhum arquivo; grep -rln 'AuthFormCard' src tests e2e → só src/components/auth/AuthFormCard.tsx e src/pages/Auth.tsx; src/components/ui não tem password-input. Há cobertura indireta por E2E Playwright: tests/e2e/auth-navigation.spec.ts:74-79 abre /auth, preenche 'Senha de Acesso' (rótulo em AuthFormCard.tsx:276) e clica 'ACESSAR CIRCUITO'; tests/e2e/auth-navigation.spec.ts:201 usa o placeholder 'Email cadastrado' do modal de recuperação (AuthFormCard.tsx:295); tests/e2e/mobile-auth-smoke.spec.ts:79 preenche o campo de senha. Esses specs rodam no gate: .github/workflows/pr-checks.yml:460 (job e2e) e :558 (npx playwright test). O toggle mostrar/ocultar senha (AuthFormCard.tsx:319-329) não é exercitado: grep -rln 'showPwd\|Mostrar senha\|Ocultar senha' tests e2e → 0 resultados.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F0929 · Etapa 72 do plano: Corrigir filtros .in de alta cardinalidade

- **Tipo:** Teste
- **O que os docs afirmam:** Substituir quatro violações por join/RPC/batching seguro. Saída esperada: testes unitários verdes e carga limite. Gate: possível RPC.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:749-749`
- **O que falta:** Só falta a parte 'carga limite' da etapa: cenário k6 (scripts/load/) ou teste que dispare .in com milhares de ids via chunkedIn para provar ausência de 414; o resto está entregue e gateado.
- **Evidência:** Batching seguro implementado: src/lib/supabase/chunkedIn.ts:28 `export async function chunkedIn` com 64 usos em src (grep -rn chunkedIn src| grep -v .test → 64). Guard estático src/lib/supabase/all-in-calls.test.ts:1-60 reprova qualquer .in() em coluna de alta cardinalidade fora do chunkedIn; executado agora: `npx vitest run src/lib/supabase/all-in-calls.test.ts` → 1 passed; roda em .github/workflows/qa-exhaustive.yml:90-91 e no `npm test` do pr-checks. Teste unitário chunkedIn.test.ts existe. Saída 'carga limite' da etapa: scripts/load/k6-smoke.js não exercita .in em massa (grep -n 'chunked\|.in(' scripts/load/k6-smoke.js → 0).
- **Revisão:** sem contestação cética concluída.

### F0930 · Etapa 85 do plano: Expandir acessibilidade

- **Tipo:** Teste
- **O que os docs afirmam:** Cobrir 174 rotas por amostragem de estados, remover suppressions justificadas e nomear 82 botões. Saída esperada: axe/teclado/reader gates. Gate: nenhum.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:765-765`
- **O que falta:** Ampliar routes.ts por amostragem das rotas de src/routes/AppRoutes.tsx, injetar sessão no CI, remover ignoreRules de color-contrast/svg-img-alt corrigindo tokens/SVG, nomear botões icon-only e adicionar teste de navegação por teclado.
- **Evidência:** Sweep cobre 10 rotas (tests/a11y/routes.ts:20-98) de 161 páginas (ls src/pages/*.tsx → 161), e as 8 autenticadas são puladas no CI (axe-sweep.spec.ts:85-91). Supressões continuam em todas as rotas (routes.ts:29,36,47,54,61,68,75,82,89,96 — 'region', 'color-contrast', 'svg-img-alt'). Botões icon-only: 209 ocorrências de size="icon" em src, ~77 sem aria-label/sr-only/title próximo (heurística grep). Nenhum gate de teclado/leitor de tela: grep -rn 'keyboard\|screen.reader\|toHaveAccessibleName' tests/a11y → 0.
- **Revisão:** sem contestação cética concluída.

### F0931 · Etapa canônica 26/08 nº 85: Expandir acessibilidade (175 rotas; nomear 82 botões)

- **Tipo:** Teste
- **O que os docs afirmam:** Etapa canônica 85 (plano 26/08, matriz de status 30/08, estado ⬜): remover supressões justificadas; gates de axe/teclado/leitor de tela.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:245-245`
- **O que falta:** Idem F0930: cobertura de rotas autenticadas no CI, remoção das supressões e nomeação dos botões icon-only.
- **Evidência:** Mesmo estado de F0930: gate axe só em 2 rotas públicas no CI (tests/a11y/routes.ts:21-37; axe-sweep.spec.ts:85-91), supressões por rota mantidas (routes.ts:47,54,75,82), ~77 botões size="icon" sem rótulo evidente (heurística grep em src). Estado ⬜ do doc confirmado.
- **Revisão:** sem contestação cética concluída.

### F0932 · Handoff P084: Acessibilidade autenticada nas 175 rotas

- **Tipo:** Teste
- **O que os docs afirmam:** Fila canônica do handoff (onda 9): Acessibilidade autenticada nas 175 rotas. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:400-400`
- **O que falta:** Secrets de sessão no CI + LOVABLE_BROWSER_AUTH_STATUS=injected em a11y-sweep.yml/qa-exhaustive.yml; ampliar routes.ts para as rotas críticas de AppRoutes.tsx.
- **Evidência:** Infra pronta: tests/a11y/axe-sweep.spec.ts:18-45 restaura sessão Supabase (cookies+localStorage) e routes.ts:39-97 declara 8 rotas autenticadas; mas nenhum workflow injeta a sessão (grep -rn LOVABLE_BROWSER_AUTH_STATUS .github/workflows → 0), logo o sweep autenticado nunca executa (skip em axe-sweep.spec.ts:85-91). 8 rotas ≠ 175 rotas de src/routes/AppRoutes.tsx.
- **Revisão:** sem contestação cética concluída.

### F0933 · Plano 30/08 etapa 84 (P084): Acessibilidade autenticada nas 175 rotas

- **Tipo:** Teste
- **O que os docs afirmam:** Etapa 84 do plano de 100 etapas (auditoria 30/08; = P084 do handoff): Violações priorizadas por impacto, com regressão automática nas rotas críticas.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:754-754`
- **O que falta:** Executar o sweep autenticado no CI (sessão injetada) e estender routes.ts às rotas críticas autenticadas.
- **Evidência:** Violações já são priorizadas por impacto (axe-sweep.spec.ts:118-120 filtra serious/critical; :122-138 anexa JSON por rota) e há regressão automática em PR de UI (.github/workflows/a11y-sweep.yml:9-17,57-70) — mas só nas 2 rotas públicas; as autenticadas são puladas (axe-sweep.spec.ts:85-91) por falta de sessão no CI (grep LOVABLE_BROWSER_AUTH_STATUS .github/workflows → 0).
- **Revisão:** sem contestação cética concluída.

### F0939 · [SDR] Notificações — central (IMPLEMENTADO_PARCIAL)

- **Tipo:** Trigger
- **O que os docs afirmam:** Notificações — central. UI: src/components/notifications/NotificationCenter.tsx:234. Hook: useNotifications.ts:46,93,127,143. Edge/Tabela: notifications. Linhas no banco: 6 (todas system/system). Quem dispara: trigger/edge diversos. O que falta: Funciona, mas nenhuma notificação do domínio SDR; última há 12 dias
- **Fontes:** `docs/estado/03_DOMINIO_SDR_CADENCIAS.md:302-302`
- **O que falta:** Em MQLQualificationForm.tsx:102 trocar o insert direto por supabase.rpc('send_notification', ...) (SECURITY DEFINER, aceita user_id alheio) e tratar o erro; decidir sobre sdr-consecutive-alerts: incluir na allowlist de deploy.yml:144 ou remover o cron job 82.
- **Evidência:** UI montada: src/components/notifications/NotificationCenter.tsx:230-239 usa useNotifications/useMarkNotificationRead etc.; montado em NotificationPopover.tsx:18 e src/pages/Notificacoes.tsx:169. Hook lê dado real: src/hooks/useNotifications.ts:55 .from('notifications'), :75 realtime channel, :119 rpc mark_all_notifications_read, :179 rpc send_notification. Banco: tables/public/notifications.md (RLS sim, 7 policies, realtime sim); functions.md:283 e :333 (RPCs existem, send_notification SECURITY DEFINER). Lacuna SDR confirmada com causa: único emissor do domínio SDR é src/components/sdr/MQLQualificationForm.tsx:102-112, que insere com user_id = auth_user_id do closer; a policy INSERT `notifications_insert_own_or_admin` exige WITH CHECK `(user_id = auth.uid()) OR is_admin_or_manager(auth.uid())` (notifications.md:106) e SDR tem app_role 'salesperson' → insert rejeitado silenciosamente (se…
- **Revisão:** sem contestação cética concluída.

### F0940 · Budgets de performance (bundle, lighthouse)

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Etapa 89 P: scripts/check-bundle-budget.mjs, .lighthouserc.json, job lighthouse.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:88`
- **O que falta:** Definir budgets de queries (ex.: contagem de requests Supabase por rota via Playwright) e de memória (performance.memory/heap em preview) com gate; incluir bundle-size (e, quando estável, lighthouse) no ci-gate de pr-checks.yml:711.
- **Evidência:** Bundle: scripts/check-bundle-budget.mjs:18-42 budgets por chunk, enforce em .github/workflows/pr-checks.yml:636-668 (job bundle-size) e qa-exhaustive.yml:96-97. Lighthouse: .lighthouserc.json:9-21 asserts perf/a11y/LCP/CLS; job pr-checks.yml:598-634. Nenhum dos dois está no ci-gate (pr-checks.yml:704-711 needs só lint-and-typecheck,test,build,instrucoes-agentes); lighthouse é não-bloqueante em qa-exhaustive.yml:117 (`\|\| echo ::warning`). Budgets de queries/memória: ausente (grep -rn -i 'memory budget\|query budget\|maxQueries' scripts .github → 0).
- **Revisão:** sem contestação cética concluída.

### F0941 · Ciclos de chunk eliminados (check-bundle-budget.mjs:18-40)

- **Tipo:** Workflow CI
- **O que os docs afirmam:** P087 P.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:177`
- **O que falta:** Adicionar checagem de ciclos entre chunks a partir de bundle-stats/ (ou rollup-plugin-visualizer JSON) no check-bundle-budget.mjs e budgets para os chunks de rota pesados (App/WinLoss).
- **Evidência:** Ciclo eliminado por fusão de chunks: vite.config.ts:157-165 (invariante react/Radix/catch-all no mesmo chunk 'vendor') e scripts/check-bundle-budget.mjs:37-39 (budget 'vendor' 330 KB). Mas não há guard automático contra ciclo de chunk: grep -rn -i circular scripts vite.config.ts → 0; .dependency-cruiser.cjs:15-16 (no-circular) cobre imports de código-fonte, não chunks do Rollup. Budgets App/WinLoss do item 87: chunks de rota ficam '⚪ untracked' (check-bundle-budget.mjs:61-69,89-90 — só vendor-* e **entry** têm teto).
- **Revisão:** sem contestação cética concluída.

### F0942 · Etapa 89 do plano: Definir budgets de performance

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Chunks, LCP/INP/CLS, queries, memória e PWA; quebrar módulos/chunks apenas por hotspot medido. Saída esperada: gate de regressão. Gate: nenhum.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:769-769`
- **O que falta:** Adicionar assert INP (ou TBT como proxy já existe em warn) como error, budgets de queries/memória, decisão sobre PWA, e tornar lighthouse/bundle-size required no ci-gate.
- **Evidência:** Chunks: scripts/check-bundle-budget.mjs:18-42 + pr-checks.yml:668 (gate por PR). LCP/CLS: .lighthouserc.json:16,20 (error). INP: ausente (grep -n 'interaction-to-next-paint\|inp' .lighthouserc.json → 0). Queries/memória/PWA: ausente (grep -rn -i 'pwa\|workbox\|vite-plugin-pwa' vite.config.ts package.json → 0; sem budget de queries/memória). Gate de regressão: lighthouse fora do ci-gate (pr-checks.yml:711) e não-bloqueante no semanal (qa-exhaustive.yml:117).
- **Revisão:** sem contestação cética concluída.

### F0943 · graphify:contracts e tsc tipado sem casts as unknown as

- **Tipo:** Workflow CI
- **O que os docs afirmam:** P059 P: casts contornam (FollowUpTerritoryRules.tsx:29).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:156`
- **O que falta:** Regenerar src/integrations/supabase/types.ts (types-sync.yml) para cobrir as tabelas usadas em FollowUpTerritoryRules.tsx e remover o cast; promover no-restricted-syntax a 'error' com ratchet; adicionar passo `graphify:contracts --out` ao graphify.yml/pr-checks.yml.
- **Evidência:** Script existe: package.json:52 `graphify:contracts` → scripts/graphify/static-contracts.mjs (mapeia .from/.rpc/.functions.invoke, :22-28), mas não roda em nenhum workflow (grep -rn 'graphify:contracts\|static-contracts' .github/workflows → 0) e exige `--out` (execução: 'Coleta estática recusada: Informe --out'). Casts: grep -rn 'as unknown as' src → 161 ocorrências; eslint.config.js:68-74 só 'warn' para o padrão; src/components/settings/FollowUpTerritoryRules.tsx:28-29 mantém `supabase as unknown as SupabaseClient` com eslint-disable (doc confirmado).
- **Revisão:** sem contestação cética concluída.

### F0945 · react-hooks/exhaustive-deps como error

- **Tipo:** Workflow CI
- **O que os docs afirmam:** L317 P: eslint.config.js:35 warn; 51 disables.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:269`
- **O que falta:** Promover a regra a 'error' em eslint.config.js:44 e zerar os 50 `eslint-disable-next-line react-hooks/exhaustive-deps` (corrigir deps ou usar useRef/useEvent).
- **Evidência:** eslint.config.js:44 `'react-hooks/exhaustive-deps': 'warn'` (ainda warn; a linha citada pelo doc era :35, hoje :44). Disables: grep -rn 'eslint-disable.*exhaustive-deps' src| wc -l → 50 (ex.: src/components/race/RaceArena.tsx:152,179; src/components/reporting/ReportPreview.tsx:52). Lint roda com --max-warnings 0 (package.json:27), então warnings bloqueiam, mas os 50 disables mascaram as violações.
- **Revisão:** sem contestação cética concluída.

### F0946 · tsconfig strict sem ratchet (noUncheckedIndexedAccess)

- **Tipo:** Workflow CI
- **O que os docs afirmam:** L311 P: tsconfig.app.json:14 strict; noUncheckedIndexedAccess false; tsconfig.strict.json ratchet.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:268`
- **O que falta:** Reduzir scripts/typecheck-baseline.json (882 → 0) corrigindo acessos indexados, depois mover noUncheckedIndexedAccess/noUnused* para tsconfig.app.json e remover tsconfig.strict.json (docs/TYPE_DEBT.md).
- **Evidência:** tsconfig.app.json:14 `strict: true` e :19 `noUncheckedIndexedAccess: false`; tsconfig.strict.json:6-11 liga noUncheckedIndexedAccess/noUnusedLocals/noUnusedParameters como ratchet; scripts/typecheck-baseline.json total 882 erros (geradoEm 2026-10-01); scripts/check-typecheck-baseline.mjs:28-57 reprova só erros novos; roda em .github/workflows/pr-checks.yml:133 (`npm run typecheck:baseline`). Ratchet não zerado.
- **Revisão:** sem contestação cética concluída.

## Não verificável (2)

### F0829 · Secret de edge VAPID_PRIVATE_KEY

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc lista o secret `VAPID_PRIVATE_KEY` — chave privada VAPID (push) — como configurado nas Edge Functions.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1687-1698`
- **O que falta:** Faltou acesso para listar secrets do projeto (painel Supabase > Edge Functions > Secrets ou `supabase secrets list`). Mesmo configurado, a única leitora (send-push-notification) está fora da allowlist e precisaria entrar em deploy.yml:144.
- **Evidência:** Leitura no código: supabase/functions/send-push-notification/index.ts:347 (`Deno.env.get('VAPID_PRIVATE_KEY')`), :348-353 retorna 503 'vapid_not_configured' se ausente. Função NÃO está na allowlist ACTIVE (.github/workflows/deploy.yml:144 → grep -x send-push-notification → 0), logo não roda em produção. Nenhum MCP disponível lista secrets de edge do projeto usyxfpqlsspldubptrdl (só create_edge_function_secret); vault.md do snapshot sem 'vapid' (grep -i vapid → 0).| CONTESTADO pelo cético (PARCIAL): A única leitora do secret é supabase/functions/send-push-notification/index.ts:346-353 (sem chave, responde 503). Ela está fora da allowlist ACTIVE em .github/workflows/deploy.yml:144: `sed -n 144p \| sed 's/\\n/\n/g' \| grep -E 'push\|device'` → 0 de 100 linhas. Seu único chamador é new-device-alert (snapshot edge-functions.json: chamada_por_edges=['new-device-alert']), que também está fora …
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F0830 · Secret de edge VAPID_PUBLIC_KEY

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc lista o secret `VAPID_PUBLIC_KEY` — chave pública VAPID (push) — como configurado nas Edge Functions.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:1687-1698`
- **O que falta:** Faltou acesso à listagem de secrets do projeto. Adicionalmente push-subscribe e send-push-notification precisam entrar na allowlist (deploy.yml:144) para o secret ter efeito em produção.
- **Evidência:** Leitura no código: supabase/functions/push-subscribe/index.ts:66 (`Deno.env.get("VAPID_PUBLIC_KEY")`, action get-vapid-key público) e supabase/functions/send-push-notification/index.ts:346. Nenhuma das duas está na allowlist ACTIVE (.github/workflows/deploy.yml:144 → grep -x push-subscribe\|send-push-notification → 0). Sem ferramenta MCP para listar secrets do projeto; snapshot vault.md sem 'vapid'.| CONTESTADO pelo cético (PARCIAL): O secret é lido em supabase/functions/push-subscribe/index.ts:66 e send-push-notification/index.ts:346. Nenhuma das duas está na allowlist ACTIVE de .github/workflows/deploy.yml:144 (grep push → 0 de 100 linhas). Logo, o chamador do front (src/hooks/usePushNotifications.ts:58 invoca 'push-subscribe') não recebe a chave em produção. Nesse caso o hook cai em toast.success('Notificações do navegador ativadas') (usePushNotifications.ts:121-125) sem assinar push…
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

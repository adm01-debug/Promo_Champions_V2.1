# Segurança, LGPD e administração

[Voltar ao índice](README.md)

309 itens não implementados, parciais ou não verificáveis neste domínio.

## Não implementado (117)

### F3827 · Componente/tela IPWhitelistPanel (2 afirmações nos docs)

- **Tipo:** Componente
- **O que os docs afirmam:** Doc lista o componente `IPWhitelistPanel.tsx` — painel de whitelist de IPs.| `IPWhitelistPanel.tsx` sem imports.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:171-187`, `docs/estado/08_ADMIN_SEGURANCA.md:144,247`
- **O que falta:** componente IPWhitelistPanel ausente (componentes.json e src/)
- **Evidência:** componente IPWhitelistPanel ausente (componentes.json e src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): Removido de propósito: commit 6df1a08f1 'refactor(ui): remover 4 componentes de segurança órfãos' apaga src/components/security/IPWhitelistPanel.tsx (199 l), e commit aead9c9a2 (#283) diz 'remover ... IPWhitelistPanel (duplicata do IPWhitelistManager montado)'. A função equivalente está ativa: src/pages/Configuracoes.tsx:10 importa e :309 monta <IPWhitelistManager />. Ausente hoje: grep -rln IPWhitelistPanel src → 0.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3829 · Componente/tela RoleManager (4 afirmações nos docs)

- **Tipo:** Componente
- **O que os docs afirmam:** PARCIAL (9/11 ainda sem uso): RoleManager com 0 importadores.| Doc lista o componente `RoleManager.tsx` — administração de papéis. \| Painéis de segurança construídos e sem uso. \| Classificado MORTO: `src/components/security/RoleManager.tsx` (289 l) duplica RoleManagement; 0 imports.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:222`, `docs/DOCUMENTACAO_SISTEMA.md:171-187`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:135`, `docs/estado/08_ADMIN_SEGURANCA.md:113`
- **O que falta:** componente RoleManager ausente (componentes.json e src/)
- **Evidência:** componente RoleManager ausente (componentes.json e src/)| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): Commit 6df1a08f1 apaga src/components/security/RoleManager.tsx (287 l). Commit aead9c9a2 (#283) diz 'remover RoleManager (mock visual sem backend; RoleManagement e PermissionMatrix ja montados)'. Ausente hoje: grep -rln RoleManager src → 0.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3830 · Filtro de período (1h| 6h \| 24h \| 7d \| custom com datas)

- **Tipo:** Componente
- **O que os docs afirmam:** Filtro de período pré-definido ou datas personalizadas (Calendar/Popover); padrão 24h.
- **Fontes:** `docs/TELEMETRY_MODULE_DOCS.md:62,396,406-409,866`
- **O que falta:** componente TimeFilter ausente (componentes.json e src/)
- **Evidência:** componente TimeFilter ausente (componentes.json e src/)| CONTESTADO pelo cético (IMPLEMENTADO): src/pages/AdminTelemetria.tsx:50 define o tipo TimeFilter = '1h'\|'6h'\|'24h'\|'7d'\|'custom'; :57 o padrão é '24h'; :61-78 getTimeThreshold() calcula o intervalo, inclusive o personalizado; :12-13 importa Popover e Calendar; :352-368 Select com opção 'Personalizado' que abre o Popover. O filtro é usado na consulta real de query_telemetry (:96-108), tabela que existe no banco com RLS (tables.md:261). Rota em src/routes/AppRoutes.tsx:1013 (/admin/telemetria); menu em sidebarMenuData.ts:363.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3831 · Indicador de força de senha

- **Tipo:** Componente
- **O que os docs afirmam:** Interface exibe indicador de força da senha ao digitar.
- **Fontes:** `docs/SECURITY.md:9`
- **O que falta:** Componente que mostra a força da senha enquanto se digita, usado no cadastro e no reset de senha
- **Evidência:** componente PasswordStrength ausente (componentes.json e src/)| cético: Busca por PasswordStrength/zxcvbn/'senha fraca\|forte' em src encontra só texto fixo em src/pages/ResetPassword.tsx:122 ('Escolha uma senha forte com pelo menos 6 caracteres') e mensagens de erro do servidor em src/lib/auth/passwordErrorMessages.ts:47. Os resultados com 'strength' em src são todos de coaching, não de senha.

### F3832 · Sessão: aviso 5 minutos antes de expirar

- **Tipo:** Componente
- **O que os docs afirmam:** Usuário recebe aviso 5 minutos antes da expiração.
- **Fontes:** `docs/SECURITY.md:22`
- **O que falta:** Modal ou toast avisando 5 min antes de expirar, com opção de renovar a sessão
- **Evidência:** componente SessionExpiryWarning ausente (componentes.json e src/)| cético: Não existe aviso antes de expirar. src/hooks/useSessionManagement.ts:27 verifica a sessão a cada 5 min e :250-253 só faz toast.warning('Sua sessão expirou...') e signOut DEPOIS que a sessão já expirou. Busca por SessionExpiryWarning/SessionTimeout em src → 0.

### F3833 · Edge function new-device-alert sem functions.invoke literal no front

- **Tipo:** Agendamento (cron)
- **O que os docs afirmam:** Uma das 64/168 funções sem invocador literal em src/. Grupo: Cron / alertas agendados (INFERIDO). Classificação por grupo deduzida do nome; pg_cron/config.toml não verificados.
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:291-311`
- **O que falta:** nenhum job em pg_cron para "new-device-alert" (cron.md, 45 jobs)
- **Evidência:** nenhum job em pg_cron para "new-device-alert" (cron.md, 45 jobs)| CONTESTADO pelo cético (PARCIAL): O artefato existe: supabase/functions/new-device-alert/index.ts (301 l, envia e-mail via Resend). Nada dispara a função: 0 ocorrências em cron.md e triggers.md; sem invocação em src; em supabase/functions só aparece num comentário (send-push-notification/index.ts:309). Está fora da allowlist ACTIVE (.github/workflows/deploy.yml:144). Pelo código, é um alerta disparado por login, não uma tarefa de cron.
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F2562 · Canário via flag USE_USER_CLIENT_${FN_NAME} inexistente

- **Tipo:** Doc/config
- **O que os docs afirmam:** String `USE_USER_CLIENT_` não existe em lugar nenhum do repositório.
- **Fontes:** `docs/estado/08_ADMIN_SEGURANCA.md:233`
- **O que falta:** Implementar a flag de canário em supabase/functions/_shared/auth-client.ts, ou retirar a promessa dos docs.
- **Evidência:** grep USE_USER_CLIENT_ no repo (fora node_modules) só retorna docs discutindo a ausência da flag (C_estado_runbooks.md, 08_ADMIN_SEGURANCA.md:233) e SEC-08_SERVICE_ROLE_AUDIT.md:54 onde é só proposta futura. Zero ocorrências em código.| cético: ausente: `grep -rln USE_USER_CLIENT --exclude-dir=node_modules --exclude-dir=.git .` → só 3 docs (C_estado_runbooks.md, 08_ADMIN_SEGURANCA.md, SEC-08_SERVICE_ROLE_AUDIT.md). `grep -rniE 'canary\|canario' supabase/functions/_shared` → 0 resultados, nem em _shared/auth-client.ts.

### F2563 · CAPTCHA (hCaptcha/Turnstile) em sign-in/sign-up

- **Tipo:** Doc/config
- **O que os docs afirmam:** Requer secret no provider e site key no frontend.
- **Fontes:** `docs/AUTH_CONFIG.md:38-40`
- **O que falta:** Colocar o widget hCaptcha/Turnstile no login e no cadastro, enviar options.captchaToken e habilitar o provider no painel GoTrue.
- **Evidência:** grep CAPTCHA/hcaptcha/turnstile/captchaToken em src/ → 0 resultados. .env.example sem variáveis CAPTCHA. Nenhum envio de captchaToken em signIn/signUp.| cético: ausente: `grep -rliE 'captcha\|turnstile' src supabase/functions --include=*.ts --include=*.tsx` → 0 resultados. `grep -niE captcha .env.example supabase/config.toml` → 0 resultados.

### F2578 · D10: SUPABASE_SERVICE_ROLE_KEY, SUPABASE_DB_URL e SUPABASE_ACCESS_TOKEN são secrets de repo; SUPABASE_DB_URL não usado

- **Tipo:** Doc/config
- **O que os docs afirmam:** Qualquer branch lê os secrets; SUPABASE_DB_URL não referenciado por workflow.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:19,78-80`
- **O que falta:** Criar Environment ci-integration com restrição de branch e mover os secrets sensíveis para ele.
- **Evidência:** github_list_actions_secrets confirma SUPABASE_SERVICE_ROLE_KEY, SUPABASE_DB_URL, SUPABASE_ACCESS_TOKEN no nível do repo; github_list_environments não mostra ci-integration. SUPABASE_DB_URL hoje É usado (apply-migration.yml:40, contexto.yml:221, db-backup.yml:38, db-probe.yml:30, pr-checks.yml:384) — claim original desatualizado. ENVIRONMENTS.md:38-40 confirma secrets 'no nível do repositório' por design.
- **Revisão:** sem contestação cética concluída.

### F2579 · D11: allowed_actions=all e sha_pinning_required=false, embora actions estejam pinadas por SHA

- **Tipo:** Doc/config
- **O que os docs afirmam:** Configuração de Actions permissiva.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:20,63-64`
- **O que falta:** Setar sha_pinning_required=true e allowed_actions=selected com allowlist.
- **Evidência:** github_get_actions_permissions (live): {allowed_actions:'all', sha_pinning_required:false} — confirma a configuração permissiva em 20/11/2026.
- **Revisão:** sem contestação cética concluída.

### F2584 · DPA templates

- **Tipo:** Doc/config
- **O que os docs afirmam:** Falta templates de DPA.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:190`
- **O que falta:** Criar templates de DPA em docs/legal/.
- **Evidência:** ausente: find docs/legal -type f → diretório inexistente; find . -iname '_DPA_' só acha a própria menção em docs/GAPS_CLASSE_MUNDIAL.md:190.
- **Revisão:** sem contestação cética concluída.

### F2585 · Etapa 1 do plano: Abrir incidente de credenciais

- **Tipo:** Doc/config
- **O que os docs afirmam:** Registrar os dois P0, owners, horário e cadeia de custódia sem copiar valores sensíveis. Saída esperada: ticket de incidente. Gate: nenhum.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:657-657`
- **O que falta:** Abrir ticket de incidente formal com owners e cadeia de custódia.
- **Evidência:** STATUS_100_ETAPAS_2026-08-30.md:119 marca '🔶' pendente; A_planos_execucao.md:19 marca 'NI'. github_search_issues 'incidente credenciais' não retornou ticket de incidente dedicado (só PRs de docs/CI #68,#69,#184).
- **Revisão:** sem contestação cética concluída.

### F2586 · Etapa 17: ruleset extra para .github/workflows/** (só o owner altera)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Bloqueia agente reescrevendo CI.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:53`
- **O que falta:** Criar ruleset com file path restriction para .github/workflows/**.
- **Evidência:** github_list_rulesets (live) retorna só 1 ruleset (main-protection, target BRANCH, refName include DEFAULT_BRANCH) — nenhum ruleset de restrição de caminho para .github/workflows/**.
- **Revisão:** sem contestação cética concluída.

### F2587 · Etapa 20: sha_pinning_required=true

- **Tipo:** Doc/config
- **O que os docs afirmam:** Tudo já pinado.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:60`
- **O que falta:** Setar sha_pinning_required=true.
- **Evidência:** github_get_actions_permissions (live): sha_pinning_required=false.
- **Revisão:** sem contestação cética concluída.

### F2588 · Etapa 21: allowed_actions selected com allowlist (actions/, github/, denoland/, supabase/, astral-sh/, treosh/)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Restringir actions.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:61`
- **O que falta:** Setar allowed_actions=selected com a allowlist de patterns (actions/, github/, denoland/, supabase/, astral-sh/, treosh/).
- **Evidência:** github_get_actions_permissions (live): allowed_actions='all', não 'selected'.
- **Revisão:** sem contestação cética concluída.

### F2590 · Etapa 33: Environment ci-integration com restrição de branch para SUPABASE_SERVICE_ROLE_KEY, SUPABASE_ACCESS_TOKEN e credenciais E2E

- **Tipo:** Doc/config
- **O que os docs afirmam:** Secrets saem do nível de repo.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:77`
- **O que falta:** Criar Environment ci-integration com deployment_branch_policy restrito a main.
- **Evidência:** github_list_environments (live) só lista copilot, pr-preview, Preview, Production — sem ci-integration. G_infra_ci_integracoes.md:63 confirma 'NÃO INICIADO'.
- **Revisão:** sem contestação cética concluída.

### F2591 · Etapa 34: remover secret SUPABASE_DB_URL

- **Tipo:** Doc/config
- **O que os docs afirmam:** Não usado; expõe Postgres de produção.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:78`
- **O que falta:** Remover o secret — mas isso quebra workflows que hoje dependem dele; decisão de arquitetura antes.
- **Evidência:** github_list_actions_secrets (live) lista SUPABASE_DB_URL ainda presente (updated_at 2026-10-14), e agora usado por mais workflows (ver F2578).
- **Revisão:** sem contestação cética concluída.

### F2592 · Etapa 35: trocar SUPABASE_ACCESS_TOKEN por token de escopo mínimo

- **Tipo:** Doc/config
- **O que os docs afirmam:** Token de conta acessa todos os projetos.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:79`
- **O que falta:** Criar token dedicado de escopo mínimo e documentar a troca.
- **Evidência:** docs/SECRETS_ROTATION.md:17,62 e PLANO_CI_WORKFLOWS_2026-10-01.md:76 ainda descrevem SUPABASE_ACCESS_TOKEN como token de conta genérico; nenhum documento registra token dedicado de escopo mínimo.
- **Revisão:** sem contestação cética concluída.

### F2593 · Etapa 39: documentar rotação trimestral de secrets e lembrete agendado

- **Tipo:** Doc/config
- **O que os docs afirmam:** Alinhar com #184.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:83`
- **O que falta:** Documentar cadência trimestral e criar workflow agendado de lembrete, alinhado à issue #184.
- **Evidência:** docs/SECRETS_ROTATION.md existe mas grep 'trimestral\|quarterly\|lembrete' → 0 resultados; nenhum workflow schedule trata de lembrete de rotação.
- **Revisão:** sem contestação cética concluída.

### F2594 · Etapa 52 do plano: Planejar expurgo do histórico

- **Tipo:** Doc/config
- **O que os docs afirmam:** Mapear clones, branches, tags, CI e consumidores antes de git-filter-repo. Saída esperada: runbook e janela. Gate: autorização explícita para reescrita.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:723-723`
- **O que falta:** Produzir runbook de expurgo e janela; depende de autorização explícita do dono (gate destrutivo).
- **Evidência:** STATUS_100_ETAPAS_2026-08-30.md:197 marca '⬜'; A_planos_execucao.md:56 marca 'NI' (busca por filter-repo/BFG sem resultado). Nenhum runbook dedicado de expurgo encontrado.
- **Revisão:** sem contestação cética concluída.

### F2597 · Etapa 90: Dependabot cooldown de 3-7 dias

- **Tipo:** Doc/config
- **O que os docs afirmam:** Evita pacote recém-publicado comprometido.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:158`
- **O que falta:** adicionar bloco `cooldown: { default-days: <3-7> }` em cada entrada `updates` de .github/dependabot.yml.
- **Evidência:** ausente: grep -n 'cooldown' .github/dependabot.yml → 0 resultados. Arquivo lido integralmente só tem schedule/groups/labels/assignees.
- **Revisão:** sem contestação cética concluída.

### F2613 · Histórico de rotações vazio (nenhuma rotação registrada)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Tabela de histórico sem linhas; critério de aceite pendente após rotação dos secrets CI.
- **Fontes:** `docs/SECRETS_ROTATION.md:124-132`
- **O que falta:** executar rotação real de secret (ex.: CI Supabase/E2E) e registrar data+motivo+downtime na tabela §4.
- **Evidência:** docs/SECRETS_ROTATION.md:124-132: tabela §4 continua com a linha única 'Nenhuma rotação registrada até a criação deste documento (2026-10-01)', sem linha datada adicional; linhas 134-136 reafirmam que o critério de aceite está pendente.
- **Revisão:** sem contestação cética concluída.

### F2614 · Incidente formal de credenciais

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 1 NI: nenhum incidente em docs/postmortems além de 2026-08-30_cron_outage.md.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:19`
- **O que falta:** criar docs/postmortems/<data>_credenciais.md com timeline, causa raiz, remediação e owners.
- **Evidência:** ls docs/postmortems/ → só 2026-08-30_cron_outage.md. Nenhum postmortem sobre incidente de credenciais.
- **Revisão:** sem contestação cética concluída.

### F2625 · Pen test e procedimento de incidente

- **Tipo:** Doc/config
- **O que os docs afirmam:** Backlog P: pen test ausente.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:335`
- **O que falta:** Relatório de pen test (interno ou de terceiro) — nenhum artefato no repo. Contratar/executar e versionar o relatório (ou declarar formalmente como risco aceito).
- **Evidência:** `find docs -iname '*pentest*' -o -iname '*penetration*'` → 0 resultados. docs/SECURITY.md:93 só lista 'Penetration testing' como item de checklist aspiracional, sem relatório anexo. O procedimento de incidente, por outro lado, EXISTE separadamente: docs/RUNBOOK.md:87 'Procedimento de Incidente' e docs/SECURITY.md:114 'Incident Response', além de docs/postmortems/2026-08-30_cron_outage.md (post-mortem real).
- **Revisão:** sem contestação cética concluída.

### F2629 · Plano 30/08 etapa 16 (P016): Matriz verify_jwt declarada × implantada × exigida

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 16 do plano de 100 etapas (auditoria 30/08; = P016 do handoff): Consolidar a matriz verify_jwt; divergências classificadas por risco e fluxo público legítimo.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:665-665`
- **O que falta:** Criar a matriz consolidada (ex. docs/security/verify-jwt-matrix.md) cruzando config.toml (implantada), docs/API.md (declarada) e uma coluna de risco/exigência real por função, como pedia a etapa 16 do plano de 100 etapas.
- **Evidência:** `grep -n verify_jwt docs/agentes/mapa-do-sistema.md` → 0 resultados; não existe matriz consolidada 'declarada × implantada × exigida' com classificação de risco em nenhum doc (`grep -rln verify_jwt docs/` só retorna docs de runbook/estado específicos e docs/API.md, nenhum com classificação de risco por função). docs/API.md tem uma listagem por function (Auth exigida), mas não cruza 'declarada' vs 'implantada' vs 'exigida' nem classifica divergências por risco/fluxo público.
- **Revisão:** sem contestação cética concluída.

### F2630 · Plano 30/08 etapa 65 (P065): Matriz de autenticação/autorização para as 170 funções

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 65 do plano de 100 etapas (auditoria 30/08; = P065 do handoff): Ator permitido, recurso, owner e verificação de escopo por endpoint.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:729-729`
- **O que falta:** Produzir a matriz de autenticação/autorização por endpoint (ator permitido, recurso, owner, verificação de escopo) prevista na etapa 65 (P065) — nenhum artefato encontrado.
- **Evidência:** `find . -iname '*edge-auth-matrix*'` → 0 resultados; não existe docs/security/ no repo (`ls docs/security/` falha). docs/agentes/mapa-do-sistema.md não contém matriz de ator/recurso/owner por function. O doc mais próximo (docs/API.md) lista auth por padrão detectado no handler, mas não é uma matriz formal de autorização (owner, escopo, verificação) por endpoint cobrindo as ~170 functions.
- **Revisão:** sem contestação cética concluída.

### F2641 · Repositório GitHub privado

- **Tipo:** Doc/config
- **O que os docs afirmam:** API do GitHub: visibility public; CHANGELOG.md:6 diz que foi tornado privado.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:124`
- **O que falta:** Tornar o repositório privado de fato (ação do dono no GitHub, Settings → Danger Zone → Change visibility) ou corrigir CHANGELOG.md:166 para não afirmar algo que não ocorreu — decisão de negócio/segurança, não cabe ao agente decidir sozinho dado o impacto (CI, Vercel, colaboradores externos).
- **Evidência:** `github_get_repo(adm01-debug/Promo_Champions_V2.1)` retorna `"private": false, "visibility": "public"` — confirmado ao vivo via GitHub API nesta sessão. CHANGELOG.md:166 afirma 'Repositório tornado privado (expunha código completo + PII de funcionários)', o que é falso hoje; AGENTS.md:60 também já declara 'Repo público' como estado atual e conhecido.
- **Revisão:** sem contestação cética concluída.

### F2650 · Runbook de expurgo do histórico Git

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa 52 NI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:56`
- **O que falta:** Escrever runbook de expurgo do histórico git (mapa de clones/branches/tags/CI + filter-repo/BFG + gate de autorização).
- **Evidência:** ausente: grep -rln 'filter-repo\|BFG' docs/runbooks/ → 0 resultados. Só mencionado como pendente em A_planos_execucao.md:56 ('NI').
- **Revisão:** sem contestação cética concluída.

### F2651 · Runbook WebAuthn

- **Tipo:** Doc/config
- **O que os docs afirmam:** Sem runbook.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:142`
- **O que falta:** Criar docs/runbooks/webauthn.md.
- **Evidência:** ls docs/runbooks/ lista 15 runbooks, nenhum webauthn.md. Confirma G_infra_ci_integracoes.md:142.
- **Revisão:** sem contestação cética concluída.

### F2674 · Tokens de sessão fora de localStorage (cookie httpOnly)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Cliente Supabase usa storage localStorage + persistSession; token acessível a qualquer JS.
- **Fontes:** `docs/auditoria/RELATORIO_FALHAS.md:41-45`
- **O que falta:** Migrar para cookie httpOnly ou adicionar CSP restritiva de script-src e documentar a mitigação — nenhuma das duas existe.
- **Evidência:** src/integrations/supabase/client.ts:9-15 ainda usa storage: localStorage, persistSession: true. vercel.json só define CSP 'frame-ancestors self' (anti-clickjacking), sem script-src que mitigasse XSS/roubo de token.
- **Revisão:** sem contestação cética concluída.

### F2678 · Webhook externo get-client-ip ausente do config.toml (verify_jwt=true por padrão)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Função com papel "eco de IP do cliente" não está em supabase/config.toml, logo fica com verify_jwt=true e rejeitaria 401 chamadores externos sem JWT Supabase. Doc marca como pendente de correção.
- **Fontes:** `docs/estado/10_EDGE_FUNCTIONS.md:67-80`
- **O que falta:** Se necessária: adicionar [functions.get-client-ip] com verify_jwt=false + proteção própria e incluir na allowlist; se órfã, remover o código morto.
- **Evidência:** grep 'get-client-ip' supabase/config.toml → 0 resultados (verify_jwt=true default confirmado). Handler (supabase/functions/get-client-ip/index.ts) não tem proteção própria. NÃO está na allowlist ACTIVE de deploy.yml:144 (grep → 0 ocorrências) — nem roda em produção. Chamador citado em docs (useLoginRateLimiter.ts) está desatualizado: grep -rn 'get-client-ip' src → 0 resultados; esse hook usa a RPC get_login_lockout_status.
- **Revisão:** sem contestação cética concluída.

### F3834 · `register-verify` com `verifyRegistrationResponse` (challenge uso único, expectedOrigins, RP ID)

- **Tipo:** Edge function
- **O que os docs afirmam:** ADR-010 (webauthn): register-verify verifica attestation com challenge anti-replay, origin allowlistada, RP ID e persiste chave COSE real + counter.
- **Fontes:** `docs/decisions/ADR-010-webauthn-simplewebauthn.md:37-40`
- **O que falta:** pasta supabase/functions/register-verify/index.ts ausente
- **Evidência:** pasta supabase/functions/register-verify/index.ts ausente| CONTESTADO pelo cético (IMPLEMENTADO): A ação register-verify existe dentro da function webauthn, não numa pasta própria. supabase/functions/webauthn/index.ts:20-22 importa verifyRegistrationResponse de npm:@simplewebauthn/server@14.0.3; :216-226 verifica com challenge de uso único (challengeConsumer :66-87, que apaga o challenge após o uso), expectedOrigin e expectedRPID; :232-245 grava a chave COSE real e o counter. A lista de origens vem de _shared/webauthn-helpers.ts expectedOrigins. webauthn está na allowlist (deploy.yml:144). Chamador: src/hooks/useWebAuthn.ts:127-129. Tabelas webauthn_credentials e webauthn_challenges existem com RLS (tables.md:380-381).
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3835 · 109/170 edge functions usam service_role sem validar papel do caller — adotar getUserClient

- **Tipo:** Edge function
- **O que os docs afirmam:** Doc afirma 109 functions operam com service_role sem checar identidade além do verify_jwt; ação: adotar _shared/auth-client.ts:getUserClient nas 20 mais sensíveis (SEC-08 lista ~50).
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:94,99-100`
- **O que falta:** pasta supabase/functions/auth-client/index.ts ausente
- **Evidência:** pasta supabase/functions/auth-client/index.ts ausente| CONTESTADO pelo cético (IMPLEMENTADO): supabase/functions/_shared/auth-client.ts:34 exporta getUserClient e :93 exporta requireAdmin. getUserClient aparece em 113 index.ts (grep -rl getUserClient supabase/functions --include=index.ts \| wc -l → 113), muito acima das 20 pedidas. Das 90 functions que usam service_role, só 6 não têm checagem de chamador reconhecível pela minha busca: receive-quote-sync (valida HMAC, index.ts:128-142), log-web-vitals, email-unsubscribe e report-embed-public (públicas por design), ranking-api e new-device-alert (fora da allowlist).
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F2680 · Canário USE_USER_CLIENT_${FN_NAME}

- **Tipo:** Edge function
- **O que os docs afirmam:** NÃO INICIADO: grep = 0.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:378`
- **O que falta:** Implementar o canário USE_USER_CLIENT_${FN_NAME} ou remover formalmente a promessa dos docs.
- **Evidência:** ausente: grep -rn 'USE_USER_CLIENT' supabase/ src/ → 0 resultados, confirmando C_estado_runbooks.md:378.
- **Revisão:** sem contestação cética concluída.

### F3837 · Edge function login-options (2 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Desabilitar login-options/login-verify até existir verificação criptográfica completa. Saída esperada: feature flag/rota bloqueada. Gate: autorização de runtime.| A própria função exclui login-options e login-verify da autenticação interna e enumera credenciais por e-mail.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:665-665`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:144-144`
- **O que falta:** pasta supabase/functions/login-options/index.ts ausente
- **Evidência:** pasta supabase/functions/login-options/index.ts ausente| CONTESTADO pelo cético (PARCIAL): A ação login-options existe em supabase/functions/webauthn/index.ts:258-300 (function na allowlist, deploy.yml:144). A condição de bloqueio ('até existir verificação criptográfica') já está cumprida: login-verify verifica a assinatura (:319-333). O problema apontado pelo doc continua: login-options fica fora de requiresAuth (:149-154) e, a partir do e-mail, faz listUsers (só a 1ª página, perPage 1000, :262-266) e devolve os credential_id do usuário (:268-279). Isso permite enumerar contas e passkeys por e-mail. Chamador: src/hooks/useWebAuthn.ts:183-185.
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F3838 · Edge function login-verify (2 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** ADR-010 (webauthn): login-verify valida assinatura ECDSA/RSA contra a chave COSE, challenge, origin, RP ID e atualiza counter via authenticationInfo.newCounter.| supabase/functions/webauthn/index.ts:270-360 verifica apenas presença de campos e igualdade de challenge; não verifica assinatura, rpIdHash, origin, flags, contador ou CBOR/COSE.
- **Fontes:** `docs/decisions/ADR-010-webauthn-simplewebauthn.md:41-43`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:142-142`
- **O que falta:** pasta supabase/functions/login-verify/index.ts ausente
- **Evidência:** pasta supabase/functions/login-verify/index.ts ausente| CONTESTADO pelo cético (IMPLEMENTADO): supabase/functions/webauthn/index.ts:302-372, ação login-verify. Busca a credencial pelo id (:308-312) e chama verifyAuthenticationResponse (:319-333) com a chave COSE, o challenge consumido, expectedOrigin, expectedRPID e o counter. Atualiza o counter com authenticationInfo.newCounter (:336-342) e só depois gera o magic link para o user_id que vem do banco (:345-358). Chamador: src/hooks/useWebAuthn.ts:201-205, usado em src/hooks/auth/useAuthForm.ts:194-195 (Auth.tsx). Function na allowlist.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F2690 · Etapa 48 do plano: Aplicar autorização/ownership nas funções service-role

- **Tipo:** Edge function
- **O que os docs afirmam:** Priorizar as 74 que escrevem e os casos globais listados. Saída esperada: matriz função→papel→escopo e testes. Gate: deploy Edge autorizado.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:716-716`
- **O que falta:** Produzir a matriz e os testes — nenhum dos dois existe.
- **Evidência:** AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:716 define saída esperada = matriz função→papel→escopo e testes. Nenhum arquivo desse tipo existe no repo (find/grep não acham).
- **Revisão:** sem contestação cética concluída.

### F2691 · Etapa canônica 26/08 nº 48: Aplicar autorização/ownership nas funções service-role (74 que escrevem)

- **Tipo:** Edge function
- **O que os docs afirmam:** Etapa canônica 48 (plano 26/08, matriz de status 30/08, estado ⬜): matriz função→papel→escopo e testes.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:188-188`
- **O que falta:** Mesma pendência de F2690; também não existe helper centralizado 'getServiceClient'.
- **Evidência:** STATUS_100_ETAPAS_2026-08-30.md:188 marca a etapa canônica 48 com estado ⬜ (não feita). 'getServiceClient' citado como artefato esperado não existe no repo (grep -rn 'getServiceClient' supabase/functions → 0).
- **Revisão:** sem contestação cética concluída.

### F3843 · Etapa canônica 26/08 nº 9: Bloquear login WebAuthn (login-options/login-verify) até verificação criptográfica completa

- **Tipo:** Edge function
- **O que os docs afirmam:** Etapa canônica 9 (plano 26/08, matriz de status 30/08, estado 🔒): feature flag/rota bloqueada.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:127-127`
- **O que falta:** pasta supabase/functions/webauthn-login-options/index.ts ausente
- **Evidência:** pasta supabase/functions/webauthn-login-options/index.ts ausente| CONTESTADO pelo cético (IMPLEMENTADO): O objetivo da etapa 9 (não haver login WebAuthn sem verificação criptográfica) foi atingido por outro caminho: em vez de bloquear, a verificação real foi implementada. supabase/functions/webauthn/index.ts:1-14 documenta a troca; :319-333 verifyAuthenticationResponse. Commit e74ff4208 (#203) 'feat(auth): webauthn com verificação criptográfica real via simplewebauthn'. As pastas webauthn-login-options/verify nunca foram o desenho: as ações ficam em webauthn/index.ts:46-49.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F2692 · MFA por SMS envia o código

- **Tipo:** Edge function
- **O que os docs afirmam:** Gera o código e não envia.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:262-266`
- **O que falta:** Implementar o envio real via Twilio a partir de v_code — hoje é placeholder; o usuário nunca recebe o código.
- **Evidência:** Corpo real de setup_sms_mfa (snapshot .../functions/public/setup_sms_mfa__3250813184c64a68.sql) gera v_code, grava em sms_verification_codes/user_mfa_settings e termina com o comentário literal '-- In production: send SMS via Twilio/etc with v_code' seguido de RETURN true — nunca chama nenhum provedor de SMS. Confirma README.md:262-266. Nenhuma edge function mfa-sms existe (grep -rli 'mfa' supabase/functions --include=index.ts → 0).
- **Revisão:** sem contestação cética concluída.

### F3844 · WebAuthn com verificação criptográfica real

- **Tipo:** Edge function
- **O que os docs afirmam:** Etapa 9 concluída: verificação real em webauthn/index.ts:20-22,221,319 + ADR-010.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:15`
- **O que falta:** pasta supabase/functions/010-webauthn-simplewebauthn/index.ts ausente
- **Evidência:** pasta supabase/functions/010-webauthn-simplewebauthn/index.ts ausente| CONTESTADO pelo cético (IMPLEMENTADO): supabase/functions/webauthn/index.ts:17-22 importa generate*/verify*Response de npm:@simplewebauthn/server@14.0.3; :221 verifyRegistrationResponse; :319 verifyAuthenticationResponse. docs/decisions/ADR-010-webauthn-simplewebauthn.md existe. Testes: supabase/functions/_shared/webauthn-helpers_test.ts. Function na allowlist (deploy.yml:144). Front: src/hooks/useWebAuthn.ts e PasskeySettings, montado via src/pages/Configuracoes.tsx.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3845 · WebAuthn desabilitado (fail-closed) até backend canônico

- **Tipo:** Edge function
- **O que os docs afirmam:** Doc: WebAuthn passou a falhar explicitamente (503) em vez de declarar sucesso sem verificação.
- **Fontes:** `docs/auditoria/EXECUCAO_ONDA_0_2026-08-26.md:16`
- **O que falta:** pasta supabase/functions/fail-closed/index.ts ausente
- **Evidência:** pasta supabase/functions/fail-closed/index.ts ausente| CONTESTADO pelo cético (REMOVIDO_INTENCIONALMENTE): O fail-closed com 503 era provisório (commit 648dcc9d4) e foi trocado pela verificação real no commit e74ff4208 (#203). supabase/functions/webauthn/index.ts:1-14 explica a troca. Hoje não há 503 no fluxo: grep -n 503 em webauthn/index.ts e em src/hooks/useWebAuthn.ts → 0.
- **Revisão:** em disputa. O cético propõe Removido de propósito e o juiz ainda não decidiu.

### F3846 · webauthn login-verify verifica assinatura criptográfica e usa user_id do banco

- **Tipo:** Edge function
- **O que os docs afirmam:** login-verify não verificava assinatura WebAuthn e retornava magiclink para credential_id arbitrário (account takeover). FASE4 diz corrigido em webauthn/index.ts:309-350.
- **Fontes:** `docs/auditoria/RELATORIO_FALHAS.md:386-391`
- **O que falta:** pasta supabase/functions/309-350/index.ts ausente
- **Evidência:** pasta supabase/functions/309-350/index.ts ausente| CONTESTADO pelo cético (IMPLEMENTADO): supabase/functions/webauthn/index.ts:308-312 busca credData pelo credential_id. :319-333 verifica a assinatura contra a public_key COSE gravada. :329-334 falha se não verificar. :345-346 usa credData.user_id, do banco, e não um valor do cliente, para getUserById e generateLink. O challenge é de uso único e apagado (:66-87). Tabelas webauthn_credentials e webauthn_challenges com RLS (tables.md:380-381).
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F2703 · WebAuthn rejeita RP ID vindo do cliente

- **Tipo:** Edge function
- **O que os docs afirmam:** WebAuthn aceita RP ID vindo do cliente.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:132`
- **O que falta:** Fixar o RP ID no servidor (env WEBAUTHN_RP_ID ou lista por ambiente) e rejeitar rpId divergente vindo do cliente.
- **Evidência:** supabase/functions/webauthn/index.ts:144: const rpId = body.rpId|\| req.headers.get(RP_ID_HEADER) \|\| new URL(req.url).hostname — RP ID aceito do body enviado pelo cliente. supabase/functions/_shared/webauthn-helpers.ts:26-27 documenta explicitamente: 'O rpId vem do cliente (hostname da página)'. Não há lista fixa de RP ID no servidor. \| cético: supabase/functions/webauthn/index.ts:144: const rpId = body.rpId \|\| req.headers.get(RP_ID_HEADER) \|\| new URL(req.url).hostname — RP ID aceito do body/header do cliente e usado como expectedRPID (:225, :323). supabase/functions/_shared/webauthn-helpers.ts:26-27: 'O rpId vem do cliente'. Nenhuma constante/env de RP ID fixo: grep -n 'RP_ID\b\\|WEBAUTHN_RP_ID' supabase/functions/webauthn → só RP_ID_HEADER (:43).

### F3847 · 10 funções SECURITY DEFINER executáveis por anon (check_login_rate_limit, fn_check_login_allowed, fn_global_search, fn_product_active_for_rls, fn_super_filtro*…

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Catálogo da origem lista 10 SECURITY DEFINER executáveis por anon, todas com search_path fixo; get_quote_token_by_value e submit_quote_response são fluxos públicos de orçamento que exigem teste de token/replay.
- **Fontes:** `docs/auditoria/CATALOGO_BANCO_ORIGEM_2026-08-26.md:68-88`
- **O que falta:** função "anon" ausente do banco real (functions.md)
- **Evidência:** função "anon" ausente do banco real (functions.md)| CONTESTADO pelo cético (NAO_APLICAVEL): O item descreve o catálogo do banco de ORIGEM (docs/auditoria/CATALOGO_BANCO_ORIGEM_2026-08-26.md), outro projeto. Nenhuma das funções citadas existe no banco real: grep em functions.md por check_login_rate_limit, fn_check_login_allowed, fn_global_search, fn_product_active_for_rls, fn_super_filtro, get_catalog_bestseller_page, get_quote_token_by_value e submit_quote_response → 0.
- **Revisão:** em disputa. O cético propõe Não aplicável e o juiz ainda não decidiu.

### F3848 · 30 funções SECURITY DEFINER executáveis por anon acima da allowlist ADR-008 (11)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** O destino possui 30 funções de aplicação SECURITY DEFINER executáveis por anon contra 10 na origem; ADR-008 permite 11 pré-login revisadas.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:131-135`
- **O que falta:** função "has_function_privilege" ausente do banco real (functions.md)
- **Evidência:** função "has_function_privilege" ausente do banco real (functions.md)| CONTESTADO pelo cético (NAO_APLICAVEL): É uma contagem histórica (30 contra 11), não uma funcionalidade. O motivo mecânico ('has_function_privilege ausente') não faz sentido, pois é função nativa do Postgres. Estado atual para referência: functions.md tem 19 funções SECURITY DEFINER com EXECUTE para anon, várias delas de trigger (ex.: audit_trigger, trg_deal_stage_history). ADR-008 existe em docs/decisions/ADR-008-anon-executable-security-definer.md:11-19 (allowlist de 11).
- **Revisão:** em disputa. O cético propõe Não aplicável e o juiz ainda não decidiu.

### F3849 · Advisor segurança: 204 RPCs SECURITY DEFINER executáveis por authenticated e 15 por anon

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Doc: Advisor retorna 229 warnings; alteração de permissões de EXECUTE não executada.
- **Fontes:** `docs/auditoria/VALIDACAO_SINCRONIA_GITHUB_SUPABASE_2026-09-10.md:159-160,198`
- **O que falta:** função "get_advisors" ausente do banco real (functions.md)
- **Evidência:** função "get_advisors" ausente do banco real (functions.md)| CONTESTADO pelo cético (NAO_APLICAVEL): É uma contagem do Advisor numa data (204/15); get_advisors é uma ferramenta MCP, não um artefato do sistema. Snapshot atual (functions.md): 249 SECURITY DEFINER com EXECUTE para authenticated e 19 para anon. A remediação existe em parte: supabase/migrations/20260831130000_harden_public_access_and_privileged_rpcs.sql.
- **Revisão:** em disputa. O cético propõe Não aplicável e o juiz ainda não decidiu.

### F3850 · Auth hook/RPC que grava login_attempts

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** DIVERGENTE: não há auth hook em functions; front insere direto e é negado.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:397`
- **O que falta:** função "login_attempts" ausente do banco real (functions.md)
- **Evidência:** função "login_attempts" ausente do banco real (functions.md)| CONTESTADO pelo cético (IMPLEMENTADO): O front não insere direto: usa RPCs SECURITY DEFINER que gravam login_attempts. functions/public/record_failed_login_attempt__95d3d07fd20a49d8.sql:51 'INSERT INTO public.login_attempts'; também existe record_successful_login_attempt. Chamadas em src/hooks/useLoginRateLimiter.ts:88-95, usado em src/hooks/auth/useAuthForm.ts:107,133,151. functions.md lista record_failed_login_attempt com EXECUTE para anon e authenticated. src/hooks/useSecurityMonitoring.ts:27,93 só lê login_attempts.
- **Revisão:** em disputa. O cético propõe Implementado e o juiz ainda não decidiu.

### F3851 · Etapa 39 do plano: Endurecer SECURITY DEFINER

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Revalidar as 10 da origem e 217 do destino; fixar search_path, ownership e EXECUTE mínimo. Saída esperada: zero rotina mutável perigosa para anon. Gate: autorização função/grants.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:704-704`
- **O que falta:** função "v_security_definer_exposure" ausente do banco real (functions.md)
- **Evidência:** função "v_security_definer_exposure" ausente do banco real (functions.md)| CONTESTADO pelo cético (PARCIAL): O endurecimento foi feito em parte. Migrations 20260718000004_fix_security_definer_search_path.sql e 20260831130000_harden_public_access_and_privileged_rpcs.sql. Todas as SECURITY DEFINER em functions.md têm config search_path (awk: SD sem search_path → 0). A exposição a anon caiu para 19. Ainda há funções fora da allowlist ADR-008 executáveis por anon: get_user_role, has_role, is_admin_or_manager, get_current_salesperson_id, is_email_opted_out, record_failed_login_attempt (esta grava dados). A view v_security_definer_exposure não existe (views.md/functions.md → 0).
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F3853 · Fluxo 2FA customizado: funções SQL escrevem em sms_verification_codes e mfa_verification_attempts

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Doc afirma que funções SQL do fluxo 2FA escrevem nessas tabelas e que o MFA customizado está incompleto (ver auditoria). Snapshot real: ambas as tabelas existem com 0 linhas.
- **Fontes:** `docs/DEAD_TABLES.md:71-73`
- **O que falta:** função "sms_verification_codes" ausente do banco real (functions.md)
- **Evidência:** função "sms_verification_codes" ausente do banco real (functions.md)| CONTESTADO pelo cético (PARCIAL): As funções SQL existem e gravam nessas tabelas: functions/public/setup_sms_mfa__3250813184c64a68.sql:12-13 (INSERT INTO sms_verification_codes), além de verify_and_enable_sms, verify_mfa_code e verify_and_enable_totp. O front as chama em src/hooks/useMFA.ts:245, :271 e :327. Mas o SMS nunca é enviado: setup_sms_mfa.sql:22 '-- In production: send SMS via Twilio/etc with v_code'. Mesmo assim o front mostra toast 'Código enviado' (useMFA.ts:251). O código é gerado com random() (:10). As tabelas existem com RLS (tables.md:210, :339).
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F3887 · Sessão: timeout de inatividade de 30 minutos

- **Tipo:** Hook
- **O que os docs afirmam:** Sessão expira após 30 minutos ocioso.
- **Fontes:** `docs/SECURITY.md:19-21`
- **O que falta:** hook useIdleTimeout ausente (hooks.json e arquivos src/)
- **Evidência:** hook useIdleTimeout ausente (hooks.json e arquivos src/)
- **Revisão:** sem contestação cética concluída.

### F3888 · useQuery query-telemetry com limit 500, refetchInterval 30s e staleTime 10s

- **Tipo:** Hook
- **O que os docs afirmam:** Consulta a query_telemetry via TanStack Query com .limit(500), auto-refresh a cada 30000ms e staleTime 10000ms.
- **Fontes:** `docs/TELEMETRY_MODULE_DOCS.md:59,398-428,864-867`
- **O que falta:** hook useQuery ausente (hooks.json e arquivos src/)
- **Evidência:** hook useQuery ausente (hooks.json e arquivos src/)
- **Revisão:** sem contestação cética concluída.

### F2714 · Envio real de SMS para MFA (provider Twilio)

- **Tipo:** Integração externa
- **O que os docs afirmam:** Nenhum envio de SMS está ligado; código nunca sai do banco.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:535-537`
- **O que falta:** Criar edge function de envio de SMS MFA via Twilio e chamá-la após setup_sms_mfa (hook useMFA.ts ou pg_net).
- **Evidência:** supabase/migrations/20260321195552_1a939365-b697-4a37-870b-c118281c25b2.sql:133-156, função public.setup_sms_mfa: gera o código e grava em sms_verification_codes, mas o comentário na linha 153 diz '-- In production: send SMS via Twilio/etc with v_code' — não há chamada de envio. grep -rln TWILIO supabase/functions src → só twilio-click-to-call/call-status/call-twiml e send-multichannel-message (discador/mensageria, não MFA). src/hooks/useMFA.ts:238-259 (setupSMS) só chama a RPC e mostra toast, sem invocar edge function de SMS.| cético: No banco real, setup_sms_mfa continua só gravando o código: snapshot supabase/functions/public/setup_sms_mfa__3250813184c64a68.sql:22 '-- In production: send SMS via Twilio/etc with v_code'; nenhuma chamada net./http no corpo. Functions que citam SMS (send-multichannel-message, sequence-runner, twilio-call-twiml) não são de MFA; grep -rn 'send-sms' src → …

### F2720 · PII em JSONB livre (metadata/payload/notes) não varrida

- **Tipo:** Outro
- **O que os docs afirmam:** Limitação conhecida: anonimização não cobre JSONB livre.
- **Fontes:** `docs/LGPD.md:97-98`
- **O que falta:** Confirma-se a limitação declarada: não existe varredor genérico de PII em JSONB livre fora das tabelas já cobertas; é item de backlog sem artefato correspondente.
- **Evidência:** supabase/migrations/20261018190000_lgpd_fixes_consent_anonymize.sql:141-650 (anonymize_data_subject) só limpa colunas jsonb nomeadas explicitamente (ex.: metadata em channel_interactions linha 336-340, objections/next_steps linha 270-271); não há varredura genérica de JSONB livre fora da lista fixa. docs/LGPD.md:97-98 documenta isso como limitação conhecida.
- **Revisão:** sem contestação cética concluída.

### F2727 · Etapa 8 do plano: Investigar uso indevido

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Consultar Auth, API, Edge, PostgREST e banco pelo período de exposição, preservando evidência e LGPD. Saída esperada: relatório de impacto. Gate: acesso a logs.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:664-664`
- **O que falta:** Executar investigação de logs e produzir relatório de impacto versionado; nada foi produzido.
- **Evidência:** Nenhum relatório de impacto existe no repo; grep só retorna os próprios documentos de plano (AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md, STATUS_100_ETAPAS_2026-08-30.md) descrevendo a etapa como planejada.
- **Revisão:** sem contestação cética concluída.

### F2728 · Etapa canônica 26/08 nº 1: Abrir incidente de credenciais

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa canônica 1 (plano 26/08, matriz de status 30/08, estado 🔶): dois P0, owners, horário, custódia sem copiar valores; saída: ticket de incidente.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:119-119`
- **O que falta:** Abrir e versionar o ticket de incidente; não existe hoje.
- **Evidência:** Nenhum ticket/registro de incidente versionado em docs/execucao/; grep só retorna documentos de plano que descrevem a etapa.
- **Revisão:** sem contestação cética concluída.

### F2729 · Etapa canônica 26/08 nº 25: Comparar RLS e FORCE RLS

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa canônica 25 (plano 26/08, matriz de status 30/08, estado 🔒): cobertura por tabela/partição, efeito por role; mapa deny/allow real.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:153-153`
- **O que falta:** Produzir e versionar o mapa deny/allow comparando origem x destino; não existe.
- **Evidência:** docs/RLS_AUDIT_QUERIES.md só audita o banco atual isoladamente; nenhuma comparação com banco de origem foi encontrada (grep 'origem' em docs/estado/14_VERIFICACAO_DA_AUDITORIA.md sem resultado); nenhum mapa deny/allow versionado.
- **Revisão:** sem contestação cética concluída.

### F2730 · Etapa canônica 26/08 nº 26: Comparar policies

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa canônica 26 (plano 26/08, matriz de status 30/08, estado 🔒): roles, comando, permissiva/restritiva, USING/WITH CHECK normalizados; diff revisável.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:154-154`
- **O que falta:** Produzir e versionar o diff de policies origem x destino; não existe.
- **Evidência:** Mesma base de F2729: docs/RLS_AUDIT_QUERIES.md §1 só tem queries de pg_policies no destino, sem diff normalizado contra a origem.
- **Revisão:** sem contestação cética concluída.

### F2731 · Etapa canônica 26/08 nº 52: Planejar expurgo do histórico (git-filter-repo)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa canônica 52 (plano 26/08, matriz de status 30/08, estado ⬜): mapear clones, branches, tags, CI, consumidores; runbook e janela.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:197-197`
- **O que falta:** Criar e versionar o runbook de expurgo de histórico; não existe.
- **Evidência:** Nenhum docs/runbooks/expurgo-historico* ou equivalente existe (listagem de docs/runbooks/ não contém); grep só retorna documentos de plano.
- **Revisão:** sem contestação cética concluída.

### F2732 · Etapa canônica 26/08 nº 8: Investigar uso indevido (Auth, API, Edge, PostgREST, banco; LGPD)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa canônica 8 (plano 26/08, matriz de status 30/08, estado 🔒): janela = período completo de exposição com custódia de evidências; saída: relatório de impacto.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:126-126`
- **O que falta:** Idêntico a F2727.
- **Evidência:** Mesma etapa de F2727 citada em outro documento de plano; nenhum relatório de impacto versionado existe.
- **Revisão:** sem contestação cética concluída.

### F2733 · Export CSV mensal de logs para storage frio (mitigação forense)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** ADR-007: perda de visibilidade forense >90d mitigada por export CSV mensal para storage frio — fora do escopo da ADR.
- **Fontes:** `docs/decisions/ADR-007-log-retention.md:22-22`
- **O que falta:** Criar job/edge function de export para Storage e bucket de arquivamento antes da purga (cron.md:11 purga sem exportar antes); não existe.
- **Evidência:** Nenhum job/edge function de export CSV mensal para storage frio encontrado (grep/ls sem resultado); só o próprio ADR-007 (docs/decisions/ADR-007-log-retention.md:22) descreve a mitigação como fora de escopo.
- **Revisão:** sem contestação cética concluída.

### F2734 · Export de auth.users da origem exige gate AUTH-DATA/LGPD (atividade fora da etapa 12)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Export auth.users da origem é atividade própria com gate AUTH-DATA, justificativa LGPD, escopo mínimo, retenção e proteção.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:278-278`
- **O que falta:** Registrar a autorização nominal antes de qualquer export; sem evidência de que ocorreu.
- **Evidência:** Nenhum registro de autorização nominal (gate AUTH-DATA/LGPD) para export de auth.users da origem encontrado em docs/execucao/; STATUS_100_ETAPAS_2026-08-30.md:278 só descreve a exigência.
- **Revisão:** sem contestação cética concluída.

### F2737 · Handoff P007: Auditar logs de acesso a migrate-helper

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Fila canônica do handoff (onda 1): Auditar logs de acesso a migrate-helper. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:283-283`
- **O que falta:** Produzir e versionar o relatório de linha do tempo de chamadas/IPs; não existe.
- **Evidência:** migrate-helper foi removida do repo (AGENTS.md §7); nenhum relatório de linha do tempo de acesso a ela foi encontrado em docs/.
- **Revisão:** sem contestação cética concluída.

### F2738 · Investigação de uso indevido (logs Auth/Edge/PostgREST)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa 8 NI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:26`
- **O que falta:** Idêntico a F2727.
- **Evidência:** Fonte própria (A_planos_execucao.md:26) já classifica como 'NI'; nenhum relatório de impacto encontrado.
- **Revisão:** sem contestação cética concluída.

### F2739 · Linha do tempo de auditoria de logs de acesso

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** P007 NI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:119`
- **O que falta:** Idêntico a F2737.
- **Evidência:** Fonte própria (A_planos_execucao.md:119) classifica como 'NI'; nenhum relatório de linha do tempo encontrado.
- **Revisão:** sem contestação cética concluída.

### F2741 · Painéis Stripe/Resend/MailerSend/OpenRouter para rotação

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** §7.5-6 NI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:220`
- **O que falta:** Nenhuma rotação nesses painéis foi registrada; depende de ação manual do dono fora do repo.
- **Evidência:** docs/SECRETS_ROTATION.md:124-130 registra explicitamente 'Nenhuma rotação registrada até a criação deste documento (2026-10-01)'.
- **Revisão:** sem contestação cética concluída.

### F2743 · Pen test externo registrado

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Doc aponta ausência de pen test registrado; backlog.
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:351,577`
- **O que falta:** Contratar/executar pen test externo e versionar relatório; depende de fornecedor externo.
- **Evidência:** Diretório docs/security/ não existe; grep por pen test/pentest em docs/SECURITY.md sem resultado.
- **Revisão:** sem contestação cética concluída.

### F2744 · Plano 30/08 etapa 7 (P007): Auditar logs de acesso a migrate-helper

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa 7 do plano de 100 etapas (auditoria 30/08; = P007 do handoff): Auditar logs de acesso disponíveis para migrate-helper e credenciais; linha do tempo de chamadas/IPs.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:653-653`
- **O que falta:** Idêntico a F2737.
- **Evidência:** Mesma etapa de F2737 (P007), citada a partir de AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:653; migrate-helper já removida sem relatório produzido.
- **Revisão:** sem contestação cética concluída.

### F2745 · Política de retenção aplicada a cron_failure_alerts (pacote 2026-10-01)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Doc afirma que cron_failure_alerts "ganhou política de retenção neste pacote". Migration 20261001151000_log_retention_indexes_and_purge.sql NÃO lista cron_failure_alerts em data_retention_policies (seed cobre audit_log, audit_logs, data_access_log, website_visitor_logs, webhook_inbound__, telemetria, error_logs, integration_logs, session_activity, login__, security_events, rate_limit_logs, access_denied_logs); cron data-retention-purge-daily (45 3 * * *) executa fn_apply_data_retention().
- **Fontes:** `docs/DEAD_TABLES.md:66-69`
- **O que falta:** Adicionar linha para cron_failure_alerts em data_retention_policies (migration nova), ou corrigir a afirmação em DEAD_TABLES.md.
- **Evidência:** docs/DEAD_TABLES.md:66-69 afirma que cron_failure_alerts "ganhou política de retenção neste pacote". A migration supabase/migrations/20261001151000_log_retention_indexes_and_purge.sql:99-117 (único INSERT em data_retention_policies em todo o histórico) lista 17 tabelas e NÃO inclui 'cron_failure_alerts'.
- **Revisão:** sem contestação cética concluída.

### F2747 · Política de retenção aplicada a maintenance_log (pacote 2026-10-01)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Doc afirma que maintenance_log "ganhou política de retenção neste pacote". Migration 20261001151000_log_retention_indexes_and_purge.sql NÃO lista maintenance_log em data_retention_policies (seed cobre audit_log, audit_logs, data_access_log, website_visitor_logs, webhook_inbound__, telemetria, error_logs, integration_logs, session_activity, login__, security_events, rate_limit_logs, access_denied_logs); cron data-retention-purge-daily (45 3 * * *) executa fn_apply_data_retention().
- **Fontes:** `docs/DEAD_TABLES.md:66-69`
- **O que falta:** Adicionar linha para maintenance_log em data_retention_policies, ou corrigir DEAD_TABLES.md.
- **Evidência:** docs/DEAD_TABLES.md:66-69 afirma que maintenance_log "ganhou política de retenção neste pacote". O INSERT em supabase/migrations/20261001151000_log_retention_indexes_and_purge.sql:99-117 não lista 'maintenance_log'; nenhuma outra migration insere essa linha.
- **Revisão:** sem contestação cética concluída.

### F2748 · Política de retenção aplicada a migration_log (pacote 2026-10-01)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Doc afirma que migration_log "ganhou política de retenção neste pacote". Migration 20261001151000_log_retention_indexes_and_purge.sql NÃO lista migration_log em data_retention_policies (seed cobre audit_log, audit_logs, data_access_log, website_visitor_logs, webhook_inbound__, telemetria, error_logs, integration_logs, session_activity, login__, security_events, rate_limit_logs, access_denied_logs); cron data-retention-purge-daily (45 3 * * *) executa fn_apply_data_retention().
- **Fontes:** `docs/DEAD_TABLES.md:66-69`
- **O que falta:** Adicionar linha para migration_log em data_retention_policies, ou corrigir DEAD_TABLES.md.
- **Evidência:** docs/DEAD_TABLES.md:66-69 afirma que migration_log "ganhou política de retenção neste pacote". O INSERT em supabase/migrations/20261001151000_log_retention_indexes_and_purge.sql:99-117 não lista 'migration_log'; nenhuma outra migration insere essa linha.
- **Revisão:** sem contestação cética concluída.

### F2751 · Re-auditoria pendente de v_security_definer_exposure contra grants atuais

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Não há evidência de rodada de validação da exposição de SECURITY DEFINER após 2026-10-05.
- **Fontes:** `docs/SECURITY_HARDENING.md:238-239`
- **O que falta:** Rodar SELECT * FROM v_security_definer_exposure contra os grants atuais e registrar resultado datado em docs/auditoria/.
- **Evidência:** docs/SECURITY_HARDENING.md:238-239 afirma que a re-auditoria de v_security_definer_exposure está pendente, sem evidência após 2026-10-05. grep -rln "v_security_definer_exposure" docs/ supabase/ só retorna a criação da view e citações até 2026-09-02; não há relatório datado após 2026-10-05 em docs/auditoria/ (nem na pasta mais recente, funcionalidades-pendentes-2026-10-12).
- **Revisão:** sem contestação cética concluída.

### F2754 · Revisão de segurança trimestral (issue com checklist: inventário RLS/grants, npm audit + dependabot alerts, gitleaks histórico, 13 functions verify_jwt=false, …

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Issue trimestral com 5 itens fechada com resultado.
- **Fontes:** `docs/PROCESSOS.md:30-41`
- **O que falta:** Abrir e fechar issue 'Revisão de segurança' trimestral com os 5 itens evidenciados; adicionar gitleaks aos validadores.
- **Evidência:** docs/PROCESSOS.md:30-41 exige issue trimestral fechada com 5 itens de checklist. mcp__github__list_issues no repo adm01-debug/Promo_Champions_V2.1 retornou totalCount:0 (zero issues). Também não há gitleaks: find/grep por 'gitleaks' em todo o repo e workflows → 0 resultados.
- **Revisão:** sem contestação cética concluída.

### F2755 · Revisão trimestral de segurança (issue com checklist)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** NÃO VERIFICÁVEL.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:414`
- **O que falta:** Mesmo item de F2754: criar e fechar a issue trimestral do checklist de docs/PROCESSOS.md:30-41.
- **Evidência:** docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:414 marcou 'NÃO VERIFICÁVEL' por falta de acesso a issues na época. Nesta verificação, com acesso MCP ao GitHub, mcp__github__list_issues(owner=adm01-debug, repo=Promo_Champions_V2.1) retorna totalCount:0 — zero issues no repositório.
- **Revisão:** sem contestação cética concluída.

### F2756 · Rotação da chave fixa da migrate-helper

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa 5 NI (SECRETS_ROTATION.md:128).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:23`
- **O que falta:** Rotacionar a chave e registrar data/motivo na tabela §4 de docs/SECRETS_ROTATION.md.
- **Evidência:** docs/SECRETS_ROTATION.md §4 'Histórico de rotações' tem uma única linha: 'Nenhuma rotação registrada até a criação deste documento (2026-10-01)'. git log --follow -p mostra só 2 commits no arquivo (2026-10-02), nenhum posterior. A função migrate-helper já não existe (find supabase/functions -iname "_migrate_" → vazio), mas a rotação da chave fixa dela não tem registro.
- **Revisão:** sem contestação cética concluída.

### F2757 · Rotação da credencial que esteve em migrate-helper no histórico

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** A credencial literal que constou no histórico Git ainda precisa ser rotacionada; remover do HEAD não prova rotação.
- **Fontes:** `docs/execucao/RECONCILIACAO_GITHUB_SUPABASE_2026-08-31.md:129`
- **O que falta:** Rotacionar a credencial literal e documentar remediação de histórico com data em docs/SECRETS_ROTATION.md.
- **Evidência:** docs/execucao/RECONCILIACAO_GITHUB_SUPABASE_2026-08-31.md:129 registra a credencial de migrate-helper no histórico Git como pendente de rotação. docs/SECRETS_ROTATION.md §4 continua sem nenhuma linha de rotação registrada.
- **Revisão:** sem contestação cética concluída.

### F2758 · Rotação da service_role do destino

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa 6 NI; segredo no histórico Git (commit b722848dd5).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:24`
- **O que falta:** Rotacionar a service_role, atualizar secrets dependentes e registrar com smoke test.
- **Evidência:** docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:24 lista rotação da service_role do destino como NI (segredo no commit b722848dd5). docs/SECRETS_ROTATION.md §4 segue com 'Nenhuma rotação registrada'.
- **Revisão:** sem contestação cética concluída.

### F2759 · Rotação das credenciais da origem

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Etapa 7 NI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:25`
- **O que falta:** Rotacionar as credenciais do projeto Supabase de origem e registrar.
- **Evidência:** docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:25 lista rotação das credenciais da origem como NI. Nenhum registro em docs/SECRETS_ROTATION.md §4 nem commits posteriores a 2026-10-02 alterando a tabela.
- **Revisão:** sem contestação cética concluída.

### F2760 · Rotação de anon keys e literais JWT em migrations

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** T6 NI: 5 JWTs anon em migrations históricas (20260512214007, 20260726202421); 20261001160000 centraliza.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:327`
- **O que falta:** Rotacionar as anon keys dos projetos citados (válidas até 2035/2036 conforme AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:346) e registrar.
- **Evidência:** docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:327 aponta 5 JWTs anon hardcoded em migrations históricas (20260512214007, 20260726202421) como NI; 20261001160000_centralize_internal_edge_calls.sql existe e mitiga daqui pra frente, mas os JWTs antigos continuam nos arquivos históricos e nenhuma rotação dessas chaves está registrada em docs/SECRETS_ROTATION.md.
- **Revisão:** sem contestação cética concluída.

### F2761 · Rotação de credenciais (service_role, chaves antigas)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Nenhuma rotação executada; service_role antiga está no histórico Git de repo público (docs/SECRETS_ROTATION.md:128).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:148`
- **O que falta:** Executar rotação de service_role e chaves antigas e preencher §4 com data e confirmação de invalidação.
- **Evidência:** docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:148 afirma que nenhuma rotação foi executada. docs/SECRETS_ROTATION.md §4 confirma: única linha é 'Nenhuma rotação registrada até a criação deste documento (2026-10-01)', sem edição posterior.
- **Revisão:** sem contestação cética concluída.

### F2762 · Rotação dos segredos expostos em histórico do git

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Doc: autorizar rotação dos segredos expostos em histórico e remoção controlada de vestígios.
- **Fontes:** `docs/auditoria/EXECUCAO_ONDA_0_2026-08-26.md:65`
- **O que falta:** Revogar as chaves antigas expostas no histórico e registrar a rotação com data.
- **Evidência:** docs/auditoria/EXECUCAO_ONDA_0_2026-08-26.md:65 pede autorização para rotacionar segredos expostos no histórico do git. Nenhuma rotação registrada em docs/SECRETS_ROTATION.md §4.
- **Revisão:** sem contestação cética concluída.

### F3889 · Compliance dashboards (SOC 2, ISO 27001)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Falta dashboard de evidências de compliance.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:191`
- **O que falta:** rota /security-dashboard não existe em src/routes/AppRoutes.tsx (rotas.json)
- **Evidência:** rota /security-dashboard não existe em src/routes/AppRoutes.tsx (rotas.json)
- **Revisão:** sem contestação cética concluída.

### F3896 · Rota /settings

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Rota /settings testada no smoke Playwright (HTTP 200, 0 erros reais).
- **Fontes:** `docs/reports/QA_ONDA_L_FINAL.md:47-47`
- **O que falta:** rota /settings não existe em src/routes/AppRoutes.tsx (rotas.json)
- **Evidência:** rota /settings não existe em src/routes/AppRoutes.tsx (rotas.json)
- **Revisão:** sem contestação cética concluída.

### F2770 · `count_reset_requests_24h` e `has_pending_reset_request` executáveis por anon (esqueci minha senha)

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** ADR-008: usadas no fluxo 'esqueci minha senha' antes de autenticação.
- **Fontes:** `docs/decisions/ADR-008-anon-executable-security-definer.md:15-15`
- **O que falta:** Grant anon ausente e nenhuma chamada real no fluxo 'esqueci minha senha' (send-password-reset / ResetPassword.tsx).
- **Evidência:** supabase/functions.md:143,249 (snapshot real) — EXECUTE de count_reset_requests_24h e has_pending_reset_request = 'authenticated, service_role' (sem anon). Coluna 'código'='—' (zero chamadas em src/ ou supabase/functions/, só types.ts gerado). supabase/functions/send-password-reset/index.ts:55 só chama has_role. Migration 20260619150222_b6ebda93...sql:16-19 revogou anon dessas funções; nenhuma migration posterior restaurou.
- **Revisão:** sem contestação cética concluída.

### F2771 · `generate_device_fingerprint` executável por anon (trusted-device no login)

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** ADR-008: generate_device_fingerprint usada na tela de login para trusted device.
- **Fontes:** `docs/decisions/ADR-008-anon-executable-security-definer.md:16-16`
- **O que falta:** Sem grant anon e sem wiring no login/trusted-device.
- **Evidência:** supabase/functions.md:202 — EXECUTE de generate_device_fingerprint = 'authenticated, service_role'; código='—'. src/services/knownDeviceService.ts (arquivo completo) só faz CRUD em known_devices, nenhuma chamada .rpc('generate_device_fingerprint').
- **Revisão:** sem contestação cética concluída.

### F2772 · `is_authenticated` executável por anon (helper puro)

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** ADR-008: is_authenticated retorna auth.uid() IS NOT NULL.
- **Fontes:** `docs/decisions/ADR-008-anon-executable-security-definer.md:18-18`
- **O que falta:** GRANT EXECUTE ... TO anon ausente; policies como 'Authenticated users can view suppliers' (is_authenticated(), role public) retornam 42501 para anon.
- **Evidência:** supabase/functions.md:262 — EXECUTE de is_authenticated = 'authenticated, service_role' (sem anon) em produção. supabase/migrations/20260619160638_6dcd00e4...sql:1 — 'REVOKE EXECUTE ON FUNCTION public.is_authenticated() FROM PUBLIC, anon, authenticated;' sem restauração posterior para anon.
- **Revisão:** sem contestação cética concluída.

### F2779 · 2FA obrigatório em toda a organização (enforce)

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** 2FA pode ser imposto a todos os usuários da organização.
- **Fontes:** `docs/SECURITY.md:17`
- **O que falta:** Nenhum flag org-wide nem guard de rota bloqueando usuários sem MFA.
- **Evidência:** grep por require_mfa/mfa_enforced/enforce_mfa em supabase/migrations/ e src/ → 0 resultados. src/components/auth/ProtectedRoute.tsx (completo) não tem nenhuma checagem de MFA. src/hooks/useMFA.ts é só auto-enroll/unenroll por iniciativa do usuário.
- **Revisão:** sem contestação cética concluída.

### F2789 · ai-copilot com acesso anônimo permitido

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Function aceita chamadas sem JWT.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:362-362`
- **O que falta:** Função não tem chamador na UI, não está na allowlist de deploy e exige auth — contradiz 'acesso anônimo permitido' em todos os pontos.
- **Evidência:** supabase/functions/ai-copilot/index.ts:22-29 exige Authorization e retorna 401 sem ele. grep -rln 'ai-copilot' src/ → 0 (órfã, confirmado também em docs/FUNCIONALIDADES_COMPLETAS.md:654). 'ai-copilot' ausente da allowlist ACTIVE em .github/workflows/deploy.yml:144 — não roda em produção.
- **Revisão:** sem contestação cética concluída.

### F2791 · anon sem EXECUTE em has_permission e get_current_salesperson_id

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** A proteção de clients/activities vem da ausência de GRANT EXECUTE para anon nas funções auxiliares, não de policy que nega.
- **Fontes:** `docs/estado/08_ADMIN_SEGURANCA.md:51-56`
- **O que falta:** Mecanismo descrito (proteção via ausência de EXECUTE) não existe mais; proteção real hoje vem de policies com auth.uid()=user_id / role authenticated (tables/public/clients.md), não documentado como tal em 08_ADMIN_SEGURANCA.md.
- **Evidência:** has_permission foi DROPADA (supabase/migrations/20261001203100_drop_legacy_rbac.sql:39-40). get_current_salesperson_id hoje TEM EXECUTE para anon, restaurado deliberadamente por supabase/migrations/20261005140000_restore_anon_execute_rls_helpers.sql:13; confirmado no snapshot real (EXECUTE='anon, authenticated, service_role').
- **Revisão:** sem contestação cética concluída.

### F2793 · As 11 funções anon têm `SET search_path = public`

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** ADR-008: cada função anon possui SET search_path = public contra search-path hijack.
- **Fontes:** `docs/decisions/ADR-008-anon-executable-security-definer.md:25-25`
- **O que falta:** Restou 1 de 11 funções anon-executáveis; ADR-008 não reflete o estado real pós-migrations 20260619150222/160638.
- **Evidência:** Das 11 funções do ADR-008, checadas no snapshot real: check_rate_limit, log_rate_limit, count_failed_login_attempts, count_reset_requests_24h, has_pending_reset_request, generate_device_fingerprint, get_embedded_report_by_token, is_authenticated, is_ip_blocked, is_ip_whitelisted → EXECUTE sem anon hoje. Só is_country_blocked mantém anon (com search_path=public).
- **Revisão:** sem contestação cética concluída.

### F2802 · Criptografia por campo, templates de DPA e dashboard de compliance

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** pgsodium/pgp_sym_encrypt em src/functions = 0; não há página de compliance.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:158`
- **O que falta:** Criptografia por campo, templates de DPA e página/dashboard de compliance.
- **Evidência:** grep por pgsodium/pgp_sym_encrypt/pgp_sym_decrypt em src/ e supabase/ → 0 resultados. contexto/supabase/extensions.md só lista pgcrypto instalada, sem uso. Nenhuma rota/componente 'compliance' em src/routes/AppRoutes.tsx ou sidebarMenuData.ts. Nenhum template DPA (só a própria menção do gap em docs/GAPS_CLASSE_MUNDIAL.md:190).| cético: Criptografia: extensions.md:9 e :11 só têm pgcrypto e supabase_vault (sem pgsodium); vault.md diz '_nenhum_'. `grep -rni encrypt tables/public/*.md` → 0 colunas; user_mfa_settings.totp_secret é text puro (tables/public/user_mfa_settings.md:22). Templates de DPA: nenhum artefato. Dashboard de compliance: o único artefato LGPD é a fila src/pages/AdminSolicitacoesTitular.tsx (rota em AppRoutes.tsx:506, fora do sidebarMenuData.ts). É uma fila de pedidos do titular, não um dashboard de compliance.

### F2806 · Etapa 34 do plano: Fechar default ACLs

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Revogar grants futuros excessivos de postgres e supabase_admin, preservando Supabase gerenciado. Saída esperada: teste de criação de objeto. Gate: autorização de privilégios.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:699-699`
- **O que falta:** ALTER DEFAULT PRIVILEGES FOR ROLE postgres, supabase_admin REVOKE... + teste de criação de objeto.
- **Evidência:** Mesma evidência de F2803: contexto/supabase/grants.md mostra 406/419 objetos ainda com grants amplos a anon no banco de produção (20/11/2026) — default ACLs não foram fechados.| CONTESTADO pelo cético (PARCIAL): Não é 'nenhum artefato': a etapa foi executada em parte. Os defaults do owner postgres foram fechados em parte (grants.md:1363 funções sem anon, via supabase/migrations/20260517113636_5784febe-49bc-4777-8b42-1dbcfa15f528.sql:10-13; grants.md:1365 tabelas sem TRUNCATE para anon, via 20260902121000_fix_default_privileges_truncate_and_battle_score_search_path.sql:10-11). Existe o teste de pós-condição supabase/tests/db01_default_acl_assertions.sql:1-20. Continuam abertos: grants.md:1365 (anon=arwdxtm, CRUD em tabelas futuras do postgres) e :1366-1368 (supabase_admin com tudo para anon); 20261116223000_revoke_supabase_admin_default_truncate.sql:1-7 registra a falha por falta de priv…
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F2813 · Etapa canônica 26/08 nº 34: Fechar default ACLs preservando privilégios gerenciados do Supabase

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Etapa canônica 34 (plano 26/08, matriz de status 30/08, estado 🔒): revogar grants futuros excessivos de postgres/supabase_admin; teste de criação de objeto.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:167-167`
- **O que falta:** Mesma ação de F2806.
- **Evidência:** Idêntico a F2806 (mesma etapa 34, fonte docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:167). contexto/supabase/grants.md confirma 406/419 objetos ainda com default ACL amplo para anon no snapshot de 20/11/2026.| CONTESTADO pelo cético (PARCIAL): Mesma etapa 34 de F2806. Há fechamento parcial: grants.md:1363 (defaults de funções do postgres sem anon) e :1365 (sem TRUNCATE para anon), via 20260517113636:10-13 e 20260902121000:10-11. O teste supabase/tests/db01_default_acl_assertions.sql existe. O critério 'sem grant amplo a anon' ainda falha: grants.md:1365 (anon=arwdxtm) e :1366-1368 (supabase_admin com tudo para anon).
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F2818 · EXECUTE não restrito em fn_quotes_inbound_ordering_guard, trg_recording_generate_coaching, trigger_auto_coaching_on_recording

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** SCHEMA_CONVENTIONS exige REVOKE explícito; estas 3 funções não têm.
- **Fontes:** `docs/agentes/achados-auditoria-261117.md:99-101`
- **O que falta:** Migration com REVOKE EXECUTE ... FROM PUBLIC, anon nas 3 funções, aplicada em produção.
- **Evidência:** contexto/supabase/functions.md confirma EXECUTE concedido a anon, authenticated, service_role nas 3 funções: public.fn_quotes_inbound_ordering_guard, public.trg_recording_generate_coaching, public.trigger_auto_coaching_on_recording (todas criadas por supabase/migrations/20261117070000_reconcilia_objetos_orfaos_producao.sql, sem REVOKE). docs/agentes/achados-auditoria-261117.md:98-101 registra exatamente essas 3 como pendência conhecida e não corrigida.| cético: functions.md:191 (fn_quotes_inbound_ordering_guard), :360 (trg_recording_generate_coaching) e :363 (trigger_auto_coaching_on_recording) mostram EXECUTE para 'anon, authenticated, service_role'. `grep -rln 'REVOKE.*(fn_quotes_inbound_ordering_guard\|trg_recording_generate_coaching\|trigger_auto_coaching_on_recording)' supabase/migrations` → 0. A pendência está aberta em docs/agentes/achados-auditoria-261117.md:99-101.

### F2819 · Field-level encryption at rest

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Falta criptografia por campo.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:188`
- **O que falta:** Criptografar em repouso as colunas sensíveis (totp_secret, tokens OAuth, PII) com pgsodium/Vault.
- **Evidência:** Mesma evidência de F2802: grep por pgsodium/pgp_sym_encrypt em src/ e supabase/ → 0 resultados; contexto/supabase/extensions.md não lista pgsodium instalada (só pgcrypto, sem uso). Nenhuma coluna sensível criptografada por campo.| cético: extensions.md:9 e :11 sem pgsodium; vault.md: '_nenhum_'. `grep -rni encrypt tables/public/*.md` → 0. Coluna sensível em claro: tables/public/user_mfa_settings.md:22 (totp_secret text). `grep -rli 'pgsodium\|pgp_sym_encrypt' supabase/functions src` → 0; o único acerto de 'encrypt' é o payload Web Push (send-push-notification/index.ts:154), que não é criptografia em repouso.

### F2853 · Plano 30/08 etapa 39 (P039): Reduzir grants de tabelas e default ACLs amplos

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Etapa 39 do plano de 100 etapas (auditoria 30/08; = P039 do handoff): Menor privilégio comprovado por suíte de autorização; aprovação por objeto antes do REVOKE.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:694-694`
- **O que falta:** Executar REVOKE dos grants de tabela para anon (RLS como defesa real) e criar a suíte de autorização por objeto com aprovação prévia.
- **Evidência:** 390 de 408 tabelas ainda concedem GRANT amplo a anon (DELETE/INSERT/REFERENCES/SELECT/TRIGGER/UPDATE). Migrations ALTER DEFAULT PRIVILEGES encontradas só tratam EXECUTE de funções e TRUNCATE, nunca GRANT de tabela. Sem suíte de autorização por objeto no repo.| CONTESTADO pelo cético (PARCIAL): Há redução parcial e suíte: grants.md — 28 objetos sem nenhum grant a anon (ex.: user_2fa, user_2fa_backup_codes, password_history, audit_log, login_attempts, security_events, entity_versions, v_security_definer_exposure) e SELECT revogado de anon em monthly_sales_summary/territories. Default ACL public/postgres: functions sem anon e tables 'anon=arwdxtm' (sem TRUNCATE) (grants.md:1344+). Suítes existem: supabase/tests/db01_default_acl_assertions.sql, canonical_role_simulation.sql, rls_test_suite.sql, tests/migrations/authz_hardening_contract_test.ts; 109 migrations com REVOKE ... FROM anon. Porém…
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F2865 · Proteção CSRF por token com rotação automática

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Proteção CSRF baseada em token, rotação automática e validação em todas as mutações.
- **Fontes:** `docs/SECURITY.md:44-48`
- **O que falta:** Corrigir a doc (SPA + Bearer JWT dispensa CSRF clássico) ou implementar validação server-side.
- **Evidência:** grep 'csrf\|CSRF' em src e supabase -> 0 resultados em todo o repo. docs/SECURITY.md:44-48 afirma token CSRF com rotação automática e validação em mutações — nada disso existe no código.| cético: git grep -i csrf HEAD fora de docs → só SECURITY.md e graphify-out/GRAPH_REPORT.md. Histórico: src/lib/csrfProtection.ts criado em cfbfb7f92 e apagado em 269a35f15 (commit genérico 'Changes' do gpt-engineer, sem registro de remoção deliberada); era só token em sessionStorage, nunca validado em servidor. docs/SECURITY.md:44-48 continua afirmando.

### F2913 · Criptografia client-side de PII

- **Tipo:** Service/lib
- **O que os docs afirmam:** PII é criptografada no cliente antes de persistir.
- **Fontes:** `docs/SECURITY.md:28-33`
- **O que falta:** implementar módulo de cifra (WebCrypto AES-GCM) em src/lib e aplicá-lo nos campos PII de contatos antes de INSERT/UPDATE, com decifra na leitura — nada disso existe
- **Evidência:** grep por WebCrypto/crypto.subtle/AES/cifra em src/lib,src/hooks,src/services fora de testes → único hit é useUploadCallRecording.ts:103, que usa crypto.subtle.digest('SHA-256',...) para fingerprint de arquivo, não cifra de PII. Nenhum módulo de criptografia de campos PII existe. docs/SECURITY.md:28-33 é texto genérico sem correspondência no código.
- **Revisão:** sem contestação cética concluída.

### F3897 · Device fingerprinting e user agent tracking

- **Tipo:** Service/lib
- **O que os docs afirmam:** Fingerprint de dispositivo e rastreio de user agent nas integrações de segurança.
- **Fontes:** `docs/FUNCIONALIDADES_SISTEMA.md:383-384`
- **O que falta:** arquivo deviceFingerprint ausente em src/
- **Evidência:** arquivo deviceFingerprint ausente em src/
- **Revisão:** sem contestação cética concluída.

### F3899 · Service/lib getUserClient (2 afirmações nos docs)

- **Tipo:** Service/lib
- **O que os docs afirmam:** 19 funções criam client com JWT do usuário.| Padrão 'JWT do usuário (RLS)': `getUserClient(req)` valida o token e cria client que opera sob RLS.
- **Fontes:** `docs/estado/08_ADMIN_SEGURANCA.md:85,232`, `docs/API.md:17-17`
- **O que falta:** arquivo getUserClient ausente em src/
- **Evidência:** arquivo getUserClient ausente em src/
- **Revisão:** sem contestação cética concluída.

### F3902 · Tabela _internal_secrets com coaching_cron_secret (header X-Cron-Secret / isAuthorizedCronRequest)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** pg_cron lê o segredo na tabela e envia X-Cron-Secret; edges validam com isAuthorizedCronRequest.
- **Fontes:** `docs/SECRETS_ROTATION.md:41-45,98-99`
- **O que falta:** tabela/view "coaching_cron_secret" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "coaching_cron_secret" ausente do banco real (tables.md, views.md)
- **Revisão:** sem contestação cética concluída.

### F3903 · Tabela access_denied_alert_settings com threshold (default 10)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Threshold de negadas por usuário/janela configurável em access_denied_alert_settings.
- **Fontes:** `docs/runbooks/access-denied.md:8-10,30`
- **O que falta:** tabela/view "access_denied_alert_settings" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "access_denied_alert_settings" ausente do banco real (tables.md, views.md)
- **Revisão:** sem contestação cética concluída.

### F3904 · Tabela app_role (3 afirmações nos docs)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Papéis RBAC reais no banco.| Doc: drift severo do enum app_role entre tipos locais e origem; equalizar exige ADR de papéis. \| `roles.name` = admin\|manager\|seller enquanto enum `app_role` = admin\|manager\|salesperson; as duas fontes nunca se cruzam.
- **Fontes:** `docs/estado/08_ADMIN_SEGURANCA.md:88`, `docs/auditoria/MATRIZ_FORENSE_BANCOS_E_CONTRATOS_2026-08-26.md:251-255`, `docs/estado/08_ADMIN_SEGURANCA.md:75,88,237`
- **O que falta:** tabela/view "app_role" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "app_role" ausente do banco real (tables.md, views.md)
- **Revisão:** sem contestação cética concluída.

### F3905 · Tabela email_optouts (2 afirmações nos docs)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Opt-out ausente: risco LGPD e de deliverability.| Gap: não localizada tabela de unsubscribe.
- **Fontes:** `docs/benchmark/RAMPER_2026-07.md:164`, `docs/benchmark/RAMPER_2026-07.md:85`
- **O que falta:** tabela/view "email_optouts" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "email_optouts" ausente do banco real (tables.md, views.md)
- **Revisão:** sem contestação cética concluída.

### F3906 · Tabela roles (2 afirmações nos docs)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** O dicionário documenta a tabela `roles` (5 colunas, RLS não declarado nas migrations). Não consta no snapshot real do banco. Dropada por supabase/migrations/20261001203100_drop_legacy_rbac.sql (modelo RBAC paralelo removido; canônico é app_role + user_roles).| Censo count(*) real em 2026-08-16: 3 linhas. Doc nota assinatura de seed sintético nos blocos 900/600/500/100.
- **Fontes:** `docs/DATA_DICTIONARY.md:5167-5178`, `docs/estado/11_DADOS_BANCO.md:128-128`
- **O que falta:** tabela/view "roles" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "roles" ausente do banco real (tables.md, views.md)
- **Revisão:** sem contestação cética concluída.

### F3908 · Tabela v_products_public (4 afirmações nos docs)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Etapa 37 P: 9 views security_invoker (20260831130000); v_products_public sem artefato.| Reduzir v_products_public e revisar as nove views owner-context. Saída esperada: contrato público aprovado. Gate: decisão funcional e DDL. \| Etapa canônica 37 (plano 26/08, matriz de status 30/08, estado 🔒): reduzir v_products_public; revisar 9 views; contrato público aprovado. \| v_products_public expõe 184 colunas, incluindo custo, organização, fornecedor, impostos e metadados de sincronização. Observação: o doc refere-se ao projeto ORIGEM rapjswienfhkobhlamxb, que AGENTS.md declara não pertencer a este repo; verificar também o equivalente no destino usyxfpqlsspldubptrdl.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:43`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:702-702`, `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:170-170`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:432-432`
- **O que falta:** tabela/view "v_products_public" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "v_products_public" ausente do banco real (tables.md, views.md)
- **Revisão:** sem contestação cética concluída.

### F3909 · Tabela views_security_invoker (2 afirmações nos docs)

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Fila canônica do handoff (onda 4): Corrigir security_invoker e grants das nove views. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.| Etapa 31 do plano de 100 etapas (auditoria 30/08; = P031 do handoff): Após autorização, corrigir security_invoker e grants; testes positivos e negativos por papel.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:322-322`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:686-686`
- **O que falta:** tabela/view "views_security_invoker" ausente do banco real (tables.md, views.md)
- **Evidência:** tabela/view "views_security_invoker" ausente do banco real (tables.md, views.md)
- **Revisão:** sem contestação cética concluída.

### F2935 · Lint test de CI: service_role sem getServiceClient rejeitado

- **Tipo:** Teste
- **O que os docs afirmam:** NÃO INICIADO: só chunked_in_lint_test e cors_lint_test existem.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:379`
- **O que falta:** Criar supabase/functions/_shared/service_role_lint_test.ts que varre index.ts e falha em createClient com SUPABASE_SERVICE_ROLE_KEY fora de getServiceClient (com allowlist das 90 atuais), rodando no tier unit do deno-test-suite.
- **Evidência:** Não há lint test que rejeite uso de service_role sem getServiceClient: _shared/ só tem cors_lint_test.ts e chunked_in_lint_test.ts, nenhum cita service_role/getServiceClient (grep -n 'service_role\|getServiceClient' supabase/functions/_shared/*lint_test.ts → 0). getServiceClient existe em supabase/functions/_shared/auth-client.ts:76, mas 90 index.ts ainda leem SUPABASE_SERVICE_ROLE_KEY direto (grep -rln SUPABASE_SERVICE_ROLE_KEY supabase/functions --include=index.ts| wc -l → 90). Contract tests por function (ex.: enrich-lead/contract_test.ts:42) não são o lint global.
- **Revisão:** sem contestação cética concluída.

### F2937 · Pendência ADR-009 #1: verificação da CSP em browser real (zero violações no console)

- **Tipo:** Teste
- **O que os docs afirmam:** ADR-009: quem revisar deve navegar login, dashboard, export PDF/Excel e assistente de IA confirmando zero erro de CSP.
- **Fontes:** `docs/decisions/ADR-009-session-storage-e-csp.md:93-96`
- **O que falta:** Criar spec Playwright (ex.: tests/e2e/csp-violations.spec.ts no projeto chromium-desktop) que navegue login/dashboard/export PDF-Excel/assistente IA e falhe em mensagens de console 'Content Security Policy' ou evento securitypolicyviolation; registrar o resultado na ADR-009.
- **Evidência:** docs/decisions/ADR-009-session-storage-e-csp.md:92-95 mantém a pendência 1 aberta. Nenhum teste captura violações de CSP: grep -rlniE 'csp\|securitypolicyviolation\|Content-Security-Policy' tests → 0; listeners existentes são genéricos (tests/e2e/dashboard-navigation.spec.ts:61 pageerror; quote-to-sale-ui-error-alt.spec.ts:80 console) sem filtro de CSP. CSP ativa em index.html:56 e vercel.json:22.
- **Revisão:** sem contestação cética concluída.

### F3910 · Teste de regressão anon em clients/activities/sales/leads (helpers re-concedidos a anon)

- **Tipo:** Teste
- **O que os docs afirmam:** PARCIAL/risco: 20261005140000 concede EXECUTE a anon em get_current_salesperson_id, get_user_role, is_admin_or_manager.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:214`
- **O que falta:** arquivo de teste 20261005140000_restore_anon_execute_rls_helpers.sql ausente
- **Evidência:** arquivo de teste 20261005140000_restore_anon_execute_rls_helpers.sql ausente
- **Revisão:** sem contestação cética concluída.

### F2945 · Verificação da CSP em browser real (ADR-009)

- **Tipo:** Teste
- **O que os docs afirmam:** Nenhum registro ou teste de violação de CSP.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:148`
- **O que falta:** Criar um spec Playwright que escute securitypolicyviolation e os erros de console em login, dashboard, export PDF/Excel e assistente IA, e que falhe se houver violação. Depois, registrar a execução no ADR-009.
- **Evidência:** A CSP existe em index.html:56 (meta) e vercel.json:22 (só frame-ancestors), mas docs/decisions/ADR-009-session-storage-e-csp.md:85-94 registra que a verificação foi apenas estática e que a checagem em browser real fica pendente. Nenhum teste captura violação de CSP: grep -rn -i 'csp\|securitypolicyviolation' tests/ e2e/ → 0 resultados.| cético: Confirmado. docs/decisions/ADR-009-session-storage-e-csp.md:84-95 diz que a verificação foi só estática e que a checagem em browser real segue pendente (Pendências item 1). Não há teste de CSP: grep -rln -i -E 'content-security-policy\|securitypolicyviolation\|\bcsp\b' tests e2e src scripts → 0 resultados. Em docs/, só B_funcionalidades_docs.md e o próprio ADR-009 falam em violação de CSP, os dois como pendência.

### F3911 · 10 event triggers que revogam grants futuros

- **Tipo:** Trigger
- **O que os docs afirmam:** Há 10 event triggers habilitados que revogam parte dos grants futuros, mas não corrigem tabelas/sequences/default ACL. Observação: o doc refere-se ao projeto ORIGEM rapjswienfhkobhlamxb, que AGENTS.md declara não pertencer a este repo; verificar também o equivalente no destino usyxfpqlsspldubptrdl.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:403-403`
- **O que falta:** trigger pg_event_trigger ausente (triggers.md)
- **Evidência:** trigger pg_event_trigger ausente (triggers.md)
- **Revisão:** sem contestação cética concluída.

### F3913 · Trigger audit_trigger (2 afirmações nos docs)

- **Tipo:** Trigger
- **O que os docs afirmam:** API.md lista a function SQL `audit_trigger` com última definição em 20260104200100_audit_trail_complete.sql, grants "—" e uso no front "—".| log_audit e audit_trigger nunca foram anexadas; superseded por audit_log_row_change (mig/20261001193100:120-137).
- **Fontes:** `docs/API.md:478-478`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:88`
- **O que falta:** trigger audit_trigger ausente (triggers.md)
- **Evidência:** trigger audit_trigger ausente (triggers.md)
- **Revisão:** sem contestação cética concluída.

### F2950 · Config gitleaks fixada no CI (D-03 aberta)

- **Tipo:** Workflow CI
- **O que os docs afirmam:** D-03: contagens gitleaks divergentes (20/31, 32, 8+32, 33); fecha-se fixando a config no CI (etapa 87) e reproduzindo.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:333-333`
- **O que falta:** Versionar .gitleaks.toml com allowlist e criar um job em pr-checks.yml com o gitleaks numa versão fixada. Registrar a contagem reproduzida para fechar a D-03.
- **Evidência:** Não existe config nem workflow do gitleaks: ls -a| grep gitleaks → 0 resultados; grep -rln -i gitleaks .github/ scripts/ package.json → 0 resultados. A D-03 continua 'Aberta' em docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:335. \| cético: Confirmado. ls -a \| grep -i gitleaks → 0 resultados. grep -rln -i gitleaks .github scripts package.json → 0 resultados. Também não há outro scanner externo: grep -rn -i -E 'trufflehog\|detect-secrets\|ggshield\|gitleaks' .github .husky scripts package.json → 0 resultados. .husky/pre-commit só roda lint-staged.

### F2951 · Etapa 23: job zizmor (auditoria de segurança de workflows)

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Detecta injection, permissions excessivas, persist-credentials.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:63`
- **O que falta:** Criar .github/workflows/zizmor.yml (pull_request em .github/workflows/**, permissions: {}, versão fixada) ou um step em pr-checks.yml.
- **Evidência:** Nenhum job ou step roda zizmor. Só há comentários de supressão '# zizmor: ignore[excessive-permissions]' em .github/workflows/contexto.yml:310, inventario-estado-semanal.yml:43 e types-sync.yml:143. grep -rn -i zizmor package.json .husky scripts → 0 resultados. docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:59 registra 'NÃO INICIADO'.| cético: Confirmado. grep -rn -i zizmor .github → só os comentários de supressão em contexto.yml:310, inventario-estado-semanal.yml:43 e types-sync.yml:143. Nenhum job ou step usa zizmor.

### F2957 · gitleaks fixado como ferramenta

- **Tipo:** Workflow CI
- **O que os docs afirmam:** §8 D-03 NI: não há gitleaks no repo/CI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:223`
- **O que falta:** Versionar .gitleaks.toml e rodar o gitleaks numa versão fixada em pr-checks.yml.
- **Evidência:** Não existe gitleaks no repo nem no CI: ls -a| grep -i gitleaks → 0 resultados; grep -rln -i gitleaks .github/ scripts/ package.json → 0 resultados. O único scanner é o próprio scripts/security/check-no-committed-service-role.ts (package.json:47, pr-checks.yml:134-135). \| cético: Confirmado. grep -rln -i gitleaks .github scripts package.json → 0 resultados, e não há .gitleaks.toml. O único scanner é o npm run security:secrets (package.json:47), que roda em pr-checks.yml:133-134 ('Committed secrets scan').

### F2960 · Scanner de segredos detecta URLs postgres://

- **Tipo:** Workflow CI
- **O que os docs afirmam:** P006 P: check-no-committed-service-role.ts:17-20 cobre JWT/sb_secret_/hex; não detecta postgres://; sem teste de regressão.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:118`
- **O que falta:** Adicionar a regex de postgres(ql)://user:senha@ (ignorando o placeholder <senha> de scripts/run-sql-tests.sh:52) e um teste com um caso positivo e um negativo.
- **Evidência:** O scanner scripts/security/check-no-committed-service-role.ts tem só 3 padrões (:17-20: JWT, sb_secret_, atribuição nomeada) e nenhum é de URL de banco: grep -n -i -E 'postgres(ql)?://' scripts/security → 0 resultados. Também não há teste: grep em _.test._ → 0 resultados. O próprio repo documenta URLs postgres:// com placeholder em scripts/run-sql-tests.sh:11,19,52, o que exige uma regra que ignore placeholders <senha>.| cético: Confirmado. Os padrões de check-no-committed-service-role.ts:17-20 não incluem URL postgres://, e não há teste. A detecção de URL de banco não existe, então NAO_IMPLEMENTADO é correto. O scanner em si existe e está coberto no F2958.

## Parcial (167)

### F2520 · Ação 'Anonimizar' para erasure com confirmação na tela admin

- **Tipo:** Ação/botão
- **O que os docs afirmam:** Na tela de solicitações, pedidos erasure têm botão que aciona anonymize_data_subject com confirmação.
- **Fontes:** `docs/LGPD.md:50-51,55-66`
- **O que falta:** Adicionar item de menu para /admin/solicitacoes-titular; hoje só é acessível digitando a URL direto.
- **Evidência:** src/pages/AdminSolicitacoesTitular.tsx:402-497 (botão 'Anonimizar' + AlertDialog de confirmação); src/hooks/admin/useDataSubjectRequests.ts:127-147 (useAnonymizeDataSubject chama supabase.rpc('anonymize_data_subject', {p_subject_email,p_subject_id,p_phone,p_request_id})); RPC real em supabase/schema.sql:10246. Rota registrada (src/routes/AppRoutes.tsx:506). Porém grep 'Titular' src/components/layout/sidebar/sidebarMenuData.ts → 0 resultados: sem entrada no menu.
- **Revisão:** sem contestação cética concluída.

### F2521 · Botão "Ver Logs Detalhados" do SecurityDashboard

- **Tipo:** Ação/botão
- **O que os docs afirmam:** Doc: botão sem ação.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/D_frontend.md:165-165`
- **O que falta:** Adicionar handler que navegue para uma tela de logs de segurança.
- **Evidência:** src/pages/SecurityDashboard.tsx:150-158 — único <Button> do arquivo ('Ver Logs Detalhados'), sem onClick, sem navigate.
- **Revisão:** sem contestação cética concluída.

### F2524 · Botões/comandos sem handler real em AdminComercial

- **Tipo:** Ação/botão
- **O que os docs afirmam:** A auditoria confirmou botões/comandos visíveis sem handler real no módulo AdminComercial.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:234-234`
- **O que falta:** Implementar onClick de Filtrar/Exportar no histórico, ou ocultá-los.
- **Evidência:** src/pages/admin/AdminComercial.tsx:717-731 — botões 'Filtrar' e 'Exportar' na aba Histórico de Auditoria sem onClick. Em contraste, botões 'Aprovar'/'Rejeitar' (622-642) têm handler real (processApprovalMutation.mutate).
- **Revisão:** sem contestação cética concluída.

### F2525 · Botões/comandos sem handler real em SecurityDashboard

- **Tipo:** Ação/botão
- **O que os docs afirmam:** A auditoria confirmou botões/comandos visíveis sem handler real no módulo SecurityDashboard.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:234-234`
- **O que falta:** Mesmo de F2521.
- **Evidência:** Mesma evidência de F2521: SecurityDashboard.tsx:150-158, único Button do arquivo, sem onClick.
- **Revisão:** sem contestação cética concluída.

### F2528 · Fluxo de reset de senha

- **Tipo:** Ação/botão
- **O que os docs afirmam:** ResetPassword.tsx implementa recuperação de senha; edge `send-password-reset` envia e-mail; `PasswordResetApproval.tsx` permite admin aprovar.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:161-166,185,1019`
- **O que falta:** Adicionar 'send-password-reset' à allowlist de deploy.yml:144 para o e-mail sair de fato em produção.
- **Evidência:** Fluxo integrado em código: ResetPassword.tsx roteado (/reset-password, AppRoutes.tsx:219); PasswordResetApproval.tsx:58-105 grava/lê password_reset_requests e 83-84 chama functions.invoke('send-password-reset'), montado em Configuracoes.tsx. Porém 'send-password-reset' NÃO está na allowlist ACTIVE (grep em .github/workflows/deploy.yml:144 → 0 resultados) — existe no repo mas não é deployada em produção.
- **Revisão:** sem contestação cética concluída.

### F2532 · Login/cadastro por email e senha

- **Tipo:** Ação/botão
- **O que os docs afirmam:** Auth.tsx oferece login e cadastro por email/senha via Supabase Auth.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:161-165`
- **O que falta:** A afirmação de 'cadastro' no formulário é falsa — é decisão de produto (contas só via painel externo); se UI de cadastro for exigida, falta tela admin de criação de usuário.
- **Evidência:** Login real: AuthContext.tsx:125-128 (signIn→signInWithPassword) chamado por useAuthForm.ts:104. Cadastro NÃO existe no formulário: AuthFormCard.tsx:145-147 declara 'Novos cadastros são criados exclusivamente por um administrador'; grep 'signUp(' em src/hooks/auth/*.ts, Auth.tsx, AuthContext.tsx → 0 resultados; grep 'createUser\|inviteUserByEmail' em src/ e supabase/functions/ → 0 resultados.
- **Revisão:** sem contestação cética concluída.

### F2540 · Gestão de consentimento na UI (consent_records, has_active_consent)

- **Tipo:** Componente
- **O que os docs afirmam:** consent_records e has_active_consent existem só no banco, 0 usos em src e functions.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:145`
- **O que falta:** UI (admin e/ou self-service) para consent_records, e envios checando has_active_consent antes de disparar.
- **Evidência:** has_active_consent confirmada só no banco (supabase/functions.md:248). No código, grep 'consent_records\|has_active_consent' em src/ e supabase/functions/ só acha src/integrations/supabase/types.ts (tipos gerados) e supabase/functions/twilio-call-twiml/index.ts:134, que é apenas um COMENTÁRIO, sem query real. Nenhuma UI captura/revoga consentimento.
- **Revisão:** sem contestação cética concluída.

### F2541 · Lixeira admin para restaurar/purgar soft delete

- **Tipo:** Componente
- **O que os docs afirmam:** UI admin de lixeira usando restore_deleted_record, hard_delete_record e cleanup_deleted_records (0 usos em src/functions). Soft delete em si aplicado em useQuotes e useTaskQueries.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:22`
- **O que falta:** Criar página admin de lixeira (rota+menu) que liste deleted_at preenchido e chame as RPCs de restaurar/purgar.
- **Evidência:** Soft delete real: useQuotes.ts:266 (update deleted_at/deleted_by) e filtros .is('deleted_at',null) em 97,121,286; useTaskQueries.ts também filtra. As RPCs restore_deleted_record/hard_delete_record/cleanup_deleted_records só aparecem em supabase/functions/_shared/canonical-hardening_contract_test.ts (teste de contrato, não chamada de app real). grep -ni 'lixeira\|trash' em AppRoutes.tsx → 0 resultados.
- **Revisão:** sem contestação cética concluída.

### F2544 · UI de direitos do titular (acesso, eliminação, portabilidade)

- **Tipo:** Componente
- **O que os docs afirmam:** data_subject_requests e anonymize_data_subject têm 0 refs em src e functions.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:144`
- **O que falta:** Adicionar item de menu para /admin/solicitacoes-titular e construir portal self-service fora do /admin usando a RLS já existente.
- **Evidência:** Reivindicação do doc ('0 refs') desatualizada/falsa: fila admin completa em AdminSolicitacoesTitular.tsx (504 linhas) + useDataSubjectRequests.ts, cobrindo access/rectification/erasure/portability/consent_revocation/information (linhas 56-62), com CRUD real e chamada a anonymize_data_subject (mesma evidência F2520). Rota registrada (AppRoutes.tsx:506). Faltam: (1) sem entrada no menu (grep 'Titular' em sidebarMenuData.ts → 0); (2) sem portal self-service para o titular (RLS já prevê 'Titular abre própria solicitação', useDataSubjectRequests.ts:90-91, mas grep 'portal.*titular\|PortalTitular\|MeusDados' em src/ → 0 resultados).
- **Revisão:** sem contestação cética concluída.

### F2545 · UI useSalespersonCustomFields: editor visual de campos no painel admin

- **Tipo:** Componente
- **O que os docs afirmam:** Falta editor visual de campos no painel admin para useSalespersonCustomFields (UI atual: 1 import).
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:68`
- **O que falta:** Criar uma UI que edite os valores de salesperson_custom_field_values por vendedor. Hoje dá para editar as definições e ver os valores, mas não editar os valores.
- **Evidência:** useSalespersonCustomFields.ts (src/hooks/sales/useSalespersonCustomFields.ts:14-50) é read-only. Único consumidor: CustomFieldsDisplay.tsx:17, montado em VendedorHeader.tsx:68 — só exibe badges. O editor existente, CustomFieldsManager.tsx (montado em Configuracoes.tsx:301), gerencia só as definições de campo (team_custom_fields), não escreve em salesperson_custom_field_values (0 ocorrências).| cético: Confirmado: src/hooks/sales/useSalespersonCustomFields.ts:22 e :31 só fazem SELECT em team_custom_fields e salesperson_custom_field_values. O único consumidor é src/components/salespeople/CustomFieldsDisplay.tsx:17, montado em src/components/vendedor/VendedorHeader.tsx:68, e só exibe. src/components/settings/CustomFieldsManager.tsx:53,67,89 escreve apenas em team_custom_fields (as definições) e fica montado em src/pages/Configuracoes.tsx:300-301, atrás de isAdmin (:294). Nada escreve valor…

### F2546 · UI useWebAuthn: onboarding de passkey no login + lista de credenciais com nicknames

- **Tipo:** Componente
- **O que os docs afirmam:** Falta onboarding de passkey no login + lista de credenciais com nicknames para useWebAuthn (UI atual: 1 import (Settings)).
- **Fontes:** `docs/FUNCIONALIDADES_SEM_UI.md:82`
- **O que falta:** Falta um input para nomear ou renomear a passkey e um onboarding guiado depois do login. O botão de login com passkey e a lista já existem.
- **Evidência:** Login já tem botão de passkey (AuthFormCard.tsx:221-238 'Entrar com passkey', via useAuthForm.ts:194-195 loginWithPasskey) — contradiz a doc ('UI atual: 1 import'). Settings tem PasskeySettings.tsx (Configuracoes.tsx:278) com lista mostrando friendly_name, mas o nickname é gerado automaticamente pelo backend (supabase/functions/webauthn/index.ts:247 `Passkey ${data}`), sem input para o usuário nomear.| cético: Confirmado: a edge function webauthn está na allowlist (.github/workflows/deploy.yml:144, último item de ACTIVE). As tabelas webauthn_credentials e webauthn_challenges existem no banco real (tables/public/webauthn_credentials.md). PasskeySettings.tsx:161 só exibe cred.friendly_name e :382 faz o SELECT. O nome é fixo no backend: supabase/functions/webauthn/index.ts:247 `Passkey ${new Date().toLocaleDateString('pt-BR')}`. grep 'rename\|nickname\|Input' em PasskeySettings.tsx → 0 res…

### F2548 · .env com credenciais commitado — remover do histórico e ignorar

- **Tipo:** Doc/config
- **O que os docs afirmam:** .env com VITE_SUPABASE_PROJECT_ID/URL/PUBLISHABLE_KEY reais está commitado; recomenda revogar chaves, limpar histórico e garantir .env no .gitignore.
- **Fontes:** `docs/reports/BACKEND_ANALYSIS_REPORT.md:30-62`
- **O que falta:** Limpar o histórico dos commits 3b8fbe9ae e d0a4a2983 (filter-repo/BFG), ou registrar que as chaves expostas foram revogadas.
- **Evidência:** .env não rastreado hoje e .gitignore:27 o lista. Mas `git log --all --oneline -- .env` retorna 3 commits (3b8fbe9ae, d0a4a2983, 13c31aa8e) — histórico NÃO foi limpo (sem filter-repo/BFG), só removido do tracking atual. Critério explícito do item ('git log não retorna commits') falha.| cético: `git ls-files .env` → vazio, e .gitignore:27 lista .env. Mas `git log --all --oneline -- .env` → 3 commits (3b8fbe9ae, d0a4a2983, 13c31aa8e), ou seja, o histórico não foi limpo. O critério do item ('git log não retorna commits') falha.

### F2551 · `autoRefreshToken: true` limitando janela de token roubado ao `jwt_expiry`

- **Tipo:** Doc/config
- **O que os docs afirmam:** ADR-009: autoRefreshToken true já limita a janela do token; jwt_expiry do projeto ainda não auditado (etapa 24).
- **Fontes:** `docs/decisions/ADR-009-session-storage-e-csp.md:39-41`
- **O que falta:** Auditar o jwt_expiry no painel Auth do projeto usyxfpqlsspldubptrdl. A Management API está desabilitada no snapshot.
- **Evidência:** client.ts:13 tem autoRefreshToken: true (confirmado). jwt_expiry é config do painel Supabase Auth, inacessível a este agente (nenhuma ferramenta MCP aponta para usyxfpqlsspldubptrdl); docs/AUTH_CONFIG.md:14 só recomenda, sem evidência do valor real.| cético: src/integrations/supabase/client.ts:13 tem autoRefreshToken: true. O jwt_expiry real não está no snapshot: contexto/supabase/auth.md diz 'Configuração indisponível (Management API desabilitada)' e project-config.md diz '_Management API desabilitada._'. docs/AUTH_CONFIG.md:14 só traz a recomendação ≤3600 s.

### F2555 · ALLOWED_ORIGINS documentado em SECRETS_ROTATION e .env.example

- **Tipo:** Doc/config
- **O que os docs afirmam:** T8 P: não aparece em nenhum dos dois.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:329`
- **O que falta:** Adicionar entrada de ALLOWED_ORIGINS em docs/SECRETS_ROTATION.md e .env.example.
- **Evidência:** grep ALLOWED_ORIGINS em docs/SECRETS_ROTATION.md e .env.example → 0 resultados em ambos. Secret real e usado em supabase/functions/_shared/cors.ts e documentado só em supabase/functions/README.md:100-111.| CONTESTADO pelo cético (NAO_IMPLEMENTADO): O item trata só de documentar ALLOWED_ORIGINS em dois arquivos, e nenhum dos dois tem a entrada: `grep -c ALLOWED_ORIGINS docs/SECRETS_ROTATION.md .env.example` → 0 e 0. A fonte (A_planos_execucao.md:329, 'T8 P: não aparece em nenhum dos dois') é o próprio plano de adicionar, que não foi executado. Não existe nenhuma entrada parcial. O secret só aparece em código (supabase/functions/_shared/cors.ts:20-32) e em outros docs (RUNBOOK, functions/README), que estão fora do escopo do item.
- **Revisão:** em disputa. O cético propõe Não implementado e o juiz ainda não decidiu.

### F2559 · API.md sem fn_test_* com anon (catálogo regenerado)

- **Tipo:** Doc/config
- **O que os docs afirmam:** DIVERGENTE: repo revoga mas catálogo diz anon.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:406`
- **O que falta:** Rodar scripts/gen-api-catalog.mjs e commitar o docs/API.md regenerado.
- **Evidência:** docs/API.md:587-591 ainda lista 5 funções fn_test_* com role 'anon'. Snapshot real do banco (functions.md:194-198) mostra que hoje essas funções têm grants só service_role (ou authenticated+service_role), sem anon, via migração 20261001203300_deny_dead_tables_revoke_anon_grants.sql. Banco já corrigido; catálogo docs/API.md desatualizado.| cético: docs/API.md:587-591 ainda lista os 5 fn_test_* com 'anon, authenticated, service_role'. No banco real, functions.md:194-198 mostra fn_test_backdate_cron_alert e fn_test_cleanup_cron_alerts com grant só service_role: o banco foi corrigido, mas o catálogo não foi regenerado. scripts/gen-api-catalog.mjs existe.

### F2570 · CORS com ALLOWED_ORIGINS configurado

- **Tipo:** Doc/config
- **O que os docs afirmam:** _shared/cors.ts:7 cai para * sem ALLOWED_ORIGINS; env não configurada.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:154`
- **O que falta:** Confirmar no Supabase Dashboard se ALLOWED_ORIGINS está de fato setado (fora do alcance do repo); atualizar RUNBOOK.md:47-49.
- **Evidência:** supabase/functions/_shared/cors.ts:7,24-34,60-62 — fallback sem ALLOWED_ORIGINS não é mais '_', cai em DEFAULT_ALLOWED_ORIGINS (lista fixa). 167/173 functions usam getCorsHeaders. corsHeaders estático com '_' ainda exportado (cors.ts:112-114) para compat. docs/RUNBOOK.md:47-49 ainda descreve fallback '*' (desatualizado).
- **Revisão:** sem contestação cética concluída.

### F2575 · CSP Report-Only inviável via `<meta>` (etapa 22 do plano revisada)

- **Tipo:** Doc/config
- **O que os docs afirmam:** ADR-009: Content-Security-Policy-Report-Only só funciona como header HTTP; projeto entrega CSP via meta porque headers dependiam do hosting (Lovable Cloud).
- **Fontes:** `docs/decisions/ADR-009-session-storage-e-csp.md:71-89`
- **O que falta:** Adicionar header Content-Security-Policy-Report-Only em vercel.json agora que o host é Vercel.
- **Evidência:** vercel.json:1-56 não tem Content-Security-Policy-Report-Only. Comentário sobre Lovable Cloud já removido de index.html:47 (texto atual não cita Lovable).
- **Revisão:** sem contestação cética concluída.

### F2577 · CSP via meta em index.html

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc afirma CSP via meta em index.html, mas com unsafe-inline + unsafe-eval e connect-src https://*.supabase.co amplo.
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:340,349`
- **O que falta:** Restringir connect-src a https://usyxfpqlsspldubptrdl.supabase.co (index.html:56).
- **Evidência:** index.html:56 — meta CSP confirmado, sem unsafe-inline/unsafe-eval (já corrigido); connect-src ainda tem https://_.supabase.co / wss://_.supabase.co, curinga não restrito ao projeto canônico usyxfpqlsspldubptrdl.
- **Revisão:** sem contestação cética concluída.

### F2581 · docs/SEC-08_SERVICE_ROLE_AUDIT.md alega migração de ~50 funções

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc afirma helper pronto e ~122 funções usando service_role; medição: 138/168 cru, 5 getServiceClient, 19 getUserClient.
- **Fontes:** `docs/estado/08_ADMIN_SEGURANCA.md:223-233`
- **O que falta:** Atualizar 08_ADMIN_SEGURANCA.md com números atuais; implementar flag canário se for usar feature-flag.
- **Evidência:** docs/SEC-08_SERVICE_ROLE_AUDIT.md:25,33,63 descreve plano em andamento (⏳), não alega conclusão. Medição em 08_ADMIN_SEGURANCA.md:223-233 (138/168, 5, 19) está desatualizada: grep atual mostra 90/173 diretas, 52 getServiceClient, 113 getUserClient. Flag USE_USER_CLIENT_ ausente (0 resultados).
- **Revisão:** sem contestação cética concluída.

### F2596 · Etapa 88 do plano: Endurecer CSP e storage do browser

- **Tipo:** Doc/config
- **O que os docs afirmam:** Remover unsafe-eval/inline progressivamente e reduzir JWT/dados sensíveis persistidos. Saída esperada: CSP report-only→enforced. Gate: plano de compatibilidade.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:768-768`
- **O que falta:** remover 'unsafe-inline' de style-src; parar de persistir o corpo da resposta NLQ em sessionStorage.
- **Evidência:** index.html:56 tem CSP enforced (não report-only): script-src 'self' sem unsafe-eval/unsafe-inline. Porém style-src ainda mantém 'unsafe-inline' (index.html:56). src/hooks/nlq/useNLQ.ts:17,28 migrou de localStorage para sessionStorage, mas ainda grava o NLQResponse completo (useNLQ.ts:9-12).
- **Revisão:** sem contestação cética concluída.

### F2599 · Etapa canônica 26/08 nº 88: Endurecer CSP e armazenamento do navegador

- **Tipo:** Doc/config
- **O que os docs afirmam:** Etapa canônica 88 (plano 26/08, matriz de status 30/08, estado ⬜): remover unsafe-eval/inline progressivamente; reduzir dado sensível persistido (useNLQ.ts, ClientPurchaseHistory.tsx); CSP report-only→enforced.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:248-248`
- **O que falta:** remover 'unsafe-inline' de style-src; evitar persistir payload de resposta do NLQ mesmo em sessionStorage.
- **Evidência:** Mesma etapa 88 do F2596. CSP enforced sem unsafe-eval confirmado (index.html:56). useNLQ.ts:17,28 usa sessionStorage (não mais localStorage) mas ainda guarda response completo. ClientPurchaseHistory.tsx:50,76 usa localStorage só para filtros de UI, não JWT/dado sensível.
- **Revisão:** sem contestação cética concluída.

### F2609 · Headers de segurança do hosting: X-Frame-Options/frame-ancestors e Permissions-Policy

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc verificou ao vivo: HSTS, nosniff, referrer-policy presentes; faltam X-Frame-Options/frame-ancestors e Permissions-Policy; index.html:48 afirma que hosting aplica.
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:194,349`
- **O que falta:** adicionar header Permissions-Policy em vercel.json.
- **Evidência:** vercel.json:8-25 já define X-Frame-Options: SAMEORIGIN e CSP frame-ancestors 'self' para todas as rotas exceto /embed/, refutando a premissa da fonte (desatualizada). Permissions-Policy continua ausente (grep → 0 resultados). curl -I em produção bloqueado pelo proxy da sandbox ('403 no rule or network setting allows this host'); confirmação via vercel.json versionado, que é a config real do deploy.
- **Revisão:** sem contestação cética concluída.

### F2617 · Matriz authz revisada das functions (docs/API.md)

- **Tipo:** Doc/config
- **O que os docs afirmam:** P065 P: heurística (gen-api-catalog.mjs:7-10).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:160`
- **O que falta:** revisar manualmente cada classificação heurística de auth por function e adicionar coluna de escopo.
- **Evidência:** docs/API.md existe mas é gerado por heurística estática (scripts/gen-api-catalog.mjs:7-10: 'não detectado' não é prova de ausência de auth). A fonte (A_planos_execucao.md:160) classifica o item como 'P': 'Matriz authz das funções| P \| docs/API.md (heurística) \| Matriz revisada com escopo' — e isso não mudou.
- **Revisão:** sem contestação cética concluída.

### F2618 · Matriz função→papel exigido (5.3)

- **Tipo:** Doc/config
- **O que os docs afirmam:** PARCIAL: 34 index.ts usam cron-secret/internal-service-auth; 64 dirs com checagem de papel.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:258`
- **O que falta:** consolidar matriz versionada função→papel exigido, hoje só inferível lendo cada handler individualmente.
- **Evidência:** Contagem atual: 27 index.ts usam cron-secret/internal-service-auth e 72 usam has_role/is_admin_or_manager/requireRole — ordem de grandeza próxima da fonte (34/64). Não existe arquivo dedicado de 'matriz função→papel' versionado (find docs → 0 resultados); a informação está dispersa em docs/API.md e no código.
- **Revisão:** sem contestação cética concluída.

### F2620 · Matriz verify_jwt (20 false) com coluna implantado

- **Tipo:** Doc/config
- **O que os docs afirmam:** P016 P: config.toml; docs/API.md:14-33.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:126`
- **O que falta:** Adicionar coluna 'implantado' ao gerador scripts/gen-api-catalog.mjs (que produz docs/API.md) cruzando cada function com a allowlist ACTIVE de deploy.yml:144, e corrigir a contagem (22, não 20) na citação da P016.
- **Evidência:** supabase/config.toml tem 22 entradas `verify_jwt = false` (grep -c '^verify_jwt = false' supabase/config.toml = 22), não 20 como o doc-fonte diz. docs/API.md:14-33 documenta o modelo de auth por function (coluna 'Auth exigida' já indica se é verify_jwt off/on), mas `grep -n implantado docs/API.md` = 0 resultados: não existe coluna 'implantado' cruzando com a allowlist de produção (.github/workflows/deploy.yml:144).
- **Revisão:** sem contestação cética concluída.

### F2623 · Pacote dbpkg-lgpd-retencao (migration de anonimização para dumps)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Dump de produção para staging deve ser anonimizado via migration do pacote dbpkg-lgpd-retencao.
- **Fontes:** `docs/STAGING.md:61-62`
- **O que falta:** Staging real não existe neste repo (confirmado por outras auditorias — docs/STAGING.md é só guia). 'dbpkg-lgpd-retencao' é nome fictício/não implementado; renomear a referência em STAGING.md para apontar à função real (anonymize_data_subject) ou remover a menção até existir pipeline de dump.
- **Evidência:** docs/STAGING.md:62 referencia 'migration de anonimização do pacote dbpkg-lgpd-retencao', mas `grep -rn dbpkg-lgpd-retencao` no repo só encontra essa única citação — não existe pasta/pacote/migration com esse nome. O que existe de fato é `anonymize_data_subject` em supabase/migrations/20261001150100_lgpd_consent_and_anonymization.sql e 20261018190000_lgpd_fixes_consent_anonymize.sql, usado por src/hooks/admin/useDataSubjectRequests.ts (fluxo de solicitação de titular), mas é anonimização sob demanda (LGPD art. 18), não um pipeline de dump prod→staging.
- **Revisão:** sem contestação cética concluída.

### F2631 · PROCESSOS: número de verify_jwt=false (20, não 13)

- **Tipo:** Doc/config
- **O que os docs afirmam:** DIVERGENTE: config.toml tem 20.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:415`
- **O que falta:** Atualizar docs/PROCESSOS.md:40 com o número correto e atual (22, verificado agora — nem 13 nem os 20 já citados em auditorias anteriores batem, pois o número muda com o tempo); idealmente gerar essa contagem automaticamente a partir de supabase/config.toml em vez de hardcoded.
- **Evidência:** docs/PROCESSOS.md:40 diz '13 edge functions com verify_jwt=false'. O número real em supabase/config.toml é 22 (`grep -c '^verify_jwt = false' supabase/config.toml` = 22), não 13 E também não 20 como a própria fonte desta claim (C_estado_runbooks.md:415) já havia apontado como correção.
- **Revisão:** sem contestação cética concluída.

### F2634 · Protocolo Edge: ator/papel/recurso, ownership antes de service role, CORS allowlist, verify_jwt explícito, timeout/request ID/retry/circuit breaker

- **Tipo:** Doc/config
- **O que os docs afirmam:** Para cada endpoint: validar autenticação e ownership antes de service role; limitar IDs/paginação/payload; CORS por allowlist; verify_jwt explícito; timeout, request ID, retry idempotente, circuit breaker; falha honesta sem integração; testes negativos.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:220-242`
- **O que falta:** Produzir a matriz por endpoint comprovando conformidade com os 10 itens do protocolo (hoje só os utilitários compartilhados existem; não há auditoria function-a-function registrada).
- **Evidência:** supabase/functions/_shared/ tem peças do protocolo: cors.ts (CORS allowlist), cron-request-auth.ts/internal-service-auth.ts (segredo interno/ownership), circuit-breaker.ts, fetch-with-timeout.ts (timeout/circuit breaker) — confirma infraestrutura parcial existe. Mas não existe nenhuma matriz por endpoint provando que cada uma das ~170 functions segue todos os 10 itens do protocolo (docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:220-242 é só o checklist descritivo, sem matriz de conformidade por função).
- **Revisão:** sem contestação cética concluída.

### F2644 · RLS_MATRIX cobre mais de 10 tabelas

- **Tipo:** Doc/config
- **O que os docs afirmam:** PARCIAL.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:399`
- **O que falta:** Ampliar docs/RLS_MATRIX.md para cobrir mais tabelas de risco (ex.: webhooks, winloss_webhook_subscriptions, discount_approval_requests, data_retention_policies) — hoje são exatamente 10, não mais de 10.
- **Evidência:** docs/RLS_MATRIX.md tem exatamente 10 tabelas na matriz (`grep -c '^\|`' docs/RLS_MATRIX.md` = 10): sales, clients, orders, commissions, nps_surveys, call_recordings, quotes, user_mfa_settings, login_attempts, user_2fa_log — não 'mais de 10' como pede o critério.
- **Revisão:** sem contestação cética concluída.

### F2645 · RLS_MATRIX estendida às 96 tabelas USING (true)

- **Tipo:** Doc/config
- **O que os docs afirmam:** PARCIAL.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:398`
- **O que falta:** Levantar as 96 tabelas com policy TO authenticated USING(true) e adicioná-las a docs/RLS_MATRIX.md com dono da linha e segmentação por papel.
- **Evidência:** docs/RLS_MATRIX.md:16-25 tem exatamente 10 linhas de tabelas; grep -c 'USING (true)' docs/RLS_MATRIX.md → 0. docs/estado/08_ADMIN_SEGURANCA.md:219-221 e C_estado_runbooks.md:398-399 confirmam 96 tabelas com USING(true) fora da matriz.
- **Revisão:** sem contestação cética concluída.

### F2647 · RP ID = hostname da página enviado pelo cliente (login exige https://<rpId>)

- **Tipo:** Doc/config
- **O que os docs afirmam:** ADR-010 (webauthn): em produção o RP ID é o hostname da página, enviado pelo cliente.
- **Fontes:** `docs/decisions/ADR-010-webauthn-simplewebauthn.md:58-59`
- **O que falta:** Adicionar allowlist de domínios válidos e rejeitar rpId fora dela, em vez de aceitar qualquer valor do cliente.
- **Evidência:** supabase/functions/webauthn/index.ts:144 confirma rpId vindo do cliente (body.rpId\|\|header\|\|hostname). webauthn-helpers.ts:31-48 `expectedOrigins()` deriva as origens aceitas só a partir desse rpId, sem checar allowlist fixa de domínios de produção.
- **Revisão:** sem contestação cética concluída.

### F2648 · Runbook access-denied: fonte access_denied_logs (não security_events)

- **Tipo:** Doc/config
- **O que os docs afirmam:** DIVERGENTE: função lê access_denied_logs (index.ts:187).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:319`
- **O que falta:** Atualizar o runbook para citar access_denied_logs.
- **Evidência:** docs/runbooks/access-denied.md:9,13 cita `security_events`; supabase/functions/access-denied-alerts/index.ts:198 lê `access_denied_logs`.
- **Revisão:** sem contestação cética concluída.

### F2649 · Runbook access-denied: tabela de settings e limite corretos

- **Tipo:** Doc/config
- **O que os docs afirmam:** DIVERGENTE: access_denied_alert_settings inexistente; função lê security_alert_settings com DEFAULT_SPIKE_THRESHOLD = 5.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:318`
- **O que falta:** Corrigir runbook para citar security_alert_settings e o limite real (5).
- **Evidência:** docs/runbooks/access-denied.md:9 cita `access_denied_alert_settings`/limite 10; index.ts:18,117-125 usa `security_alert_settings` com DEFAULT_SPIKE_THRESHOLD=5.
- **Revisão:** sem contestação cética concluída.

### F2653 · Score do linter Supabase: 0 ERROR, 130 WARN categorizados

- **Tipo:** Doc/config
- **O que os docs afirmam:** ADR-008: linter com 0 ERROR e 130 WARN (11 anon pré-auth + 119 authenticated-only auditados).
- **Fontes:** `docs/decisions/ADR-008-anon-executable-security-definer.md:44-44`
- **O que falta:** Rodar get_advisors(security) no projeto real e comparar ERROR/WARN/0028 com os 11 da ADR-008; forte indício de que o conjunto já mudou.
- **Evidência:** Sem MCP get_advisors para o projeto Promo Champions nesta sessão. Snapshot real (contexto/docs/contexto/supabase/lints.md, 20/11/2026) tem taxonomia própria e só 9 rpc_anon_executable, cujos nomes quase não coincidem com as 11 funções do ADR-008 (só is_country_blocked em comum).
- **Revisão:** sem contestação cética concluída.

### F2655 · SEC-08: lista sem funções inexistentes (page-analytics-writer, revenue-forecast, deal-committee-*)

- **Tipo:** Doc/config
- **O que os docs afirmam:** DIVERGENTE (ref. inexistente).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:377`
- **O que falta:** Corrigir a lista do SEC-08 com os nomes reais das edge functions.
- **Evidência:** docs/SEC-08_SERVICE_ROLE_AUDIT.md:30,39-40 cita page-analytics-writer, deal-committee-*, revenue-forecast — nenhum existe em supabase/functions/ com esse nome exato (existem calculate-committee-coverage, extract-committee-from-call, generate-revenue-forecast, revenue-forecast-ai).
- **Revisão:** sem contestação cética concluída.

### F2658 · SECURITY_HARDENING: contagem de SECURITY DEFINER executáveis por anon atualizada

- **Tipo:** Doc/config
- **O que os docs afirmam:** DIVERGENTE: auditoria mediu 30; 20261005140000 re-concede anon a 4 helpers.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:405`
- **O que falta:** Rodar a re-auditoria pendente e publicar contagem atualizada em docs/SECURITY_HARDENING.md.
- **Evidência:** docs/SECURITY_HARDENING.md §10 (linhas 226-235) já reconhece: 'a contagem nominal da matriz não é mais válida' e 'Pendente: re-auditoria... não há evidência de rodada de validação após 2026-10-05'. Migration 20261005140000_restore_anon_execute_rls_helpers.sql confirma o re-grant a 4 helpers.
- **Revisão:** sem contestação cética concluída.

### F2659 · SECURITY_HARDENING: SECURITY DEFINER executável por anon

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc diz nenhuma desde 11/07; nova concessão em 20261005140000.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:331`
- **O que falta:** Atualizar docs/SECURITY_HARDENING.md com as 4 concessões pós-11/07 e sua justificativa.
- **Evidência:** supabase/migrations/20261005140000_restore_anon_execute_rls_helpers.sql:13-16 faz GRANT EXECUTE ... TO anon em 4 funções SECURITY DEFINER após 11/07, contradizendo 'nenhuma desde 11/07'. docs/SECURITY_HARDENING.md:226-230 já documenta essas exceções mas não atualiza a contagem total.
- **Revisão:** sem contestação cética concluída.

### F2670 · Tabelas de auditoria (`audit_logs`, `activity_audit_logs`, `sale_notifications_audit`, `quote_conversion_audit`) fora da retenção

- **Tipo:** Doc/config
- **O que os docs afirmam:** ADR-007: tabelas com valor jurídico/auditoria não entram na retenção padrão; política separada quando definida.
- **Fontes:** `docs/decisions/ADR-007-log-retention.md:17-17`
- **O que falta:** Reconciliar ADR-007 com a realidade: excluir audit_logs/activity_audit_logs do array de enforce_telemetry_retention OU atualizar a ADR reconhecendo a retenção já ativa. Para sale_notifications_audit/quote_conversion_audit a política segue de fato indefinida.
- **Evidência:** fn_cleanup_stale_logs (snapshot supabase/functions/public/fn_cleanup_stale_logs__463d4ab7f988f47f.sql) de fato NÃO lista as 4 tabelas protegidas por ADR-007 (docs/decisions/ADR-007-log-retention.md:17). Mas existe uma SEGUNDA função, enforce_telemetry_retention (.../functions/public/enforce_telemetry_retention__12ae32cb1ec02d01.sql), agendada e ATIVA via cron 'enforce-telemetry-retention-daily' (cron.md:14, '30 3 * * *', active=sim) que DELETA de 'activity_audit_logs' (TTL 30d) e 'audit_logs' (TTL 90d) — 2 das 4 tabelas que a ADR-007 declara fora da retenção. A 'política separada' tratada como inexistente já existe e roda, contradizendo a decisão documentada. 'sale_notifications_audit' e 'quote_conversion_audit' continuam sem qualquer função de limpeza.
- **Revisão:** sem contestação cética concluída.

### F2675 · Tornar repo privado e is_template:false

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc P0: repo público com is_template:true expõe código e PII; ação: 1 chamada de API. (AGENTS.md atual declara repo público por decisão.)
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:193,487-493`
- **O que falta:** Documentar/executar a limpeza de PII referida pelo critério, já que a decisão de manter público foi mantida.
- **Evidência:** github_get_repo ao vivo: private=false, is_template=false, visibility=public. is_template já está correto. private continua false. AGENTS.md §6 documenta explicitamente a decisão de manter público, satisfazendo a cláusula alternativa, mas não há limpeza de PII documentada associada, exigida pelo critério.
- **Revisão:** sem contestação cética concluída.

### F2679 · 140 Edge Functions com service-role, 93 sem validar identidade, 74 escrevendo

- **Tipo:** Edge function
- **O que os docs afirmam:** Das 169 funções, 140 obtêm cliente service-role; 93 não validam identidade dentro do handler e 74 executam escrita ou RPC. Apenas 11 têm guardas explícitas de role/admin.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:167-167`
- **O que falta:** Nenhuma matriz função→papel→escopo existe no repo. Produzi-la e fechar os gaps de autorização por ownership nas ~16 funções sem guarda e nas citadas no plano (#66).
- **Evidência:** 90 funções usam SERVICE_ROLE_KEY; com padrões amplos de guarda (getUser, has_role, auth-client, webhook-auth, internal-service-auth, HMAC, is_admin_or_manager) restam 16 sem guarda reconhecível — menor que os '93' originais (AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:167), indicando hardening parcial. Gap específico confirmado: lead-scoring/index.ts:24,35-36 autentica (getUserClient) mas usa service_role sem checar ownership (A_planos_execucao.md:166).
- **Revisão:** sem contestação cética concluída.

### F2682 · Edge function `webauthn` usa `npm:@simplewebauthn/server@14.0.2`

- **Tipo:** Edge function
- **O que os docs afirmam:** ADR-010 (webauthn): implementação real com npm:@simplewebauthn/server@14.0.2 pinado (publicado 2026-09-13, >7 dias).
- **Fontes:** `docs/decisions/ADR-010-webauthn-simplewebauthn.md:28-33`
- **O que falta:** Atualizar ADR-010 para refletir 14.0.3 (ou revisar o bump) — a versão exata citada na ADR não bate mais com o código.
- **Evidência:** ADR-010:28 fixa @simplewebauthn/server@14.0.2; código atual (index.ts:16-26) importa @simplewebauthn/server@14.0.3 (commit 77cf11d39, bump de dependência). Função não retorna mais 503 e está deployada.
- **Revisão:** sem contestação cética concluída.

### F3836 · Edge function get-client-ip (10 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Catálogo API.md lista a edge function `get-client-ip` na categoria "Alertas / Monitoramento" com auth "nenhuma detectada no handler · verify_jwt", método "qualquer", payload "—" e resposta "JSON".| Edge functions operacionais e de infraestrutura. \| supabase/functions/get-client-ip existe no repo (citada em src/: não); sonda OPTIONS em produção: OPTIONS → 404 NOT_FOUND (não publicada; limite de 100 funções do plano). Status no doc: BLOQUEADO. \| Obtém IP real do cliente. \| Doc classifica como ÓRFÃ. Chamador(es): só scripts/load/k6-smoke.js:25. Só k6; nenhum uso no front. \| 21 linhas; chamador: FE src/hooks/useLoginRateLimiter.ts(url); verify_jwt true (default); tabelas tocadas (linhas em …
- **Fontes:** `docs/API.md:39-39`, `docs/agentes/mapa-do-sistema.md:70`, `docs/prod-readiness.md:344`, `docs/FUNCIONALIDADES_COMPLETAS.md:572-572`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:119-119`, `docs/estado/10_EDGE_FUNCTIONS.md:389-389` e mais 4
- **O que falta:** Incluir na allowlist e ter um chamador, ou remover a function
- **Evidência:** supabase/functions/get-client-ip/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| cético: supabase/functions/get-client-ip/index.ts existe (22 l). Está fora da allowlist (deploy.yml:144 não contém get-client-ip). Nenhum chamador: grep em src e supabase/functions → 0; cron.md e triggers.md → 0.

### F3840 · Edge function new-device-alert (9 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** PARCIAL (14/24 ainda órfãs): new-device-alert segue com 0 chamadores.| Sem assinatura VAPID nem criptografia; nunca entregue; new-device-alert órfã. \| Catálogo API.md lista a edge function `new-device-alert` na categoria "Alertas / Monitoramento" com auth "nenhuma detectada no handler · verify_jwt", método "qualquer", payload "—" e resposta "JSON {error, message, is_new, alert_id}". \| Doc lista a edge function `new-device-alert` (#15) — alerta de novo dispositivo. Auth: JWT. \| 290 linhas; chamador: **nenhum**; verify_jwt true (default); tabelas tocadas (linhas em produção): email_logs(0), known_devices(0), login_alerts(0). Classificação do doc: MORTO_OU_ABANDONADO (sem chamador). \| Doc …
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:267`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:253`, `docs/API.md:41-41`, `docs/FUNCIONALIDADES_COMPLETAS.md:565-565`, `docs/FUNCIONALIDADES_SISTEMA.md:522-522`, `docs/DOCUMENTACAO_SISTEMA.md:992-1021` e mais 5
- **O que falta:** Ter um chamador no fluxo de login e incluir na allowlist de deploy
- **Evidência:** supabase/functions/new-device-alert/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; ÓRFÃ: nenhum chamador no front, em edges ou em SQL/cron (edge-functions.json)| cético: supabase/functions/new-device-alert/index.ts existe (301 l). Está fora da allowlist (deploy.yml:144). Nenhum chamador: só um comentário em send-push-notification/index.ts:309; cron.md/triggers.md → 0. :10-11 lança erro ao carregar se RESEND_API_KEY estiver ausente.

### F3841 · Edge function send-alert-notifications (7 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Catálogo API.md lista a edge function `send-alert-notifications` na categoria "Alertas / Monitoramento" com auth "nenhuma detectada no handler · verify_jwt", método "qualquer", payload "recipientEmail" e resposta "JSON {message, emailsSent, alertsSent, error}".| Doc classifica como PARCIAL. Chamador(es): FE components/notifications/NotificationPreferenceCard.tsx:66. Desenhada para cron; só botão "testar". Alertas críticos configurados pelo usuário não disparam. \| Doc lista a edge function `send-alert-notifications` (#22) — enviar notificações de alerta. Auth: Service. \| Relatório lista send-alert-notifications entre as funções sem qualquer verificação de autenticação; roadmap #8 pede prot…
- **Fontes:** `docs/API.md:44-44`, `docs/estado/10_EDGE_FUNCTIONS.md:444-444`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:175-175`, `docs/FUNCIONALIDADES_COMPLETAS.md:688-688`, `docs/FUNCIONALIDADES_SISTEMA.md:530-530`, `docs/DOCUMENTACAO_SISTEMA.md:992-1021` e mais 4
- **O que falta:** Incluir send-alert-notifications na allowlist de deploy para o cron e o botão funcionarem em produção
- **Evidência:** supabase/functions/send-alert-notifications/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/components/notifications/NotificationPreferenceCard.tsx| cético: Fato novo: o cron existe, job 85 send-alert-notifications-5min, '*/5 * * * *' (cron.md:48), via trigger_internal_edge_job, que lista a function na allowlist SQL (functions/public/trigger_internal_edge_job__f02f045c8b4350ab.sql). Execuções 'succeeded' em cron-runs.md:367-373, mas isso só confirma que o pedido foi enfileirado. A function está FORA da allowlist ACTIVE (deploy.yml:144), então a chamada HTTP cai em uma function não publicada. Chamador no front: NotificationPreferenceCard.tsx:66, montado em src/pages/Notificacoes.tsx:326.

### F3842 · Edge function send-password-reset (8 afirmações nos docs)

- **Tipo:** Edge function
- **O que os docs afirmam:** Catálogo API.md lista a edge function `send-password-reset` na categoria "Auth / Segurança" com auth "JWT do usuário · verify_jwt", método "qualquer", payload "—" e resposta "JSON {success, error}".| Doc lista a edge function `send-password-reset` (#23) — enviar email de reset de senha. Auth: Service. \| 175 linhas; chamador: FE src/components/security/PasswordResetApproval.tsx; verify_jwt true (default); tabelas tocadas (linhas em produção): password_reset_requests(0). Classificação do doc: PARCIAL. \| Doc classifica como REAL. Chamador(es): FE components/security/PasswordResetApproval.tsx:84. RESEND_API_KEY. \| Envio de e-mail de redefinição de senha via Resend. \| supabase/functions/send…
- **Fontes:** `docs/API.md:51-51`, `docs/FUNCIONALIDADES_COMPLETAS.md:689-689`, `docs/DOCUMENTACAO_SISTEMA.md:992-1021`, `docs/estado/10_EDGE_FUNCTIONS.md:447-447`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/E_edge_functions.md:178-178`, `docs/estado/13_INTEGRACOES.md:68` e mais 3
- **O que falta:** Incluir na allowlist de deploy; sem isso a aprovação de reset falha em produção
- **Evidência:** supabase/functions/send-password-reset/index.ts existe; FORA da allowlist de deploy (.github/workflows/deploy.yml:144) → não roda em produção; chamada por: src/components/security/PasswordResetApproval.tsx| cético: supabase/functions/send-password-reset/index.ts existe. Chamador src/components/security/PasswordResetApproval.tsx:84, montado em src/pages/Configuracoes.tsx:318. Mas a function está fora da allowlist ACTIVE (deploy.yml:144 não contém send-password-reset).

### F2684 · Edge function webauthn (PARCIAL)

- **Tipo:** Edge function
- **O que os docs afirmam:** 414 linhas; chamador: FE src/hooks/useWebAuthn.ts; verify_jwt true (default); tabelas tocadas (linhas em produção): webauthn_challenges(0), webauthn_credentials(0). Classificação do doc: PARCIAL.
- **Fontes:** `docs/estado/10_EDGE_FUNCTIONS.md:468-468`
- **O que falta:** Nenhuma ação de código; falta evidência de uso real em produção.
- **Evidência:** Diretório existe, deployada, chamador real invoca (functions.invoke). Mas stats.md:230,332 mostram 0 linhas em webauthn_credentials e webauthn_challenges na produção (snapshot 2026-11-20) — nenhum registro/login real completado até a data.
- **Revisão:** sem contestação cética concluída.

### F2689 · Edge functions com SERVICE_ROLE_KEY exigem getUser/has_role ou segredo interno

- **Tipo:** Edge function
- **O que os docs afirmam:** ~50 index.ts usam service role sem getUser/has_role/assinatura; verify_jwt=true não é autorização pois anon key é JWT público.
- **Fontes:** `docs/auditoria/RELATORIO_FALHAS.md:478-481`
- **O que falta:** Revisar as 16 funções listadas e aplicar os helpers já existentes em _shared/ (auth-client.ts, webhook-auth.ts, internal-service-auth.ts) ou documentar por que são seguras sem guarda.
- **Evidência:** RELATORIO_FALHAS.md:478-481 cita ~50 funções sem guarda. Checagem atual com padrões amplos de guarda sobre as 90 que usam SERVICE_ROLE_KEY: restam 16 sem padrão reconhecível (analyze-call, log-web-vitals, ranking-api, semantic-search, sequence-runner, visual-search, entre outras) — bem menor que ~50, indicando hardening parcial, mas gap não eliminado.
- **Revisão:** sem contestação cética concluída.

### F2696 · SEC-08: migração de service_role para getUserClient concluída

- **Tipo:** Edge function
- **O que os docs afirmam:** PARCIAL: 90/172 dirs referenciam SUPABASE_SERVICE_ROLE_KEY; getServiceClient em 52; getUserClient em 112; flag USE_USER_CLIENT_* inexistente.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:219`
- **O que falta:** Migrar as functions priorizadas restantes (analyze-conversation, generate-loss-coaching, sequence-enroll, sequence-record-reply e as mistas) para getUserClient e implementar o canário USE_USER_CLIENT_* ou remover a promessa de docs/SEC-08_SERVICE_ROLE_AUDIT.md:54.
- **Evidência:** grep -rl SUPABASE_SERVICE_ROLE_KEY supabase/functions --include=index.ts → 90 arquivos; grep -rl getServiceClient → 57; grep -rl getUserClient → 123 (de 172 dirs). grep -rn USE_USER_CLIENT supabase/ src/ → 0 resultados (flag canário inexistente). Números batem com docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:219.| cético: grep -rl SUPABASE_SERVICE_ROLE_KEY supabase/functions --include=index.ts \| wc -l → 90; getServiceClient → 52; getUserClient → 113 (pequena divergência com os 57/123 do verificador, sem mudar o veredito). grep -rn USE_USER_CLIENT supabase src .github → 0 resultados; a promessa do canário está só em docs/SEC-08_SERVICE_ROLE_AUDIT.md:54. docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:376 lista analyze-conversation, generate-loss-coaching, sequence-enroll, sequence-record-reply ainda sem getUserClient.

### F2697 · service_role em 90/172 functions (5.2)

- **Tipo:** Edge function
- **O que os docs afirmam:** PARCIAL.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:257`
- **O que falta:** Reduzir o uso direto de service_role nas 90 functions ou justificar por function as que exigem bypass de RLS (ver F2696).
- **Evidência:** Mesma medição de F2696: 90/172 dirs referenciam SUPABASE_SERVICE_ROLE_KEY (grep -rl SUPABASE_SERVICE_ROLE_KEY supabase/functions --include=index.ts| wc -l → 90). Ver docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:257. \| cético: grep -rl SUPABASE_SERVICE_ROLE_KEY supabase/functions --include=index.ts \| wc -l → 90 (de 171 pastas). Mesmo estado de F2696; docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:257.

### F2698 · webauthn (rotas pré-login WebAuthn) atrás do JWT padrão apesar de contrato externo

- **Tipo:** Edge function
- **O que os docs afirmam:** webauthn é contrato de provider/iframe/pré-login mas permanece com verify_jwt padrão, o que bloqueia o uso legítimo; torná-lo público sem assinatura criaria escrita forjável.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:184-186`
- **O que falta:** Declarar [functions.webauthn] em supabase/config.toml com verify_jwt coerente com login-options/login-verify pré-login e aplicar rate limit (_shared/rate-limit) no handler.
- **Evidência:** supabase/config.toml não tem bloco [functions.webauthn] (grep -n webauthn supabase/config.toml → 0 resultados), então a function fica no verify_jwt default (true) do gateway, não documentado como coerente com o contrato pré-login. supabase/functions/webauthn/index.ts não importa _shared/rate-limit.ts — sem rate limit. Em contrapartida há assinatura/anti-replay reais: verifyRegistrationResponse/verifyAuthenticationResponse (webauthn/index.ts:221,319) e challenge consumido uma vez (webauthn/index.ts:96-116).| cético: grep -n webauthn supabase/config.toml → 0 resultados (verify_jwt fica no default). grep -n 'rate' supabase/functions/webauthn/index.ts → só generateRegistrationOptions/generateAuthenticationOptions, sem enforceRateLimit. Há anti-replay real: verifyAuthenticationResponse em supabase/functions/webauthn/index.ts:319-335 e contador em :341. A chave publicável default é sb_publish…

### F2700 · WebAuthn gera magic link administrativo e devolve hashed_token/action_link

- **Tipo:** Edge function
- **O que os docs afirmam:** Após verificação fraca, a função incrementa contador por conta própria, gera magic link administrativo e devolve hashed_token/action_link ao cliente.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:142-142`
- **O que falta:** Trocar a devolução do magic link bruto (action_link) por emissão de sessão que não exponha o link administrativo completo ao cliente.
- **Evidência:** A verificação da assinatura hoje é forte (verifyAuthenticationResponse, webauthn/index.ts:319-335), não mais 'fraca' como em 2026-08-26. Mas a function ainda gera magic link administrativo e devolve token ao cliente no payload JSON: webauthn/index.ts:352-372 (supabase.auth.admin.generateLink + retorno de token: signInData.properties?.hashed_token e actionLink: signInData.properties?.action_link).| cético: Emissão só após verificação válida (supabase/functions/webauthn/index.ts:319-343), mas a resposta ainda devolve token: signInData.properties?.hashed_token e actionLink: signInData.properties?.action_link (supabase/functions/webauthn/index.ts:352-372); o cliente extrai o token do actionLink e chama verifyOtp (src/hooks/useWebAuthn.ts:225-239).

### F3854 · Função SQL/RPC check_2fa_failed_attempts (4 afirmações nos docs)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Alcançável por anon via PUBLIC default nunca revogado; guarda interna não inspecionada.| API.md lista a function SQL `check_2fa_failed_attempts` com última definição em 20260831130000_harden_public_access_and_privileged_rpcs.sql, grants "authenticated, service_role" e uso no front "—". \| RPCs expostas no destino e ausentes de types.ts: check_2fa_failed_attempts, check_failed_attempts, is_admin_or_manager, log_security_event, record_login_attempt. \| check_2fa_failed_attempts, has_role, is_country_blocked e is_email_opted_out são SECURITY DEFINER executáveis por anon (check_2fa_failed_attempts também sem search_path).
- **Fontes:** `docs/estado/11_DADOS_BANCO.md:339-339`, `docs/API.md:513-513`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:502-504`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:157-163`
- **O que falta:** Ter um chamador no fluxo de 2FA ou remover a função
- **Evidência:** função public.check_2fa_failed_attempts existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: public.check_2fa_failed_attempts existe (functions.md:116), com EXECUTE só para authenticated e service_role, o que já resolve a afirmação 'alcançável por anon via PUBLIC'. Não é usada: colunas código, cron, triggers e banco vazias (functions.md:116). O login usa o MFA nativo (src/hooks/auth/useAuthForm.ts:124,142 supabase.auth.mfa.*).

### F3855 · Função SQL/RPC check_rate_limit (4 afirmações nos docs)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Doc: de 128 nomes de RPC em produção, só 9 coincidem com funções da origem.| check_rate_limit, get_client_seasonality, get_client_top_products, get_industry_benchmark_stats, get_industry_seasonality, get_industry_top_products, has_permission, has_role, mark_all_notifications_read, refresh_materialized_views e search_products_semantic. \| Limitação de taxa nas chamadas de API. \| API.md lista a function SQL `check_rate_limit` com última definição em 20251231120039_b2152855-d5fa-4fa1-8557-b2884e44108d.sql, grants "—" e uso no front "1 arquivo(s)".
- **Fontes:** `docs/auditoria/MATRIZ_FORENSE_BANCOS_E_CONTRATOS_2026-08-26.md:264-268`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:549-557`, `docs/SECURITY.md:57-59`, `docs/API.md:521-521`
- **O que falta:** Ter um chamador (login ou edge) ou remover; alinhar o grant com o ADR-008
- **Evidência:** função public.check_rate_limit existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: public.check_rate_limit existe (functions.md:121), SECURITY DEFINER, com EXECUTE para authenticated e service_role. Não é usada: colunas código, cron, triggers e banco vazias. ADR-008 (docs/decisions/ADR-008-anon-executable-security-definer.md:13) diz que ela deveria ser executável por anon no login, o que diverge do grant atual.

### F3856 · Função SQL/RPC cleanup_old_audit_logs (2 afirmações nos docs)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Função existe; nenhum cron verificado.| API.md lista a function SQL `cleanup_old_audit_logs` com última definição em 20260105000002_audit_trail.sql, grants "—" e uso no front "—".
- **Fontes:** `docs/estado/08_ADMIN_SEGURANCA.md:131,298`, `docs/API.md:526-526`
- **O que falta:** A função é legada e sem uso: remover ou documentar; a retenção da audit_logs canônica já está agendada
- **Evidência:** função public.cleanup_old_audit_logs existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: public.cleanup_old_audit_logs (functions/public/cleanup_old_audit_logs__12ae32cb1ec02d01.sql:8) apaga da tabela legada audit_log, que tables.md:31 marca como 'superseded por public.audit_logs ... só para leitura histórica'. Nenhum cron a chama (cron.md → 0). A retenção de 90 dias da tabela canônica audit_logs já roda por outro caminho: enforce_telemetry_retention (functions/public/enforce_telemetry_retention__12ae32cb1ec02d01.sql:25), job 10 diário (cron.md:14).

### F3857 · Função SQL/RPC count_failed_login_attempts (3 afirmações nos docs)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** API.md lista a function SQL `count_failed_login_attempts` com última definição em 20251231120039_b2152855-d5fa-4fa1-8557-b2884e44108d.sql, grants "—" e uso no front "—".| Camada de segurança paralela ao GoTrue sem chamador. log_rate_limit foi movida para private. \| Tentativas de login são limitadas e brute force é bloqueado.
- **Fontes:** `docs/API.md:539-539`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:83`, `docs/SECURITY.md:60-61`
- **O que falta:** Função sem chamador (código morto): usar no fluxo de lockout ou dropar em migration. A limitação de login real está em get_login_lockout_status, não nesta função.
- **Evidência:** função public.count_failed_login_attempts existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: supabase/functions.md:142 (snapshot): public.count_failed_login_attempts existe, SECURITY DEFINER, EXECUTE authenticated/service_role (não PUBLIC), colunas código/cron/triggers/banco vazias; ausente: grep -rln count_failed_login_attempts src supabase/functions scripts tests e2e → 0 resultados. O bloqueio de força bruta existe por OUTRO caminho: src/hooks/useLoginRateLimiter.ts:41 chama get_login_lockout_status (functions.md:230) e :88-95 registra tentativas via RPC.

### F3858 · Função SQL/RPC fn_admin_security_definer_exposure (4 afirmações nos docs)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** API.md lista a function SQL `fn_admin_security_definer_exposure` com última definição em 20260711134320_f46c46d9-295a-4e9e-a0da-ca57174d135d.sql, grants "authenticated, service_role" e uso no front "—".| Detector de exposição de SECURITY DEFINER sem consumidor. \| RPC restrita a admin que expõe a view de exposição de SECURITY DEFINER. \| Doc: snapshot contém funções SECURITY DEFINER expostas/sem search_path; inventariar e testar em staging.
- **Fontes:** `docs/API.md:569-569`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:89`, `docs/SECURITY_HARDENING.md:45-49,66`, `docs/auditoria/SIMULACAO_CENARIOS_ONDA_0_2026-08-26.md:42`
- **O que falta:** Consumidor: painel admin (ex.: /seguranca) ou job de CI que chame a RPC.
- **Evidência:** função public.fn_admin_security_definer_exposure existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: functions.md:172: existe, EXECUTE authenticated/service_role; corpo functions/public/fn_admin_security_definer_exposure__12ae32cb1ec02d01.sql filtra WHERE has_role(auth.uid(),'admin'); view v_security_definer_exposure existe (views.md, 1 ocorrência). ausente: grep -rln fn_admin_security_definer_exposure src supabase/functions scripts tests → 0 resultados (nenhuma tela/hook/CI consome).

### F3859 · Função SQL/RPC has_pending_reset_request (2 afirmações nos docs)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** API.md lista a function SQL `has_pending_reset_request` com última definição em 20251231131342_a0f87441-d86b-49d8-a197-f97973da46fc.sql, grants "—" e uso no front "—".| Funções de controle de reset de senha sem chamador (Auth gerencia).
- **Fontes:** `docs/API.md:648-648`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:83`
- **O que falta:** Chamador vivo ou DROP em migration (reset é gerido pelo GoTrue).
- **Evidência:** função public.has_pending_reset_request existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: functions.md:249: existe (lê password_reset_requests), EXECUTE authenticated/service_role; ausente: grep -rln has_pending_reset_request src supabase/functions scripts tests → 0; cron.md/triggers sem referência.

### F3862 · Função SQL/RPC is_country_blocked (2 afirmações nos docs)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** is_country_blocked existe só em types.ts (geo, fora do repo).| Alcançável por anon via PUBLIC default nunca revogado; guarda interna não inspecionada.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:282`, `docs/estado/11_DADOS_BANCO.md:353-353`
- **O que falta:** Chamador real (bloqueio geográfico não é aplicado em lugar nenhum) e REVOKE EXECUTE de anon/PUBLIC.
- **Evidência:** função public.is_country_blocked existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: functions.md:263: existe no banco real (refuta 'só em types.ts'), SECURITY DEFINER, EXECUTE anon/authenticated/service_role; corpo só consulta geo_blocked_regions sem guarda auth.uid()/has_role. Sem chamador: GeoBlockingMap.tsx:22,43,49 e GeoBlockingManager.tsx:123,151 usam a tabela geo_blocked_regions direto; grep -rn is_country_blocked src supabase/functions → 0 (fora de types.ts).

### F3863 · Função SQL/RPC is_mfa_enabled (2 afirmações nos docs)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** API.md lista a function SQL `is_mfa_enabled` com última definição em 20251231120846_562120aa-f001-412e-8054-805485a4cfb6.sql, grants "—" e uso no front "—".| TOTP custom que "aceitava qualquer código" (mig/20261001203500:3-6), substituído por MFA nativo; funções continuam em public sem chamador.
- **Fontes:** `docs/API.md:665-665`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:83`
- **O que falta:** DROP em migration (ou chamador vivo + guarda auth.uid()=check_user_id OR admin).
- **Evidência:** função public.is_mfa_enabled existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: functions.md:268: existe, SECURITY DEFINER, EXECUTE authenticated; corpo recebe check_user_id arbitrário sem checar auth.uid() (functions/public/is_mfa_enabled__*.sql). grep -rln is_mfa_enabled src supabase/functions tests → 0. Migration 20261001203500:3-7 substituiu o TOTP custom pelo nativo mas não dropou estas funções.

### F3864 · Função SQL/RPC log_security_event (4 afirmações nos docs)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** log_security_event: mantém superfície mutável anônima.| Alcançável por anon via PUBLIC default nunca revogado; com guarda interna (confirmado §3.4). \| RPC de log de eventos de segurança exige auth.uid() não nulo e valida o payload. \| API.md lista a function SQL `log_security_event` com última definição em 20260831130000_harden_public_access_and_privileged_rpcs.sql, grants "authenticated, service_role" e uso no front "—".
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:137-145`, `docs/estado/11_DADOS_BANCO.md:357-357`, `docs/execucao/HARDENING_CANONICO_2026-08-31.md:69`, `docs/API.md:673-673`
- **O que falta:** Chamador real (front/edge) e teste negativo (anon rejeitado, payload inválido).
- **Evidência:** função public.log_security_event existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: functions.md:278: EXECUTE só authenticated/service_role (anon revogado); corpo functions/public/log_security_event__*.sql exige auth.uid() não nulo (exceto service_role) e valida severidade/tamanhos de payload. Mas sem chamador: grep -rln log_security_event src supabase/functions tests supabase/tests src/test → 0 (sem teste negativo).

### F3865 · Função SQL/RPC restore_record (3 afirmações nos docs)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** restore_record: aceita nome de tabela e restaura qualquer registro com deleted_at, sem whitelist nem autorização.| Alcançável por anon via PUBLIC default nunca revogado; sem guarda interna (confirmado §3.4). \| API.md lista a function SQL `restore_record` com última definição em 20260831130000_harden_public_access_and_privileged_rpcs.sql, grants "authenticated, service_role" e uso no front "—".
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:137-145`, `docs/estado/11_DADOS_BANCO.md:360-360`, `docs/API.md:722-722`
- **O que falta:** UI/hook de restauração da lixeira que chame a RPC (ou drop).
- **Evidência:** função public.restore_record existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: Doc 'sem whitelist nem autorização' está desatualizado: functions/public/restore_record__*.sql exige service_role ou is_admin_or_manager(auth.uid()) e whitelist ('clients','activities','products','suppliers','teams'); functions.md:327 EXECUTE authenticated/service_role. Sem chamador: só tests/migrations/canonical_hardening_contract_test.ts e supabase/functions/_shared/canonical-hardening_contract_test.ts referenciam; nada em src/ ou edges.

### F3866 · Função SQL/RPC update_own_sale (2 afirmações nos docs)

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** API.md lista a function SQL `update_own_sale` com última definição em 20260412115357_dcf9ab46-7f4b-484f-bf6f-7a87bcbc40f7.sql, grants "—" e uso no front "—".| Função de atualização da própria venda sem chamador.
- **Fontes:** `docs/API.md:778-778`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:87`
- **O que falta:** Chamada .rpc('update_own_sale') no front ou DROP em migration.
- **Evidência:** função public.update_own_sale existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: functions.md:381: existe, EXECUTE authenticated/service_role; grep -rln update_own_sale src supabase/functions scripts tests → 0.

### F2706 · Handoff P035: Auditar as 30 funções SECURITY DEFINER anon contra allowlist de 11

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Fila canônica do handoff (onda 4): Auditar as 30 funções SECURITY DEFINER anon contra allowlist de 11. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:326-326`
- **O que falta:** Reconciliar ADR-008 com o conjunto real (justificativa/owner por função) e revogar EXECUTE anon das funções trigger e das não justificadas.
- **Evidência:** ADR-008 (docs/decisions/ADR-008-anon-executable-security-definer.md, 2026-07-11) documenta allowlist de 11 funções SECURITY DEFINER com EXECUTE para anon. O handoff de 30/08 (posterior) pede auditar '30 funções... contra allowlist de 11'. No snapshot atual, a contagem real de funções (não-trigger) SECURITY DEFINER com anon no grant é de 8 nomes distintos: get_current_salesperson_id, get_login_lockout_status, get_user_role, has_role, is_admin_or_manager, is_country_blocked, is_email_opted_out, record_failed_login_attempt (apurado via script sobre supabase/functions.md) — conjunto quase totalmente diferente dos 11 do ADR-008 (só is_country_blocked repete). Migrations posteriores (ex.: supabase/migrations/20261005140000_restore_anon_execute_rls_helpers.sql) alteraram grants ad hoc sem atualizar o ADR-008.| cético: ADR-008 existe em docs/decisions/ADR-008-anon-executable-security-definer.md…

### F3868 · Limitação: colunas só-nome (activities.contact_name, buying_committee.contact_name, channel_interactions.contact_name) casadas pelo nome em clients

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Se titular não existe em clients, essas colunas ficam intactas; query de verificação lista residual.
- **Fontes:** `docs/LGPD.md:87-93,138-140`
- **O que falta:** Corrigir docs/LGPD.md:89-93 (channel_interactions não é casada por nome; activities/buying_committee restritas às vendas do titular) e incluir buying_committee na query residual.
- **Evidência:** public.anonymize_data_subject existe (functions.md:79, chamada por src/hooks/admin/useDataSubjectRequests.ts). Corpo functions/public/anonymize_data_subject__27b00b89e193986b.sql:47-58 resolve v_client_ids em clients; :152-160 (buying_committee) e :365-372 (activities) casam contact_name pelo nome só dentro das vendas do titular — sem titular em clients ficam intactas, como diz docs/LGPD.md:89-93. Diverge em channel_interactions: :348-357 casa por e-mail/telefone em contact_info, não por nome. Query residual existe em docs/LGPD.md:137-139 (só activities).
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F2709 · Plano 30/08 etapa 35 (P035): Auditar as 30 funções SECURITY DEFINER anon contra allowlist de 11

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Etapa 35 do plano de 100 etapas (auditoria 30/08; = P035 do handoff): Justificativa, owner, autenticação e menor privilégio para cada função.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:690-690`
- **O que falta:** Igual a F2706.
- **Evidência:** Mesmo item que F2706 (fonte docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:690, P035). ADR-008 (2026-07-11) cobre só 11 funções e está desatualizado frente ao conjunto real hoje (ver evidência detalhada em F2706).| cético: Mesmo item de F2706 (P035): docs/decisions/ADR-008-anon-executable-security-definer.md desatualizado frente ao snapshot supabase/functions.md:218,230,240,251,264,311 (8 helpers + 12 triggers definer com anon).

### F3871 · RPC 2FA valida próprio usuário ou administração

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** Funções de 2FA só operam para auth.uid() do próprio usuário ou para admin.
- **Fontes:** `docs/execucao/HARDENING_CANONICO_2026-08-31.md:68`
- **O que falta:** Guarda auth.uid()=check_user_id OR is_admin_or_manager em is_mfa_enabled (ou DROP, sem chamador).
- **Evidência:** check_2fa_failed_attempts (functions.md:116) corpo :10-18 exige service_role ou p_user_id=auth.uid() ou is_admin_or_manager; disable_totp, disable_sms, setup_sms_mfa, verify_mfa_code, regenerate_backup_codes, set_mfa_preferred_method, get_mfa_status, verify_and_enable_sms, update_user_mfa_settings operam via auth.uid() (≥1 ocorrência em cada corpo em functions/public/). Exceção: is_mfa_enabled(check_user_id) (functions.md:268), SECURITY DEFINER, EXECUTE authenticated, corpo functions/public/is_mfa_enabled__a8c098bf35b6808d.sql:7-12 consulta qualquer user_id sem checar auth.uid()/admin.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F3872 · RPC/função SQL `cleanup_deleted_records`

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** API.md lista a function SQL `cleanup_deleted_records` com última definição em 20260104210000_soft_delete_enhanced.sql, grants "—" e uso no front "—".
- **Fontes:** `docs/API.md:524-524`
- **O que falta:** Cron pg_cron para a purga, SET search_path e REVOKE de anon (ou drop).
- **Evidência:** função public.cleanup_deleted_records existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: functions.md:128: existe, SECURITY INVOKER sem search_path fixo, EXECUTE anon/authenticated/service_role; corpo apaga deals/clients/activities/tasks com deleted_at > 90 dias; sem job: grep cleanup_deleted cron.md → 0; grep -rln cleanup_deleted_records src supabase/functions → 0.

### F3873 · RPC/função SQL `count_reset_requests_24h`

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** API.md lista a function SQL `count_reset_requests_24h` com última definição em 20251231131342_a0f87441-d86b-49d8-a197-f97973da46fc.sql, grants "—" e uso no front "—".
- **Fontes:** `docs/API.md:540-540`
- **O que falta:** Chamador vivo ou DROP em migration.
- **Evidência:** função public.count_reset_requests_24h existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: functions.md:143: existe (conta password_reset_requests), EXECUTE authenticated/service_role; grep -rln count_reset_requests_24h src supabase/functions tests → 0.

### F3874 · RPC/função SQL `generate_device_fingerprint`

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** API.md lista a function SQL `generate_device_fingerprint` com última definição em 20251231121413_c4826621-81ba-45f1-86f9-092fac5d9ee4.sql, grants "—" e uso no front "—".
- **Fontes:** `docs/API.md:594-594`
- **O que falta:** Chamador vivo ou DROP em migration.
- **Evidência:** função public.generate_device_fingerprint existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: functions.md:202: existe, EXECUTE authenticated/service_role; grep -rln generate_device_fingerprint src supabase/functions tests → 0.

### F3875 · RPC/função SQL `is_known_device`

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** API.md lista a function SQL `is_known_device` com última definição em 20251231121413_c4826621-81ba-45f1-86f9-092fac5d9ee4.sql, grants "—" e uso no front "—".
- **Fontes:** `docs/API.md:664-664`
- **O que falta:** Chamador vivo ou DROP em migration.
- **Evidência:** função public.is_known_device existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: functions.md:267: existe (lê known_devices, tables.md:190), EXECUTE authenticated/service_role; grep -rln is_known_device src supabase/functions tests → 0.

### F3876 · RPC/função SQL `record_login_attempt`

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** API.md lista a function SQL `record_login_attempt` com última definição em 20260719000001_restore_login_attempts_insert_policy.sql, grants "service_role" e uso no front "—".
- **Fontes:** `docs/API.md:708-708`
- **O que falta:** REVOKE EXECUTE de authenticated (ou guarda service_role no corpo) e chamador real, ou DROP.
- **Evidência:** função public.record_login_attempt existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: functions.md:313: existe; comentário diz 'caller must be service_role', mas EXECUTE real = authenticated, service_role (diverge do grant 'service_role' do API.md) e o corpo functions/public/record_login_attempt__*.sql faz INSERT em login_attempts sem checar auth.role() — qualquer authenticated pode forjar tentativas. grep -rln record_login_attempt src supabase/functions → 0 (front usa record_failed/successful_login_attempt, useLoginRateLimiter.ts:88-95).

### F3877 · RPC/função SQL `update_own_profile`

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** API.md lista a function SQL `update_own_profile` com última definição em 20260317230752_59f7cd10-885e-4b37-8df8-d05cf8731a58.sql, grants "—" e uso no front "—".
- **Fontes:** `docs/API.md:777-777`
- **O que falta:** Chamada .rpc('update_own_profile') no front ou DROP em migration.
- **Evidência:** função public.update_own_profile existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: functions.md:380: existe, EXECUTE authenticated/service_role; grep -rln update_own_profile src supabase/functions tests → 0.

### F3878 · RPC/função SQL `update_user_mfa_settings`

- **Tipo:** Função SQL/RPC
- **O que os docs afirmam:** API.md lista a function SQL `update_user_mfa_settings` com última definição em 20260404155258_7109bf7e-3093-412b-97a9-e67436fd98ba.sql, grants "—" e uso no front "—".
- **Fontes:** `docs/API.md:784-784`
- **O que falta:** DROP em migration (resíduo do TOTP custom) ou chamador vivo.
- **Evidência:** função public.update_user_mfa_settings existe no banco real (functions.md); sem referência em código, cron, triggers ou outras funções (coluna de uso vazia)| cético: functions.md:385: existe, exige auth.uid() mas aceita p_totp_secret/p_backup_codes em texto claro; grep -rln update_user_mfa_settings src supabase/functions tests → 0; fluxo atual é auth.mfa nativo (useMFA.ts:111-134).

### F3881 · Eventos VisibilityChange rastreados

- **Tipo:** Hook
- **O que os docs afirmam:** Tracking de visibilitychange.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:592-592`
- **O que falta:** Registrar evento de visibilidade como tipo próprio (se for o requisito), tratar erro do insert e corrigir o nome no doc.
- **Evidência:** Hook useUsageTracking não existe (grep -rn useUsageTracking src → 0). Listener existe com outro nome: src/lib/analytics.ts:111-115 (visibilitychange hidden → flushCurrentPage) que grava em page_analytics (:92-102); RouteTracker montado em src/components/templates/MainLayout.tsx:137; page_analytics existe com RLS (tables.md:226). Mas não registra um evento 'VisibilityChange' próprio — só a duração da página — e o erro do insert é engolido (:104-106). Doc: docs/FUNCIONALIDADES_COMPLETAS.md:592.
- **Revisão:** decidido pelo juiz após contestação; veredito inicial era Não implementado.

### F3885 · Hook useIPBlocking (2 afirmações nos docs)

- **Tipo:** Hook
- **O que os docs afirmam:** Doc lista o hook `useIPBlocking.ts` — bloqueio de IPs.| O grafo de imports a partir de src/main.tsx não alcança: src/hooks/useIPBlocking.ts, src/hooks/useMFA.ts, src/hooks/useRateLimit.ts, src/hooks/useReauthentication.ts, src/hooks/useSessionManagement.ts, src/hooks/sessionHelpers.ts. Candidatos a validação, não lixo.
- **Fontes:** `docs/DOCUMENTACAO_SISTEMA.md:199-201`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:257-258`
- **O que falta:** Aplicar o bloqueio no login (chamar is_ip_blocked/useCheckIPStatus no fluxo de auth ou edge) e implementar ou remover o hook de whitelist.
- **Evidência:** arquivo src/hooks/useIPBlocking.ts existe mas hook não consta em hooks.json (não exportado/indexado)| cético: Evidência mecânica errada, mas veredito se mantém. useBlockedIPs (src/hooks/useIPBlocking.ts:29-113) lê/grava blocked_ips (RLS admin, tables/public/blocked_ips.md:49-56), é usado por BlockedIPsPanel.tsx:44, montado em SecurityDashboard.tsx:278, rota /seguranca (AppRoutes.tsx:1044-1050), menu sidebarMenuData.ts:371. Os outros arquivos também são alcançáveis: useMFA (Configuracoes.tsx, MFASetup), useRateLimit (RateLimitDashboard→SecurityDashboard.tsx:281), useSessionManagement/sessionHelpers (SessionManager→:284), useReauthentication (ReauthDialog→Configuracoes.tsx:25,335). Falta o fio: o bloqueio nunca é aplicado — is_ip_blocked só é chamado por useCheckIPStatus (useSecurityMonitoring.ts:5-9), que não tem consumidor (grep useCheckIPStatus src → só definição/reexport); comentário …

### F2712 · Edge function get-client-ip sem functions.invoke literal no front

- **Tipo:** Integração externa
- **O que os docs afirmam:** Uma das 64/168 funções sem invocador literal em src/. Grupo: Webhook de entrada (INFERIDO). Classificação por grupo deduzida do nome; pg_cron/config.toml não verificados.
- **Fontes:** `docs/estado/09_HOOKS_SERVICES.md:291-311`
- **O que falta:** Remover a function ou adicioná-la à allowlist e ligar um chamador real.
- **Evidência:** supabase/functions/get-client-ip/index.ts existe, mas 'get-client-ip' NÃO está na allowlist ACTIVE de .github/workflows/deploy.yml:144 (grep -o → 0 resultados) — não é deployada em produção. grep -rln get-client-ip src supabase/functions (excluindo a própria pasta) → 0 resultados: nenhum chamador. Ausente também de cron.md e webhooks.md no snapshot.| cético: supabase/functions/get-client-ip/index.ts existe; ausente da allowlist (grep no ACTIVE de .github/workflows/deploy.yml:144 → 0). grep -rn get-client-ip em _.ts/_.tsx/_.sql/_.toml/*.yml fora da própria pasta → 0 resultados; ausente de cron.md/webhooks.md do snapshot. Só existe o código, sem deploy nem chamador.

### F2716 · Integração externa: Web Push (VAPID)

- **Tipo:** Integração externa
- **O que os docs afirmam:** 2 funções (push-subscribe, send-push-notification) não publicadas (0/2). Chamada real ao provedor não exercida (B4).
- **Fontes:** `docs/prod-readiness.md:866`
- **O que falta:** Incluir as 2 functions na allowlist (liberando vaga no limite de 100), configurar VAPID_* e validar uma entrega real.
- **Evidência:** Nem 'push-subscribe' nem 'send-push-notification' estão na allowlist ACTIVE de .github/workflows/deploy.yml:144 (grep -o para cada nome → 0 resultados) — 0/2 deployadas, confirmando o '0/2' de docs/prod-readiness.md:866. Código existe e é chamado: src/hooks/usePushNotifications.ts invoca as duas, usado em src/components/settings/BrowserPushSettings.tsx e src/components/security/PushNotificationSettings.tsx. VAPID_PUBLIC_KEY/VAPID_PRIVATE_KEY referenciados em push-subscribe/index.ts:66 e send-push-notification/index.ts:15-19,346. Tabela public.push_subscriptions existe no snapshot.| cético: push-subscribe e send-push-notification fora da allowlist (grep no ACTIVE de .github/workflows/deploy.yml:144 → 0 para ambos); chamadas em src/hooks/usePushNotifications.ts; tabela push_subscriptions existe no snapshot (tables/public/push_subscriptions.md).

### F2721 · Alertas de segurança (login falho, atividade incomum, mudança de permissão, exportação de dados)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Sistema alerta sobre tentativas de login falhas, padrões incomuns, mudanças de permissão e eventos de exportação de dados.
- **Fontes:** `docs/SECURITY.md:73-78`
- **O que falta:** Falta notificação real para login falho e mudança de permissão (hoje só gravam registro); falta instrumentar evento de exportação de dados (não existe).
- **Evidência:** Login falho registrado via RPC record_failed_login_attempt (src/hooks/useSecurityMonitoring.ts:65) sem notificação. Mudança de permissão grava security_events via trg_audit_user_roles (supabase/migrations/20261001203000_audit_trigger_user_roles.sql:44-67) mas nenhum leitor notifica admin. access-denied-alerts (allowlist deploy.yml:144, cron.md:50) envia e-mail real para picos de acesso negado — único evento com notificação completa. Exportação de dados: nenhuma instrumentação encontrada.
- **Revisão:** sem contestação cética concluída.

### F2724 · Detecção de novo dispositivo: `known_devices` + `new-device-alert`

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** ADR-009: known_devices + edge function new-device-alert detectam sessão em dispositivo novo.
- **Fontes:** `docs/decisions/ADR-009-session-storage-e-csp.md:42-42`
- **O que falta:** Deployar new-device-alert na allowlist e implementar detecção automática no login (insert em known_devices + chamada à function); hoje é só gestão manual, sem alerta real.
- **Evidência:** known_devices/knownDeviceService.ts/is_known_device existem, mas nada em src/ chama is_known_device ou insere known_devices no login (único consumidor é KnownDevices.tsx, só gerencia manualmente). new-device-alert existe no repo mas NÃO está na allowlist ACTIVE (.github/workflows/deploy.yml:144, confirmado via grep/python) e nenhum chamador o invoca; sem cron.
- **Revisão:** sem contestação cética concluída.

### F2725 · Domínio dormente: Segurança avançada (2FA / WebAuthn / MFA / geo) (14 tabelas zeradas)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Agrupamento funcional com 14 tabelas todas com 0 linhas; indica módulo construído e nunca usado.
- **Fontes:** `docs/estado/11_DADOS_BANCO.md:221-229`
- **O que falta:** Confirmar via query real se as tabelas (user_2fa, webauthn_credentials etc.) já recebem linhas reais pós-lançamento da UI; não verificável aqui por falta de acesso ao banco canônico.
- **Evidência:** UI real roteada existe: MFASetup.tsx (Configuracoes.tsx, SecurityDashboard.tsx) com RPCs reais (useMFA.ts:82-389); KnownDevices.tsx; webauthn na allowlist ACTIVE (deploy.yml:144). Sem acesso de query ao banco canônico usyxfpqlsspldubptrdl nesta sessão para confirmar se as 14 tabelas continuam zeradas.
- **Revisão:** sem contestação cética concluída.

### F2736 · GDPR/LGPD workflows completos (esquecimento, portabilidade)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Falta right to be forgotten e portabilidade.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:187`
- **O que falta:** Implementar geração real do export de dados do titular para portabilidade; hoje é só toggle manual de status, confirmando a lacuna de docs/GAPS_CLASSE_MUNDIAL.md:187.
- **Evidência:** Esquecimento implementado ponta a ponta (ver F2735). Portabilidade não: AdminSolicitacoesTitular.tsx:408-416 só tem botão 'Concluir' que faz UPDATE manual de status para request_type!=='erasure' (inclui 'portability', linha 63), sem gerar export real de dados. Não existem edge functions lgpd-erase/lgpd-export.
- **Revisão:** sem contestação cética concluída.

### F2740 · Nenhuma ação administrativa registrada em audit_logs

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** action tem 1 valor (update), entity_type 2 valores (sales, tasks), 0 registros de mudança de papel/toggle de flag/bloqueio de IP; rajadas em 2026-08-13/14 indicam seed.
- **Fontes:** `docs/estado/08_ADMIN_SEGURANCA.md:249-263`
- **O que falta:** Instrumentar audit_logs para toggle de feature flag e bloqueio/liberação de IP; hoje só mudança de role é auditada.
- **Evidência:** Mudança de role é auditada via trg_audit_user_roles (migration 20261001203000:12-67) em audit_logs/security_events. Toggle de feature flag (useFeatureFlagsAdmin.ts:54,73) e bloqueio de IP não têm nenhuma escrita em audit_logs (triggers.md:40-41,151-152,171-172 só mostram trigger de updated_at nessas tabelas); useLogAuditEvent só é chamado em ImportExport.tsx.
- **Revisão:** sem contestação cética concluída.

### F2742 · Password reset com aprovação por admin (password_reset_requests + send-password-reset)

- **Tipo:** Processo automatizado
- **O que os docs afirmam:** Fluxo controlado de reset de senha com aprovação por admin.
- **Fontes:** `docs/FUNCIONALIDADES_SISTEMA.md:378-378; docs/FUNCIONALIDADES_SISTEMA.md:531-531`
- **O que falta:** Incluir send-password-reset na allowlist ACTIVE; hoje a aprovação do admin não dispara e-mail real em produção.
- **Evidência:** Fluxo existe: PasswordResetApproval.tsx:58,73,105 + send-password-reset/index.ts:79-122 (Resend real). Porém 'send-password-reset' NÃO está na allowlist ACTIVE de .github/workflows/deploy.yml:144 (confirmado via script Python sobre a lista de 100 nomes).
- **Revisão:** sem contestação cética concluída.

### F3890 · Rota /admin/comercial (4 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** API.md declara a rota `/admin/comercial` renderizando o componente AdminComercial com acesso "admin ou gestor".| Rota registrada em AppRoutes.tsx com acesso "admin_ou_gestor", GET em produção 200. Status no doc: OK \| A rota /admin/comercial está entre as 26 classificadas como parciais: existe ligação estática, mas a auditoria não a considera pronta (dados mock, ações sem efeito ou contrato quebrado). \| Rota /admin/comercial (AppRoutes.tsx:281) renderiza src/pages/admin/AdminComercial.tsx; role: admin ou manager. Classificação do doc: IMPLEMENTADO_TOTAL. Evidência: link src/components/admin/AdminQuickLinks.tsx:32 · sb=1 useQuery=1 mut=1 (árvore 12 arq.)
- **Fontes:** `docs/API.md:440-440`, `docs/prod-readiness.md:83`, `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:203-205`, `docs/estado/01_FRONTEND_ROTAS.md:199-199`
- **O que falta:** rota /admin/comercial → src/pages/admin/AdminComercial.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Evidência:** rota /admin/comercial → src/pages/admin/AdminComercial.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Revisão:** sem contestação cética concluída.

### F3891 · Rota /admin/fila-tarefas-automaticas (5 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** API.md declara a rota `/admin/fila-tarefas-automaticas` renderizando o componente AdminFilaTarefasAutomaticas com acesso "admin ou gestor".| Rota /admin/fila-tarefas-automaticas (AppRoutes.tsx:171) renderiza src/pages/AdminFilaTarefasAutomaticas.tsx; role: admin ou manager. Classificação do doc: MORTO_OU_ABANDONADO. Evidência: SEM link/menu em todo src/ · sb=1 useQuery=0 mut=1 (árvore 7 arq.) \| Rota registrada em AppRoutes.tsx com acesso "admin_ou_gestor", GET em produção 200, chamando as edge functions generate-urgent-client-tasks. Status no doc: OK \| NÃO INICIADO (20/20): rota /admin/fila-tarefas-automaticas existe mas sem link/menu; só mapas de título/prefetch. \| Doc: telas funcionais…
- **Fontes:** `docs/API.md:341-341`, `docs/estado/01_FRONTEND_ROTAS.md:100-100`, `docs/prod-readiness.md:86`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:52`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/D_frontend.md:167-167`
- **O que falta:** rota /admin/fila-tarefas-automaticas → src/pages/AdminFilaTarefasAutomaticas.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Evidência:** rota /admin/fila-tarefas-automaticas → src/pages/AdminFilaTarefasAutomaticas.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Revisão:** sem contestação cética concluída.

### F3892 · Rota /admin/regras-inatividade (5 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** API.md declara a rota `/admin/regras-inatividade` renderizando o componente AdminRegrasInatividade com acesso "admin ou gestor".| Rota /admin/regras-inatividade (AppRoutes.tsx:172) renderiza src/pages/AdminRegrasInatividade.tsx; role: admin ou manager. Classificação do doc: MORTO_OU_ABANDONADO. Evidência: SEM link/menu em todo src/ · sb=1 useQuery=1 mut=1 (árvore 9 arq.) \| Rota registrada em AppRoutes.tsx com acesso "admin_ou_gestor", GET em produção 200. Status no doc: OK \| NÃO INICIADO (20/20): rota /admin/regras-inatividade existe mas sem link/menu; só mapas de título/prefetch. \| Doc lista /admin/regras-inatividade entre os itens de FUNCIONALIDADES_SEM_UI resolvidos com página ou cons…
- **Fontes:** `docs/API.md:342-342`, `docs/estado/01_FRONTEND_ROTAS.md:101-101`, `docs/prod-readiness.md:94`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:52`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:206`
- **O que falta:** rota /admin/regras-inatividade → src/pages/AdminRegrasInatividade.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Evidência:** rota /admin/regras-inatividade → src/pages/AdminRegrasInatividade.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Revisão:** sem contestação cética concluída.

### F3893 · Rota /admin/solicitacoes-titular (2 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Rota registrada em AppRoutes.tsx com acesso "admin_ou_gestor", GET em produção 200. Status no doc: OK| Admin/manager processam solicitações do titular nesta rota.
- **Fontes:** `docs/prod-readiness.md:96`, `docs/LGPD.md:50-51`
- **O que falta:** rota /admin/solicitacoes-titular → src/pages/AdminSolicitacoesTitular.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Evidência:** rota /admin/solicitacoes-titular → src/pages/AdminSolicitacoesTitular.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Revisão:** sem contestação cética concluída.

### F3894 · Rota /admin/tarefas (4 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** API.md declara a rota `/admin/tarefas` renderizando o componente AdminTasksPage com acesso "admin".| Rota /admin/tarefas (AppRoutes.tsx:285) renderiza src/pages/AdminTasksPage.tsx; role: admin. Classificação do doc: MORTO_OU_ABANDONADO. Evidência: SEM link/menu em todo src/ · sb=3 useQuery=2 mut=3 (árvore 10 arq.) \| Rota registrada em AppRoutes.tsx com acesso "admin", GET em produção 200. Status no doc: OK \| NÃO INICIADO (20/20): rota /admin/tarefas existe mas sem link/menu; só mapas de título/prefetch.
- **Fontes:** `docs/API.md:444-444`, `docs/estado/01_FRONTEND_ROTAS.md:203-203`, `docs/prod-readiness.md:98`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:52`
- **O que falta:** rota /admin/tarefas → src/pages/AdminTasksPage.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Evidência:** rota /admin/tarefas → src/pages/AdminTasksPage.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Revisão:** sem contestação cética concluída.

### F3895 · Rota /admin/web-vitals (6 afirmações nos docs)

- **Tipo:** Rota/tela
- **O que os docs afirmam:** Web Vitals P75 por rota a partir de web_vitals_samples.| Link de emergência para painel interno de web vitals. \| API.md declara a rota `/admin/web-vitals` renderizando o componente AdminWebVitalsPage com acesso "admin". \| Rota registrada em AppRoutes.tsx com acesso "admin", GET em produção 200. Status no doc: OK \| Rota /admin/web-vitals (AppRoutes.tsx:279) renderiza src/pages/admin/AdminWebVitalsPage.tsx; role: admin. Classificação do doc: IMPLEMENTADO_PARCIAL. Evidência: link src/components/admin/AdminQuickLinks.tsx:74 · sb=1 useQuery=1 mut=0 (árvore 7 arq.) · somente leitura — nenhuma mutação/persistência na árvore \| `src/lib/webVitals.ts:5`; rota `AppRoutes.tsx:279`; web_vitals_sampl…
- **Fontes:** `docs/DEPLOYMENT.md:107`, `docs/runbooks/on-call.md:44-45`, `docs/API.md:438-438`, `docs/prod-readiness.md:101`, `docs/estado/01_FRONTEND_ROTAS.md:197-197`, `docs/estado/08_ADMIN_SEGURANCA.md:136`
- **O que falta:** rota /admin/web-vitals → src/pages/admin/AdminWebVitalsPage.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Evidência:** rota /admin/web-vitals → src/pages/admin/AdminWebVitalsPage.tsx (AppRoutes.tsx); sem entrada no menu (sidebarMenuData.ts) → só acessível por URL
- **Revisão:** sem contestação cética concluída.

### F2765 · UI LGPD de titular/consentimento/anonimização

- **Tipo:** Rota/tela
- **O que os docs afirmam:** LGPD só no banco; LGPD.md cita migration com nome errado.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:273`
- **O que falta:** Adicionar entrada de menu em sidebarMenuData.ts para /admin/solicitacoes-titular; corrigir o timestamp citado em docs/LGPD.md.
- **Evidência:** src/pages/AdminSolicitacoesTitular.tsx existe, usa hooks reais (src/hooks/admin/useDataSubjectRequests.ts com useQuery/useMutation batendo em supabase.from, sem mock) e está registrada em src/routes/AppRoutes.tsx:506-509 ('/admin/solicitacoes-titular'). Porém src/components/layout/sidebar/sidebarMenuData.ts não tem nenhuma entrada para essa rota — só acessível digitando a URL. Confirma-se também: docs/LGPD.md:4,124 cita a migration '20261013163000_lgpd_consent_e_optout_por_telefone.sql', mas o arquivo real é '20261018120000_lgpd_consent_e_optout_por_telefone.sql' (timestamp errado).
- **Revisão:** sem contestação cética concluída.

### F2766 · _internal_secrets com grants amplos a anon/authenticated mas RLS USING false

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Grants default do Supabase em tabela de segredos; RLS nega tudo, sem exposição, mas grants desnecessários.
- **Fontes:** `docs/agentes/achados-auditoria-261117.md:105-107`
- **O que falta:** Executar REVOKE ALL ON public._internal_secrets FROM anon, authenticated (RLS já bloqueia; grants redundantes continuam sem razão).
- **Evidência:** tables/public/internal_secrets.md (snapshot produção) confirma policy RLS 'Deny all access to _internal_secrets' (USING false) para anon/authenticated. Porém a seção Grants da mesma tabela mostra anon e authenticated ainda com DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE (grants padrão nunca revogados) — exatamente o achado de docs/agentes/achados-auditoria-261117.md:105-107.
- **Revisão:** sem contestação cética concluída.

### F2768 · `check_rate_limit` e `log_rate_limit` executáveis por anon (rate-limit no login)

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** ADR-008: check_rate_limit e log_rate_limit mantêm EXECUTE para anon por serem usadas em /auth/login antes do JWT.
- **Fontes:** `docs/decisions/ADR-008-anon-executable-security-definer.md:13-13`
- **O que falta:** Reconciliar/aposentar essas 2 funções órfãs e atualizar a ADR-008, já que o rate-limit de login real migrou para outras funções.
- **Evidência:** docs/decisions/ADR-008-anon-executable-security-definer.md:13 afirma que check_rate_limit e log_rate_limit mantêm EXECUTE para anon por uso em /auth/login. O snapshot real de produção (functions.md:121,277) mostra grants apenas 'authenticated, service_role' — SEM anon hoje. grep -rln "check_rate_limit\|log_rate_limit" src/ supabase/functions/ só acerta types.ts (gerado) — nenhum chamador real; o rate-limit de login atual usa get_login_lockout_status/record_failed_login_attempt (functions.md:230,311, com anon; chamadas em src/hooks/useLoginRateLimiter.ts:41,91).
- **Revisão:** sem contestação cética concluída.

### F2769 · `count_failed_login_attempts` executável por anon (bloqueio progressivo)

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** ADR-008: count_failed_login_attempts acessível a anon para bloqueio progressivo de brute-force.
- **Fontes:** `docs/decisions/ADR-008-anon-executable-security-definer.md:14-14`
- **O que falta:** Mesma reconciliação de F2768: função órfã e sem anon atual; ADR-008 desatualizada quanto a este item.
- **Evidência:** docs/decisions/ADR-008-anon-executable-security-definer.md:14 afirma count_failed_login_attempts acessível a anon. O snapshot de produção (functions.md:142) mostra grants apenas 'authenticated, service_role' — sem anon. grep -rln "count_failed_login_attempts" src/ supabase/functions/ só acerta types.ts gerado — nenhum chamador real. O login atual usa get_login_lockout_status + record_failed_login_attempt (anon; chamadas em src/hooks/useLoginRateLimiter.ts:41,91), introduzidas pela migration 20260831130000.
- **Revisão:** sem contestação cética concluída.

### F2773 · ~140 edge functions sem autorização por papel (qualquer usuário logado invoca)

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Dependem só de verify_jwt=true; qualquer usuário autenticado pode invocar territory-optimization, predict-quota-attainment, revops-hub (lê commissions), ranking-api, auto-reassign-inactive. Doc recomenda introduzir autorização por papel.
- **Fontes:** `docs/estado/10_EDGE_FUNCTIONS.md:192-196`
- **O que falta:** Os 5 exemplos citados já foram corrigidos; as ~140 funções restantes não foram reauditadas individualmente nesta sessão.
- **Evidência:** territory-optimization/index.ts:89-97, predict-quota-attainment/index.ts:116-126 e revops-hub/index.ts:21-29 já chamam is_admin_or_manager e retornam 403. auto-reassign-inactive/index.ts:65-75 exige service_role ou X-Cron-Secret. ranking-api/index.ts:16-57 usa API token próprio, não JWT comum. Hoje 72/173 functions chamam is_admin_or_manager/has_role.
- **Revisão:** sem contestação cética concluída.

### F2774 · 122 de 168 edge functions usam SUPABASE_SERVICE_ROLE_KEY (bypass de RLS)

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** 122 funções instanciam cliente com service_role ignorando RLS; só 14 fazem verificação de identidade própria.
- **Fontes:** `docs/estado/10_EDGE_FUNCTIONS.md:174-178`
- **O que falta:** Fato geral se mantém, mas contagem/percentual do doc estão desatualizados (queda de 73%→52%).
- **Evidência:** Contagem atual: 90/173 (52%) usam SUPABASE_SERVICE_ROLE_KEY cru vs 122/168 (73%) citado em docs/estado/10_EDGE_FUNCTIONS.md:174-178. getUserClient/getServiceClient já em 114/173.
- **Revisão:** sem contestação cética concluída.

### F2775 · 13 edge functions com verify_jwt=false autenticam no handler

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Checklist exige revisão das 13 functions sem verify_jwt.
- **Fontes:** `docs/PROCESSOS.md:40`
- **O que falta:** Número do checklist desatualizado (13→22); as demais não amostradas não foram revisadas individualmente.
- **Evidência:** supabase/config.toml tem hoje 22 blocos verify_jwt=false (não 13, docs/PROCESSOS.md:40). Spot-check de 5 (email-unsubscribe, bitrix24-oauth, whatsapp-inbound-webhook, twilio-call-status, multichannel-status-webhook) confirma autenticação real no handler (token/HMAC/signature).
- **Revisão:** sem contestação cética concluída.

### F2776 · 138/168 edge functions usam SUPABASE_SERVICE_ROLE_KEY cru

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** 82% das funções instanciam client com service_role diretamente.
- **Fontes:** `docs/estado/08_ADMIN_SEGURANCA.md:83,230`
- **O que falta:** Migração para clients RLS-aware avançou bastante desde a medição, mas não chegou a 0%; classificação função-a-função não refeita.
- **Evidência:** Hoje 90/173 (52%) usam service_role cru vs 138/168 (82%) citado em docs/estado/08_ADMIN_SEGURANCA.md:83,230. getUserClient/getServiceClient já em 114/173.
- **Revisão:** sem contestação cética concluída.

### F2778 · 217 de 281 funções SQL são SECURITY DEFINER; 46 executáveis por anon; 30 ambas

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Superfície de risco: 30 funções SECURITY DEFINER executáveis por anon (10,7%).
- **Fontes:** `docs/estado/11_DADOS_BANCO.md:321-327`
- **O que falta:** Meta de '0 funções sem guarda' não atingida (restam 9), mas números do doc (217/281/46/30) desatualizados pelo crescimento do banco.
- **Evidência:** Recontagem real: 378 funções totais, 304 SECURITY DEFINER (vs 217/281), 42 com 'anon' no EXECUTE (25 são trigger, não invocáveis via RPC). SECURITY DEFINER+anon+não-trigger = 9 funções (helpers deliberados: get_current_salesperson_id, get_user_role, has_role, is_admin_or_manager x2, is_country_blocked, is_email_opted_out, get_login_lockout_status, record_failed_login_attempt) vs 30 citadas.
- **Revisão:** sem contestação cética concluída.

### F2784 · 5 JWTs anon hardcoded em migrations (2 inline em pg_cron) + fallback em verify-dispatcher-request-id.sh — rotacionar

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Doc P1: JWTs anon de saejqkojleeaxzrslzfg/rapjswienfhkobhlamxb em migrations 20260726202421:15 e 20260726202545:12 (legíveis em cron.job) e scripts/verify-dispatcher-request-id.sh:22; rotacionar e auditar cron.job.
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:346,528-534,575,586`
- **O que falta:** cron.job já corrigido (lê de _internal_secrets); migrations e script ainda expõem os 5 JWTs; rotação das chaves antigas não verificável (exige painel dos outros projetos).
- **Evidência:** 5 JWTs literais confirmados em supabase/migrations/20260418124334:56, 20260512214007:37, 20260512213243:74, 20260726202421:15, 20260726202545:12 + fallback em scripts/verify-dispatcher-request-id.sh:22 — bate com o achado. Porém supabase/cron.md (47 jobs reais) não tem mais nenhum 'Bearer'/'eyJ' literal — jobs como deal-risk-digest-daily já leem anon_key de public._internal_secrets.
- **Revisão:** sem contestação cética concluída.

### F2788 · ACL de funções: 371/378 sem anon no EXECUTE, 297 SECURITY DEFINER; anon com EXECUTE em 7; add_salesperson_xp só service_role/postgres

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Dump normaliza ACLs antes dos grants para reproduzir produção.
- **Fontes:** `docs/agentes/replay-do-repo-261117.md:242-247`
- **O que falta:** add_salesperson_xp confirmado; contagem exata de 7 não reconciliada com o snapshot direto.
- **Evidência:** add_salesperson_xp (public/private) confirmado com EXECUTE='service_role' apenas — bate com a claim. Já 'anon com EXECUTE em 7 funções': snapshot real mostra 'anon' no EXECUTE de 42/378 funções (25 trigger + 17 regulares; 9 SECURITY DEFINER não-trigger), não 7 — divergência provavelmente por metodologia diferente (dump/restore do doc vs snapshot live).
- **Revisão:** sem contestação cética concluída.

### F2795 · Backup codes de MFA

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Códigos de backup para MFA.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:538-538`, `docs/FEATURE_SUMMARY.md:62-62`
- **O que falta:** Gravar hash dos códigos (não texto plano); gerar com gen_random_bytes em vez de random(); aceitar backup code no desafio de login (useAuthForm.ts:139-150), hoje restrito a Configurações; decidir o destino da tabela órfã user_2fa_backup_codes.
- **Evidência:** Tabela user_mfa_settings.backup_codes (text[]) + RPC generate_mfa_backup_codes/regenerate_backup_codes (contexto/supabase/functions/public/generate_mfa_backup_codes___.sql, regenerate_backup_codes___.sql) + verify_mfa_code (contexto/supabase/functions/public/verify_mfa_code__edc236b47ca9fb9f.sql) comparando `p_code = ANY(v_settings.backup_codes)` em TEXTO PLANO e removendo o código usado do array (uso único OK). UI real em src/hooks/useMFA.ts:320-379 (verifyMFA, regenerateBackupCodes) chamando supabase.rpc(). Existe também tabela legada separada public.user_2fa_backup_codes (contexto/supabase/tables/public/user_2fa_backup_codes.md, coluna `code` text, RLS sim) não referenciada por nenhuma function/hook (órfã).| cético: Confirmo o PARCIAL e acho fios faltando além do hash. (1) Os códigos ficam em texto plano: verify_mfa_code__edc236b47ca9fb9f.sql:34-37 compara `p_code = ANY(v_settings.ba…

### F2797 · Cinco migrations com URL Supabase e anon JWT literal

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Cinco arquivos contêm URLs Supabase e cinco ocorrências de anon JWT que precisam migrar para Vault/configuração.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:475-475`
- **O que falta:** Os literais continuam nas migrations (histórico versionado). O estado real usa a tabela _internal_secrets, não o Vault (vault.md vazio). Falta confirmar a rotação dos 2 anon JWTs expostos.
- **Evidência:** Confirmados exatamente 5 migrations com JWT literal `eyJ...`: supabase/migrations/20260418124334_2874267c-1cbc-441f-aef4-75fc83de067d.sql:56, 20260512213243_8e4190b5-be17-4171-bb9c-614b97b107a7.sql, 20260512214007_64196e26-e33f-4899-987f-ca2db55743f7.sql, 20260726202421_0e6c60a8-07a3-4e75-9aa4-934a5fbafc09.sql, 20260726202545_ba25ae3a-5e67-48b6-8293-a40a51613430.sql. Valor é anon JWT do projeto ORIGEM (ref `saejqkojleeaxzrslzfg`), não migrado para Vault.| cético: Confirmo as 5 migrations com JWT literal: `grep -rlE eyJhbGciOi supabase/migrations` → 20260418124334, 20260512213243, 20260512214007, 20260726202421 e 20260726202545. As URLs literais são de 3 refs (rapjswienfhkobhlamxb x3, saejqkojleeaxzrslzfg x2, usyxfpqlsspldubptrdl x1). docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:90 fala em '5 ocorrências de 2 anon JWTs distintos'. Em produção, cron.md não tem nenhum `eyJ` (grep -c → 0);…

### F2798 · Convenção: funções privilegiadas SECURITY DEFINER + SET search_path=public + REVOKE FROM PUBLIC, anon

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Funções privilegiadas: SECURITY DEFINER, `SET search_path = public`, REVOKE ALL FROM PUBLIC/anon, GRANT mínimo e checagem de role no corpo; preferir SECURITY INVOKER. Regra mecânica — NÃO verificada.
- **Fontes:** `docs/SCHEMA_CONVENTIONS.md:29-31`
- **O que falta:** REVOKE EXECUTE FROM PUBLIC, anon nas funções SECURITY DEFINER que não são helpers de identidade.
- **Evidência:** Snapshot real (contexto/supabase/functions.md): 0 de 378 funções SECURITY DEFINER sem search_path fixo (todas têm search_path=public). Porém 20 funções SECURITY DEFINER concedem EXECUTE a anon além dos helpers de identidade documentados — inclui public.fn_quotes_inbound_ordering_guard, public.trg_recording_generate_coaching, public.trigger_auto_coaching_on_recording, public.audit_log_row_change, public.audit_trigger, public.auto_victory_post, public.log_audit_event, public.log_data_access, public.protect_pa_nudge_content, public.trg_deal_stage_history, public.trg_invalidate_forecast_narrative_cache. docs/agentes/achados-auditoria-261117.md:98-101 já registra 3 delas como pendência conhecida.| cético: Recontei no functions.md: 304 funções SECURITY DEFINER, 0 sem search_path, 20 com EXECUTE para anon. Entre as 20 há helpers de identidade aceitáveis (has_role, is_admin_or_manager, get_user…

### F2800 · Convenção: policy mínima via is_admin_or_manager(auth.uid()) / has_role(auth.uid(), admin)

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Autenticado lê o próprio dado OU admin/manager via `public.is_admin_or_manager(auth.uid())` / `public.has_role(auth.uid(), 'admin')`. Regra mecânica — NÃO verificada.
- **Fontes:** `docs/SCHEMA_CONVENTIONS.md:25-26`
- **O que falta:** Criar policy explícita (ou documentar o deny-all) em webhook_dispatch_rate e trocar as 15 checagens inline em user_roles por is_admin_or_manager/has_role.
- **Evidência:** contexto/supabase/policies.md tem 608 ocorrências de is_admin_or_manager/has_role cobrindo a maioria das 408 tabelas. Porém public.webhook_dispatch_rate tem RLS habilitado e 0 policies (contexto/supabase/tables/public/webhook_dispatch_rate.md: 'policies| 0'), violando o critério literal 'toda tabela com RLS tem ao menos 1 policy' (efeito prático é deny-all, não um buraco). \| cético: tables/public/webhook_dispatch_rate.md:7-9 mostra RLS habilitado com 'policies \| 0'. Além disso, 15 policies de admin não usam as funções canônicas e fazem EXISTS direto em user_roles (`grep -c 'FROM user_roles' policies.md` → 15), ex.: policies.md:10 (access_denied_logs), :85-86 (buying_committee), :91 (buying_signals). Isso viola o critério 'policies de admin usam as funções canônicas'.

### F2803 · Default ACLs de supabase_admin concedem CRUD/TRUNCATE/MAINTAIN/REFERENCES/TRIGGER a anon/authenticated

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Default ACLs de objetos criados por supabase_admin concedem por padrão CRUD, TRUNCATE, MAINTAIN, REFERENCES e TRIGGER a anon/authenticated; a migration final endureceu só o owner postgres. Observação: o doc refere-se ao projeto ORIGEM rapjswienfhkobhlamxb, que AGENTS.md declara não pertencer a este repo; verificar também o equivalente no destino usyxfpqlsspldubptrdl.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:401-401`
- **O que falta:** REVOKE dos default ACLs de supabase_admin (exige papel supabase_admin/suporte Supabase) e GRANT mínimo; ver F2806/F2813.
- **Evidência:** contexto/supabase/grants.md: 406 de 419 objetos concedem a anon DELETE, INSERT, REFERENCES, SELECT, TRIGGER, UPDATE (grant de tabela, não RLS) — inclusive public._internal_secrets e public.ab_tests. Reproduz no banco DESTINO (usyxfpqlsspldubptrdl, snapshot 20/11/2026) o mesmo padrão de default ACL amplo descrito para a origem. RLS bloqueia o acesso de fato na maioria dos casos (_internal_secrets tem policy 'Deny all access' USING/CHECK=false), mas o grant de tabela continua aberto.| cético: Confirmado no banco DESTINO. grants.md:1368 (default de supabase_admin em public, tabelas) dá anon=arwdDxtm, ou seja, CRUD, TRUNCATE, REFERENCES, TRIGGER e MAINTAIN; grants.md:1366 dá anon=X em funções. Só o owner postgres foi endurecido: grants.md:1363 (funções sem anon) e :1365 (tabelas sem D/TRUNCATE para anon). A migration supabase/migrations/20261116223000_revoke_supabase_admin_default_truncate.…

### F2807 · Etapa 36 do plano: Revisar policies literais true

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Classificar as 176 USING e 48 CHECK; substituir somente as não intencionais. Saída esperada: testes anon/authenticated/service_role. Gate: autorização RLS por lote.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:701-701`
- **O que falta:** Classificação formal das 114/8 policies true restantes e testes anon/authenticated/service_role por policy.
- **Evidência:** Contagem atual: 117 policies USING=true (eram 176) e 8 WITH CHECK=true (eram 48) — contexto/supabase/policies.md. Nenhuma para anon/public (ver F2799), indicando revisão parcial (provável migration 20260831130000_harden_public_access_and_privileged_rpcs.sql). Não há testes anon/authenticated/service_role dedicados por policy — só supabase/tests/rls_test_suite.sql, que testa apenas RLS habilitada (relrowsecurity).| cético: Recontagem no policies.md: 114 USING=`true` e 8 WITH CHECK=`true` (eram 176/48), nenhuma para anon/public. O commit HEAD 90170947d removeu mais policies (sales/activities). Testes por role: supabase/tests/canonical_role_simulation.sql:8 e :169 (SET LOCAL ROLE anon/authenticated) cobrem só login_attempts e RPCs de login, não as policies true. rls_test_suite.sql (49 linhas) só checa relrowsecurity.

### F2810 · Etapa 51 do plano: Parametrizar os 12 scripts secretos

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Ler env/Vault, negar execução sem project ref explícito e adicionar dry-run. Saída esperada: gitleaks limpo no HEAD. Gate: nenhum segredo novo.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:722-722`
- **O que falta:** Validar o project ref esperado (usyxfpqlsspldubptrdl), adicionar modo dry-run e rodar/registrar gitleaks limpo no HEAD.
- **Evidência:** scripts/lib/requireSupabaseAdminEnv.ts lê SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY só de process.env, valida HTTPS, exige CONFIRM_SUPABASE_ADMIN_WRITE=EXECUTAR_ESCRITA_ADMINISTRATIVA antes de escrever. Usado por 7 scripts (seed-race-cars.ts, run-win-loss-analysis.ts, seed-fake-data.ts, seed-real-people.ts, seed-august-sales.ts, seed-probe.ts, seed-deal-outcomes.ts). `npm run security:secrets` passou sem achados.| cético: scripts/lib/requireSupabaseAdminEnv.ts:8-18 lê SUPABASE_URL/SERVICE_ROLE_KEY do ambiente; :20-35 exige HTTPS; :37-43 exige confirmação de escrita. São 7 scripts usuários (`grep -rl requireSupabaseAdminEnv scripts`). STATUS_100_ETAPAS_2026-08-30.md:90 diz 'os 12 scripts foram parametrizados'. Porém não há checagem de project ref explícito nem dry-run (só a confirmação de escrita), e gitleaks não está no CI (`grep -rln gitleaks .github scripts package.json` → 0).

### F2814 · Etapa canônica 26/08 nº 36: Revisar policies literais true (176 USING e 48 CHECK)

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Etapa canônica 36 (plano 26/08, matriz de status 30/08, estado 🔒): classificar e substituir só as não intencionais; testes anon/authenticated/service_role.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:169-169`
- **O que falta:** Mesma ação de F2807.
- **Evidência:** Idêntico a F2807 (mesma etapa 36, fonte docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:169). Contagem atual 117 USING=true e 8 CHECK=true (reduzido de 176/48), nenhuma anon/public, sem classificação documentada nem teste dedicado.| cético: Mesma etapa 36 de F2807. policies.md hoje tem 114 USING=`true` e 8 CHECK=`true`, nenhuma para anon/public. Não há classificação documentada nem teste por policy (canonical_role_simulation.sql cobre só o login).

### F2820 · Field-level security granular

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Falta segurança por campo.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:159`
- **O que falta:** Mecanismo de field-level security de verdade: column grants ou REVOKE SELECT nas colunas de custo de public.sales para authenticated (hoje o vendedor lê unit_cost/total_cost direto da tabela base, filtrado só por RLS de linha), e um mecanismo configurável para outras tabelas.
- **Evidência:** Existe mascaramento de colunas por papel: view public.sales_with_markup (docs/contexto/supabase/views.md:688-717) tem CASE WHEN has_role(auth.uid(),'admin') OR has_role(auth.uid(),'manager') THEN unit_cost/total_cost/margin_amount ELSE NULL. Integrada ponta a ponta: src/hooks/bi/useMarkupOverview.ts:25, src/hooks/bi/useCriticalMarkupSales.ts:36, src/hooks/reports/useSalesReport.ts:51,58, src/services/salesService.ts:70,166. Mas é mascaramento hardcoded em 1 view/3 colunas, não um mecanismo genérico de field-level security configurável (docs/GAPS_CLASSE_MUNDIAL.md:159 compara ao Salesforce).| cético: Confirmo o mascaramento apenas em public.sales_with_markup (views.md:679-717, CASE has_role admin/manager em unit_cost/total_cost/margin_amount). E ele é contornável: a tabela base public.sales tem as mesmas colunas (tables/public/sales.md:51-55), authenticated tem SELECT em todas as colunas…

### F2821 · Functions sem padrão de auth detectado ('nenhuma detectada no handler') exigem revisão

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** O catálogo classifica dezenas de functions como 'nenhuma detectada no handler — confira a function antes de expor/chamar', dependendo apenas do verify_jwt do gateway.
- **Fontes:** `docs/API.md:22-23`
- **O que falta:** Auditoria sistemática só das functions 'nenhuma detectada' que ESTÃO na allowlist deploy.yml:144 (as de fora não rodam); corrigir new-device-alert (checar user_id === auth.uid()) antes de algum dia entrar na allowlist.
- **Evidência:** Os 4 exemplos citados já têm checagem real, contradizendo o rótulo automático 'nenhuma detectada': ranking-api é classificado como 'Bearer manual' (docs/API.md:154); demand-forecast checa papel manager (supabase/functions/demand-forecast/index.ts:33-46); bitrix24-sync checa service_role/X-Cron-Secret ou papel admin/manager (bitrix24-sync/index.ts:945-973); onboarding-launcher checa isPrivileged (onboarding-launcher/index.ts:63-67). Ao amostrar outras ~56 das 66 functions 'nenhuma detectada'+verify_jwt on, encontrei exposição real: supabase/functions/new-device-alert/index.ts:97-160 grava known_devices e dispara email para QUALQUER user_id do payload sem checar que o chamador é o próprio usuário.| cético: Concordo com PARCIAL, com uma correção: o exemplo de exposição citado (supabase/functions/new-device-alert/index.ts:110-160, que grava known_devices para qualquer data.user_id usando se…

### F2822 · Functions SQL com `SECURITY INVOKER` e grants mínimos

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** ARCHITECTURE: edge functions (sic — functions SQL) com SECURITY INVOKER e grants mínimos.
- **Fontes:** `docs/ARCHITECTURE.md:91-92`
- **O que falta:** Gate de CI que compare as functions DEFINER expostas a anon/authenticated com a lista auditada do ADR-008.
- **Evidência:** security_invoker=true usado amplamente em views (ex. supabase/migrations/20260712221013_99a59155...sql:7). Snapshot atual (20/11/2026, docs/contexto/supabase/functions.md) mostra 20 functions SECURITY DEFINER em public com EXECUTE para anon e 209 para authenticated — contra '11 anon revisadas' do ADR-008. Auditoria já registrou divergência: docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:133 cita 30 DEFINER anon no destino vs 10 na origem. Checklist de nova DEFINER é manual, sem gate em CI (docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:407).| cético: Nenhum gate de CI confere SECURITY DEFINER: grep -rln -i 'security.definer\|prosecdef' em scripts/, .github/workflows/ e supabase/tests → só scripts de snapshot/doc e quote-to-sale-stress.sql, nenhum é gate. scripts/run-sql-tests.sh:72-92 roda rls_test_suite, canonical_post_migration_…

### F2824 · gitleaks HEAD #2: 20260418124334_2874267c-*.sql contém anon JWT do projeto legado saejqkojleeaxzrslzfg

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Achado gitleaks regra jwt em supabase/migrations/20260418124334_2874267c-*.sql:56: anon JWT do projeto legado saejqkojleeaxzrslzfg; privilégio nominal baixo; migration permanece imutável — tratamento via rotação do token e expurgo autorizado ou migration corretiva.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:82-86`
- **O que falta:** Rotação do token no projeto legado saejqkojleeaxzrslzfg (NAO_VERIFICAVEL: exige acesso ao painel daquele projeto); allowlist documentada do scanner.
- **Evidência:** Literal anon JWT confirmado presente: supabase/migrations/20260418124334_2874267c-1cbc-441f-aef4-75fc83de067d.sql:56 (saejqkojleeaxzrslzfg). Migration imutável (correto). .gitleaks.toml não existe no repo (0 resultados); scripts/security/check-no-committed-service-role.ts:33-42 só filtra JWT role='service_role', ignora role='anon'.| cético: Literal confirmado em supabase/migrations/20260418124334_2874267c-1cbc-441f-aef4-75fc83de067d.sql:56 (grep eyJ). Não existe .gitleaks.toml nem gitleaks/trufflehog no CI (grep -rli 'gitleaks\|trufflehog\|secretlint' em .github, package.json e scripts → 0). scripts/security/check-no-committed-service-role.ts:39-48 só acusa JWT com role === 'service_role'. O literal não está no banco de produção: grep -rl eyJ no snapshot supabase/ → 0.

### F2825 · gitleaks HEAD #3: 20260512213243_8e4190b5-*.sql contém anon JWT legado (duplicata do #2)

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Achado gitleaks regra jwt em supabase/migrations/20260512213243_8e4190b5-*.sql:74: anon JWT legado (duplicata do #2); privilégio nominal baixo; migration permanece imutável — tratamento via rotação do token e expurgo autorizado ou migration corretiva.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:82-86`
- **O que falta:** Rotação do token legado (NAO_VERIFICAVEL) e allowlist documentada do scanner.
- **Evidência:** Literal anon JWT confirmado presente: supabase/migrations/20260512213243_8e4190b5-be17-4171-bb9c-614b97b107a7.sql:74 (mesma string de F2824, duplicata). .gitleaks.toml ausente; scanner local não cobre JWT anon.| cético: Literal confirmado em supabase/migrations/20260512213243_8e4190b5-*.sql:74. Scanner sem cobertura de anon (check-no-committed-service-role.ts:39-48); sem .gitleaks.toml.

### F2826 · gitleaks HEAD #4: 20260512214007_64196e26-*.sql contém anon JWT da origem rapjswienfhkobhlamxb

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Achado gitleaks regra jwt em supabase/migrations/20260512214007_64196e26-*.sql:37: anon JWT da origem rapjswienfhkobhlamxb; privilégio nominal baixo; migration permanece imutável — tratamento via rotação do token e expurgo autorizado ou migration corretiva.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:82-86`
- **O que falta:** Rotação do token da origem rapjswienfhkobhlamxb (NAO_VERIFICAVEL) e allowlist do scanner.
- **Evidência:** Literal anon JWT confirmado presente: supabase/migrations/20260512214007_64196e26-e33f-4899-987f-ca2db55743f7.sql:37 (rapjswienfhkobhlamxb). .gitleaks.toml ausente; scanner não cobre anon JWT.| cético: Literal confirmado em supabase/migrations/20260512214007_64196e26-*.sql:37. Scanner só pega service_role (check-no-committed-service-role.ts:39-48); sem .gitleaks.toml.

### F2827 · gitleaks HEAD #5: 20260726202421_0e6c60a8-*.sql contém anon JWT da origem (duplicata do #4)

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Achado gitleaks regra jwt em supabase/migrations/20260726202421_0e6c60a8-*.sql:15: anon JWT da origem (duplicata do #4); privilégio nominal baixo; migration permanece imutável — tratamento via rotação do token e expurgo autorizado ou migration corretiva.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:82-86`
- **O que falta:** Mesma pendência do F2826.
- **Evidência:** Literal anon JWT confirmado presente: supabase/migrations/20260726202421_0e6c60a8-07a3-4e75-9aa4-934a5fbafc09.sql:15 (mesma string de F2826, duplicata). .gitleaks.toml ausente.| cético: Literal confirmado em supabase/migrations/20260726202421_0e6c60a8-*.sql:15 (grep eyJ).

### F2828 · gitleaks HEAD #6: 20260726202545_ba25ae3a-*.sql contém anon JWT da origem (duplicata do #4)

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Achado gitleaks regra jwt em supabase/migrations/20260726202545_ba25ae3a-*.sql:12: anon JWT da origem (duplicata do #4); privilégio nominal baixo; migration permanece imutável — tratamento via rotação do token e expurgo autorizado ou migration corretiva.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:82-86`
- **O que falta:** Mesma pendência do F2826.
- **Evidência:** Literal anon JWT confirmado presente: supabase/migrations/20260726202545_ba25ae3a-5e67-48b6-8293-a40a51613430.sql:12 (duplicata de F2826/F2827). .gitleaks.toml ausente.| cético: Literal confirmado em supabase/migrations/20260726202545_ba25ae3a-*.sql:12 (grep eyJ).

### F2829 · gitleaks: 20 ocorrências no estado atual e 31 no histórico

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** gitleaks encontrou 20 ocorrências no estado versionado e 31 no histórico: segredo service_role real, credencial da migrate-helper, cinco anon JWT em migrations e falsos positivos.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:120-120`
- **O que falta:** Scanner do tipo gitleaks com allowlist documentada, cobrindo também JWT anon.
- **Evidência:** find -iname '_gitleaks_' → 0 resultados (sem .gitleaks.toml, sem gitleaks real no CI). npm run security:secrets roda limpo mas scripts/security/check-no-committed-service-role.ts:33-42 só detecta JWT role='service_role'; os 5 anon JWT confirmados em F2824-F2828 não são pegos.| cético: Não há gitleaks no repo nem no CI: grep -rli gitleaks .github package.json scripts → 0, e ls -a \| grep leak → 0. package.json:47 security:secrets = check-no-committed-service-role.ts, que filtra só role service_role (linhas 39-48), sb_secret_ e atribuições *_ACCESS_KEY/SECRET. Os 5 anon JWT continuam nas migrations (F2824-F2828).

### F2830 · Grants amplos a anon/authenticated (anon: 231 INSERT, 477 MAINTAIN, 254 REFERENCES/TRIGGER)

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Tabela de grants relacionais: anon tem 56 SELECT, 231 INSERT, 229 UPDATE/DELETE, 477 MAINTAIN, 254 REFERENCES/TRIGGER; authenticated 432/341/337/336/542/350; service_role 587 em tudo. Observação: o doc refere-se ao projeto ORIGEM rapjswienfhkobhlamxb, que AGENTS.md declara não pertencer a este repo; verificar também o equivalente no destino usyxfpqlsspldubptrdl.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:391-399`
- **O que falta:** Revogar MAINTAIN/REFERENCES/TRIGGER e escrita de anon de forma sistemática, inclusive no default ACL (grants.md:1365).
- **Evidência:** grants.md (snapshot prod atual usyxfpqlsspldubptrdl, 20/11/2026) confirma grants amplos para anon também no destino: INSERT em 411/419 linhas, SELECT em 417/419, TRIGGER em 409/419. RLS é a proteção real (policies.md). Migrations pontuais reduziram parte: 20261001203300_deny_dead_tables_revoke_anon_grants.sql (4 tabelas), 20260902121000 e 20261116223000 (TRUNCATE).| cético: No destino (grants.md:6-1323), anon aparece em 410 objetos public e tem INSERT em 408. Exemplos: public.sales anon com DELETE/INSERT/REFERENCES/SELECT/TRIGGER/UPDATE (grants.md:918); default ACL public/postgres concede anon=arwdxtm (grants.md:1365), com REFERENCES(x)/TRIGGER(t)/MAINTAIN(m) para tabelas novas. authenticated aparece em 437 objetos, ou seja, houve só redução pontual para anon.

### F2831 · Grants amplos: anon com SELECT/INSERT/UPDATE em 384 das 398 tabelas

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** anon tem SELECT em 384 das 398 tabelas e INSERT/UPDATE em 384; proteção real depende das policies.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:159-159`
- **O que falta:** Grants mínimos por tabela e suíte de autorização ampla.
- **Evidência:** Confirmado no snapshot do destino (grants.md): anon com SELECT em 417 linhas, INSERT em 411 — volume igual ou maior que os '384 de 398' citados para a origem. Proteção real depende das RLS policies (policies.md).| cético: grants.md: 410 linhas anon em public, 408 com INSERT, para 408 tabelas listadas em tables.md. O volume é maior que os '384 de 398' da origem. Proteção depende de RLS.

### F2833 · Handoff P003: Rotacionar a chave fixa de migrate-helper

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Fila canônica do handoff (onda 1): Rotacionar a chave fixa de migrate-helper. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:279-279`
- **O que falta:** Evidência de rotação ou invalidação da ACCESS_KEY antiga no provedor (NAO_VERIFICAVEL deste ambiente).
- **Evidência:** Function e ACCESS_KEY hardcoded removidas do código (commit ce2bac704, 2026-09-03); grep 'ACCESS_KEY' no repo não retorna literal; migrate-helper ausente da allowlist de .github/workflows/deploy.yml:144. Vetor de exposição eliminado na prática.| cético: Código removido (14b2750a4 e ce2bac704; ls supabase/functions/migrate-helper → ausente) e function fora da allowlist deploy.yml:144. Não dá para provar que a chave antiga é rejeitada: o snapshot edge-functions.md:3 diz 'Management API desabilitada', então não se vê o que está deployado, e a chave segue no histórico git.

### F2835 · Handoff P039: Reduzir grants de tabelas e default ACLs amplos

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Fila canônica do handoff (onda 4): Reduzir grants de tabelas e default ACLs amplos. Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:330-330`
- **O que falta:** Reduzir default ACLs e grants de anon de forma sistemática e ter suíte verde comprovando.
- **Evidência:** Migrations pontuais existem: 20260902120000_revoke_anon_truncate_and_fix_battle_score.sql, 20261001203300_deny_dead_tables_revoke_anon_grants.sql (apenas 4 tabelas, linhas 3-19), 20261027130000_agent_runs_owner_check_e_grants.sql, 20261116223000_revoke_supabase_admin_default_truncate.sql, 20261117060000_revoke_grants_tabelas_webhook.sql. grants.md atual ainda mostra anon com INSERT/SELECT/TRIGGER em >400 tabelas.| cético: O default ACL continua amplo: grants.md:1365 (public/postgres: anon=arwdxtm) e grants.md:1368 (public/supabase_admin: anon=arwdDxtm, com TRUNCATE). Grants de tabela de anon em 408 objetos public. Só houve migrations pontuais.

### F2837 · Helpers de RLS sem EXECUTE para anon

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Helpers de RLS têm EXECUTE concedido a anon (mig 20261005140000:13-16); sem teste SET ROLE anon no CI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:267-270`
- **O que falta:** Teste com SET ROLE anon cobrindo get_user_role, is_admin_or_manager e get_current_salesperson_id, retornando NULL/false, incluído em scripts/run-sql-tests.sh.
- **Evidência:** supabase/migrations/20261005140000_restore_anon_execute_rls_helpers.sql:12-16 CONCEDE (não revoga) EXECUTE a anon deliberadamente — revogar quebra RLS (comentário linhas 1-9: sem o grant, GET /rest/v1/sales anônimo retornava 42501 em vez de lista vazia). A mitigação real foi reescrever get_user_role/is_admin_or_manager para retornar NULL/false quando auth.role()='anon', não REVOKE. supabase/tests/role_helpers_matrix_assertions.sql testa is_admin_or_manager mas não usa SET ROLE anon e não está em scripts/run-sql-tests.sh (0 matches) — não roda no CI.| cético: supabase/migrations/20261005140000_restore_anon_execute_rls_helpers.sql:13-16 CONCEDE EXECUTE a anon de propósito (justificativa nas linhas 1-11). O único teste de CI com SET LOCAL ROLE anon é supabase/tests/canonical_role_simulation.sql:8, que roda via scripts/run-sql-tests.sh:78-79, mas testa lockout de login, não os helpers: grep…

### F2839 · JWT anon hard-coded em migrations antigas rotacionado

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** PARCIAL: trigger_campaign_health_alert reescrita via _internal_secrets (20261001160000:136-156); JWT continua em 5 migrations antigas.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:256`
- **O que falta:** Registro da rotação ou invalidação da chave nos projetos legados (NAO_VERIFICAVEL deste ambiente).
- **Evidência:** public.trigger_campaign_health_alert() no snapshot atual não contém mais literal JWT: usa _internal_secrets (linha 17) e monta Authorization a partir dele (linha 37) — confirma reescrita via 20261001160000. Literal ainda presente nas 5 migrations históricas (ver F2840), mantidas imutáveis por design.| cético: O corpo atual em produção (functions/public/trigger_campaign_health_alert__12ae32cb1ec02d01.sql:12-17,32-38) lê anon_key/functions_base_url/coaching_cron_secret de public._internal_secrets, sem literal (grep -rl eyJ no snapshot → 0). A rotação da chave do projeto antigo não tem evidência no repo.

### F2840 · JWT anon hard-coded em trigger_campaign_health_alert() e em 5 migrations

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Função SQL public.trigger_campaign_health_alert() embute "Bearer eyJ…" literal; a mesma string está em 5 migrations (20260418124334, 20260512213243, 20260512214007, 20260726202421, 20260726202545). Doc recomenda mover para Vault ou GUC.
- **Fontes:** `docs/estado/10_EDGE_FUNCTIONS.md:157-172`
- **O que falta:** Rotação dos tokens legados (NAO_VERIFICAVEL); opcionalmente mover anon_key de _internal_secrets para vault.decrypted_secrets como pede o critério.
- **Evidência:** Literal 'Bearer eyJ...' confirmado nas 5 migrations: 20260418124334...sql:56, 20260512213243...sql:74, 20260512214007...sql:37, 20260726202421...sql:15, 20260726202545...sql:12. A function trigger_campaign_health_alert() já foi corrigida (ver F2839) e não usa mais o literal.| cético: A função de produção não tem mais o literal (trigger_campaign_health_alert__12ae32cb1ec02d01.sql:12-17), mas a chave vem da tabela public._internal_secrets, não do Vault nem de GUC como pede o critério. O literal segue nas 5 migrations: 20260418124334:56, 20260512213243:74, 20260512214007:37, 20260726202421:15, 20260726202545:12 (grep eyJ).

### F2841 · Matriz de posse para 96 tabelas TO authenticated USING (true)

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** PARCIAL: hardening pontual (20261001203200, 20261005170000); sem varredura geral.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:218`
- **O que falta:** Matriz de posse para as ~106 tabelas e policies segmentadas.
- **Evidência:** Migrations pontuais: 20261001203200_restrict_user_roles_select.sql, 20261005170000_quote_items_owner_write_policy.sql. docs/RLS_MATRIX.md existe mas documenta só 'Tabelas de maior risco' (10 tabelas, linhas 15-24). Snapshot atual (policies.md) mostra 106 policies com role authenticated e USING literal 'true' — volume comparável, sem varredura geral.| cético: docs/RLS_MATRIX.md:15-24 cobre só 10 tabelas, e o arquivo inteiro tem 34 linhas. policies.md tem 106 tabelas distintas com policy authenticated e USING literal `true` (grep '\| authenticated \| `true` \|' \| cut por tabela \| sort -u → 106).

### F2842 · MFA nativo obrigatório e totp_secret removido

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** A.13 4 D: MFA opcional (useAuthForm.ts; 20261001203500_mfa_native_migration_flag.sql); totp_secret em texto puro.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:452`
- **O que falta:** Exigir MFA (aal2) para os papéis definidos e remover ou criptografar totp_secret.
- **Evidência:** src/hooks/auth/useAuthForm.ts:117-120: desafio MFA só ocorre se o usuário já tem fator TOTP enrolado (aal1→aal2 condicional) — não obrigatório para todos. supabase/migrations/20261001203500_mfa_native_migration_flag.sql:9-13 declara que NÃO dropa totp_secret/backup_codes. Coluna totp_secret confirmada presente em produção (tables/public/user_mfa_settings.md:22).| cético: MFA é opcional: src/hooks/auth/useAuthForm.ts:118-133 só desafia quem já tem fator TOTP. grep -rn 'mfa_required\|requireMfa\|enforce_mfa' em src e supabase/functions → só o estado de UI. Nenhuma policy exige aal2 (grep -c aal policies.md → 0). A coluna totp_secret existe em produção (tables/public/user_mfa_settings.md:22).

### F2846 · Nenhuma tabela com RLS e zero policies (1.019 policies, média 2,57/tabela)

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Todas as 397 tabelas têm ao menos uma policy em pg_policies.
- **Fontes:** `docs/estado/11_DADOS_BANCO.md:404-411`
- **O que falta:** Criar policy explícita (deny-all documentada) em public.webhook_dispatch_rate ou registrar a exceção como em webhook_events.
- **Evidência:** contexto/docs/contexto/supabase/tables/public/webhook_dispatch_rate.md: RLS=sim, policies=0, nota '⚠️ RLS habilitado sem policies'. Contradiz literalmente 'nenhuma tabela com RLS e zero policies' (há 1 em 408).| cético: Confirmado: supabase/tables.md:384 public.webhook_dispatch_rate RLS=sim, policies=0; tables/public/webhook_dispatch_rate.md:9 'policies \| 0', sem nota de deny-all intencional (diferente de webhook_events.md:3, que documenta a exceção). Doc afirma 'nenhuma tabela com RLS e zero policies'.

### F2851 · PII removida de scripts/seed-real-people.ts (repo público)

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** scripts/seed-real-people.ts:14+ contém nomes e e-mails reais de vendedores em repositório público.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:130`
- **O que falta:** Reescrever histórico (filter-repo) e anonimizar também scripts/seed-august-sales.ts e scripts/seed-race-cars.ts.
- **Evidência:** scripts/seed-real-people.ts (HEAD) já anonimizado (commit 3a6012da3, PR #266). Mas 'git log --all -p' ainda expõe e-mails reais ([e-mail omitido] e outros) nos commits b722848dd/648dcc9d4 — acessíveis em repo público.| cético: HEAD scripts/seed-real-people.ts:14-25 anonimizado (example.test). Histórico: git show 648dcc9d4:scripts/seed-real-people.ts:15-22 tem nomes reais + e-mails @promobrindes.com.br. Novo: nomes reais continuam no HEAD em outros scripts — scripts/seed-august-sales.ts:30-34 (nome + nº de vendas/ticket médio) e scripts/seed-race-cars.ts:28-34.

### F2857 · Policy "Admins can delete telemetry" (DELETE via has_role admin)

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Somente admins podem apagar registros de telemetria.
- **Fontes:** `docs/TELEMETRY_MODULE_DOCS.md:146-149,668-672`
- **O que falta:** Trocar para has_role(auth.uid(),'admin') ou corrigir TELEMETRY_MODULE_DOCS.md:146-149.
- **Evidência:** policies.md:640 'Admins can delete telemetry' existe mas USING é 'is_admin_or_manager(auth.uid())', não 'has_role admin' como documentado (TELEMETRY_MODULE_DOCS.md:146-149). Origem: migration 20260323120713 já criou com is_admin_or_manager.| cético: policies.md:640 'Admins can delete telemetry' DELETE USING is_admin_or_manager(auth.uid()) — não has_role admin; manager também apaga.

### F2858 · Policy "Admins can read telemetry" (SELECT via has_role admin)

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Somente usuários com role admin podem ler query_telemetry.
- **Fontes:** `docs/TELEMETRY_MODULE_DOCS.md:140-144,662-666`
- **O que falta:** Alinhar nome/condição com o doc ou corrigir o doc.
- **Evidência:** policies.md:641 mostra policy real 'Admins can view telemetry' (não 'read'), USING is_admin_or_manager — nome e condição diferem do documentado (TELEMETRY_MODULE_DOCS.md:140-144). Origem: migration 20260323120713.| cético: policies.md:641 nome real 'Admins can view telemetry', USING is_admin_or_manager(auth.uid()); não existe 'Admins can read telemetry' nem has_role admin-only.

### F2859 · Policy "Authenticated users can insert own telemetry"

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Usuário autenticado pode inserir telemetria desde que user_id = auth.uid().
- **Fontes:** `docs/TELEMETRY_MODULE_DOCS.md:151-154,674-680`
- **O que falta:** WITH CHECK (user_id = auth.uid()).
- **Evidência:** policies.md:642 'Authenticated users can insert own telemetry' tem WITH CHECK '(auth.uid() IS NOT NULL)', não 'user_id = auth.uid()' como documentado (TELEMETRY_MODULE_DOCS.md:151-154). Origem: migration 20260404151705.| cético: policies.md:642 'Authenticated users can insert own telemetry' WITH CHECK (auth.uid() IS NOT NULL), não user_id = auth.uid().

### F2862 · Policy leads_authenticated_all USING(true) removida

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** mig/20260903000001:5-10 cria leads_authenticated_all USING(true) WITH CHECK(true) com comentário "tighten per-role later"; public.leads não existe no repo nem em types.ts, então a migration falha em banco limpo.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/F_banco_dados.md:187`
- **O que falta:** Remover ou guardar com IF EXISTS a migration órfã; limpar o branch update_lead_score.
- **Evidência:** Migration 20260903000001_enable_rls_leads.sql cria policy USING(true)/WITH CHECK(true) sem IF EXISTS. public.leads não existe no banco real nem em types.ts — migration nunca aplicada com sucesso. ai-agent-orchestrator/index.ts:292-296 ainda referencia '.from('leads')' para update_lead_score, caminho que quebraria em runtime.| cético: supabase/migrations/20260903000001_enable_rls_leads.sql:3-10 sem IF EXISTS, USING(true), comentário 'tighten per-role later'. Correção: a migration está registrada como aplicada com 0 statements (snapshot migrations.md:609), e public.leads/leads_authenticated_all não existem (grep em tables.md/policies.md → 0). ai-agent-orchestrator/index.ts:292-296 usa .from('leads'), mas a function não está na allowlist (deploy.yml:144 → 0), então não roda em produção.

### F2863 · Política de senha: exige maiúscula, minúscula, número e caractere especial

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Senhas devem conter maiúsculas, minúsculas, números e caracteres especiais.
- **Fontes:** `docs/SECURITY.md:8`
- **O que falta:** Regex das 4 classes no schema e/ou password_requirements no GoTrue (painel não verificável aqui).
- **Evidência:** Nenhuma validação de complexidade (4 classes de caractere) no front: useAuthForm.ts:12 e ResetPassword.tsx:20 só usam z.string().min(8). Sem fluxo signUp() no front. Config GoTrue não verificável (auth.md: 'Management API desabilitada').| cético: Únicos schemas de senha: useAuthForm.ts:12 e ResetPassword.tsx:20 = z.string().min(8); grep de regex de classes/PasswordStrength em src → 0; supabase/config.toml sem password_requirements (grep → 0). Nenhum fluxo de cadastro/troca além de ResetPassword.tsx:62.

### F2867 · RBAC 100% client-side; garantia real depende de RLS

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** A proteção de rotas é apenas no cliente; se as políticas RLS não espelharem requiredRole/requireAdminOrManager a proteção é decorativa (fora do escopo do doc). (ver também docs/estado/01_FRONTEND_ROTAS.md linhas 397)
- **Fontes:** `docs/estado/01_FRONTEND_ROTAS.md:301-301`
- **O que falta:** Auditar as 117 policies USING(true) contra o RBAC do front.
- **Evidência:** docs/estado/01_FRONTEND_ROTAS.md:301 confirma RBAC 100% client-side (ProtectedRoute.tsx só usa useUserRoles no cliente). No banco, 804/1017 policies usam has_role/is_admin_or_manager/auth.uid(), mas 116 ainda usam USING(true) puro sem diferenciação de papel.| cético: docs/estado/01_FRONTEND_ROTAS.md:301 RBAC só no cliente. policies.md: 117 policies USING `true` (todas authenticated/service). Tabelas centrais (clients, sales, quotes) têm policies por papel/dono, mas ex. coaching_opportunities 'coaching_opp_read_authenticated' SELECT USING true e ai_narrative_cache/edge_job_locks/webhook_inbound_log ALL true.

### F2871 · Reduzir uso de SUPABASE_SERVICE_ROLE_KEY (122 funções)

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** 122 edge functions usam SERVICE_ROLE_KEY; recomenda anon key + JWT do usuário salvo em crons de fato globais (rotate-daily-challenges, scheduled-reports-runner).
- **Fontes:** `docs/reports/BACKEND_ANALYSIS_REPORT.md:306-318`
- **O que falta:** Migrar as ~27 edge functions chamadas pela UI (lista acima) para client com SUPABASE_ANON_KEY + Authorization do usuário, reservando SERVICE_ROLE_KEY só para cron/background (rotate-daily-challenges, scheduled-reports-runner etc.).
- **Evidência:** `grep -r "SUPABASE_SERVICE_ROLE_KEY" supabase/functions --include="*.ts" -l| wc -l` = 102 (doc citava 122, redução marginal). Cruzando com `functions.invoke(...)` em src/: 27 funções chamadas diretamente pela UI ainda usam SERVICE_ROLE_KEY (ex.: access-denied-alerts, analyze-call, analyze-conversation, bitrix24-oauth, bitrix24-sync, calculate-deal-health, detect-stuck-deals, email-bulk-retry, email-bulk-send, email-composer-bulk, helpdesk-sync, mine-win-loss-patterns, notify-v4-quote-status, process-cadence-tasks, revenue-forecast-ai), não apenas cron/background como recomendado.
- **Revisão:** sem contestação cética concluída.

### F2881 · RLS habilitado em 380+ tabelas, políticas não auditadas

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Todas as tabelas têm rls_enabled = true, mas políticas não foram avaliadas; tabela com linhas pode estar invisível ao usuário.
- **Fontes:** `docs/estado/02_DOMINIO_CRM_PIPELINE.md:237-238`
- **O que falta:** Auditoria exaustiva de pg_policies para as tabelas do domínio CRM/Pipeline ainda não amostradas nesta verificação, para eliminar risco de tabela com RLS 'invisível' ao usuário final.
- **Evidência:** RLS 100% confirmado (tables.md, 408/408). Auditoria por amostragem feita agora nas tabelas-núcleo do domínio CRM/Pipeline usadas pelo front (tables/public/sales.md, clients.md, pipelines.md, pipeline_stages.md): todas têm policies de SELECT/INSERT por papel bem formadas (is_admin_or_manager, auth.uid()=user_id, client_portfolio), não placeholders. Porém a auditoria completa das 380+ tabelas citadas no doc não foi refeita tabela por tabela nesta verificação.
- **Revisão:** sem contestação cética concluída.

### F2886 · RLS/REVOKE em _internal_secrets e avaliação de migração para vault.secrets

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Tabela de segredos deve ter RLS/REVOKE; recomenda avaliar Supabase Vault.
- **Fontes:** `docs/SECRETS_ROTATION.md:47-53`
- **O que falta:** Executar REVOKE das permissões de anon/authenticated em _internal_secrets (defense-in-depth, hoje só a policy RLS bloqueia) e documentar/realizar a avaliação de migração para vault.secrets recomendada em docs/SECRETS_ROTATION.md:50-53.
- **Evidência:** tables/public/internal_secrets.md: existe 1 policy 'Deny all access to _internal_secrets' (ALL, roles anon+authenticated, USING false / WITH CHECK false) — mitigação por RLS. Porém grants.md ainda lista GRANT DELETE/INSERT/REFERENCES/SELECT/TRIGGER/UPDATE para anon e authenticated na tabela (REVOKE não foi aplicado, só a policy de RLS). Nenhuma menção a _internal_secrets em docs/contexto/supabase/vault.md — não há evidência de avaliação/migração para vault.secrets.
- **Revisão:** sem contestação cética concluída.

### F2887 · RP ID do WebAuthn definido no servidor

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** RP ID vem do cliente (webauthn/index.ts:144-145).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:142`
- **O que falta:** Fixar RP_ID por variável de ambiente no edge (um valor por domínio de produção), em vez de aceitar body.rpId/header do cliente como fonte primária.
- **Evidência:** supabase/functions/webauthn/index.ts:144 — `const rpId = body.rpId|\| req.headers.get(RP_ID_HEADER) \|\| new URL(req.url).hostname;` — o valor enviado pelo cliente (`body.rpId`) tem prioridade. supabase/functions/_shared/webauthn-helpers.ts:25-26 confirma no próprio comentário: 'O rpId vem do cliente (hostname da página)'. Não há env var RP_ID no edge (`grep -rn "RP_ID" supabase/` só mostra o header/body, sem default fixo por ambiente). Mitigação existente: `expectedOrigins()` só aceita o Origin do request se o host bater com o rpId informado ou for localhost — reduz mas não elimina o controle do cliente sobre o RP ID aceito.
- **Revisão:** sem contestação cética concluída.

### F2902 · Security Advisor: 0 ERROR; WARN pendentes (214 authenticated_security_definer_function_executable, 21 anon_*, 8 function_search_path_mutable, 1 materialized_vi…

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Advisors oficiais lidos em 2026-11-13 14:36 UTC: 247 itens, 0 ERROR; WARNs listados; 2 INFO rls_enabled_no_policy.
- **Fontes:** `docs/prod-readiness.md:1012`
- **O que falta:** corrigir os security definer com grants amplos, os 8 function_search_path_mutable e ligar leaked password protection; sem acesso direto ao MCP de advisors desta sessão para reconfirmar em 20/11/2026, usei a leitura de 13/11/2026 já registrada no repo
- **Evidência:** docs/prod-readiness.md:1012 (linha B3): "Advisors oficiais lidos: segurança 247 itens, 0 ERROR (214 WARN authenticated_security_definer_function_executable, 21 anon_security_definer_function_executable, 8 function_search_path_mutable, 1 materialized_view_in_api, 1 auth_leaked_password_protection, 2 INFO rls_enabled_no_policy); server_time 2026-11-13 14:36:42 UTC" — bate com a descrição do item.
- **Revisão:** sem contestação cética concluída.

### F2903 · Segurança por campo (FLS) genérica

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** FLS genérica; só a máscara de custo na view sales_with_markup.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/B_funcionalidades_docs.md:30`
- **O que falta:** criar mecanismo de FLS reutilizável (view builder/policy por coluna) em vez de repetir CASE WHEN view a view; hoje só sales_with_markup tem máscara
- **Evidência:** views.md:679-724 confirma `public.sales_with_markup` como única view que mascara custo por papel ("mascara custos absolutos para vendedores"). Busca por outro mecanismo genérico de ocultação de coluna por papel em supabase/migrations/*.sql não encontrou nenhum outro caso.
- **Revisão:** sem contestação cética concluída.

### F2905 · Tokens Twilio/Meta fora de texto puro

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Tokens Twilio e Meta em texto puro legíveis por qualquer manager (mig 20260417112931:19-21).
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:132`
- **O que falta:** migrar os tokens Twilio/Meta existentes para integration_secret_refs/vault e então restringir a policy de SELECT para não expor a managers
- **Evidência:** supabase/migrations/20260417112931_1cd3847f-...sql:1-21 — channel_credentials.credentials jsonb guarda tokens em texto puro; policy :20-22 permite SELECT a owner_id=auth.uid() OR is_admin_or_manager(auth.uid()) (managers continuam lendo). supabase/functions/_shared/secret-refs.ts:1-70 adiciona mecanismo novo (integration_secret_refs + resolveChannelCredentials) para mover campos a env:/internal:, mas é opt-in por chave: comentário :9-11 diz "credenciais antigas seguem funcionando até serem migradas".
- **Revisão:** sem contestação cética concluída.

### F2907 · Visibilidade do menu não é RBAC (AppSidebar.tsx:325 só esconde adminOnlyItems)

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** AppSidebar.tsx:325 só esconde adminOnlyItems quando userType === "admin"; itens <Manager> (/analytics, /relatorios, /metas) aparecem para qualquer papel e são barrados só no ProtectedRoute → usuário vai para /acesso-negado.
- **Fontes:** `docs/estado/01_FRONTEND_ROTAS.md:299-299`
- **O que falta:** filtrar os itens de menu Manager-only por papel antes de renderizar, não só pelo ProtectedRoute da rota
- **Evidência:** src/components/organisms/AppSidebar.tsx:287-299 só filtra adminOnlyItems quando userType==='admin'; groupedItems (inclui itens que levam a rotas Manager) renderiza sem checagem de papel. grep por requireAdminOrManager em sidebarMenuData.ts/AppSidebar.tsx → 0 resultados. src/routes/AppRoutes.tsx:203 confirma que o bloqueio real só existe no ProtectedRoute requireAdminOrManager (nível de rota), redirecionando para /acesso-negado.
- **Revisão:** sem contestação cética concluída.

### F2909 · Zero tabelas com RLS sem nenhuma policy

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** `not exists (pg_policies)` = 0 tabelas.
- **Fontes:** `docs/estado/08_ADMIN_SEGURANCA.md:69`
- **O que falta:** criar policy deny-all explícita (ou documentar a intenção) para public.webhook_dispatch_rate, hoje a única tabela com RLS habilitado e zero policies
- **Evidência:** Snapshot de produção 20/11/2026, tables.md: filtrando RLS='sim' e policies='0' aparece 1 linha — public.webhook_dispatch_rate. tables/public/webhook_dispatch_rate.md confirma 0 policies, sem comentário de intenção (diferente de webhook_events, que tem 1 policy deny-all documentada). As tabelas que motivaram a PR #424 (daily_challenge_rotations, geocode_cache) já aparecem corrigidas (1 policy cada).
- **Revisão:** sem contestação cética concluída.

### F2912 · Convenção: edges validam JWT via getClaims() de _shared

- **Tipo:** Service/lib
- **O que os docs afirmam:** Todas as edges (exceto webhooks públicos) validam JWT via getClaims() conforme padrão em _shared/.
- **Fontes:** `docs/SECURITY_HARDENING.md:106-112`
- **O que falta:** atualizar docs/SECURITY_HARDENING.md:106-108 (convenção real é getUserClient/getUser, mais segura, não getClaims); confirmar padrão de auth das ~58 functions que não usam getUserClient
- **Evidência:** getClaims só aparece em supabase/functions/_shared/auth-client.ts dentro de um COMENTÁRIO explicando por que NÃO usar (:50-52: getUser() valida assinatura no servidor; getClaims só decodifica localmente, token forjado passaria). O helper real é getUserClient (usa auth.getUser), usado em 113/171 functions. docs/SECURITY_HARDENING.md:106-108 ainda descreve a convenção como getClaims(), o que está errado.
- **Revisão:** sem contestação cética concluída.

### F2914 · Etapa canônica 26/08 nº 51: Parametrizar os 12 scripts secretos (env/Vault; dry-run; recusa sem project ref)

- **Tipo:** Service/lib
- **O que os docs afirmam:** Etapa canônica 51 (plano 26/08, matriz de status 30/08, estado 🟡): gitleaks limpo no HEAD; parametrização já presente; pendente dry-run e recusa sem project ref.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:196-196`
- **O que falta:** adicionar flag --dry-run aos scripts/seed-_.ts e checagem explícita de project ref antes de permitir escrita; scripts/remove-demos_.ts não existe
- **Evidência:** requireSupabaseAdminEnv.ts:19-34 valida HTTPS (exceto loopback) e :36-42 exige CONFIRM_SUPABASE_ADMIN_WRITE=EXECUTAR_ESCRITA_ADMINISTRATIVA (cobre parametrização+confirmação). grep por dry-run/dryRun em scripts/ → nenhum nos seed-_.ts; grep por projectRef/PROJECT_REF em scripts/lib e seed-_.ts → 0. scripts/remove-demos*.ts citado nos artefatos esperados não existe no repo. docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:196 já registrava exatamente este estado.
- **Revisão:** sem contestação cética concluída.

### F2915 · getCorsHeaders em 172/172 (report-embed-public com *)

- **Tipo:** Service/lib
- **O que os docs afirmam:** P067 P: 149/172; report-embed-public com * literal.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:162`
- **O que falta:** migrar check-quote-expiration, twilio-call-status e twilio-call-twiml para getCorsHeaders (ou documentar exceção); hoje é 167/171, não 172/172
- **Evidência:** Varredura em todos os index.ts de supabase/functions: 4 sem getCorsHeaders (check-quote-expiration, report-embed-public, twilio-call-status, twilio-call-twiml) de 171 — 167/171. report-embed-public/index.ts:141,148,166,173,180,324 usa '*' literal, exatamente como descrito (embed público intencional).
- **Revisão:** sem contestação cética concluída.

### F2916 · Rate limiter compartilhado trata Bearer sintaticamente válido como autenticado sem verificar JWT

- **Tipo:** Service/lib
- **O que os docs afirmam:** Doc: limitador compartilhado aceita Bearer ey... como autenticado sem validação; proteção por instância e dependente de cabeçalhos de IP.
- **Fontes:** `docs/auditoria/VALIDACAO_EXAUSTIVA_ONDA_0_2026-08-26.md:73-74`
- **O que falta:** validar o JWT com getUser() antes de usar seu sub como chave de rate-limit; adicionar teste negativo com Bearer forjado
- **Evidência:** supabase/functions/_shared/rate-limit.ts:63-83 rateLimitUserKey extrai 'sub' do Bearer com atob SEM verificar assinatura (comentário admite isso), usado como chave de bucket em supabase/functions/ai-copilot/index.ts:20 antes de qualquer validação real de auth. O campo bypassAuthenticated (:25) é declarado mas nunca lido em checkRateLimit/enforceRateLimit (dead code) — não há bypass total, mas também não há verificação de assinatura antes de usar o sub como chave. Não existe arquivo de teste para rate-limit.ts.
- **Revisão:** sem contestação cética concluída.

### F2917 · Sanitização de objetos de erro antes de console.error

- **Tipo:** Service/lib
- **O que os docs afirmam:** Ressalva: erros do Supabase/WebAuthn podem conter detalhes de requisição; sanitizar antes de logar (168 console.*).
- **Fontes:** `docs/auditoria/RELATORIO_FALHAS.md:118-120`
- **O que falta:** proibir no eslint console.error/warn diretos fora de src/lib/log/logger.ts e migrar os 65 arquivos restantes
- **Evidência:** src/lib/log/logger.ts:36-67 sanitiza com maskFreeText antes de console.error/warn. Mas eslint.config.js:66 define 'no-console': ['error', {allow:['warn','error']}] — console.error/warn crus continuam permitidos fora do logger (contradiz comentário em logger.ts:4). 65 arquivos em src/ têm console.error fora do logger central, não sanitizados.
- **Revisão:** sem contestação cética concluída.

### F3898 · Service/lib check-no-committed-service-role (2 afirmações nos docs)

- **Tipo:** Service/lib
- **O que os docs afirmam:** Scanner ampliado para bloquear novas atribuições literais de segredos operacionais além de service_role.| Garante que service_role não está commitada; só em package.json.
- **Fontes:** `docs/execucao/RECONCILIACAO_GITHUB_SUPABASE_2026-08-31.md:129,157`, `docs/AUTOMACAO_LOCAL.md:118`
- **O que falta:** scripts/security/check-no-committed-service-role.ts existe mas nenhum import encontrado (grep)
- **Evidência:** scripts/security/check-no-committed-service-role.ts existe mas nenhum import encontrado (grep)
- **Revisão:** sem contestação cética concluída.

### F3900 · Service/lib requireSupabaseAdminEnv (3 afirmações nos docs)

- **Tipo:** Service/lib
- **O que os docs afirmam:** remove-demos*.ts ×5, seed-*.ts ×6 e run-win-loss-analysis.ts continham JWT service_role do destino no commit b722848dd5; no HEAD leem env via scripts/lib/requireSupabaseAdminEnv (remediação em 648dcc9d4).| P014 P: --project-ref em deploy.yml; requireSupabaseAdminEnv não confere o ref. \| Etapa 51 P: scripts/lib/requireSupabaseAdminEnv.ts; scanner próprio check-no-committed-service-role.ts; falta dry-run e gitleaks.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:96-96`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:124`, `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:55`
- **O que falta:** scripts/lib/requireSupabaseAdminEnv.ts existe mas nenhum import encontrado (grep)
- **Evidência:** scripts/lib/requireSupabaseAdminEnv.ts existe mas nenhum import encontrado (grep)
- **Revisão:** sem contestação cética concluída.

### F2921 · Consent management integrado

- **Tipo:** Tabela/view/coluna
- **O que os docs afirmam:** Falta gestão de consentimento.
- **Fontes:** `docs/GAPS_CLASSE_MUNDIAL.md:189`
- **O que falta:** Criar UI/hook para registrar e revogar consentimento (consent_records) por titular; deployar twilio-call-twiml e twilio-click-to-call (incluir na allowlist deploy.yml:144) ou mover a checagem para function deployada.
- **Evidência:** Backend existe: public.consent_records com RLS e 4 policies (contexto/supabase/tables.md:102; tables/public/consent_records.md:64-94); RPCs has_active_consent/has_phone_consent (functions.md:248,250). Opt-out usado por send-multichannel-message/index.ts:290-293 (deployada, deploy.yml:144). Mas: nenhum código em src/ lê/escreve consent_records (grep -rln 'consent_records' src → só types.ts); has_phone_consent só é chamada por twilio-call-twiml/twilio-click-to-call, que NÃO estão na allowlist deploy.yml:144; consent_records tem 0 linhas (stats.md:188); docs/LGPD.md:112 'A UI para colher o consentimento do titular ainda é pendência de produto'. Única UI: revogação via fila do titular (src/pages/AdminSolicitacoesTitular.tsx:64,479).
- **Revisão:** sem contestação cética concluída.

### F2933 · Handoff P040: Suíte automatizada de segurança SQL (RLS, grants, views, SECURITY DEFINER)

- **Tipo:** Teste
- **O que os docs afirmam:** Fila canônica do handoff (onda 4): Suíte automatizada de segurança SQL (RLS, grants, views, SECURITY DEFINER). Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:331-331`
- **O que falta:** Adicionar asserção que lista funções SECURITY DEFINER em public fora de allowlist e grants a anon; incluir role_helpers_matrix_assertions.sql no run-sql-tests.sh; confirmar SUPABASE_DB_URL configurado para o tier remoto.
- **Evidência:** Suíte SQL existe: supabase/tests/rls_test_suite.sql, canonical_post_migration_assertions.sql (security_invoker :18-20; has_table_privilege/has_function_privilege :23-67), canonical_role_simulation.sql; executor scripts/run-sql-tests.sh:70-90 no job sql-tests de .github/workflows/pr-checks.yml:375-399. Faltam: nenhuma checagem de SECURITY DEFINER (grep -ciE 'definer\|prosecdef' supabase/tests/*.sql → 0 em todos exceto 1 menção em quote-to-sale-stress.sql); role_helpers_matrix_assertions.sql e db01_default_acl_assertions.sql não são executados (grep em run-sql-tests.sh → 0); tier remoto só roda com secret SUPABASE_DB_URL (pr-checks.yml:383; presença do secret NÃO VERIFICADA); não há workflow _security_ dedicado (ls .github/workflows| grep -i secur → 0).
- **Revisão:** sem contestação cética concluída.

### F2936 · Matriz de acesso RLS por role testada

- **Tipo:** Teste
- **O que os docs afirmam:** Etapa 37: testar RLS/authorization com múltiplos papéis.
- **Fontes:** `docs/auditoria/00_PLANO_MESTRE_AUDITORIA.md:118`
- **O que falta:** Gerar teste (SQL com set_config request.jwt.claims por usuário de cada app_role ou E2E com sessões por role) cobrindo a matriz de docs/RLS_MATRIX.md; ligar role_helpers_matrix_assertions.sql ao run-sql-tests.sh.
- **Evidência:** Existe cobertura parcial: tests/e2e/rls-scope-salesperson.spec.ts:16,207-229 (só salesperson; pula se admin/manager), tests/e2e/rls-authorization-edge-cases.spec.ts:45-82 (só anon), supabase/tests/canonical_role_simulation.sql:8,169 (roles de banco anon/authenticated, não app_role), docs/RLS_MATRIX.md. supabase/tests/role_helpers_matrix_assertions.sql não é executado (grep em scripts/run-sql-tests.sh → 0). Não há teste por role admin/manager/demais app_role na matriz tabela×role.
- **Revisão:** sem contestação cética concluída.

### F2938 · Plano 30/08 etapa 40 (P040): Suíte automatizada de segurança SQL (RLS, grants, views, SECURITY DEFINER)

- **Tipo:** Teste
- **O que os docs afirmam:** Etapa 40 do plano de 100 etapas (auditoria 30/08; = P040 do handoff): Teste obrigatório no CI com personas anon, auth, admin e service-role.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:695-695`
- **O que falta:** Adicionar asserção de SECURITY DEFINER (prosecdef em public × allowlist e EXECUTE para anon) e confirmar o secret SUPABASE_DB_URL para que o tier remoto rode de fato.
- **Evidência:** Mesmo artefato de F2933: suítes em supabase/tests/*.sql executadas por scripts/run-sql-tests.sh:70-90 no job sql-tests (.github/workflows/pr-checks.yml:375-399) cobrindo RLS, grants e security_invoker (canonical_post_migration_assertions.sql:18-67); sem checagem de SECURITY DEFINER (grep → 0), sem workflow _security_, tier remoto depende de SUPABASE_DB_URL (pr-checks.yml:383, NÃO VERIFICADO).
- **Revisão:** sem contestação cética concluída.

### F2942 · Teste authz_hardening_contract_test.ts movido para tests/migrations/

- **Tipo:** Teste
- **O que os docs afirmam:** Teste Deno movido de supabase/migrations/ para tests/migrations/.
- **Fontes:** `docs/execucao/MIGRATION_RENAME_MAP.md:41-47`
- **O que falta:** Adicionar passo 'deno task test:migrations' no job Deno de .github/workflows/pr-checks.yml (perto da linha 366) para o contrato rodar em todo PR.
- **Evidência:** Arquivo está em tests/migrations/authz_hardening_contract_test.ts e passa (deno test local nesta sessão: '5 passed| 0 failed'); task deno.json:4 'test:migrations'. Porém nenhum workflow executa tests/migrations (grep -rn 'tests/migrations\|test:migrations' .github/workflows → 0) e scripts/deno-test-suite.mjs:29 só varre supabase/functions.
- **Revisão:** sem contestação cética concluída.

### F2944 · Testes de admin/segurança/settings (admin 0/59, security 0/20, settings 0/27)

- **Tipo:** Teste
- **O que os docs afirmam:** Diretórios sem nenhum teste.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/G_infra_ci_integracoes.md:103`
- **O que falta:** Escrever testes Vitest para os componentes críticos: admin (ex.: AdminSystemStatus.tsx), settings e security (além de KnownDevices), cobrindo estados loading/erro/vazio e handlers.
- **Evidência:** find src/components/admin -name '_.test._' → 0 (54 componentes); src/components/settings → 0 (25 componentes); src/components/security → 1 (src/components/security/KnownDevices.test.tsx, de 19 componentes); nenhum teste em src importa @/components/(admin\|security\|settings)/ (grep → 0).
- **Revisão:** sem contestação cética concluída.

### F3912 · log_audit_event (versão trigger) insere em audit_log com colunas que não batem

- **Tipo:** Trigger
- **O que os docs afirmam:** Versão trigger usa resource_type/resource_id em audit_log — colunas não conferem.
- **Fontes:** `docs/estado/08_ADMIN_SEGURANCA.md:216`
- **O que falta:** função log_audit_event existe mas nenhum trigger a executa (triggers.md)
- **Evidência:** função log_audit_event existe mas nenhum trigger a executa (triggers.md)
- **Revisão:** sem contestação cética concluída.

### F2948 · Trilha de auditoria de export (LGPD)

- **Tipo:** Trigger
- **O que os docs afirmam:** Auditoria de exportações.
- **Fontes:** `docs/benchmark/RAMPER_2026-07.md:182`
- **O que falta:** Centralizar a auditoria de export num helper que chame log_audit_event e aplicá-lo a todos os exports (CSV/Excel/PDF, export-winloss-pdf, AuditLogsPage). Tratar a falha do log.
- **Evidência:** A tabela export_audit_logs não existe no banco: grep export_audit em tables.md → 0 resultados. Só um export grava auditoria: src/pages/ImportExport.tsx:143-152 chama logAudit EXPORT_DATA via useLogAuditEvent (src/hooks/admin/useAuditLogs.ts:51-70) → RPC log_audit_event, que grava em public.audit_logs com auth.uid() (functions/public/log_audit_event__e0f517bdeb1e80fa.sql:20-26). A chamada não é aguardada e uma falha passa em silêncio. Os outros ~35 arquivos de src com export CSV/Excel/PDF não auditam: grep 'useLogAuditEvent\|log_audit_event' em src → só ImportExport.tsx e useAuditLogs.ts. Isso inclui o próprio exportAuditLogsToCSV (useAuditLogs.ts:73).| cético: Confirmado. Não há export_audit_logs em tables.md (grep → 0). O único chamador de useLogAuditEvent é src/pages/ImportExport.tsx:20,50,143-152 (logAudit EXPORT_DATA sem await), e a rota está montada em src/routes/AppRoutes.tsx:920.…

### F2952 · Etapa 24: persist-credentials: false em todos os actions/checkout

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Nenhum job faz push.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:64`
- **O que falta:** Adicionar persist-credentials: false aos 33 checkouts restantes e manter o token só nos jobs que fazem push.
- **Evidência:** Há 44 usos de actions/checkout em .github/workflows e só 11 têm 'persist-credentials: false' (contagem por grep). Têm: automation-local.yml:31, contexto-testes.yml:56, contexto.yml:87,126,194,285,316, dependency-review.yml:29, inventario-estado-semanal.yml:51, types-sync.yml:60,152. Não têm: pr-checks.yml (15 checkouts, ex.: :41,:76,:99), deploy.yml:67,122, quote-to-sale-e2e.yml:45,70,111, codeql.yml:36, main.yml:40, migrations-drift.yml:51, a11y-sweep.yml:35 e outros.| cético: Confirmado. grep -c 'actions/checkout' .github/workflows/*.yml dá 44 no total. grep 'persist-credentials: false' dá 11, distribuídos assim: contexto.yml 5, types-sync.yml 2, automation-local 1, contexto-testes 1, dependency-review 1, inventario-estado-semanal 1. pr-checks.yml, deploy.yml, codeql.yml, main.yml e outros não têm nenhum.

### F2953 · Etapa 26: permissions: {} no workflow e mínimas por job

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Princípio do menor privilégio.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:66`
- **O que falta:** Trocar o topo dos 27 workflows por 'permissions: {}' e declarar permissões mínimas por job. Prioridade: os 9 workflows com algum write no topo.
- **Evidência:** Nenhum workflow declara 'permissions: {}' no topo: grep -rn 'permissions: {}' .github/workflows → 0 resultados. Todos os 27 workflows usam 'contents: read' no topo (ex.: pr-checks.yml:14, deploy.yml:43), e 3 usam 'contents: write' no topo: dependabot-automerge.yml:18, dependabot-fix-lockfile.yml:15, release-please.yml:13. O topo já é restritivo, mas não segue o padrão vazio + permissões mínimas por job.| cético: O veredito se confirma, mas a evidência original está imprecisa: não é verdade que todos os workflows tenham só 'contents: read' no topo. Há escrita no topo também em codeql.yml:22 (security-events: write), cron-monitoring.yml:25, edge-functions-bundle.yml:25, pr-checks.yml:16 e quote-to-sale-e2e.yml:27 (actions: write), e pr-review-sla.yml:15 (pull-requests: write), além de dependabot-automerge.yml:19-20, dependabot-fix-lockfile.yml:16 e release-please.yml:14-15 (contents: writ…

### F2955 · Etapa 40: nenhum job de PR de fork/Dependabot recebe secret (auditar if:)

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Guardas de fork.
- **Fontes:** `docs/estado/PLANO_CI_WORKFLOWS_2026-10-01.md:84`
- **O que falta:** Adicionar a guarda head.repo.full_name == github.repository aos jobs com secrets (deno-tests, sql-tests, gen-types-drift e os de migrations-drift/types-sync/codeql). Auditar dependabot-fix-lockfile.yml (pull_request_target).
- **Evidência:** Alguns jobs de PR com secrets não têm guarda explícita de fork no if:. pr-checks.yml:341 deno-tests usa só has-code (env com SUPABASE_SERVICE_ROLE_KEY em :346); sql-tests usa só has-code (:381, SUPABASE_DB_URL em :384); gen-types-drift usa só event_name + has-code (:677, SUPABASE_ACCESS_TOKEN em :690). O mesmo vale para migrations-drift.yml, types-sync.yml e codeql.yml, que usam secrets sem guarda (forkguard=0 por grep). Exceções protegidas: e2e só roda em workflow_dispatch com environment pr-preview (pr-checks.yml:470-471), e dependency-review tem guarda (:25). Hoje a proteção depende do padrão do GitHub de não entregar secrets em pull_request de fork; dependabot-fix-lockfile.yml:6 usa pull_request_target.| cético: Confirmado em pr-checks.yml. deno-tests (:341) usa só has-code e envia secrets em :344-346 (incluindo SUPABASE_SERVICE_ROLE_KEY). sql-tests (:381) usa só has-code, com secre…

### F2956 · Gate de CI para nova função SECURITY DEFINER (ADR-008)

- **Tipo:** Workflow CI
- **O que os docs afirmam:** NÃO VERIFICÁVEL por PR: template de checklist; tests/e2e/security-definer-rpc-access.spec.ts existe.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:407`
- **O que falta:** Adicionar ao check-migrations.mjs uma regra para migration nova com SECURITY DEFINER, exigindo SET search_path e REVOKE de anon/PUBLIC ou entrada na allowlist do ADR-008. Opcionalmente, ligar o spec ao CI.
- **Evidência:** tests/e2e/security-definer-rpc-access.spec.ts existe, mas se pula sem PGHOST (:23,:29,:70). Nenhum workflow define PGHOST: grep PGHOST .github/workflows → 0 resultados. O job e2e só roda em workflow_dispatch (pr-checks.yml:470). scripts/check-migrations.mjs:1-19 não verifica SECURITY DEFINER: grep -i 'definer\|invoker' scripts/check-migrations.mjs → 0 resultados. .github/pull_request_template.md não menciona definer: grep -i definer → 0 resultados. O ADR existe em docs/decisions/ADR-008-anon-executable-security-definer.md.| cético: Confirmado. scripts/check-migrations.mjs:1-19 lista só as regras 1-6 (nome, unicidade, vazio, versão crescente, RLS em CREATE TABLE, literais proibidos); grep -i 'definer\|invoker' → 0 resultados. grep -rn PGHOST .github/workflows → 0 resultados, então o spec de definer nunca roda no CI. grep -i definer .github/pull_request_template.md → 0 resultados. grep -r…

### F2958 · Handoff P006: Ampliar scanner de segredos (hex, URLs de banco, service-role)

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Fila canônica do handoff (onda 1): Ampliar scanner de segredos (hex, URLs de banco, service-role). Todas as etapas começam pendentes; 0 de 100 executadas na data do handoff. Gate(s) conforme §13.
- **Fontes:** `docs/handoff/HANDOFF_CLINE_EXECUCAO_PLANO_100_ETAPAS_2026-08-30.md:282-282`
- **O que falta:** Adicionar padrões de URL de banco com senha e de hex longo sem nome, mais um teste de regressão com o hex de 48 do migrate-helper e um JWT service_role.
- **Evidência:** scripts/security/check-no-committed-service-role.ts roda em todo PR (package.json:47; pr-checks.yml:134-135). Cobre JWT com role service_role (:17,:38-48,:65-73), sb_secret_ literal (:18) e hex com 32+ caracteres, mas só quando atribuído a const/let/var com nome contendo ACCESS_KEY\|SECRET\|TOKEN\|PASSWORD\|PRIVATE_KEY (:19-20). Não detecta hex solto ou em outro nome de variável, nem URLs postgres:// (grep -n postgres scripts/security → 0 resultados). Não há teste de regressão: grep check-no-committed-service-role em _.test._ → 0 resultados. Não há .gitleaks.toml.| cético: Confirmado. scripts/security/check-no-committed-service-role.ts:17-20 tem 3 padrões: JWT, sb_secret_, e hex de 32+ só quando atribuído a const/let/var com nome _ACCESS_KEY\|SECRET\|TOKEN\|PASSWORD\|PRIVATE_KEY_. Não há padrão postgres://. A pasta scripts/security tem só esse arquivo e não há teste que o referencie (gr…

### F2959 · Plano 30/08 etapa 6 (P006): Ampliar scanner de segredos (hex, URLs de banco, service-role)

- **Tipo:** Workflow CI
- **O que os docs afirmam:** Etapa 6 do plano de 100 etapas (auditoria 30/08; = P006 do handoff): Ampliar o scanner de segredos para hexadecimal, URLs de banco, service-role e chaves fora dos padrões; teste de regressão que detecta o incidente.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:652-652`
- **O que falta:** O mesmo do F2958.
- **Evidência:** É o mesmo artefato do F2958. scripts/security/check-no-committed-service-role.ts:17-20 cobre JWT service_role, sb_secret_ e hex só em atribuição nomeada. Não cobre postgres:// nem 'chaves fora dos padrões'. Não há teste de regressão: grep check-no-committed-service-role em _.test._ → 0 resultados. O último commit no arquivo é 400e2ba30 (#80).| cético: Mesmo artefato do F2958, mesma evidência: check-no-committed-service-role.ts:17-20 não tem padrão de URL de banco nem de chave fora dos nomes listados, e não há teste de regressão.

### F2961 · Scanner npm run security:secrets não detecta chave hexadecimal fixa

- **Tipo:** Workflow CI
- **O que os docs afirmam:** security:secrets aprovado mas incompleto: não detectou a chave fixa de migrate-helper (hex de 48 caracteres).
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:73-90`
- **O que falta:** Detectar hex de 40+ caracteres em qualquer literal (com allowlist de SHAs e lockfile), adicionar o padrão postgres:// e um teste que reproduza o caso do migrate-helper.
- **Evidência:** O script existe e roda no CI (package.json:47; pr-checks.yml:134-135). O hex só é detectado com 32+ caracteres atribuído a variável com nome _SECRET/TOKEN/ACCESS_KEY/PASSWORD/PRIVATE_KEY_ (check-no-committed-service-role.ts:19-20). Uma chave hex de 48 em outro nome (ex.: header ou objeto literal) não é detectada. Não há padrão de URL de banco nem teste de regressão: grep em _.test._ → 0 resultados.| cético: Confirmado. package.json:47 aponta security:secrets para tsx scripts/security/check-no-committed-service-role.ts, que roda em pr-checks.yml:133-134. O hex só é pego em atribuição nomeada (:19-20), então um hex de 48 em header ou objeto literal passa. Sem teste de regressão.

### F2962 · SEC-08: functions sem service_role crua e gate de CI

- **Tipo:** Workflow CI
- **O que os docs afirmam:** 90 de 172 functions usam a chave crua; sem gate de CI.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/README.md:271`
- **O que falta:** Criar um script que reprove Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') fora de _shared/, com allowlist ratchet das 90 atuais, ligá-lo ao edge-functions-lint e migrar as functions.
- **Evidência:** O helper existe (supabase/functions/_shared/auth-client.ts) e o doc também (docs/SEC-08_SERVICE_ROLE_AUDIT.md). Mas 90 index.ts ainda leem SUPABASE_SERVICE_ROLE_KEY direto (grep -rl SUPABASE_SERVICE_ROLE_KEY supabase/functions/_/index.ts| wc -l → 90). O gate segue pendente: docs/SEC-08_SERVICE_ROLE_AUDIT.md:64 diz 'Rejeição CI se SUPABASE_SERVICE_ROLE_KEY for usado sem getServiceClient \| ⏳ Fase 3'. Nenhum workflow ou script de edge verifica isso: grep SERVICE_ROLE .github/workflows/edge-functions-_.yml → 0 resultados. \| cético: Confirmado. grep -rl SUPABASE_SERVICE_ROLE_KEY supabase/functions/*/index.ts \| wc -l → 90. docs/SEC-08_SERVICE_ROLE_AUDIT.md:64 marca o gate de CI como '⏳ Fase 3'. Nas ocorrências de SERVICE_ROLE em scripts/ e .github/, nenhuma é gate: deno-test-suite.mjs:183 e gen-api-catalog.mjs:27 só leem a env, e pr-checks.yml:346 só injeta o secret. supabase/functions/_sh…

### F2963 · Varredura has_function_privilege(anon) de SECURITY DEFINER no CI

- **Tipo:** Workflow CI
- **O que os docs afirmam:** PARCIAL: ALTER DEFAULT PRIVILEGES (20260902121000); REVOKE pontual (20261001203300:53); 20261005140000 re-concede anon em 4 helpers.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:281`
- **O que falta:** Adicionar um bloco que percorra pg_proc (prosecdef, public) e falhe para função executável por anon fora da allowlist do ADR-008. Confirmar que o secret SUPABASE_DB_URL (pooler IPv4) está configurado.
- **Evidência:** Há só checagens pontuais de has_function_privilege('anon', …) para funções nomeadas em supabase/tests/canonical_post_migration_assertions.sql:55-86 e :197-214, executadas no CI por scripts/run-sql-tests.sh:73-75 no job sql-tests (pr-checks.yml:398-399). Elas só rodam se o secret SUPABASE_DB_URL existir; sem ele, viram warning e passam (run-sql-tests.sh:50-52). Não há varredura genérica de todas as funções com prosecdef=true executáveis por anon fora de uma allowlist. O spec tests/e2e/security-definer-rpc-access.spec.ts faria essa varredura, mas não roda no CI (exige PGHOST, :23,:70). Não dá para confirmar se SUPABASE_DB_URL está configurado (é secret).| cético: Confirmado. Os has_function_privilege('anon', …) de supabase/tests/canonical_post_migration_assertions.sql:55-86 e :197-217 são checagens pontuais de funções nomeadas. supabase/tests/db01_default_acl_assertions.sql:5-17 só checa …

## Não verificável (25)

### F2556 · ALLOWED_ORIGINS inclui domínio Vercel de produção

- **Tipo:** Doc/config
- **O que os docs afirmam:** DIVERGENTE: lista só promochampions.com.br + 2 lovable.app.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:346`
- **O que falta:** Ler o valor real de ALLOWED_ORIGINS no Supabase Dashboard (Edge Functions → Secrets). Não há acesso a esse painel.
- **Evidência:** Valor real do secret ALLOWED_ORIGINS em produção está no Supabase Dashboard, inacessível a este agente. README.md:107 (exemplo) não inclui domínio Vercel, mas é só exemplo. O fallback de código em cors.ts:24-32 já inclui https://promo-champions-v2-1.vercel.app.| cético: O valor do secret ALLOWED_ORIGINS só existe no painel de Edge Functions Secrets. O snapshot não exporta secrets (vault.md: '_nenhum_'; project-config.md: Management API desabilitada). O fallback de código em supabase/functions/_shared/cors.ts:27-28 inclui https://promo-champions-v2-1.vercel.app, mas só vale se o secret estiver ausente.

### F2564 · Checklist GoTrue (JWT ≤3600, refresh rotation, HIBP, rate limits, CAPTCHA, SMTP Resend) com evidência

- **Tipo:** Doc/config
- **O que os docs afirmam:** NÃO VERIFICÁVEL: só dashboard.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:387`
- **O que falta:** Acessar painel Supabase Auth e registrar evidência por release — acesso externo não disponível nesta sessão.
- **Evidência:** Checklist depende do painel Supabase Auth do projeto, inacessível a este agente. O próprio item já se autoclassifica como 'NÃO VERIFICÁVEL: só dashboard' (C_estado_runbooks.md:387).| CONTESTADO pelo cético (PARCIAL): Metade do item dá para verificar no repo. O checklist existe: docs/AUTH_CONFIG.md:1-55 cobre JWT ≤3600 (:14), refresh rotation (:15), HIBP (:23), rate limits (:27-32), CAPTCHA (:38) e SMTP Resend (:44-47). Mas nenhuma evidência foi registrada: `grep -niE 'evid\|20[0-9]{2}-[0-9]{2}\|conferido' docs/AUTH_CONFIG.md` só devolve a sugestão da linha 4 ('Conferir periodicamente… a cada release'), sem nenhum registro datado de valor conferido. Os valores reais seguem inacessíveis (contexto/supabase/auth.md: 'Configuração indisponível').
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F2567 · Config Auth do projeto: password policy, leaked-password protection, MFA habilitado

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc marca como não auditável a configuração de Auth (SINCRONIA depois confirmou proteção contra senhas vazadas desabilitada).
- **Fontes:** `docs/auditoria/AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:75,589`
- **O que falta:** Rodar o Security Advisor ou abrir o painel Auth de usyxfpqlsspldubptrdl. A Management API está indisponível.
- **Evidência:** Password policy, leaked-password protection e MFA são configs do painel Supabase Auth do projeto usyxfpqlsspldubptrdl, inacessíveis a este agente (ferramentas Supabase disponíveis são de outros projetos). Doc AUDITORIA_TECNICA_EXAUSTIVA_2026-09-02.md:75,589 já marca como pendente.| cético: O snapshot não tem a configuração de Auth: contexto/supabase/auth.md diz 'Configuração indisponível (Management API desabilitada)', project-config.md também, e lints.md não tem lint de leaked password. O último registro é histórico: docs/auditoria/VALIDACAO_SINCRONIA_GITHUB_SUPABASE_2026-09-10.md:164 ('proteção contra senhas vazadas desabilitada'), sem confirmação atual. supabase/config.toml não tem password_hibp nem mfa.

### F2608 · Have I Been Pwned (password_hibp_enabled) ON

- **Tipo:** Doc/config
- **O que os docs afirmam:** Bloqueia senhas vazadas.
- **Fontes:** `docs/AUTH_CONFIG.md:25`
- **O que falta:** acesso ao Supabase Dashboard (Authentication → 'Prevent use of leaked passwords') ou à Management API.
- **Evidência:** password_hibp_enabled é configuração do painel GoTrue (Supabase Dashboard), não exposta em config.toml nem migrations. auth.md confirma: 'Configuração indisponível (Management API desabilitada)'.
- **Revisão:** sem contestação cética concluída.

### F2615 · JWT expiry ≤ 3600 s (dashboard GoTrue)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Config server-side recomendada.
- **Fontes:** `docs/AUTH_CONFIG.md:12-14`
- **O que falta:** acesso ao Supabase Dashboard (Authentication → JWT settings) ou à Management API.
- **Evidência:** jwt_expiry não é definido em supabase/config.toml; auth.md confirma 'Configuração indisponível (Management API desabilitada)'.
- **Revisão:** sem contestação cética concluída.

### F2624 · Password HIBP Check ativo

- **Tipo:** Doc/config
- **O que os docs afirmam:** Verificação de senhas vazadas (Have I Been Pwned).
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:567-567`
- **O que falta:** Confirmar o toggle no painel Auth do Supabase Cloud (usyxfpqlsspldubptrdl) — fora do alcance desta verificação, já que a Management API estava desabilitada na coleta do snapshot. Nota: há conflito entre RELEASE_NOTES.md (diz ativo) e dois docs de auditoria (F2632/F2633, dizem desabilitado) — vale confirmar ao vivo e reconciliar.
- **Evidência:** supabase/config.toml não tem seção [auth] nem `password_hibp_enabled` (grep vazio) — a flag é configuração do painel Auth do Supabase Cloud, fora do repo. O snapshot oficial do banco real (fonte de verdade desta verificação) confirma em .../docs/contexto/supabase/auth.md: 'Configuração indisponível (Management API desabilitada).' Há evidência de código consistente com HIBP ativo (src/lib/auth/passwordErrorMessages.ts:5 'Ativado por password_hibp_enabled: true'; RELEASE_NOTES.md:11 'HIBP ativado'; tests/e2e/reset-password-hibp.spec.ts, que intercepta e simula a resposta — não testa o toggle real).
- **Revisão:** sem contestação cética concluída.

### F2632 · Proteção contra senha vazada (Auth)

- **Tipo:** Doc/config
- **O que os docs afirmam:** A.8 #5 NI: config de painel.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:363`
- **O que falta:** Confirmar no painel Auth do projeto usyxfpqlsspldubptrdl (Authentication → Policies → Password) — inacessível nesta verificação.
- **Evidência:** Mesma situação de F2624/F2633: configuração de Auth (proteção contra senha vazada) vive só no painel do Supabase Cloud. O snapshot oficial confirma: docs/contexto/supabase/auth.md → 'Configuração indisponível (Management API desabilitada).' supabase/config.toml não tem seção [auth].
- **Revisão:** sem contestação cética concluída.

### F2633 · Proteção contra senhas vazadas (leaked password protection) desabilitada

- **Tipo:** Doc/config
- **O que os docs afirmam:** Doc: Advisor aponta proteção contra senhas vazadas desabilitada no Auth; ativação não executada.
- **Fontes:** `docs/auditoria/VALIDACAO_SINCRONIA_GITHUB_SUPABASE_2026-09-10.md:164,201`
- **O que falta:** Confirmar estado real no painel Auth (Authentication → Policies) do projeto usyxfpqlsspldubptrdl e reconciliar com RELEASE_NOTES.md, que afirma o contrário.
- **Evidência:** Idêntico a F2624/F2632: setting de Auth no painel, fora do repo. Snapshot oficial (auth.md) confirma indisponibilidade de leitura da config de Auth no momento da coleta. Esta claim (desabilitada) contradiz RELEASE_NOTES.md:11 (que afirma ativado) — contradição interna da documentação que só se resolve olhando o painel ao vivo.
- **Revisão:** sem contestação cética concluída.

### F2636 · Rate limits de Auth (token, verify, sign-up, recovery)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Limites recomendados no dashboard.
- **Fontes:** `docs/AUTH_CONFIG.md:29-34`
- **O que falta:** Confirmar no painel Authentication → Rate Limits do projeto usyxfpqlsspldubptrdl — fora do alcance desta verificação.
- **Evidência:** Rate limits de Auth (token/verify/signup/recovery) são configuração do dashboard Supabase, fora do repo (supabase/config.toml não tem seção [auth] com rate_limit). docs/contexto/supabase/auth.md (snapshot oficial) confirma 'Configuração indisponível (Management API desabilitada)'.
- **Revisão:** sem contestação cética concluída.

### F2637 · Refresh token rotation ON e reuse interval ~10 s

- **Tipo:** Doc/config
- **O que os docs afirmam:** Config GoTrue recomendada.
- **Fontes:** `docs/AUTH_CONFIG.md:15-16`
- **O que falta:** Confirmar valores reais no painel Auth (Authentication → Sessions) do projeto usyxfpqlsspldubptrdl — fora do alcance desta verificação.
- **Evidência:** `grep -n 'refresh_token_rotation\\|refresh_token_reuse' supabase/config.toml` → 0 resultados; não há seção [auth] no config.toml deste repo (configuração GoTrue de produção vive só no painel Supabase). Snapshot oficial (auth.md) confirma indisponibilidade da config de Auth.
- **Revisão:** sem contestação cética concluída.

### F2656 · Secret ELEVENLABS_API_KEY (3 funções)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Lida em elevenlabs-tts/index.ts:39; existência NAO_VERIFICADA.
- **Fontes:** `docs/estado/06_DOMINIO_IA_COACHING.md:46,68`
- **O que falta:** Checar no painel Supabase (Edge Functions → Secrets) ou invocar a função e confirmar ausência de erro de env.
- **Evidência:** ELEVENLABS_API_KEY lido em 3 arquivos via Deno.env.get, inclusive elevenlabs-tts/index.ts:39. Existência do valor nos Secrets de Edge Functions do projeto não verificável nesta sessão (sem tool de listagem/painel).
- **Revisão:** sem contestação cética concluída.

### F2657 · Secret LOVABLE_API_KEY (30 funções)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Lida em ai-agent-orchestrator/index.ts:9 e 29 outras; existência NAO_VERIFICADA (fora do vault).
- **Fontes:** `docs/estado/06_DOMINIO_IA_COACHING.md:45,50-68`
- **O que falta:** Checar no painel Supabase ou invocar função de IA e confirmar ausência de erro de env.
- **Evidência:** LOVABLE_API_KEY lido em 46 arquivos (grep atual), incl. ai-agent-orchestrator/index.ts:11. docs/estado/06_DOMINIO_IA_COACHING.md:50-60 já registra NAO_VERIFICADO; vault.secrets vazio é irrelevante (secrets de Edge Function vivem fora do Postgres).
- **Revisão:** sem contestação cética concluída.

### F2662 · Segredo ADMIN_NOTIFICATION_EMAIL lido por 2 edge function(s)

- **Tipo:** Doc/config
- **O que os docs afirmam:** E-mail de admin para notificações. Doc extrai via grep de Deno.env.get; não verifica se o segredo está configurado no projeto.
- **Fontes:** `docs/estado/10_EDGE_FUNCTIONS.md:125-145`
- **O que falta:** Checar painel Supabase ou invocar as 2 funções e confirmar ausência de erro de env.
- **Evidência:** grep confirma exatamente 2 funções próprias lendo ADMIN_NOTIFICATION_EMAIL diretamente (winloss-webhook-health-monitor/index.ts, notify-critical-pattern/index.ts; o 3º match é _shared/alert-escalation.ts, código compartilhado). Existência do secret na plataforma não verificável nesta sessão.
- **Revisão:** sem contestação cética concluída.

### F2663 · Segredo SUPABASE_SERVICE_ROLE_KEY lido por 122 edge function(s)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Bypass total de RLS em 73% das funções. Doc extrai via grep de Deno.env.get; não verifica se o segredo está configurado no projeto.
- **Fontes:** `docs/estado/10_EDGE_FUNCTIONS.md:125-133`
- **O que falta:** Reexecutar a extração exata do doc-fonte e checar no painel se o secret está configurado.
- **Evidência:** Contagem exata de 122 não reproduzida: grep direto em index.ts → 90; incluindo uso indireto via getServiceClient de _shared/auth-client.ts → união de 138. Existência do secret na plataforma não verificável nesta sessão.
- **Revisão:** sem contestação cética concluída.

### F2665 · Senha mínima ≥ 8 e complexidade no GoTrue

- **Tipo:** Doc/config
- **O que os docs afirmam:** Config server-side de senha.
- **Fontes:** `docs/AUTH_CONFIG.md:21-24`
- **O que falta:** Checar Authentication → Sign In/Providers → Email no dashboard Supabase do projeto usyxfpqlsspldubptrdl.
- **Evidência:** docs/AUTH_CONFIG.md:21-24 deixa explícito que são configs do dashboard GoTrue, não do código. supabase/config.toml não tem bloco [auth] com esses campos. Snapshot real (contexto/docs/contexto/supabase/auth.md): 'Configuração indisponível (Management API desabilitada)'.
- **Revisão:** sem contestação cética concluída.

### F2672 · Token do gateway MCP renovado e token colado no chat revogado (B8)

- **Tipo:** Doc/config
- **O que os docs afirmam:** Gateway devolvia 401; dono salvou access token no ambiente; o token colado no chat em 2026-11-13 deve ser revogado e trocado.
- **Fontes:** `docs/prod-readiness.md:1016`
- **O que falta:** Checar no painel Cloudflare Workers e no painel Supabase Access Tokens se o token colado no chat em 2026-11-13 ainda é válido; revogar se sim.
- **Evidência:** docs/prod-readiness.md:1024 (B8) registra contorno em 2026-11-13 e pendência de revogar o token colado no chat. Confirmar a renovação/revogação exige o painel de Access Tokens do Supabase e o secret do Worker Cloudflare; esta sessão não tem esse acesso (ferramentas MCP de Supabase disponíveis são de outros projetos, e o egress para usyxfpqlsspldubptrdl.supabase.co é bloqueado pelo proxy, 403).
- **Revisão:** sem contestação cética concluída.

### F2673 · Token interno expirado nas chamadas banco→edge (117× 401 invalid_or_expired_token, 25× 401 unauthorized) — B18

- **Tipo:** Doc/config
- **O que os docs afirmam:** Chamadas de cron para edge functions recebem 401 por token interno expirado; identificar e renovar.
- **Fontes:** `docs/prod-readiness.md:1026`
- **O que falta:** Rodar via MCP do gateway oficial: SELECT count(*) FROM net._http_response WHERE status_code=401 AND created > now() - interval '6 hours'.
- **Evidência:** docs/prod-readiness.md:1034 (B18) documenta 117x 401 invalid_or_expired_token e 25x 401 unauthorized em 2026-11-13. Confirmar se persiste exige consultar net._http_response/cron.job_run_details ao vivo no banco oficial, sem acesso nesta sessão (mesmo bloqueio de rede/gateway de F2672).
- **Revisão:** sem contestação cética concluída.

### F2677 · verify_jwt × código × deploy comparados

- **Tipo:** Doc/config
- **O que os docs afirmam:** P070 P.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:165`
- **O que falta:** Confirmar na prática exige requisições reais sem JWT contra cada função publicada, com rede liberada para *.supabase.co — bloqueada nesta sessão (403 do proxy).
- **Evidência:** Item #70 (A_planos_execucao.md:165) pede comparar verify_jwt documentado em docs/API.md (existe, 800 linhas) contra o comportamento real do deploy.
- **Revisão:** sem contestação cética concluída.

### F2715 · Google OAuth ativo

- **Tipo:** Integração externa
- **O que os docs afirmam:** Login com Google habilitado.
- **Fontes:** `docs/FUNCIONALIDADES_COMPLETAS.md:529-529`
- **O que falta:** Confirmar no painel Supabase Auth → Providers se Google está habilitado com client_id/secret válidos (acesso que este agente não tem).
- **Evidência:** O fluxo de código existe: src/hooks/auth/useAuthForm.ts:179-190 (handleGoogleSignIn) chama lovable.auth.signInWithOAuth('google', ...) — wrapper em src/integrations/lovable/index.ts:14-35 que por fim chama supabase.auth.setSession — usado em src/pages/Auth.tsx. Mas a configuração do provider Google no Supabase Auth é feita no painel/Management API, e contexto/docs/contexto/supabase/auth.md:5 diz 'Configuração indisponível (Management API desabilitada)' — sem como confirmar se o provider está habilitado no projeto real.| CONTESTADO pelo cético (PARCIAL): O botão existe (src/hooks/auth/useAuthForm.ts:179-190 → lovable.auth.signInWithOAuth('google')), mas o login não usa o Supabase Auth: o wrapper src/integrations/lovable/index.ts:3,15 chama @lovable.dev/cloud-auth-js, cujo broker é a rota relativa DEFAULT_OAUTH_BROKER_URL='/~oauth/initiate' (node_modules/@lovable.dev/cloud-auth-js/dist/in…
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F2718 · Login Google OAuth

- **Tipo:** Integração externa
- **O que os docs afirmam:** NÃO VERIFICÁVEL.
- **Fontes:** `docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:229`
- **O que falta:** Testar login Google end-to-end em produção ou confirmar o provider habilitado no painel Supabase (acesso que este agente não tem).
- **Evidência:** O próprio doc fonte já classifica como 'NÃO VERIFICÁVEL' (docs/auditoria/funcionalidades-pendentes-2026-10-12/C_estado_runbooks.md:229) e o critério pede 'login Google funciona em prod', exigindo teste real ou acesso ao painel Supabase Auth — contexto/docs/contexto/supabase/auth.md:5 confirma 'Configuração indisponível (Management API desabilitada)'.| CONTESTADO pelo cético (PARCIAL): Há evidência suficiente para sair de NAO_VERIFICAVEL: o fluxo Google depende do broker Lovable '/~oauth/initiate' (node_modules/@lovable.dev/cloud-auth-js/dist/index.js:87,112; src/integrations/lovable/index.ts:15), inexistente na produção Vercel (vercel.json:3-7 reescreve tudo para /index.html; docs/agentes/vercel-deploy.md:9-10). No banco real só há provider 'email' (~6 usuários) e nenhum Google (snapshot supabase/stats.md:487-489). Código/botão existem, login Google em produção não tem caminho funcional…
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F2719 · Login Google OAuth via lovable.auth.signInWithOAuth

- **Tipo:** Integração externa
- **O que os docs afirmam:** `useAuthForm.ts:98` chama `lovable.auth.signInWithOAuth`; 0 identities OAuth; provider não verificável por SQL.
- **Fontes:** `docs/estado/08_ADMIN_SEGURANCA.md:104,294`
- **O que falta:** Consultar auth.identities via MCP com acesso de leitura ao projeto real e confirmar no painel Supabase Auth se o provider Google está configurado e sendo usado em produção.
- **Evidência:** src/hooks/auth/useAuthForm.ts:183 confirma a chamada 'lovable.auth.signInWithOAuth' citada no item. A contagem de identidades OAuth (auth.identities) e a configuração do provider não são verificáveis por este agente: contexto/docs/contexto/supabase/auth.md:5 diz 'Configuração indisponível (Management API desabilitada)', e auth.identities contém dados de usuário não expostos nos snapshots fornecidos.| CONTESTADO pelo cético (PARCIAL): Critério 'login OAuth registrado' verificável pelo snapshot: provider só 'email' (~6 usuários), nenhum 'google' (supabase/stats.md:487-489). A chamada lovable.auth.signInWithOAuth (src/hooks/auth/useAuthForm.ts:183) usa broker relativo '/~oauth/initiate' (node_modules/@lovable.dev/cloud-auth-js/dist/index.js:87,112) que não existe no host de produção Vercel (vercel.json:3-7; docs/agentes/vercel-deploy.md:9-10).
- **Revisão:** em disputa. O cético propõe Parcial e o juiz ainda não decidiu.

### F2785 · 859 de 907 policies RLS nomeadas no dicionário existem no banco

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** O dicionário lista nomes de policies por tabela ("RLS habilitada · N policies: ..."). 48 nomes documentados não existem em pg_policies no snapshot real (itens individuais abaixo). Nomes truncados com "…" no doc não foram comparados.
- **Fontes:** `docs/DATA_DICTIONARY.md:406-7104`
- **O que falta:** Diff nome-a-nome entre ~907 entradas documentadas e ~1033 policies reais exige automação fora do escopo desta sessão.
- **Evidência:** docs/DATA_DICTIONARY.md:406-7104 lista ~907 policies para comparar 1:1 com pg_policies; snapshot real supabase/policies.md tem hoje 1033 policies.
- **Revisão:** sem contestação cética concluída.

### F2811 · Etapa 6 do plano: Rotacionar service_role do destino

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Revogar a chave presente nos 12 scripts e atualizar consumidores autorizados via secrets manager. Saída esperada: chave antiga rejeitada e smoke autorizado. Gate: autorização de segredo/janela.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:662-662`
- **O que falta:** Confirmar no painel Supabase (API keys de usyxfpqlsspldubptrdl) que a service_role antiga foi revogada; o agente não tem acesso ao painel.
- **Evidência:** Código confirma que os scripts não têm mais a service_role key hardcoded (requireSupabaseAdminEnv/env — ver F2810). Confirmar que a CHAVE ANTIGA foi revogada no painel/API do Supabase (usyxfpqlsspldubptrdl) exige acesso ao painel de API keys, que este agente não tem.| cético: O código não tem mais service_role (STATUS_100_ETAPAS_2026-08-30.md:90; scripts/lib/requireSupabaseAdminEnv.ts:49-56). A chave real segue no histórico: AUDITORIA_EXAUSTIVA_2026-08-26_PLANO_100_ETAPAS.md:120 e STATUS_100_ETAPAS:71, que diz 'rotação não verificável; painéis pendentes'.

### F2816 · Etapa canônica 26/08 nº 6: Rotacionar service_role do destino (presente nos 12 scripts) + cofre de segredos

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Etapa canônica 6 (plano 26/08, matriz de status 30/08, estado 🔒): chave antiga rejeitada + smoke autorizado; segredo confirmado no histórico de main.
- **Fontes:** `docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:124-124`
- **O que falta:** Evidência registrada de rotação no painel Supabase; o agente não tem acesso.
- **Evidência:** Idêntico a F2811 (mesma etapa 6, fonte docs/execucao/STATUS_100_ETAPAS_2026-08-30.md:124). O artefato scripts/lib/requireSupabaseAdminEnv.ts existe e é usado por 7 scripts, confirmando que o código não tem mais a chave hardcoded. Rotação efetiva no Supabase não verificável sem painel/API.| cético: O artefato scripts/lib/requireSupabaseAdminEnv.ts:49-56 existe e é usado por 7 scripts. STATUS_100_ETAPAS_2026-08-30.md:71 diz 'rotação não verificável'. O cofre do projeto está vazio (vault.md: '_nenhum_').

### F2852 · Plano 30/08 etapa 3 (P003): Rotacionar a chave fixa de migrate-helper

- **Tipo:** Segurança/RLS
- **O que os docs afirmam:** Etapa 3 do plano de 100 etapas (auditoria 30/08; = P003 do handoff): Rotacionar a chave fixa encontrada no código e invalidar cópias expostas; evidência de revogação sem registrar o segredo.
- **Fontes:** `docs/auditoria/AUDITORIA_EXAUSTIVA_2026-08-30_ATUALIZACAO_PLANO_100_ETAPAS.md:649-649`
- **O que falta:** Confirmar no painel que a chave antiga foi revogada e preencher docs/SECRETS_ROTATION.md §4 sem o valor.
- **Evidência:** migrate-helper removida (14b2750a4), eliminando o vetor a partir de então. Rotação/invalidação da chave já exposta é ação de segredo fora do repo; vault.md do snapshot vazio, sem evidência documentada de revogação.| cético: Código removido (sem pasta migrate-helper em supabase/functions). Repo registra que NÃO há rotação: docs/SECRETS_ROTATION.md:126-128 'Nenhuma rotação registrada'; docs/auditoria/funcionalidades-pendentes-2026-10-12/A_planos_execucao.md:23 marca 'NI'. Revogação real só verificável no painel Supabase.

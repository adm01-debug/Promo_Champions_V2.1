# Changelog

## [1.1.0](https://github.com/adm01-debug/Promo_Champions_V2.1/compare/promo-champions-v2-v1.0.0...promo-champions-v2-v1.1.0) (2026-10-08)


### Funcionalidades

* add Promo_Champions_V2.1 ECC bundle ([#81](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/81)) ([e590f84](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/e590f8408674ecfa430c233bc8014797d10e75e7))
* **auth:** autorização explícita em 19 edge functions service_role (SEC-08) ([#192](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/192)) ([f3a787e](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/f3a787e684c18dd3b662ac72b8d6d09929b8e363))
* **auth:** exige autenticação do chamador em 11 edge functions de forecast e coaching ([#191](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/191)) ([102d827](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/102d827ef04164a536d96b1f662dc3838c7476a1))
* **auth:** MFA nativo, reauth server-side e WebAuthn real ([#203](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/203)) ([e74ff42](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/e74ff4208456eec1f78700d40b48f63ba95b8c19))
* **auth:** pacote auditoria authz — audit user_roles, drop RBAC legado, protege APIs de custo, deny-all/revokes ([#202](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/202)) ([f55f372](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/f55f372ac5522aaa8cf9af901524047815351740))
* **auth:** wire mfa totp challenge into login flow ([afa1006](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/afa10066dea3bcf0af1e1e8de2b2d82d5f2e0324))
* **ci:** environment pr-preview + escopar secrets E2E — Onda B ([#211](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/211)) ([3ef7d30](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/3ef7d30e9ac6218d270371dd3576793a05c73326))
* **config:** etapa 46 (parcial) — validadores de CEP e telefone BR ([#140](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/140)) ([dbc3b72](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/dbc3b72cb74ee654b3567197c304aae7d05b8979))
* **db:** fonte única de probabilidade + coluna canônica sales.status + guard div-zero no PDF ([#206](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/206)) ([9f2f6b2](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/9f2f6b2537005d345c38bccb5d3926403cccf247))
* **db:** pacote ATOMIC — RPC transacional quote→items→sale no receive-quote-webhook ([#199](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/199)) ([a4d71ac](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/a4d71aca2dd26022ae7b26229b6ac75df359f759))
* **db:** pacote auditoria — LGPD (consentimento/DSR/anonimização), retenção de logs, dead tables e seed ([#197](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/197)) ([8dcf76b](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/8dcf76b3b67c30dcd0b2578a17931649c048a15c))
* **db:** pacote auditoria — soft delete, audit canônico e optimistic locking ([#200](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/200)) ([66eb800](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/66eb800285009ccc79d96abc62ff5b6c599e37c1))
* **db:** pacote integridade — dedupe via constraints (clients/email, icp_data/bitrix_id, sales/external_deal_id) + ON DELETE em FKs ([#196](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/196)) ([213af61](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/213af611151ce83f64af285493ee6570f3bffd95))
* GitHub Actions — hardening completo (100 etapas) ([859276a](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/859276aede517544eb17b4dd68d7ec691464a6ce))
* **graphify:** .claude/ completo + GRAPH_REPORT.md + manifest.json (primeiro grafo) ([143f970](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/143f970ef845507dbe8e6915825fa7228018a0ad))
* **graphify:** adicionar fundação local segura ([2dfd57b](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/2dfd57b30bd7de9d73f950e1885e2357dc59d4c3))
* **graphify:** indexar documentação rastreável ([7be8f2b](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/7be8f2bd53294d6ae4f1b1f3ae4c5fc17deb4d4c))
* **graphify:** indexar documentação rastreável ([83b1272](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/83b12723cad10be3b051d0210cdd9bbff6c6003a))
* **graphify:** integracao completa — .graphifyignore + PreToolUse hooks + merge driver + CLAUDE.md ([299543f](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/299543f93b2cc8f1259f892308727ba16b4ef778))
* **graphify:** validar catálogo somente leitura ([f6b1f72](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/f6b1f72333ef7c6706fb25710646a755b3f3cecd))
* **graphify:** validar catálogo somente leitura ([c6a209d](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/c6a209d2de86735e7dcabd7f66cba423de44a005))
* **graphify:** validar catálogo somente leitura ([#134](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/134)) ([f6b1f72](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/f6b1f72333ef7c6706fb25710646a755b3f3cecd))
* Migração banco do lovable para Supabase Promo Champions - V2 ([b722848](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/b722848dd576a99970b26d65591bdf85b7b66c51))
* **observabilidade:** envelope de log, máscara de PII, escalação de alertas, trace W3C e métricas externas ([#215](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/215)) ([673985e](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/673985e0d6e2f51403ee76b941a0d1576d89cf60))
* SHA-pin todas as 48 referências de GitHub Actions (supply-chain hardening) ([80bc71f](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/80bc71f2d73db5cbcba2fbe657bc1422fb808ee7))


### Correções

* **analytics:** usar eventos reais de uso ([#129](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/129)) ([d4d951c](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/d4d951c545c73767adfd820005e569df9de8b444))
* aplica os achados da banca de validação adversarial (5 agentes) ([50572ad](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/50572ad83b45ec68d7bd9da0020418bed3bf2fda))
* audit exaustivo — CI [@v4](https://github.com/v4), IDOR ranking-api, CORS dinâmico, RLS leads, cron ref ([#103](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/103)) ([97f1a4b](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/97f1a4b967e30c9002dbfd344c10a26b95b0e5bd))
* **auth:** fecha service_role sem verificação em 4 edge functions públicas ([#190](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/190)) ([f43a59d](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/f43a59d51a38fb706f46aae3662a5fc44fcb6e48))
* **auth:** pacote auditoria — magic bytes, geocode proxy, fonte única de permissões, RLS E2E e rate limit em IA ([#204](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/204)) ([85e475e](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/85e475e02d61d1bcda82ce97c80e5d309f7cbdc1))
* **auth:** pacote auditoria — revogação de sessões, 401/403 + rate limit em send-password-reset, headers HTML e docs de governança ([#201](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/201)) ([f90c1ee](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/f90c1ee43172709dbde9f53a83e1f8bcf6e08523))
* **auth:** pkce flow, sw cache clear on signout, hidden sourcemaps, fix preconnect ([31f2c4d](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/31f2c4d484e8a009421132dfc20b58e173655ef3))
* **build:** funde chunks eager num só — quebra ciclo vendor-core&lt;-&gt;vendor (tela branca/NO_FCP) ([b35c3f1](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/b35c3f1a71d3a2bc09d72b020f953610342198bb))
* bump astral-sh/setup-uv ([#178](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/178)) ([344813a](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/344813adac0d361c6c3b94f2b0d950af84386bbf))
* bump brace-expansion 1.1.11→1.1.21 (ReDoS HIGH) ([47cca13](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/47cca139de50e87f7db263c03948ca1b5ac49860))
* bump dompurify 3.1.6→3.2.5 (XSS, CVE-2024-48910) ([2726164](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/2726164fffe4e32f78a3b0f9bdb89c9280db3409))
* **ci:** destrava CI da main — budgets Lighthouse realistas, deno.lock e npm audit ([#189](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/189)) ([a1b3ce2](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/a1b3ce25fce7a46cc9a33e9724af2d3c53572337))
* **ci:** E2E Tests pula (em vez de falhar) quando credenciais Supabase estão inválidas ([#155](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/155)) ([6aff616](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/6aff6161f4d58afc52afe12976cf376091648403))
* **ci:** etapa 13 — ci-gate + detect-changes para PRs doc-only ([ae13f75](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/ae13f757c1e7bcdc21814cbb8acae32fbba18a15))
* **ci:** invariante orphan_sales só aplica a vendas vindas de conversão de quote ([#232](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/232)) ([6281959](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/628195920c6e7b923eef8dbfb57d635c8d05c776))
* **ci:** reconciliar runtimes, lockfiles e chunking ([#121](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/121)) ([693f38a](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/693f38a7b26b98f363e82b6502604504448a23c0))
* **ci:** tornar validação local e imports Deno reproduzíveis ([#122](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/122)) ([f537073](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/f5370737dd7def26ffcafac8e4cb0435c025c593))
* **ci:** validar configuração completa do e2e ([#127](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/127)) ([a9a6619](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/a9a6619c4f6265e5039c308c31f0684394567141))
* **config:** etapas 05, 31, 32, 42, 48 do plano de 50 etapas ([#137](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/137)) ([abc6c48](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/abc6c48a9301b635f9ccd0d932d527eef05c58f0))
* **config:** remove preset lighthouse:recommended do LHCI ([4531c9f](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/4531c9f5a2a17e864706e229df123189dd576c14))
* **config:** repoint project_id para destino V2 (usyxfpqlsspldubptrdl), remover migrate-helper aposentado ([d150ec2](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/d150ec2ee0fc6da3c9d3cdcc8cba1c1a4f864e5d))
* conter superfícies críticas e reforçar fluxos transacionais ([648dcc9](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/648dcc9d425115d2ec51c71ba2fd94dc95418631))
* corrige falhas da validação exaustiva — triggers, versões, auth, deleted_at ([#222](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/222)) ([ed95e67](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/ed95e678d6811044e04d9df50784adf71107c149))
* corrigir acessibilidade e isolamento dos testes ([c59a4f2](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/c59a4f21a80f733fc54780b1dfedd30a9b439b3a))
* corrigir acessibilidade e isolamento dos testes ([f145194](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/f145194c9fd4f9625a97bc069605cd0ea33884a1))
* **crm:** corrige TS2352 em 8 arquivos (casts diretos sem unknown) ([0a385ba](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/0a385ba2e7b32fa7cfd94ffd3e5173d6dfee5c5c))
* **cron:** reconciliar jobs operacionais ([#126](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/126)) ([8f5ece0](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/8f5ece0f9b3fa8c395775d7168c6890d75745b34))
* **db,services:** fecha gaps da 2a rodada de validacao adversarial de 5 agentes ([#89](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/89)) ([34c352d](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/34c352d7e1d66011190e24c681fc0bc6fa665e95))
* **db:** alinha migration de retenção ao schema canônico + reponta produção pro Supabase correto ([#229](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/229)) ([f8d46a5](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/f8d46a577a3169692bdc274ba35312a3570ca5ca))
* **db:** endurece a migration de RLS com achados da revisão adversarial ([672bf1d](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/672bf1d42900c5e5f0c9cba134bba7c1986ad943))
* **db:** endurecer acesso canônico e reparar jobs ([#82](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/82)) ([5cb3527](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/5cb3527245b9783c01213965e872add4a57d6380))
* **db:** etapa 07 (parcial) — restaurar os 12 cron jobs SQL ([#144](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/144)) ([a06ec4a](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/a06ec4a90607357cdc93fa128e07680e90891b24))
* **db:** restringe get_user_role/is_admin_or_manager a self, admin/manager ou service_role ([#230](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/230)) ([d105656](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/d1056560ae3158c512542c4eff1d224286ce1dbc))
* **db:** retirar migration inexequível do supabase admin ([#125](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/125)) ([e56fc35](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/e56fc3551afa99ce18e2384aefea55468b4df1f9))
* **db:** revoga TRUNCATE de anon/authenticated e corrige sync_battle_score em producao ([#86](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/86)) ([285350f](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/285350f7eebf42aa8f574e56f8535784e7832ca9))
* **db:** revogar truncate padrão de supabase admin ([#124](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/124)) ([a8cbee7](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/a8cbee7f84536d98e00649bb877dd2cb8bf8add0))
* **db:** RLS + REVOKE nas 8 tabelas órfãs e search_path em 3 SECURITY DEFINER ([c28d478](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/c28d4785b89f1d9fbe1656909ce05375b4c7675d))
* **db:** sincronizar tipos com projeto canônico ([#123](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/123)) ([c5af7cb](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/c5af7cb2a07af4b52a000f86f33187fa0a07e211))
* **db:** territory_history FK/domínio de conquistas + regressões do review ([#231](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/231)) ([40a7076](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/40a70765b08a75f2ba23b33dddb94f5c24360d78))
* **db:** transition_sale_status autoriza closer_id e elimina sobrecarga ambígua ([#228](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/228)) ([6afcec4](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/6afcec451d6bb2de5c10ca98ab5b7447a9793f86))
* **db:** unlock_race_item nao referencia mais arena_user_stats inexistente ([#107](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/107)) ([5c0734e](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/5c0734e4e6202441342e34bb72bb123706484618))
* **deps:** corrigir 4 CVEs não-major (brace-expansion, nanoid, ws, @babel/core) ([#138](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/138)) ([b1d8d01](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/b1d8d019b907e618862a6ed4a66f9c048d6434ae))
* **deps:** upgrade vitest 1.x→5.x — remediar CVE-2026-47429 (CVSS 9.8) ([ff257f2](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/ff257f27566d12302385ad25942aff0cbdff1380))
* **e2e:** cleanup das specs Quote→Sale remove sales gêmeas — zera orphan_sales ([#237](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/237)) ([cf79e7e](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/cf79e7edf1d8960075af3e93efee83499dbe4071))
* **e2e:** isola suíte quote-to-sale do job E2E genérico e serializa testes dentro do spec ([#238](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/238)) ([8f15dc0](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/8f15dc0f3fa7f12583dca710cce6601f26f34169))
* **e2e:** specs Quote→Sale navegam pelo botão 'Detalhes' do card ([#233](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/233)) ([0c4f7ca](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/0c4f7cad45377070e07cbb49b04136cb24b5f0a8))
* **edge:** corrigir runtime e proteger jobs privilegiados ([#84](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/84)) ([197be2c](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/197be2c1ba98af0ae5c2d6151e37351bb74d7810))
* **edge:** proteger crons e reparar handlers quebrados ([#85](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/85)) ([b30cd23](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/b30cd232c5920c73ceeb8ef8a5b8742e590bb9da))
* **enrichment:** bloquear dados simulados ([#128](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/128)) ([996c701](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/996c70197de6c5c62ae1bc8ca1230407bea4232a))
* **graphify:** blindar escopo e concorrência ([2d38c74](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/2d38c74a9a8bd32de14bf66b5a6509dd4b991132))
* **graphify:** blindar escopo e concorrência ([ab1774f](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/ab1774f835061526392feb80ea48dcac29c6a07d))
* **graphify:** corrigir lacunas da auditoria ([#156](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/156)) ([2d4e758](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/2d4e75836b236b4ff89c44f55a53c9790400ee84))
* **graphify:** endurecer snapshots e impacto ([053efa1](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/053efa101ebaf65bac750a4c02971718d985b11e))
* **graphify:** endurecer snapshots e impacto ([628dbe0](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/628dbe0aa50da91f6d6c7912d659fee336e04bdd))
* **graphify:** explicitar limites de resolução ([a90a052](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/a90a0523bb51fe4fb0f450f7e77bf2e2f2b9d863))
* **graphify:** reduzir complexidade de normalizeCatalog ([c78ed1b](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/c78ed1bac1c5adae3772d99caf95a309035a15c2))
* **graphify:** reduzir complexidade de validateGraphDocument/validateMultiGraphDocument ([348c498](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/348c498f99b15578ec5d23bcda81ffc5326669f8))
* hardening das edge functions (assinatura Twilio, erros opacos, rate limits, CORS) ([ce2bac7](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/ce2bac704c2b7036b5582721c3609b09fda0e950))
* **hooks:** corrige 22 erros lint restantes — JSX comment, orphan disables, as unknown) as ([2c67745](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/2c677459d2383a6a4b237275076192e357b1c18f))
* **hooks:** corrige posição de eslint-disable em 26 arquivos ([9746e6e](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/9746e6ec07633d87a810052dc56edaaf613d1f3a))
* **hooks:** replace misplaced eslint-disable line comments with block comments ([3c06427](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/3c0642711b6bca9f8043c9bcb093402b0e322e95))
* **hooks:** suppress as-unknown-as ESLint warnings across codebase ([49ade3f](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/49ade3fe7ac619b46a49a12bc20d4c2a95cb850b))
* **ops:** pacote auditoria — status 'ganho' unificado, userId em logs, crons de saúde, Sentry e gate Lighthouse ([#182](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/182)) ([dde5aff](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/dde5affee343beb8d3cbd7843e758434d08e86eb))
* pacote auditoria — máquina de estados, pricing real, config SLA/XP, contrato front/edge e datas de negócio ([#208](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/208)) ([0f677dc](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/0f677dc9e82b7ea4654bfd6b1e31b01a0df3e867))
* pacote auditoria — RLS user_2fa_log, dedupe webhooks, N+1 hooks e validadores BR ([#185](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/185)) ([c00ecf2](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/c00ecf2c264101acf3439d62d8665b53f6d179cc))
* pipefail em edge-functions-bundle e set +e em qa-exhaustive ([f5d7bef](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/f5d7bef35d673fe28e2f2b0160d48e45ec77e7b2))
* **pipeline:** reconciliar pulso com schema canonico ([#130](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/130)) ([bc92a95](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/bc92a95797c5c14a71461e3e4bc5b6d985fb8141))
* propagar correlação em edge functions ([abe8c41](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/abe8c41dd5638bcc17070f3a5105c6725518d493))
* reconciliar guard-rails e estado GitHub/Supabase ([#80](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/80)) ([400e2ba](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/400e2ba30916bb9464030876ef589bbc122849cb))
* reforçar idempotência e controles de acesso ([af68aba](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/af68abac1b1dbce8977da08f940b2cf7e3c22f52))
* regenerar deno.lock (deno 2.9.7) — resolve lockfile drift no CI ([8d92997](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/8d92997a6bbe83a5e6753598f95da8ac43b16038))
* **sec:** exige autenticacao e papel nas 20 edge functions desprotegidas ([#194](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/194)) ([125d963](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/125d96396ef8be9dbdfeed75f4297797114cd9fa))
* **security:** etapas 22, 23 — CSP sem unsafe-inline no script-src + ADR-009 ([#139](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/139)) ([58210ee](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/58210eefff04e39d7f0a55c4d4c956b56a8839ac))
* **segurança:** OAuth Bitrix24 com state assinado + endpoints internos centralizados ([#183](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/183)) ([f7cdcb6](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/f7cdcb682380eef156ad8cb280fef8387f2da62e))
* **services:** circuit breaker em chamadas Twilio/ElevenLabs/Bitrix24 ([#87](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/87)) ([aadfe53](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/aadfe53b704d98de442c2fcc7053c7db05299126))
* **services:** drop redundant as-unknown in biService convAnalyses cast ([7729aee](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/7729aeed7ab03ccc8730eafc83dbd617f3fb9983))
* **services:** pacote VALIDACAO — validação de entrada nas edge functions de escrita + lint preventivo ([#195](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/195)) ([d0777cc](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/d0777ccbff0e61f5d928ddc8bea91647181c6400))
* **test:** remove teste órfão de schema deletado — destrava typecheck da main ([#220](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/220)) ([5e3906b](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/5e3906b5637a6766e0e482435ed046edba60d45e))
* **ui:** bundle crítico, QR TOTP local, ícones self-hosted e janelas de listagem ([069e144](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/069e14449b5abe476d32a3cecced509de4caadb1))
* **ui:** resolve as-unknown-as lint warnings across 10 components ([9ebfba2](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/9ebfba2cb847e0a38d1cf2e9095e9dcd61628e6a))


### Performance

* pacote auditoria — paginação server-side, listas virtualizadas, precache SW, alerta Web Vitals ([#218](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/218)) ([2949165](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/2949165374cebd97011a7f47507434c3be2c3ad0))


### Segurança

* exige auth em 20 edge functions que rodavam como service_role ([#193](https://github.com/adm01-debug/Promo_Champions_V2.1/issues/193)) ([9b762d4](https://github.com/adm01-debug/Promo_Champions_V2.1/commit/9b762d4bde09be02e2620bad15e4a63d896cf326))

## 2026-09-03 — Auditoria 20 dimensões: Quick Wins + Sprint 1 (PR #90)

### 🔒 Segurança
- Repositório tornado privado (expunha código completo + PII de funcionários) e flag de template removida; ruleset `main-protection` ativo (PR obrigatório + checks required + sem force-push); Dependabot security updates ligado
- `twilio-call-status` e `twilio-call-twiml` agora verificam `X-Twilio-Signature` (token do tenant e/ou `TWILIO_AUTH_TOKEN`, fail-closed) — o twiml era um oráculo público de telefone de agente via `?owner_id`
- Wrapper `withRequestId` deixou de vazar `err.message` no corpo das respostas 500 (170 functions); `ranking-api`, `report-embed-public`, `twilio-click-to-call` e `calculate-deal-health` com erros opacos + detalhe só no log estruturado
- CORS: 132 functions migradas do `corsHeaders` estático (`*`) para `getCorsHeaders(req)` — allowlist SEC-07 ativa ao configurar `ALLOWED_ORIGINS` (sem a env, comportamento inalterado)
- `twilio-click-to-call`: normalização E.164 (BR) do destino + rate limit 10/min; rate limit também em `ranking-api` (60/min), `multichannel-status-webhook` (300/min) e webhooks de voz (240/min)
- `ranking-api`: validação de `name`/`email`/`role` no `user/create` e aceite de `Authorization: Bearer <token>`
- Migration `20260902221500`: RLS + REVOKE nas 8 tabelas descobertas sem RLS (inclui `security_events` e `user_permissions_cache`) e `SET search_path` em 3 SECURITY DEFINER regredidas (aplicação no banco pendente)
- QR do TOTP gerado localmente (lib `qrcode`) — o segredo não sai mais para `api.qrserver.com`; `MFASetup` exposto em `/seguranca` (enrollment funcional)
- Token de embed aceito via header `X-Embed-Token` (query mantida por compat)

### ⚡ Performance
- `manualChunks`: preload-helper do Vite fixado em `vendor-core` e subgrafo markdown unificado — `vendor-pdf` (591 KB) e `vendor-markdown` saíram do caminho crítico do entry
- Ícones do mapa self-hosted em `public/map/` (fim de `raw.githubusercontent.com`/cdnjs em runtime)
- Janela explícita (`.limit`) em `useQuotes`, `useTasks` e `useInventoryLevels` (truncamento silencioso do PostgREST)

### 🔧 CI/Tooling
- Pipelines consolidados em `pr-checks.yml` (lint+types+secrets-scan+audit, testes com gate de coverage, `deno lint` das functions, e2e chromium+webkit, notificação de falha); `lint.yml`, `enterprise-quality.yml` e `generate-audit-pdf.yml` removidos
- Falsos verdes eliminados: secrets ausentes em `schedule`/`push`/PR interna agora falham em vez de skipar
- Lockfile único (`package-lock.json`); `bun.lock`/`bun.lockb` removidos; `lint-staged` declarado; `deno.json` migrado ao formato Deno 2 com lint zerado (31 findings corrigidos)
- Dependabot: `ignore` de majors do vitest até o upgrade coordenado
- Limpeza: relatório de qualidade fabricado, `quality-gate.sh`, `.eslintrc.json` legado, `migrate-helper/`, `deployed.txt`/`local.txt`, 5 variantes `remove-demos*` e `bundle-stats/` commitado removidos

### 🧪 Testes
- Novo `webhook-auth_twilio_any_test.ts` (6 casos — assinatura HMAC real, multi-token/multi-URL, GET, tamper); suíte `_shared` 115/115; contrato `withRequestId` 169/169 sem drift

## 2026-05-30 — Audit & Hardening Sprint

### 🔒 Security
- Added Row Level Security (RLS) policies for all tables
- Added missing foreign key indexes to prevent sequential scans
- PWA service worker now uses NetworkFirst for API calls
- Production guards suppress console.log and catch unhandled rejections

### 🐛 Bug Fixes
- **activityService**: `clientId` filter now applied + input validation
- **biService**: Fixed race condition (moved streak query into Promise.all)
- **bi-helpers**: Corrected ABC Pareto classification algorithm
- **LevelBadge**: Fixed LevelUpNotification showing wrong title/emoji
- **use-toast**: Fixed useEffect dependency causing listener churn
- **AudioContext**: Memoized context value to prevent unnecessary re-renders
- **AuthContext**: Wrapped callbacks in `useCallback` for stability
- **button / ripple-button**: Fixed haptic feedback lost in `asChild` mode
- **alert**: Fixed forwardRef element type mismatch
- **breadcrumb**: Fixed typo in BreadcrumbEllipsis displayName
- **types/activity**: Replaced hardcoded fields with generic Record<>

### 🧪 Testing
- Implemented real regression tests (was empty stubs)
- Added vitest coverage thresholds (70% lines, 60% branches)
- Playwright configured with retries and parallel workers

### 🛠 Developer Experience
- Added ErrorBoundary component for graceful error handling
- Added useAbortController and useMountedRef hooks
- ESLint now warns on `no-explicit-any` and `no-console`
- tsconfig tightened with `noImplicitAny`, `noUncheckedIndexedAccess`
- commitlint configured with project-specific scopes
- Lighthouse CI thresholds made realistic
- Added style guide, a11y checklist, and component guidelines
- Updated README with full setup instructions

### ⚡ Performance
- RLS policies and FK indexes added for database performance
- Context memoization prevents unnecessary re-renders
- Code splitting via manual chunks in vite config
- PWA runtime caching configured for Supabase API

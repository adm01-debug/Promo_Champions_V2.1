
Plano: Roadmap de Excelência 10/10 — Race Arena (execução autônoma, 1 melhoria por vez)

Vou executar sequencialmente, sem pausas, as melhorias abaixo até atingir 10/10. Cada item será uma entrega completa, com QA visual e código limpo.

### Fase 1 — Polimento visual e UX
1. **Header unificado da Race Arena** com `CheckeredFlag` no topo + breadcrumb (Hub → Pista) + badge de season ativa pulsante.
2. **Skeleton premium** no `RaceArenaView` (track + sidebar + feed) durante loading inicial.
3. **Empty states cinematográficos** quando não há season ativa (CTA admin / aviso piloto) com ilustração SVG.
4. **Transição entre Hub ↔ Pistas** com motion shared layout (slide + fade).

### Fase 2 — Engajamento e gamificação
5. **Painel "Próxima Meta"** no sidebar: distância em R$/pontos para ultrapassar o piloto à frente (já existe lógica de micro-goals, integrar).
6. **Combo Streak indicator** no card do piloto (chama de fogo quando 3+ vendas seguidas no dia).
7. **Mini-podium fixo no header** mostrando top 3 com avatares + medalhas, atualizado em realtime.
8. **Histórico de campeões** — nova aba no Hub listando últimos vencedores mensais (Closer/SDR) com bandeira quadriculada.

### Fase 3 — Admin Console premium
9. **Dashboard de saúde da season** no admin: gráfico de evolução diária, % engajamento, alertas (season sem eventos há X dias).
10. **Bulk actions na garagem**: resetar customização em massa, exportar CSV de pilotos.
11. **Preview ao vivo da cerimônia** no admin (botão "Pré-visualizar premiação") sem gravar evento.
12. **Audit feed com filtros** (tipo de evento, piloto, intervalo de data) + export.

### Fase 4 — Performance e qualidade
13. **Memoização agressiva** dos componentes pesados (`RaceTrack`, `RaceCar`, `LeaderboardSidebar`) com `React.memo` + `useMemo` em derivações.
14. **Virtualização do feed** com `@tanstack/react-virtual` quando >50 eventos.
15. **Code-splitting** do admin (`/admin/race-arena` lazy isolado) e do `MonthlyChampionOverlay` (carregado só quando trigger dispara).
16. **A11y completo**: roles ARIA na pista, foco visível em todos botões, leitor de tela narrando posições do leaderboard.

### Fase 5 — Polimento final
17. **Sons opcionais** (motor acelerando em overtake, fanfarra na cerimônia) respeitando `RaceSoundToggle`.
18. **Compartilhamento da cerimônia** gerando imagem PNG via `html-to-image` para download/social.
19. **Documentação inline** (JSDoc) nos hooks e componentes públicos da pasta `race/`.
20. **QA visual final** — screenshots Hub, Pista Closer, Pista SDR, Admin, Cerimônia em 1561px e mobile.

### Regras de execução
- 1 melhoria por commit lógico, sem perguntar entre etapas.
- Semantic tokens, Sora/Inter, ≤300L por arquivo, strict TS, zero console errors.
- Reaproveitar componentes existentes; criar helpers em `*Helpers.ts` quando exceder limite.
- Toast de sucesso em ações admin; skeleton em todo loading.
- Após cada fase, validar tipos (`tsc`) e ausência de regressões visuais.

### Entrega
Ao concluir as 20 melhorias, a Race Arena estará em padrão Awwwards 10/10 — cinematográfica, performática, acessível e gerenciável.

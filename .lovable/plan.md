
# Plano de Execução Sequencial — Race Arena 10/10

Vou executar as 10 melhorias da auditoria, **uma por vez, sem pausas nem perguntas**, em ordem de ROI. Cada item vira um commit completo e testável antes do próximo.

## Sequência de execução

**1. Spotlight do "VOCÊ" + Ultrapassagens dramáticas** (alto impacto, baixo esforço)
- Halo pulsante no carro do usuário logado + label sticky "VOCÊ"
- `OvertakeHighlight` ganha flash de tela, slow-motion 200ms, toast com avatares
- Boost trail melhorado com partículas SVG e glow afterimage

**2. Race Commentary IA** (diferencial único)
- Edge function `race-commentary` usando `google/gemini-2.5-flash-lite`
- Painel substitui/complementa `RaceEventFeed` com narração contextual
- Trigger em mudanças significativas (overtake, checkpoint, líder novo)

**3. Daily Check-in Ritual + Delta Diário** (retenção)
- Modal/overlay no 1º acesso do dia mostrando delta vs ontem
- Snapshot diário em nova tabela `race_daily_snapshots`
- Power-up grátis se manteve streak

**4. Modo TV `/race-arena/tv`** (viralização interna)
- Rota fullscreen sem chrome, rotação automática Closer↔SDR a cada 30s
- Narração IA em destaque, MonthlyChampionOverlay expandido
- Sem sidebar, sem header, otimizado para 1920x1080

**5. Tokens semânticos + Skin engine** (consistência sistêmica)
- `--race-grass`, `--race-asphalt`, `--race-checkered` em `index.css`
- Substituir `#5fa358` hardcoded em todos os componentes de pista
- Integrar com sistema de skins existente

**6. Modos de visualização (Imersivo/Competitivo/Análise)** (cognição)
- Toggle no header da arena
- Imersivo: só pista + leaderboard mínimo
- Competitivo: + feed + podium
- Análise: + score breakdown + predicted rank

**7. Onboarding inline + Demo ghost-race** (ativação)
- Empty state com 3 carros animados em loop
- Tooltips sequenciais 1ª visita (custom, sem dep)
- Checklist "3/5 etapas para entrar na corrida"

**8. Rivalidades + Highlights timeline** (storytelling)
- Detector de pares que trocam posições ≥3x → badge "Rivalidade"
- Timeline lateral "Highlights" com snapshots dos top 5 eventos

**9. Customização profunda (Garagem + Skins desbloqueáveis)** (propriedade)
- Rota `/race-arena/garage` com troféus, stats lifetime
- Decals/neons desbloqueáveis por liga
- Apelido + frase de chegada customizada

**10. Acessibilidade total + Reactions ao vivo** (inclusão + social)
- Modo daltônico (padrões nos carros)
- Reduced motion: saltos discretos entre checkpoints
- `aria-live` anunciando mudanças
- Reactions emoji 🔥👏😱 em tempo real via realtime channel

## Padrões em todas as etapas
- ≤400 linhas por arquivo, lógica pesada em `*Helpers.ts`
- Tokens semânticos (sem cores hardcoded novas)
- Framer Motion + haptics + skeleton
- Zero erros de console
- React Query + RLS quando tocar DB
- Edge functions seguem pattern de `validation.ts` + CORS shared utils

## Próximo passo
Sair do plano mode e iniciar **etapa 1** (Spotlight + Ultrapassagens dramáticas). Ao concluir cada etapa, sigo direto para a próxima sem interromper.

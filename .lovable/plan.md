
Adicionar torcedores animados nas bordas da pista (na grama, fora do asfalto), pequenos pontos coloridos com leve animação de pulo (wave) simulando torcida.

## Mudanças

**`src/components/race/track/TrackScenery.tsx`** — novo subcomponente `TrackCrowd`:
- Grupos de ~6-10 torcedores em 4 clusters posicionados na grama ao redor da pista (ex: lateral esquerda y=300, lateral direita y=600, topo perto da largada, base perto da chegada)
- Cada torcedor: círculo pequeno (cabeça r=3) + retângulo (corpo 4x6) com cores variadas (vermelho, azul, amarelo, verde, branco)
- Animação de pulo (translateY oscilando 0 a -3px) com delays escalonados para efeito de "ola"
- Renderizar no layer `outer` (atrás dos helicópteros mas sobre a grama)

**`src/index.css`** — keyframe `race-crowd-jump`:
- 0%, 100%: translateY(0)
- 50%: translateY(-3px)
- duration ~0.6s infinite, delays variados por torcedor

## Resultado
4 clusters de torcedores animados nas bordas da pista, pulando em ondas com cores vibrantes — atmosfera de evento ao vivo F1.

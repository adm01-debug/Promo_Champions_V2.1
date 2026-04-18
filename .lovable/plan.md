
Adicionar um terceiro helicóptero cruzando o meio da pista (vertical, de cima para baixo ou diagonal), diferente dos dois laterais existentes.

## Mudanças

**`src/index.css`** — novo keyframe `race-helicopter-cross-vertical`:
- Move o helicóptero do topo (translateY(-80px)) até a base (translateY(1400px))
- Posicionado no meio horizontal da cena (~x:400)
- Rotação de 90° para apontar para baixo (nariz na direção do movimento)
- Duração ~14s, loop infinito com delay para não coincidir com os outros

**`src/components/race/track/TrackScenery.tsx`**:
- Estender o componente `BroadcastHelicopter` para suportar nova prop `vertical?: boolean` (ou criar variante `VerticalHelicopter`)
- Quando `vertical`, aplica animação `race-helicopter-cross-vertical` e rotação inicial de 90°
- Adicionar instância: cor verde/amarela (terceira cor distinta dos azul/vermelho existentes), atravessando o centro da pista
- Sombra circular acompanha embaixo

## Resultado
Três helicópteros simultâneos: azul (topo, esquerda→direita), vermelho (base, direita→esquerda), e novo verde/amarelo cruzando verticalmente o meio da pista — cobertura aérea completa estilo F1.

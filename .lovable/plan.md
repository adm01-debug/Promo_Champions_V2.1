
As 7 melhorias do redesign visual da Race Arena já foram **todas concluídas** na rodada anterior:

1. ✅ Pista oval estendida limpa com chicane suave
2. ✅ Curbs e asfalto com gradiente de profundidade
3. ✅ Carros com labels horizontais (counter-rotate) + chip translúcido
4. ✅ Infield reorganizado (pit, paddock, lago com ilha+palmeira)
5. ✅ Árvores com sombra suave + arquibancadas coloridas
6. ✅ Grama com vinheta mais forte
7. ✅ Container com saturação +8%, drop-shadow premium e rounded-3xl

Não há mais itens pendentes do plano aprovado. Para continuar "rumo à perfeição 10/10++", proponho um **novo ciclo de 6 polish micro-detalhes** que elevam ainda mais o nível visual:

# Ciclo de polish 11-16 (micro-perfeição)

**11. Linha de largada/chegada xadrez** — faixa quadriculada preta/branca animada sutilmente na posição inicial da pista (atualmente ausente).

**12. Marshal posts (postes de fiscais)** — 4 pequenos postes laranja com bandeirinha nas curvas principais, dando sensação de circuito real.

**13. Sombra dinâmica dos carros** — sombra projetada acompanha rotação do carro (atualmente é elipse fixa); usar `<ellipse>` rotacionado junto com o body.

**14. Trilha de pneu (skid marks)** — quando carro está em "boost" ou ultrapassagem, deixar rastro sutil de pneu que esmaece em 1.5s.

**15. Reflexo metálico no capô** — adicionar gradient linear branco animado (shimmer lento de 4s) que passa pela carroceria, dando aspecto "diecast lustroso".

**16. Bandeiras de patrocinador nas barreiras** — 6-8 bandeirinhas triangulares coloridas alternadas (vermelho/branco/azul) ao longo das tyre stacks, estilo F1.

## Arquivos a editar
- `src/components/race/track/TrackAsphalt.tsx` — linha de largada xadrez
- `src/components/race/track/TrackScenery.tsx` — marshal posts + bandeiras patrocinador
- `src/components/race/RaceCar.tsx` — sombra dinâmica + shimmer no capô + skid marks
- `src/components/race/track/TrackDefs.tsx` — gradient shimmer + pattern xadrez
- `src/index.css` — token novo para skid mark

Sem perguntas. Executo as 6 em sequência até finalizar.

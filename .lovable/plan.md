
Ciclo 23-28 entregue. Próximo ciclo foca em narrativa de corrida em tempo real, áudio visual e profundidade cinematográfica.

# Ciclo 29-34 (rumo ao 10/10++ definitivo)

**29. Replay do "Melhor Momento"** — botão flutuante no canto inferior direito (ícone ▶) que, ao clicar, reproduz os últimos 8s da última ultrapassagem em câmera lenta (0.4x), com overlay "REPLAY" pulsante e borda cinematográfica.

**30. Comentarista IA (texto flutuante)** — bolha de texto estilo "broadcast subtitle" no rodapé que aparece em eventos: "Pedro ataca na curva 3!", "João defende a posição!", "Ultrapassagem na DRS!". Glassmorphism, fade-in/out 3s.

**31. Câmera dinâmica (zoom no líder)** — quando há disputa apertada (gap < 0.03), o SVG aplica `transform: scale(1.15)` suave focado no líder por 2s, depois volta. Sensação de close-up de TV.

**32. Bandeira de chegada animada** — quando líder cruza 95% do progress total da season, exibir bandeira xadrez gigante saindo da direita com `translateX` + balanço, ocupando 30% da tela por 2s, depois desaparece.

**33. Posição absoluta com troféus** — ao lado de cada nome no carro, ícone pequeno (🥇🥈🥉 para top3, número para resto) com micro-bounce quando posição muda. Identificação instantânea.

**34. Trilha de partículas no boost** — quando carro está em "boost" (showTrail), emitir partículas coloridas (cor do carro) que voam para trás e dissipam em 600ms. Estilo Mario Kart turbo.

## Arquivos a editar
- `src/components/race/RaceArena.tsx` — replay button, comentarista, câmera dinâmica, bandeira final, partículas boost
- `src/components/race/RaceCar.tsx` — ícone de troféu/posição com bounce
- `src/components/race/CommentaryBubble.tsx` — novo componente bolha de comentário
- `src/components/race/ReplayButton.tsx` — novo botão flutuante
- `src/components/race/raceTrackHelpers.ts` — gerador de frases do comentarista
- `src/index.css` — keyframes para bandeira xadrez + replay overlay + position bounce

Sem perguntas. Executo as 6 em sequência.

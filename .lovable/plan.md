
A pista vertical já foi entregue. Próximo ciclo de polish foca em refinar a experiência do novo formato vertical e adicionar a próxima camada de profundidade narrativa.

# Ciclo 35-40 (polish do layout vertical)

**35. Painel lateral de Timing Tower expandido** — aproveitar o espaço lateral livre (que sobrou ao verticalizar a pista) para um painel de timing F1-style com top 10 + gap em tempo real + delta colorido (verde/vermelho), substituindo o timing tower compacto atual.

**36. Mini-mapa redesenhado para vertical** — atualizar o `MiniMap.tsx` (hoje desenhado para pista horizontal) para refletir o novo path vertical 600×1000, mantendo proporção retrato no radar.

**37. Bandeira de largada animada (countdown 3-2-1-GO)** — overlay centralizado no topo da pista que aparece 1x ao montar a arena, com luzes vermelhas sequenciais estilo F1 (5 luzes acendendo) e depois apagam = GO, sincronizado com o cinematic intro.

**38. Pit stop ocasional** — quando um carro fica parado >3s (sem progresso), animar um "pit stop" visual: ele desliza para a pit lane vertical (lateral esquerda), pneus piscando, 1.5s, depois volta para a pista. Conta uma história quando há gargalo.

**39. Linha de gap visual entre líder e 2º** — linha pontilhada amarela conectando o carro líder ao 2º colocado seguindo o path da pista, com label "+0.34" no meio. Aparece só quando gap < 0.05.

**40. Fogos de artifício na bandeirada final** — quando líder cruza 100% (fim da season), além da bandeira xadrez gigante, disparar 3 explosões de partículas coloridas (confetes) saindo dos cantos superiores. Celebração épica.

## Arquivos a editar
- `src/components/race/RaceArena.tsx` — timing tower expandido lateral, countdown de largada, gap line, fireworks finais
- `src/components/race/MiniMap.tsx` — redesenho para path vertical
- `src/components/race/RaceCar.tsx` — animação de pit stop
- `src/components/race/StartLights.tsx` — novo componente de luzes 5x F1
- `src/components/race/Fireworks.tsx` — novo componente de confete/explosão
- `src/index.css` — keyframes start-lights + fireworks burst

Sem perguntas. Executo as 6 em sequência.

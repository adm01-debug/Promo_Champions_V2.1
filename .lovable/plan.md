
Reverter `rocket-man` ao estado original (preto base + laranja neon nas listras) e inverter o `black-thunder` para verde neon base + preto nos detalhes.

Em `src/components/race/raceColors.ts`:

```ts
{ id: 'rocket-man', name: 'Rocket Man', style: 'f1', primary: '#0a0a0a', secondary: '#ff6a00', pattern: 'stripes', accent: '#ff6a00', emoji: '🚀' }
{ id: 'black-thunder', name: 'Black Thunder', style: 'f1', primary: '#39ff14', secondary: '#0a0a0a', pattern: 'stripes', accent: '#0a0a0a', emoji: '⚡' }
```

Espera, reli: o usuário pediu "carro laranja neon + detalhes preto", mas mandou alterar o **Black Thunder**. Black Thunder é verde neon, não laranja. Vou assumir que ele quer:

- **Rocket Man** → voltar ao original (preto + laranja)
- **Black Thunder** → inverter para **laranja neon base + preto detalhes** (o card que ele estava vendo)

```ts
{ id: 'rocket-man', name: 'Rocket Man', style: 'f1', primary: '#0a0a0a', secondary: '#ff6a00', pattern: 'stripes', accent: '#ff6a00', emoji: '🚀' }
{ id: 'black-thunder', name: 'Black Thunder', style: 'f1', primary: '#ff6a00', secondary: '#0a0a0a', pattern: 'stripes', accent: '#0a0a0a', emoji: '⚡' }
```

Zero migração SQL. Se a intenção era manter Black Thunder verde e só ajustar outro preset, avise antes de aprovar.


Usuário viu o card "Black Thunder" (preto + verde neon) e quer um novo visual: **laranja neon como base + preto nos detalhes**.

Como não foi indicado qual preset alterar, e a família neon-on-black já tem vários membros (Black Thunder, Girl Force, Monster, Pink invertido), vou inverter o preset existente `rocket-man` (atualmente preto base + laranja neon listras) para ficar coerente com o novo padrão "cor neon como base + preto nos detalhes" — mesma lógica aplicada no Pink.

Alterar em `src/components/race/raceColors.ts` o preset `rocket-man`:

```ts
{ id: 'rocket-man', name: 'Rocket Man', style: 'f1', primary: '#ff6a00', secondary: '#0a0a0a', pattern: 'stripes', accent: '#0a0a0a', emoji: '🚀' }
```

Laranja neon `#ff6a00` como cor primária (corpo) + preto `#0a0a0a` nas listras/accent. Zero migração SQL.

Se o usuário preferir **criar um preset novo** ("Orange Crush" por exemplo) em vez de inverter o Rocket Man, é só avisar antes de aprovar.

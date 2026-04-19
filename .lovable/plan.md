
User quer renomear "Trans Pride" e "Bi Pride" (nomes ficaram ruins nos cards) e pintar ambos com cores arco-íris.

Olhando `raceColors.ts`:
- `pride-trans`: primary `#5BCEFA`, secondary `#F5A9B8` → renomear + trocar pattern para `pride-rainbow`
- `pride-bi`: primary `#D60270`, secondary `#0038A8` → renomear + trocar pattern para `pride-rainbow`

Mas se os 3 ficarem idênticos (todos rainbow), perdem identidade. Melhor:
- Manter os 3 com `pattern: pride-rainbow` (todos pintados arco-íris como pedido)
- Diferenciar por `style` (f1/kart/stock) e nomes mais curtos/elegantes

## Plano

**Edição única em `src/components/race/raceColors.ts`:**

| Antes | Depois |
|---|---|
| `pride-rainbow` / "Pride Rainbow" / f1 | "Orgulho F1" / f1 / pattern rainbow |
| `pride-trans` / "Trans Pride" / kart | "Orgulho Kart" / kart / pattern rainbow |
| `pride-bi` / "Bi Pride" / stock | "Orgulho Stock" / stock / pattern rainbow |

Todos os 3 com `pattern: 'pride-rainbow'`, mantendo emojis distintos (🏳️‍🌈 / 🏳️‍⚧️ / 💗) e estilos distintos para variedade visual. IDs preservados para retrocompat com carros já salvos no banco.

**Sem outras mudanças** — `LiveryPattern` já suporta `pride-rainbow`, e os IDs continuam os mesmos (carros existentes não quebram).

## Garantias
Zero migração SQL · IDs preservados · 3 carros visualmente arco-íris mas com chassi diferente (f1/kart/stock) · arquivo < 200 linhas.

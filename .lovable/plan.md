
**Executar Melhoria #8 — SEO + a11y** no módulo Cadência de Orçamentos. Status: #1–#7 concluídas. Restam 3 (#8, #9, #10).

### #8 — SEO + a11y completos

**SEO (`src/pages/QuoteCadencesPage.tsx`)**
- Helmet enriquecido:
  - `<title>Cadência de Orçamentos | Promo Champions</title>`
  - `<meta name="description">` (≤160 chars) descrevendo follow-up automatizado de orçamentos.
  - `<link rel="canonical" href="https://championgifts.lovable.app/cadencias-orcamentos" />`
  - OG: `og:title`, `og:description`, `og:type=website`, `og:url`, `og:image` (favicon/branded).
  - Twitter: `twitter:card=summary_large_image`, `twitter:title`, `twitter:description`.
- H1 semântico único na página (já existe — validar).

**Acessibilidade**
- `QuoteCadenceMetrics.tsx`:
  - Container com `role="region"` + `aria-label="Métricas de cadência de orçamentos"`.
  - Cada valor numérico em `<span role="status" aria-live="polite">`.
- `QuoteCadenceCard` / lista:
  - `aria-label` descritivo no card raiz (cliente + status).
  - `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` em cards interativos e botões.
- `QuoteCadenceDetailDrawer`:
  - `aria-describedby` apontando para descrição interna.
  - `aria-label` em todos os botões de ação (Pausar, Retomar, Cancelar, Concluir tarefa).
- `QuoteCadenceConversionChart`:
  - `aria-label` no `ToggleGroup` ("Período do gráfico").
  - `aria-label` em cada `ToggleGroupItem` ("Últimos 30 dias", etc.).
- DropdownMenu triggers (ações do card): `aria-label="Ações do orçamento {cliente}"`.

**Padrões mantidos:**
- Tokens semânticos, Sora/Inter, ≤400 linhas, TS strict, zero warnings.
- Sem alterações de schema, sem impacto em outros módulos.

**Próximos passos após #8:** #9 (skeletons shimmer + stagger Framer Motion + empty state SVG) e #10 (memória `mem://features/quote-cadence-module` + atualização do índice).

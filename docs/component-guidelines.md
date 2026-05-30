# 🏗 Component Guidelines — Promo Champions v2

## Naming
- **Components**: `PascalCase` (`LevelBadge.tsx`, `useAbortController.ts`)
- **Utilities**: `kebab-case` (`bi-helpers.ts`, `date-helpers.ts`)
- **Pages**: `PascalCase` (`ABCAnalysisPage.tsx`)
- **Hooks**: `camelCase` with `use` prefix (`useAuth.ts`)
- **Contexts**: `PascalCase` with `Context` suffix (`AuthContext.tsx`)

## TODO / FIXME Conventions
```ts
// TODO(@username): #issue-id — Description of what needs to be done
// FIXME(@username): #issue-id — Bug description with impact
```

## forwardRef
All UI components that wrap native elements MUST use `forwardRef`:
```tsx
const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ ... }, ref) => <button ref={ref} ... />
);
Button.displayName = 'Button';
```

## displayName
Every component MUST have `Component.displayName` set for React DevTools debugging.

## useState Lazy Initialization
For expensive initial values, use the lazy initializer pattern:
```tsx
// ✅ DO: Lazy initializer
const [data, setData] = useState(() => expensiveComputation());

// ❌ DON'T: Recalculated every render
const [data, setData] = useState(expensiveComputation());
```

## Imports
- No unused imports (enforced by ESLint)
- Group imports: React → third-party → @/ aliases → relative
- Use `import type` for type-only imports

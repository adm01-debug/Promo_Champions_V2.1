# Architecture

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State**: React Query + Zustand
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Realtime**: Supabase Realtime
- **Deployment**: Vercel

## Folder Structure

```
src/
├── components/
│   ├── shared/     # Reusable UI components
│   ├── analytics/  # Analytics-specific
│   ├── dashboard/  # Dashboard widgets
│   └── forms/      # Form components
├── hooks/          # Custom React hooks
├── lib/            # Utility functions
├── pages/          # Page components
└── integrations/   # External integrations
```

## Data Flow

1. UI Component
2. Custom Hook (React Query)
3. Supabase Client
4. PostgreSQL Database
5. Real-time updates via websockets

## State Management

- **Server State**: React Query
- **UI State**: React useState/useReducer
- **Global State**: Zustand (minimal)

## Authentication

- Supabase Auth
- Row Level Security (RLS)
- JWT tokens
- 2FA support

# API Documentation

## Supabase Tables

### clients
- `id`: UUID (PK)
- `name`: String
- `email`: String
- `user_id`: UUID (FK)
- `created_at`: Timestamp

### deals
- `id`: UUID (PK)
- `title`: String
- `value`: Number
- `stage`: Enum
- `client_id`: UUID (FK)
- `user_id`: UUID (FK)

### activities
- `id`: UUID (PK)
- `type`: Enum
- `description`: Text
- `client_id`: UUID (FK)

## React Query Keys

```typescript
['clients'] // All clients
['clients', id] // Single client
['deals'] // All deals
['deals', { status }] // Filtered deals
```

## Custom Hooks

### useClients()
Fetch and manage clients

### useDeals(filters?)
Fetch deals with optional filters

### useDashboardKPIs()
Get dashboard metrics

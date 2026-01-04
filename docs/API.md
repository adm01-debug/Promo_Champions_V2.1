# API Documentation

## Supabase Tables

### clients
- id, name, email, phone, user_id

### deals
- id, title, value, status, client_id, user_id

### activities
- id, type, description, client_id, deal_id, user_id

## React Query Keys
- ['clients'] - All clients
- ['deals'] - All deals
- ['activities'] - All activities

## Custom Hooks
- useClients() - Fetch clients
- useDeals() - Fetch deals
- useActivities() - Fetch activities
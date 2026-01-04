# Soft Delete Implementation

## Overview
Soft delete allows "deleting" records without actually removing them from the database.

## Implementation

### Add deleted_at column
```sql
ALTER TABLE clients ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE deals ADD COLUMN deleted_at TIMESTAMP;
ALTER TABLE activities ADD COLUMN deleted_at TIMESTAMP;
```

### Update queries
```typescript
// Instead of DELETE
await supabase
  .from('clients')
  .update({ deleted_at: new Date().toISOString() })
  .eq('id', clientId);

// Filter out deleted records
await supabase
  .from('clients')
  .select('*')
  .is('deleted_at', null);
```

## Benefits
- Data recovery
- Audit trail
- Referential integrity

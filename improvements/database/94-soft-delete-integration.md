# Melhoria 94 - Soft Delete Integration Guide

## 1. Apply Migration
```bash
supabase migration up 20251228_add_soft_delete
```

## 2. Update Components
```typescript
// ClientRow.tsx
import { useSoftDelete } from '@/hooks/useSoftDelete';

const ClientRow = ({ client }) => {
  const { deleteRecord } = useSoftDelete('clients');
  
  return (
    <DeleteButton
      onDelete={() => deleteRecord(client.id)}
      itemName={client.name}
    />
  );
};
```

## 3. Add RecycleBin Page
```typescript
// pages/RecycleBin.tsx
import { RecycleBin } from '@/components/RecycleBin';

export const RecycleBinPage = () => {
  return <RecycleBin />;
};
```

## Tables with Soft Delete:
- clients ✅
- deals ✅
- activities ✅
- products ✅
- suppliers ✅
- teams ✅

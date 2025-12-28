# API Documentation

## Edge Functions

### 1. `calculate-metrics`
**Endpoint**: `/functions/v1/calculate-metrics`
**Method**: POST
**Auth**: Required

**Request**:
```json
{
  "deal_id": "uuid",
  "metric_type": "probability" | "velocity" | "churn"
}
```

**Response**:
```json
{
  "value": 0.85,
  "confidence": 0.92,
  "factors": ["stage", "time_in_stage", "activity_count"]
}
```

## RPC Functions

### 1. `get_user_permissions`
Returns user's permissions based on role.

```sql
SELECT * FROM get_user_permissions();
```

**Returns**:
```json
{
  "clients": ["read", "create", "update"],
  "deals": ["read", "create", "update", "delete"]
}
```

### 2. `route_lead`
Assigns lead to best salesperson.

```sql
SELECT * FROM route_lead(lead_score := 85, region := 'SP');
```

**Returns**: `UUID` of assigned salesperson

### 3. `predict_churn`
Calculates churn probability for client.

```sql
SELECT * FROM predict_churn(client_id);
```

**Returns**: `NUMERIC` (0.0 - 1.0)

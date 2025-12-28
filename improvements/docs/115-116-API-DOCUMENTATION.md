# API Documentation

## 🌐 Edge Functions

### 1. calculate-sales-metrics
**Endpoint:** `/functions/v1/calculate-sales-metrics`  
**Method:** POST  
**Auth:** Required

**Request:**
```json
{
  "user_id": "uuid",
  "start_date": "2025-01-01",
  "end_date": "2025-12-31"
}
```

**Response:**
```json
{
  "total_revenue": 150000,
  "deals_won": 45,
  "deals_lost": 12,
  "conversion_rate": 78.9,
  "avg_deal_value": 3333.33
}
```

### 2. route-lead
**Endpoint:** `/functions/v1/route-lead`  
**Method:** POST  
**Auth:** Required

**Request:**
```json
{
  "lead_score": 85,
  "region": "SP",
  "industry": "tech"
}
```

**Response:**
```json
{
  "salesperson_id": "uuid",
  "salesperson_name": "João Silva",
  "confidence": 0.92,
  "reason": "High score + region match + industry expertise"
}
```

### 3. predict-churn
**Endpoint:** `/functions/v1/predict-churn`  
**Method:** POST  
**Auth:** Required

**Request:**
```json
{
  "client_id": "uuid"
}
```

**Response:**
```json
{
  "churn_probability": 0.35,
  "risk_level": "medium",
  "factors": [
    "No activity in 45 days",
    "Declining engagement"
  ],
  "recommendations": [
    "Schedule check-in call",
    "Send value proposition email"
  ]
}
```

## 📞 RPC Functions

### get_dashboard_kpis
```sql
SELECT * FROM get_dashboard_kpis(user_id UUID);
```

**Returns:**
```sql
TABLE (
  deals_won INTEGER,
  deals_lost INTEGER,
  revenue NUMERIC,
  avg_closing_days NUMERIC,
  deals_this_month INTEGER
)
```

### calculate_deal_metrics
```sql
SELECT * FROM calculate_deal_metrics(deal_id UUID);
```

**Returns:**
```sql
TABLE (
  win_probability NUMERIC,
  days_in_stage INTEGER,
  velocity_score NUMERIC,
  next_best_action TEXT
)
```

### refresh_materialized_views
```sql
SELECT refresh_materialized_views();
```

Refreshes all materialized views (dashboard KPIs, leaderboard).

## 🔐 Authentication

### Login
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});
```

### 2FA Verification
```typescript
const { data, error } = await supabase.auth.mfa.verify({
  factorId: 'factor-id',
  challengeId: 'challenge-id',
  code: '123456'
});
```

### Logout
```typescript
await supabase.auth.signOut();
```

## 📊 Realtime Subscriptions

### Subscribe to Deal Updates
```typescript
const channel = supabase
  .channel('deals-changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'deals'
    },
    (payload) => {
      console.log('Change received!', payload);
    }
  )
  .subscribe();
```

### Unsubscribe
```typescript
channel.unsubscribe();
```

## 🚨 Error Handling

All API responses follow this structure:

**Success:**
```json
{
  "data": { ... },
  "error": null
}
```

**Error:**
```json
{
  "data": null,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": { ... }
  }
}
```

**Common Error Codes:**
- `UNAUTHORIZED` (401)
- `FORBIDDEN` (403)
- `NOT_FOUND` (404)
- `VALIDATION_ERROR` (422)
- `RATE_LIMIT_EXCEEDED` (429)
- `INTERNAL_ERROR` (500)

## 📈 Rate Limits

- **Login:** 5 requests/minute
- **API Calls:** 100 requests/minute
- **Realtime Connections:** 10 concurrent
- **File Uploads:** 10 MB max size

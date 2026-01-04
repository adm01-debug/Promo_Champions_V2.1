# API Documentation

## Overview

SalesPro provides a comprehensive REST API for integration with external systems.

## Authentication

All API requests require authentication using a Supabase JWT token.

```bash
Authorization: Bearer YOUR_JWT_TOKEN
```

## Base URL

```
Production: https://api.salespro.com/v1
Staging: https://api-staging.salespro.com/v1
```

## Endpoints

### Clients

#### List Clients
```
GET /clients
```

Query Parameters:
- `status` - Filter by status (lead, qualified, customer)
- `limit` - Number of results (default: 50)
- `offset` - Pagination offset

Response:
```json
{
  "data": [
    {
      "id": "uuid",
      "name": "Client Name",
      "email": "client@example.com",
      "status": "qualified"
    }
  ],
  "total": 100
}
```

#### Create Client
```
POST /clients
```

Request Body:
```json
{
  "name": "New Client",
  "email": "new@example.com",
  "phone": "+1234567890",
  "company": "Company Inc"
}
```

### Deals

#### List Deals
```
GET /deals
```

#### Create Deal
```
POST /deals
```

#### Update Deal
```
PATCH /deals/:id
```

### Webhooks

#### Register Webhook
```
POST /webhooks
```

Request Body:
```json
{
  "url": "https://your-domain.com/webhook",
  "events": ["deal.created", "deal.won"],
  "secret": "your-secret-key"
}
```

## Webhook Events

Available events:
- `deal.created`
- `deal.updated`
- `deal.won`
- `deal.lost`
- `client.created`
- `client.updated`
- `activity.logged`

## Rate Limits

- 100 requests per minute per user
- 1000 requests per hour per user

## Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests
- `500` - Internal Server Error

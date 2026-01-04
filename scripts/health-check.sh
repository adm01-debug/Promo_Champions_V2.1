#!/bin/bash
# Health Check Script

URL=${1:-https://salespro.com}

echo "🏥 Running health checks for $URL"

# Check HTTP status
HTTP_STATUS=$(curl -o /dev/null -s -w "%{http_code}" "$URL")

if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ HTTP Status: OK ($HTTP_STATUS)"
else
    echo "❌ HTTP Status: FAILED ($HTTP_STATUS)"
    exit 1
fi

# Check API endpoint
API_STATUS=$(curl -o /dev/null -s -w "%{http_code}" "$URL/api/health")

if [ "$API_STATUS" = "200" ]; then
    echo "✅ API: OK"
else
    echo "❌ API: FAILED"
    exit 1
fi

# Check database
DB_STATUS=$(curl -s "$URL/api/health" | jq -r '.database')

if [ "$DB_STATUS" = "ok" ]; then
    echo "✅ Database: OK"
else
    echo "❌ Database: FAILED"
    exit 1
fi

echo "✅ All health checks passed!"

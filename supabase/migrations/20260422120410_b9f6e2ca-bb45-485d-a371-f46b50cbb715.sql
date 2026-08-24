-- Cleanup de subscriptions de teste criadas durante validação ponta-a-ponta
-- da persistência em winloss_webhook_deliveries (test.invalid).
DELETE FROM public.winloss_webhook_subscriptions
WHERE url LIKE 'https://test.invalid/persist-%';
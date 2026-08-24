DELETE FROM public.winloss_webhook_subscriptions
WHERE url LIKE 'https://httpbin.org/%'
   OR url LIKE '%invalid-domain-xyz-test-lovable%';
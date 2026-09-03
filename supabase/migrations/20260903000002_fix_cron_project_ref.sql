-- Replace stale project ref in pg_cron job commands.
-- Migrations 20260512214007, 20260726202421, 20260726202545 created jobs pointing
-- to rapjswienfhkobhlamxb; the official project is usyxfpqlsspldubptrdl.
UPDATE cron.job
SET command = replace(command, 'rapjswienfhkobhlamxb', 'usyxfpqlsspldubptrdl')
WHERE command LIKE '%rapjswienfhkobhlamxb%';

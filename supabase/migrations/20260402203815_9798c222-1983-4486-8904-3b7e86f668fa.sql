
-- Add lat/lng columns to clients table for map functionality
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS lat double precision;
ALTER TABLE public.clients ADD COLUMN IF NOT EXISTS lng double precision;

-- Add index for geospatial queries
CREATE INDEX IF NOT EXISTS idx_clients_lat_lng ON public.clients (lat, lng) WHERE lat IS NOT NULL AND lng IS NOT NULL;

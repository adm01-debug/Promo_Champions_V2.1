ALTER TABLE public.objections_library ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Create index for faster tag searching
CREATE INDEX IF NOT EXISTS idx_objections_library_tags ON public.objections_library USING GIN(tags);

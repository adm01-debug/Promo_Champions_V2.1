-- Add 'urgent' to task_priority
ALTER TYPE public.task_priority ADD VALUE IF NOT EXISTS 'urgent';

-- Add 'discount' to task_type
ALTER TYPE public.task_type ADD VALUE IF NOT EXISTS 'discount';
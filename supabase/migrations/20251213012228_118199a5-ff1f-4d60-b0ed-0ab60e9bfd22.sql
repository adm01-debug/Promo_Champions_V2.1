-- Create task priority enum
CREATE TYPE public.task_priority AS ENUM ('high', 'medium', 'low');

-- Create task status enum
CREATE TYPE public.task_status AS ENUM ('pending', 'in_progress', 'completed', 'cancelled');

-- Create task type enum
CREATE TYPE public.task_type AS ENUM ('call', 'meeting', 'follow_up', 'email', 'proposal', 'other');

-- Create tasks table
CREATE TABLE public.tasks (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    salesperson_id UUID REFERENCES public.salespeople(id) ON DELETE CASCADE,
    sale_id UUID REFERENCES public.sales(id) ON DELETE SET NULL,
    priority task_priority NOT NULL DEFAULT 'medium',
    status task_status NOT NULL DEFAULT 'pending',
    task_type task_type NOT NULL DEFAULT 'other',
    due_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_time TIME,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow public read access to tasks"
ON public.tasks FOR SELECT USING (true);

CREATE POLICY "Allow public insert to tasks"
ON public.tasks FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update to tasks"
ON public.tasks FOR UPDATE USING (true);

CREATE POLICY "Allow public delete to tasks"
ON public.tasks FOR DELETE USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
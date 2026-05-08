export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskType = 'call' | 'email' | 'meeting' | 'follow_up' | 'other' | 'proposal' | 'discount';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled';

export interface TaskRecord {
  id: string;
  title: string;
  description: string | null;
  task_type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string;
  due_time: string | null;
  sale_id: string | null;
  salesperson_id: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  sale?: { client_name: string; product_name?: string };
  salesperson?: { name: string; avatar_url?: string };
}

/** @deprecated Use TaskRecord instead */
export type Task = TaskRecord;

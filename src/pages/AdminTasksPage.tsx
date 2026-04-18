import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { TaskConsoleHub } from '@/components/admin/task-console/TaskConsoleHub';
import { Helmet } from 'react-helmet-async';

export default function AdminTasksPage() {
  return (
    <ProtectedRoute requiredRole="admin">
      <Helmet>
        <title>Console de Tarefas & XP | Admin</title>
        <meta name="description" content="Gerencie o catálogo de tarefas, atribuições e pontuação XP dos vendedores." />
      </Helmet>
      <div className="container mx-auto px-4 py-6">
        <TaskConsoleHub />
      </div>
    </ProtectedRoute>
  );
}

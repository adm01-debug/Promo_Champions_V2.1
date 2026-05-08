import React from "react";
import { FC } from 'react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, Mail, Video, MessageSquare, Calendar, Clock, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

type ActivityType = 'call' | 'email' | 'meeting' | 'message' | 'task';
type ActivityStatus = 'pending' | 'completed' | 'overdue' | 'scheduled';

interface Activity {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  dueDate?: Date;
  completedAt?: Date;
  status: ActivityStatus;
  client?: {
    name: string;
    avatar?: string;
  };
}

const typeConfig = {
  call: { icon: Phone, label: 'Ligação', color: 'text-info' },
  email: { icon: Mail, label: 'Email', color: 'text-success' },
  meeting: { icon: Video, label: 'Reunião', color: 'text-primary' },
  message: { icon: MessageSquare, label: 'Mensagem', color: 'text-streak' },
  task: { icon: Calendar, label: 'Tarefa', color: 'text-muted-foreground' },
};

const statusConfig = {
  pending: { icon: Circle, label: 'Pendente', color: 'text-warning' },
  completed: { icon: CheckCircle2, label: 'Concluído', color: 'text-success' },
  overdue: { icon: AlertCircle, label: 'Atrasado', color: 'text-destructive' },
  scheduled: { icon: Clock, label: 'Agendado', color: 'text-info' },
};

interface ActivityItemProps {
  activity: Activity;
  onComplete?: () => void;
  onClick?: () => void;
  compact?: boolean;
}

export const ActivityItem: FC<ActivityItemProps> = React.memo(({
  activity,
  onComplete,
  onClick,
  compact = false,
}) => {
  const typeInfo = typeConfig[activity.type];
  const statusInfo = statusConfig[activity.status];
  const TypeIcon = typeInfo.icon;
  const StatusIcon = statusInfo.icon;

  const formatDueDate = (date: Date) => {
    if (isToday(date)) return 'Hoje';
    if (isTomorrow(date)) return 'Amanhã';
    return format(date, "dd 'de' MMM", { locale: ptBR });
  };

  if (compact) {
    return (
      <div
        onClick={onClick}
        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors"
      >
        <TypeIcon size={16} className={typeInfo.color} />
        <span className="flex-1 text-sm truncate">{activity.title}</span>
        {activity.dueDate && (
          <span className={cn(
            'text-xs',
            isPast(activity.dueDate) && activity.status !== 'completed' 
              ? 'text-destructive' 
              : 'text-muted-foreground'
          )}>
            {formatDueDate(activity.dueDate)}
          </span>
        )}
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ x: 6, backgroundColor: "rgba(255, 255, 255, 0.05)" }}
      className="flex items-start gap-4 p-4 rounded-xl hover:bg-muted cursor-pointer transition-all duration-300 border border-transparent hover:border-white/10"
      onClick={onClick}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onComplete?.(); }}
        className={cn(
          'mt-0.5 p-1 rounded-full transition-colors',
          activity.status === 'completed' ? 'text-success' : 'text-muted-foreground hover:text-primary'
        )}
      >
        <StatusIcon size={18} />
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className={cn(
            'font-medium text-sm',
            activity.status === 'completed' && 'line-through text-muted-foreground'
          )}>
            {activity.title}
          </h4>
          <Badge variant="outline" className={cn('text-xs', typeInfo.color)}>
            <TypeIcon size={10} className="mr-1" />
            {typeInfo.label}
          </Badge>
        </div>

        {activity.description && (
          <p className="text-xs text-muted-foreground line-clamp-1 mb-1">
            {activity.description}
          </p>
        )}

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {activity.dueDate && (
            <span className={cn(
              'flex items-center gap-1',
              isPast(activity.dueDate) && activity.status !== 'completed' && 'text-destructive'
            )}>
              <Clock size={12} />
              {formatDueDate(activity.dueDate)}
            </span>
          )}
          {activity.client && (
            <span className="flex items-center gap-1">
              <Avatar className="h-4 w-4">
                <AvatarImage src={activity.client.avatar} />
                <AvatarFallback className="text-[8px]">
                  {activity.client.name.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              {activity.client.name}
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
});
ActivityItem.displayName = "ActivityItem";

interface ActivityListProps {
  activities: Activity[];
  onActivityClick?: (activity: Activity) => void;
  onActivityComplete?: (activity: Activity) => void;
  compact?: boolean;
  groupByDate?: boolean;
}

export const ActivityList: FC<ActivityListProps> = React.memo(({
  activities,
  onActivityClick,
  onActivityComplete,
  compact = false,
  groupByDate: _groupByDate = false,
}) => {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar size={32} className="mx-auto mb-2 opacity-50" />
        <p>Nenhuma atividade</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {activities.map(activity => (
        <ActivityItem
          key={activity.id}
          activity={activity}
          onClick={() => onActivityClick?.(activity)}
          onComplete={() => onActivityComplete?.(activity)}
          compact={compact}
        />
      ))}
    </div>
  );
});
ActivityList.displayName = "ActivityList";

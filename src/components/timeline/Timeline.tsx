import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TimelineEvent {
  id: string;
  title: string;
  description?: string;
  date?: string;
  icon?: React.ReactNode;
  status?: 'completed' | 'current' | 'pending';
}

interface TimelineProps {
  events: TimelineEvent[];
  orientation?: 'vertical' | 'horizontal';
  className?: string;
}

export const Timeline: React.FC<TimelineProps> = ({
  events,
  orientation = 'vertical',
  className,
}) => {
  const isVertical = orientation === 'vertical';

  const getStatusStyles = (status?: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500 border-green-500';
      case 'current':
        return 'bg-primary border-primary ring-4 ring-primary/20';
      default:
        return 'bg-muted border-muted-foreground/30';
    }
  };

  return (
    <div
      className={cn(
        'relative',
        isVertical ? 'space-y-6' : 'flex gap-6 overflow-x-auto pb-4',
        className
      )}
    >
      {events.map((event, index) => (
        <motion.div
          key={event.id}
          initial={{ opacity: 0, y: isVertical ? 20 : 0, x: isVertical ? 0 : 20 }}
          animate={{ opacity: 1, y: 0, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className={cn(
            'relative',
            isVertical ? 'flex gap-4' : 'flex flex-col items-center min-w-[150px]'
          )}
        >
          {/* Connector Line */}
          {index < events.length - 1 && (
            <div
              className={cn(
                'absolute bg-border',
                isVertical
                  ? 'left-3 top-8 w-0.5 h-[calc(100%+1rem)]'
                  : 'top-3 left-8 h-0.5 w-[calc(100%+1rem)]'
              )}
            />
          )}

          {/* Dot */}
          <div
            className={cn(
              'relative z-10 flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center',
              getStatusStyles(event.status)
            )}
          >
            {event.icon && (
              <span className="text-white text-xs">{event.icon}</span>
            )}
          </div>

          {/* Content */}
          <div className={cn(isVertical ? 'flex-1 pb-2' : 'text-center mt-3')}>
            {event.date && (
              <p className="text-xs text-muted-foreground mb-1">{event.date}</p>
            )}
            <h4
              className={cn(
                'font-medium text-sm',
                event.status === 'pending' && 'text-muted-foreground'
              )}
            >
              {event.title}
            </h4>
            {event.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {event.description}
              </p>
            )}
          </div>
        </motion.div>
      ))}
    </div>
  );
};

interface ActivityFeedItem {
  id: string;
  user: {
    name: string;
    avatar?: string;
  };
  action: string;
  target?: string;
  timestamp: string;
  icon?: React.ReactNode;
}

interface ActivityFeedProps {
  items: ActivityFeedItem[];
  className?: string;
}

export const ActivityFeed: React.FC<ActivityFeedProps> = ({ items, className }) => {
  return (
    <div className={cn('space-y-4', className)}>
      {items.map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex gap-3"
        >
          <div className="flex-shrink-0">
            {item.user.avatar ? (
              <img
                src={item.user.avatar}
                alt={item.user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary text-sm font-medium">
                {item.user.name.charAt(0)}
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-medium">{item.user.name}</span>{' '}
              <span className="text-muted-foreground">{item.action}</span>
              {item.target && (
                <span className="font-medium"> {item.target}</span>
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {item.timestamp}
            </p>
          </div>
          {item.icon && (
            <div className="flex-shrink-0 text-muted-foreground">
              {item.icon}
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

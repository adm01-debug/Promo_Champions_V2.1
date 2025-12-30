import { FC, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Video, 
  Phone, 
  MapPin,
  Plus,
  ChevronLeft,
  ChevronRight,
  Users 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, startOfWeek, addDays, isSameDay, isToday, addWeeks, subWeeks } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';

interface CalendarEvent {
  id: string;
  title: string;
  type: 'meeting' | 'call' | 'visit' | 'task';
  startTime: Date;
  endTime?: Date;
  location?: string;
  attendees?: { name: string; avatar?: string }[];
  color?: string;
}

interface WeekCalendarProps {
  events: CalendarEvent[];
  selectedDate?: Date;
  onDateSelect?: (date: Date) => void;
  onEventClick?: (event: CalendarEvent) => void;
  onCreateEvent?: (date: Date) => void;
  className?: string;
}

const typeConfig = {
  meeting: { icon: Video, color: 'bg-blue-500' },
  call: { icon: Phone, color: 'bg-green-500' },
  visit: { icon: MapPin, color: 'bg-purple-500' },
  task: { icon: CalendarIcon, color: 'bg-orange-500' },
};

export const WeekCalendar: FC<WeekCalendarProps> = ({
  events,
  selectedDate = new Date(),
  onDateSelect,
  onEventClick,
  onCreateEvent,
  className,
}) => {
  const [weekStart, setWeekStart] = useState(startOfWeek(selectedDate, { locale: ptBR }));
  
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getEventsForDate = (date: Date) => 
    events.filter(e => isSameDay(e.startTime, date));

  const navigateWeek = (direction: 'prev' | 'next') => {
    setWeekStart(prev => 
      direction === 'next' ? addWeeks(prev, 1) : subWeeks(prev, 1)
    );
  };

  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">
          {format(weekStart, "MMMM 'de' yyyy", { locale: ptBR })}
        </h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateWeek('prev')}>
            <ChevronLeft size={16} />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setWeekStart(startOfWeek(new Date(), { locale: ptBR }))}>
            Hoje
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigateWeek('next')}>
            <ChevronRight size={16} />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {weekDays.map(day => {
          const dayEvents = getEventsForDate(day);
          const isSelected = isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);

          return (
            <div
              key={day.toISOString()}
              className={cn(
                'min-h-[120px] rounded-lg border p-2 cursor-pointer transition-colors',
                isSelected && 'border-primary bg-primary/5',
                isTodayDate && !isSelected && 'border-primary/50',
                !isSelected && !isTodayDate && 'hover:border-muted-foreground/50'
              )}
              onClick={() => onDateSelect?.(day)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground">
                    {format(day, 'EEE', { locale: ptBR })}
                  </p>
                  <p className={cn(
                    'text-lg font-semibold',
                    isTodayDate && 'text-primary'
                  )}>
                    {format(day, 'd')}
                  </p>
                </div>
                {onCreateEvent && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100"
                    onClick={(e) => { e.stopPropagation(); onCreateEvent(day); }}
                  >
                    <Plus size={12} />
                  </Button>
                )}
              </div>

              <div className="space-y-1">
                {dayEvents.slice(0, 3).map(event => {
                  const config = typeConfig[event.type];
                  return (
                    <motion.div
                      key={event.id}
                      whileHover={{ scale: 1.02 }}
                      onClick={(e) => { e.stopPropagation(); onEventClick?.(event); }}
                      className={cn(
                        'text-xs p-1 rounded truncate text-white',
                        event.color || config.color
                      )}
                    >
                      {format(event.startTime, 'HH:mm')} {event.title}
                    </motion.div>
                  );
                })}
                {dayEvents.length > 3 && (
                  <p className="text-xs text-muted-foreground text-center">
                    +{dayEvents.length - 3} mais
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

interface EventCardProps {
  event: CalendarEvent;
  onClick?: () => void;
}

export const EventCard: FC<EventCardProps> = ({ event, onClick }) => {
  const config = typeConfig[event.type];
  const Icon = config.icon;

  return (
    <motion.div whileHover={{ x: 2 }}>
      <Card
        className="p-3 cursor-pointer hover:border-primary/50 transition-colors"
        onClick={onClick}
      >
        <div className="flex items-start gap-3">
          <div className={cn('p-2 rounded-lg', config.color)}>
            <Icon size={16} className="text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">{event.title}</h4>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <span className="flex items-center gap-1">
                <Clock size={10} />
                {format(event.startTime, 'HH:mm')}
                {event.endTime && ` - ${format(event.endTime, 'HH:mm')}`}
              </span>
              {event.location && (
                <span className="flex items-center gap-1">
                  <MapPin size={10} />
                  {event.location}
                </span>
              )}
            </div>
            {event.attendees && event.attendees.length > 0 && (
              <div className="flex items-center gap-1 mt-2">
                <Users size={10} className="text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {event.attendees.length} participantes
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

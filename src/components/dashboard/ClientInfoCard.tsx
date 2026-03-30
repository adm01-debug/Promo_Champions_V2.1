import { FC } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Phone, Mail, MessageSquare, Clock, MapPin, Building, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ClientInfoCardProps {
  client: {
    id: string;
    name: string;
    company?: string;
    email?: string;
    phone?: string;
    avatar?: string;
    status?: 'active' | 'inactive' | 'lead' | 'churned';
    lastContact?: Date;
    totalValue?: number;
    location?: string;
  };
  showActions?: boolean;
  onCall?: () => void;
  onEmail?: () => void;
  onMessage?: () => void;
  onClick?: () => void;
  className?: string;
}

const statusLabels = {
  active: { label: 'Ativo', variant: 'default' as const },
  inactive: { label: 'Inativo', variant: 'secondary' as const },
  lead: { label: 'Lead', variant: 'outline' as const },
  churned: { label: 'Perdido', variant: 'destructive' as const },
};

export const ClientInfoCard: FC<ClientInfoCardProps> = ({
  client,
  showActions = true,
  onCall,
  onEmail,
  onMessage,
  onClick,
  className,
}) => {
  return (
    <Card 
      className={cn('p-4 cursor-pointer hover:border-primary/50 transition-colors', className)}
      onClick={onClick}
    >
      <div className="flex items-start gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={client.avatar} alt={client.name} />
          <AvatarFallback>{client.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold truncate">{client.name}</h4>
            {client.status && (
              <Badge variant={statusLabels[client.status].variant}>
                {statusLabels[client.status].label}
              </Badge>
            )}
          </div>

          {client.company && (
            <p className="text-sm text-muted-foreground flex items-center gap-1">
              <Building size={14} />
              {client.company}
            </p>
          )}

          <div className="flex flex-wrap gap-3 mt-2 text-xs text-muted-foreground">
            {client.email && (
              <span className="flex items-center gap-1">
                <Mail size={12} />
                {client.email}
              </span>
            )}
            {client.phone && (
              <span className="flex items-center gap-1">
                <Phone size={12} />
                {client.phone}
              </span>
            )}
            {client.location && (
              <span className="flex items-center gap-1">
                <MapPin size={12} />
                {client.location}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t">
            {client.totalValue !== undefined && (
              <span className="text-sm font-medium flex items-center gap-1">
                <DollarSign size={14} />
                R$ {client.totalValue.toLocaleString()}
              </span>
            )}
            {client.lastContact && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Clock size={12} />
                {formatDistanceToNow(client.lastContact, { addSuffix: true, locale: ptBR })}
              </span>
            )}
          </div>
        </div>

        {showActions && (
          <div className="flex gap-1">
            {onCall && (
              <button
                onClick={(e) => { e.stopPropagation(); onCall(); }}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Phone size={16} />
              </button>
            )}
            {onEmail && (
              <button
                onClick={(e) => { e.stopPropagation(); onEmail(); }}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <Mail size={16} />
              </button>
            )}
            {onMessage && (
              <button
                onClick={(e) => { e.stopPropagation(); onMessage(); }}
                className="p-2 rounded-lg hover:bg-muted transition-colors"
              >
                <MessageSquare size={16} />
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  );
};

import { FC } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { StatusDot } from '@/components/status';

interface UserAvatarProps {
  src?: string | null;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showStatus?: boolean;
  isOnline?: boolean;
  className?: string;
}

export const UserAvatar: FC<UserAvatarProps> = ({
  src,
  name,
  size = 'md',
  showStatus = false,
  isOnline = false,
  className
}) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const sizeClasses = {
    xs: 'h-6 w-6 text-xs',
    sm: 'h-8 w-8 text-sm',
    md: 'h-10 w-10 text-base',
    lg: 'h-12 w-12 text-lg',
    xl: 'h-16 w-16 text-xl'
  };

  return (
    <div className="relative inline-block">
      <Avatar className={cn(sizeClasses[size], className)}>
        <AvatarImage src={src || undefined} alt={name} />
        <AvatarFallback className="bg-primary/10 text-primary font-medium">
          {initials}
        </AvatarFallback>
      </Avatar>
      {showStatus && (
        <span className="absolute bottom-0 right-0 block">
          <StatusDot status={isOnline ? 'success' : 'error'} pulse={isOnline} size="sm" />
        </span>
      )}
    </div>
  );
};

interface AvatarGroupProps {
  users: Array<{ src?: string | null; name: string }>;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const AvatarGroup: FC<AvatarGroupProps> = ({ users, max = 4, size = 'md' }) => {
  const visibleUsers = users.slice(0, max);
  const remaining = users.length - max;

  const sizeClasses = {
    sm: 'h-8 w-8 text-sm -ml-2',
    md: 'h-10 w-10 text-base -ml-3',
    lg: 'h-12 w-12 text-lg -ml-4'
  };

  return (
    <div className="flex items-center">
      {visibleUsers.map((user, idx) => (
        <UserAvatar
          key={idx}
          src={user.src}
          name={user.name}
          size={size}
          className={cn(
            "ring-2 ring-background",
            idx > 0 && sizeClasses[size]
          )}
        />
      ))}
      {remaining > 0 && (
        <div className={cn(
          "flex items-center justify-center rounded-full bg-muted ring-2 ring-background font-medium",
          sizeClasses[size]
        )}>
          +{remaining}
        </div>
      )}
    </div>
  );
};

interface AvatarWithInfoProps {
  src?: string | null;
  name: string;
  subtitle?: string;
  size?: 'sm' | 'md' | 'lg';
  action?: React.ReactNode;
}

export const AvatarWithInfo: FC<AvatarWithInfoProps> = ({
  src,
  name,
  subtitle,
  size = 'md',
  action
}) => (
  <div className="flex items-center gap-3">
    <UserAvatar src={src} name={name} size={size} />
    <div className="flex-1 min-w-0">
      <p className="text-sm font-medium truncate">{name}</p>
      {subtitle && <p className="text-xs text-muted-foreground truncate">{subtitle}</p>}
    </div>
    {action}
  </div>
);

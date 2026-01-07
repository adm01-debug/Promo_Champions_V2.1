import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { User } from 'lucide-react';

interface SmartAvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  status?: 'online' | 'offline' | 'away' | 'busy';
  showStatus?: boolean;
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl',
  '2xl': 'w-20 h-20 text-2xl',
};

const statusColors = {
  online: 'bg-emerald-500',
  offline: 'bg-gray-400',
  away: 'bg-amber-500',
  busy: 'bg-red-500',
};

const statusSizes = {
  xs: 'w-1.5 h-1.5',
  sm: 'w-2 h-2',
  md: 'w-2.5 h-2.5',
  lg: 'w-3 h-3',
  xl: 'w-4 h-4',
  '2xl': 'w-5 h-5',
};

function getInitials(name?: string): string {
  if (!name) return '';
  const words = name.trim().split(' ');
  if (words.length === 1) return words[0].charAt(0).toUpperCase();
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

function getColorFromName(name?: string): string {
  if (!name) return 'bg-primary';
  
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

export const SmartAvatar: React.FC<SmartAvatarProps> = ({
  src,
  alt,
  name,
  size = 'md',
  status,
  showStatus = false,
  className,
  onClick,
}) => {
  const [imageError, setImageError] = useState(false);
  const initials = getInitials(name);
  const bgColor = getColorFromName(name);

  const showImage = src && !imageError;
  const showInitials = !showImage && initials;
  const showIcon = !showImage && !showInitials;

  return (
    <motion.div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full',
        'ring-2 ring-background',
        sizeClasses[size],
        onClick && 'cursor-pointer',
        className
      )}
      whileHover={onClick ? { scale: 1.05 } : undefined}
      whileTap={onClick ? { scale: 0.95 } : undefined}
      onClick={onClick}
    >
      {showImage && (
        <img
          src={src}
          alt={alt || name || 'Avatar'}
          className="w-full h-full rounded-full object-cover"
          onError={() => setImageError(true)}
        />
      )}

      {showInitials && (
        <div
          className={cn(
            'w-full h-full rounded-full flex items-center justify-center',
            'font-semibold text-white',
            bgColor
          )}
        >
          {initials}
        </div>
      )}

      {showIcon && (
        <div className="w-full h-full rounded-full flex items-center justify-center bg-muted">
          <User className="w-1/2 h-1/2 text-muted-foreground" />
        </div>
      )}

      {showStatus && status && (
        <span
          className={cn(
            'absolute bottom-0 right-0 rounded-full border-2 border-background',
            statusColors[status],
            statusSizes[size]
          )}
        />
      )}
    </motion.div>
  );
};

// Avatar group
interface AvatarGroupProps {
  avatars: Array<{
    src?: string;
    name?: string;
    alt?: string;
  }>;
  max?: number;
  size?: SmartAvatarProps['size'];
  className?: string;
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 4,
  size = 'md',
  className,
}) => {
  const visible = avatars.slice(0, max);
  const remaining = avatars.length - max;

  return (
    <div className={cn('flex -space-x-2', className)}>
      {visible.map((avatar, index) => (
        <SmartAvatar
          key={index}
          src={avatar.src}
          name={avatar.name}
          alt={avatar.alt}
          size={size}
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'relative inline-flex items-center justify-center rounded-full',
            'bg-muted ring-2 ring-background font-medium text-muted-foreground',
            sizeClasses[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};

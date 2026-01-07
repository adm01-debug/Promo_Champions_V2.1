import { FC, ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check, X, Star, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PricingFeature {
  text: string;
  included: boolean;
}

interface PricingCardProps {
  name: string;
  price: number;
  period?: string;
  description?: string;
  features: PricingFeature[];
  recommended?: boolean;
  ctaLabel?: string;
  onSelect?: () => void;
  className?: string;
}

export const PricingCard: FC<PricingCardProps> = ({
  name,
  price,
  period = '/mês',
  description,
  features,
  recommended = false,
  ctaLabel = 'Começar',
  onSelect,
  className
}) => (
  <Card className={cn(
    "relative flex flex-col",
    recommended && "border-primary shadow-lg scale-105",
    className
  )}>
    {recommended && (
      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gap-1">
        <Star className="h-3 w-3" />
        Recomendado
      </Badge>
    )}
    <CardHeader>
      <CardTitle>{name}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
      <div className="mt-4">
        <span className="text-4xl font-bold">R$ {price}</span>
        <span className="text-muted-foreground">{period}</span>
      </div>
    </CardHeader>
    <CardContent className="flex-1">
      <ul className="space-y-3">
        {features.map((f, i) => (
          <li key={i} className="flex items-center gap-2">
            {f.included ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-muted-foreground" />
            )}
            <span className={cn(!f.included && "text-muted-foreground")}>
              {f.text}
            </span>
          </li>
        ))}
      </ul>
    </CardContent>
    <CardFooter>
      <Button 
        className="w-full" 
        variant={recommended ? "default" : "outline"}
        onClick={onSelect}
      >
        {ctaLabel}
      </Button>
    </CardFooter>
  </Card>
);

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
  className?: string;
}

export const FeatureCard: FC<FeatureCardProps> = ({
  icon,
  title,
  description,
  className
}) => (
  <Card className={cn("text-center", className)}>
    <CardContent className="pt-6">
      <div className="mx-auto w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
        {icon}
      </div>
      <h3 className="font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

interface TestimonialCardProps {
  quote: string;
  author: string;
  role?: string;
  avatar?: string;
  rating?: number;
  className?: string;
}

export const TestimonialCard: FC<TestimonialCardProps> = ({
  quote,
  author,
  role,
  avatar,
  rating,
  className
}) => (
  <Card className={cn("", className)}>
    <CardContent className="pt-6">
      {rating && (
        <div className="flex gap-1 mb-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={cn(
                "h-4 w-4",
                i < rating ? "text-yellow-400 fill-yellow-400" : "text-muted"
              )}
            />
          ))}
        </div>
      )}
      <blockquote className="text-muted-foreground italic mb-4">
        "{quote}"
      </blockquote>
      <div className="flex items-center gap-3">
        {avatar ? (
          <img src={avatar} alt={author} className="w-10 h-10 rounded-full" />
        ) : (
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            {author.charAt(0)}
          </div>
        )}
        <div>
          <p className="font-medium text-sm">{author}</p>
          {role && <p className="text-xs text-muted-foreground">{role}</p>}
        </div>
      </div>
    </CardContent>
  </Card>
);

interface AnnouncementBannerProps {
  icon?: ReactNode;
  message: string;
  action?: { label: string; onClick: () => void };
  onDismiss?: () => void;
  variant?: 'default' | 'success' | 'warning' | 'info';
  className?: string;
}

const bannerVariants = {
  default: 'bg-primary text-primary-foreground',
  success: 'bg-green-500 text-white',
  warning: 'bg-yellow-500 text-black',
  info: 'bg-blue-500 text-white'
};

export const AnnouncementBanner: FC<AnnouncementBannerProps> = ({
  icon = <Sparkles className="h-4 w-4" />,
  message,
  action,
  onDismiss,
  variant = 'default',
  className
}) => (
  <div className={cn(
    "px-4 py-2 flex items-center justify-center gap-2 text-sm",
    bannerVariants[variant],
    className
  )}>
    {icon}
    <span>{message}</span>
    {action && (
      <button 
        onClick={action.onClick}
        className="font-medium underline underline-offset-2 hover:no-underline"
      >
        {action.label}
      </button>
    )}
    {onDismiss && (
      <button onClick={onDismiss} className="ml-2 hover:opacity-80">
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
);

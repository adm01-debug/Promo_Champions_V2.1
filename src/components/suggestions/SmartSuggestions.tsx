import { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lightbulb, 
  TrendingUp, 
  Bell, 
  Sparkles, 
  X, 
  ArrowRight,
  RefreshCw 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSmartSuggestions } from '@/hooks/useSmartSuggestions';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

interface SmartSuggestionsProps {
  salespersonId?: string;
  className?: string;
  maxSuggestions?: number;
  variant?: 'cards' | 'list' | 'compact';
}

const typeIcons = {
  action: TrendingUp,
  insight: Lightbulb,
  reminder: Bell,
  tip: Sparkles,
};

const typeColors = {
  action: 'text-blue-500 bg-blue-500/10',
  insight: 'text-amber-500 bg-amber-500/10',
  reminder: 'text-purple-500 bg-purple-500/10',
  tip: 'text-emerald-500 bg-emerald-500/10',
};

const priorityStyles = {
  high: 'border-l-red-500',
  medium: 'border-l-amber-500',
  low: 'border-l-blue-500',
};

export const SmartSuggestions: FC<SmartSuggestionsProps> = ({
  salespersonId,
  className,
  maxSuggestions = 5,
  variant = 'cards'
}) => {
  const { 
    suggestions, 
    isLoading, 
    error, 
    refresh, 
    dismissSuggestion 
  } = useSmartSuggestions({ 
    salespersonId, 
    maxSuggestions 
  });

  if (error) {
    return (
      <div className={cn("p-4 text-center text-muted-foreground", className)}>
        <p>{error}</p>
        <Button variant="ghost" size="sm" onClick={refresh} className="mt-2">
          <RefreshCw className="h-4 w-4 mr-2" />
          Tentar novamente
        </Button>
      </div>
    );
  }

  if (isLoading && suggestions.length === 0) {
    return (
      <div className={cn("space-y-3", className)}>
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 rounded-xl bg-muted/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className={cn("p-6 text-center", className)}>
        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
          <Sparkles className="h-6 w-6 text-muted-foreground" />
        </div>
        <p className="text-muted-foreground">
          Nenhuma sugestão no momento. Continue trabalhando! 💪
        </p>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={cn("space-y-2", className)}>
        <AnimatePresence mode="popLayout">
          {suggestions.map((suggestion) => {
            const Icon = typeIcons[suggestion.type];
            return (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors group"
              >
                <div className={cn("p-1.5 rounded-md", typeColors[suggestion.type])}>
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <span className="text-sm flex-1 truncate">{suggestion.title}</span>
                {suggestion.action?.href && (
                  <Link to={suggestion.action.href}>
                    <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                  </Link>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    );
  }

  if (variant === 'list') {
    return (
      <div className={cn("space-y-2", className)}>
        <AnimatePresence mode="popLayout">
          {suggestions.map((suggestion) => {
            const Icon = typeIcons[suggestion.type];
            return (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className={cn(
                  "p-3 rounded-lg border border-l-4 bg-card",
                  priorityStyles[suggestion.priority]
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn("p-2 rounded-lg shrink-0", typeColors[suggestion.type])}>
                    <Icon className="h-4 w-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm">{suggestion.title}</h4>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {suggestion.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1">
                    {suggestion.action?.href && (
                      <Link to={suggestion.action.href}>
                        <Button variant="ghost" size="sm" className="h-7 text-xs">
                          {suggestion.action.label}
                        </Button>
                      </Link>
                    )}
                    {suggestion.dismissible && (
                      <button
                        onClick={() => dismissSuggestion(suggestion.id)}
                        className="p-1 rounded hover:bg-muted transition-colors"
                      >
                        <X className="h-3.5 w-3.5 text-muted-foreground" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    );
  }

  // Cards variant (default)
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 lg:grid-cols-3", className)}>
      <AnimatePresence mode="popLayout">
        {suggestions.map((suggestion, index) => {
          const Icon = typeIcons[suggestion.type];
          return (
            <motion.div
              key={suggestion.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: index * 0.1 }}
              className={cn(
                "relative p-4 rounded-xl border bg-card hover:shadow-lg transition-all",
                "border-l-4",
                priorityStyles[suggestion.priority]
              )}
            >
              {suggestion.dismissible && (
                <button
                  onClick={() => dismissSuggestion(suggestion.id)}
                  className="absolute top-2 right-2 p-1 rounded-full hover:bg-muted transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-muted-foreground" />
                </button>
              )}

              <div className={cn("inline-flex p-2 rounded-lg mb-3", typeColors[suggestion.type])}>
                <Icon className="h-5 w-5" />
              </div>

              <h4 className="font-semibold text-sm mb-1">{suggestion.title}</h4>
              <p className="text-xs text-muted-foreground mb-4">
                {suggestion.description}
              </p>

              {suggestion.action && (
                suggestion.action.href ? (
                  <Link to={suggestion.action.href}>
                    <Button variant="outline" size="sm" className="w-full gap-2">
                      {suggestion.action.label}
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full gap-2"
                    onClick={suggestion.action.onClick}
                  >
                    {suggestion.action.label}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                )
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

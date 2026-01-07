import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, ThumbsUp, ThumbsDown, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface StarRatingProps {
  value?: number;
  onChange?: (value: number) => void;
  max?: number;
  size?: 'sm' | 'md' | 'lg';
  readonly?: boolean;
  showValue?: boolean;
  className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
  value = 0,
  onChange,
  max = 5,
  size = 'md',
  readonly = false,
  showValue = false,
  className,
}) => {
  const [hoverValue, setHoverValue] = useState(0);

  const sizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  const displayValue = hoverValue || value;

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {Array.from({ length: max }).map((_, index) => {
        const starValue = index + 1;
        const isFilled = starValue <= displayValue;
        const isHalf = !isFilled && starValue - 0.5 <= displayValue;

        return (
          <motion.button
            key={index}
            type="button"
            disabled={readonly}
            whileHover={!readonly ? { scale: 1.2 } : {}}
            whileTap={!readonly ? { scale: 0.9 } : {}}
            onClick={() => !readonly && onChange?.(starValue)}
            onMouseEnter={() => !readonly && setHoverValue(starValue)}
            onMouseLeave={() => !readonly && setHoverValue(0)}
            className={cn(
              'transition-colors',
              !readonly && 'cursor-pointer',
              readonly && 'cursor-default'
            )}
          >
            <Star
              className={cn(
                sizes[size],
                isFilled
                  ? 'fill-yellow-400 text-yellow-400'
                  : isHalf
                  ? 'fill-yellow-400/50 text-yellow-400'
                  : 'text-muted-foreground/30'
              )}
            />
          </motion.button>
        );
      })}
      {showValue && (
        <span className="ml-2 text-sm text-muted-foreground">
          {value.toFixed(1)} / {max}
        </span>
      )}
    </div>
  );
};

interface FeedbackFormProps {
  onSubmit: (data: { rating?: number; feedback?: string; sentiment?: 'positive' | 'negative' }) => void;
  type?: 'rating' | 'sentiment' | 'comment' | 'full';
  placeholder?: string;
  submitLabel?: string;
  className?: string;
}

export const FeedbackForm: React.FC<FeedbackFormProps> = ({
  onSubmit,
  type = 'full',
  placeholder = 'Conte-nos sua experiência...',
  submitLabel = 'Enviar feedback',
  className,
}) => {
  const [rating, setRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [sentiment, setSentiment] = useState<'positive' | 'negative' | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    onSubmit({
      rating: type === 'rating' || type === 'full' ? rating : undefined,
      feedback: type === 'comment' || type === 'full' ? feedback : undefined,
      sentiment: type === 'sentiment' ? sentiment || undefined : undefined,
    });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn('text-center p-6 bg-green-500/10 rounded-lg', className)}
      >
        <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-3">
          <ThumbsUp className="h-6 w-6 text-white" />
        </div>
        <p className="font-medium text-green-600">Obrigado pelo feedback!</p>
        <p className="text-sm text-muted-foreground mt-1">
          Sua opinião é muito importante para nós.
        </p>
      </motion.div>
    );
  }

  return (
    <div className={cn('space-y-4', className)}>
      {(type === 'rating' || type === 'full') && (
        <div className="text-center">
          <p className="text-sm font-medium mb-2">Como você avalia?</p>
          <StarRating value={rating} onChange={setRating} size="lg" />
        </div>
      )}

      {type === 'sentiment' && (
        <div className="flex justify-center gap-4">
          <Button
            variant={sentiment === 'positive' ? 'default' : 'outline'}
            size="lg"
            onClick={() => setSentiment('positive')}
            className="gap-2"
          >
            <ThumbsUp className="h-5 w-5" />
            Gostei
          </Button>
          <Button
            variant={sentiment === 'negative' ? 'destructive' : 'outline'}
            size="lg"
            onClick={() => setSentiment('negative')}
            className="gap-2"
          >
            <ThumbsDown className="h-5 w-5" />
            Não gostei
          </Button>
        </div>
      )}

      {(type === 'comment' || type === 'full') && (
        <div className="space-y-2">
          <Textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder={placeholder}
            rows={3}
          />
        </div>
      )}

      <Button
        onClick={handleSubmit}
        disabled={
          (type === 'rating' && rating === 0) ||
          (type === 'sentiment' && !sentiment) ||
          (type === 'comment' && !feedback.trim())
        }
        className="w-full gap-2"
      >
        <Send className="h-4 w-4" />
        {submitLabel}
      </Button>
    </div>
  );
};

interface QuickFeedbackProps {
  question: string;
  onFeedback: (isPositive: boolean) => void;
  className?: string;
}

export const QuickFeedback: React.FC<QuickFeedbackProps> = ({
  question,
  onFeedback,
  className,
}) => {
  const [answered, setAnswered] = useState(false);

  const handleFeedback = (isPositive: boolean) => {
    onFeedback(isPositive);
    setAnswered(true);
  };

  return (
    <AnimatePresence mode="wait">
      {answered ? (
        <motion.div
          key="thanks"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className={cn('flex items-center gap-2 text-sm text-muted-foreground', className)}
        >
          <MessageSquare className="h-4 w-4" />
          Obrigado pelo feedback!
        </motion.div>
      ) : (
        <motion.div
          key="question"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={cn('flex items-center gap-3', className)}
        >
          <span className="text-sm text-muted-foreground">{question}</span>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFeedback(true)}
              className="h-7 px-2"
            >
              <ThumbsUp className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleFeedback(false)}
              className="h-7 px-2"
            >
              <ThumbsDown className="h-4 w-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

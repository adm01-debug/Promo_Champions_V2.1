import { FC, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, X, Send, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

interface FeedbackWidgetProps {
  trigger?: React.ReactNode;
  onSubmit: (data: FeedbackData) => void;
  className?: string;
}

interface FeedbackData {
  rating?: number;
  type: 'positive' | 'negative' | 'suggestion';
  message: string;
}

export const FeedbackWidget: FC<FeedbackWidgetProps> = ({
  trigger,
  onSubmit,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<'type' | 'rating' | 'message'>('type');
  const [feedbackType, setFeedbackType] = useState<FeedbackData['type']>('positive');
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    onSubmit({ rating, type: feedbackType, message });
    setSubmitted(true);
    setTimeout(() => {
      setIsOpen(false);
      setSubmitted(false);
      setStep('type');
      setRating(0);
      setMessage('');
    }, 2000);
  };

  const feedbackTypes = [
    { type: 'positive' as const, icon: ThumbsUp, label: 'Gostei!', color: 'text-green-500' },
    { type: 'negative' as const, icon: ThumbsDown, label: 'Precisa melhorar', color: 'text-red-500' },
    { type: 'suggestion' as const, icon: MessageSquare, label: 'Tenho uma ideia', color: 'text-blue-500' }
  ];

  return (
    <div className={cn("relative", className)}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(true)}>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <MessageSquare className="h-4 w-4" />
            Feedback
          </Button>
        )}
      </div>

      {/* Widget */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 10 }}
            className="absolute bottom-full mb-2 right-0 w-80 bg-card border rounded-xl shadow-xl overflow-hidden z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-muted/50">
              <h3 className="font-semibold">Seu feedback</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-full hover:bg-muted"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-center py-6"
                  >
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5 }}
                      className="text-4xl mb-3"
                    >
                      🎉
                    </motion.div>
                    <h4 className="font-semibold">Obrigado!</h4>
                    <p className="text-sm text-muted-foreground">
                      Seu feedback é muito importante para nós
                    </p>
                  </motion.div>
                ) : step === 'type' ? (
                  <motion.div
                    key="type"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-3"
                  >
                    <p className="text-sm text-muted-foreground mb-4">
                      Como você está se sentindo?
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {feedbackTypes.map(({ type, icon: Icon, label, color }) => (
                        <motion.button
                          key={type}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => {
                            setFeedbackType(type);
                            setStep('rating');
                          }}
                          className={cn(
                            "flex flex-col items-center gap-2 p-3 rounded-lg border hover:border-primary transition-colors",
                            feedbackType === type && "border-primary bg-primary/5"
                          )}
                        >
                          <Icon className={cn("h-6 w-6", color)} />
                          <span className="text-xs">{label}</span>
                        </motion.button>
                      ))}
                    </div>
                  </motion.div>
                ) : step === 'rating' ? (
                  <motion.div
                    key="rating"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <p className="text-sm text-muted-foreground">
                      Avalie sua experiência
                    </p>
                    <div className="flex justify-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <motion.button
                          key={star}
                          whileHover={{ scale: 1.2 }}
                          whileTap={{ scale: 0.9 }}
                          onMouseEnter={() => setHoveredRating(star)}
                          onMouseLeave={() => setHoveredRating(0)}
                          onClick={() => {
                            setRating(star);
                            setStep('message');
                          }}
                        >
                          <Star
                            className={cn(
                              "h-8 w-8 transition-colors",
                              (hoveredRating || rating) >= star
                                ? "text-amber-400 fill-amber-400"
                                : "text-muted"
                            )}
                          />
                        </motion.button>
                      ))}
                    </div>
                    <button
                      onClick={() => setStep('message')}
                      className="text-sm text-muted-foreground hover:text-foreground"
                    >
                      Pular →
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    key="message"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-4"
                  >
                    <p className="text-sm text-muted-foreground">
                      Conte-nos mais (opcional)
                    </p>
                    <Textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Escreva seu feedback..."
                      className="resize-none"
                      rows={3}
                    />
                    <Button onClick={handleSubmit} className="w-full gap-2">
                      <Send className="h-4 w-4" />
                      Enviar Feedback
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

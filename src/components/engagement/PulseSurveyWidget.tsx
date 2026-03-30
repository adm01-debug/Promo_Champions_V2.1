import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { BarChart3, CheckCircle2, MessageSquare, ThumbsUp, ThumbsDown } from "lucide-react";

interface PulseQuestion {
  id: string;
  question: string;
  type: "scale" | "boolean" | "enps";
}

const PULSE_QUESTIONS: PulseQuestion[] = [
  { id: "satisfaction", question: "Quão satisfeito você está com seu ambiente de trabalho?", type: "scale" },
  { id: "tools", question: "Você tem as ferramentas necessárias para atingir suas metas?", type: "boolean" },
  { id: "enps", question: "De 0 a 10, qual a chance de recomendar nossa empresa como local de trabalho?", type: "enps" },
];

export function PulseSurveyWidget({ className }: { className?: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isComplete, setIsComplete] = useState(false);

  const currentQuestion = PULSE_QUESTIONS[currentIndex];
  const progress = (Object.keys(answers).length / PULSE_QUESTIONS.length) * 100;

  const handleAnswer = (value: number) => {
    const newAnswers = { ...answers, [currentQuestion.id]: value };
    setAnswers(newAnswers);

    if (currentIndex < PULSE_QUESTIONS.length - 1) {
      setTimeout(() => setCurrentIndex(currentIndex + 1), 300);
    } else {
      setTimeout(() => setIsComplete(true), 300);
    }
  };

  const getENPSCategory = (score: number) => {
    if (score >= 9) return { label: "Promotor", color: "text-green-600 dark:text-green-400" };
    if (score >= 7) return { label: "Neutro", color: "text-yellow-600 dark:text-yellow-400" };
    return { label: "Detrator", color: "text-destructive" };
  };

  if (isComplete) {
    const enpsScore = answers["enps"];
    const category = enpsScore !== undefined ? getENPSCategory(enpsScore) : null;

    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="pt-6 text-center space-y-3">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
            <CheckCircle2 className="h-10 w-10 text-primary mx-auto" />
          </motion.div>
          <p className="font-semibold text-foreground">Obrigado pelo feedback!</p>
          {category && (
            <p className="text-sm text-muted-foreground">
              Seu eNPS: <span className={cn("font-bold", category.color)}>{enpsScore} ({category.label})</span>
            </p>
          )}
          <p className="text-xs text-muted-foreground">Suas respostas ajudam a melhorar nosso ambiente.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-primary" />
            Pulse Check
          </CardTitle>
          <Badge variant="secondary" className="text-[10px]">
            {currentIndex + 1}/{PULSE_QUESTIONS.length}
          </Badge>
        </div>
        <Progress value={progress} className="h-1 mt-2" />
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-3"
          >
            <p className="text-sm font-medium text-foreground">{currentQuestion.question}</p>

            {currentQuestion.type === "scale" && (
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((val) => (
                  <Button
                    key={val}
                    size="sm"
                    variant="outline"
                    onClick={() => handleAnswer(val)}
                    className="flex-1 h-10 hover:bg-primary hover:text-primary-foreground transition-colors"
                  >
                    {val}
                  </Button>
                ))}
              </div>
            )}

            {currentQuestion.type === "boolean" && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleAnswer(1)}
                  className="flex-1 gap-2 hover:bg-primary hover:text-primary-foreground"
                >
                  <ThumbsUp className="h-4 w-4" /> Sim
                </Button>
                <Button
                  variant="outline"
                  onClick={() => handleAnswer(0)}
                  className="flex-1 gap-2 hover:bg-destructive hover:text-destructive-foreground"
                >
                  <ThumbsDown className="h-4 w-4" /> Não
                </Button>
              </div>
            )}

            {currentQuestion.type === "enps" && (
              <div className="grid grid-cols-6 gap-1">
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((val) => (
                  <Button
                    key={val}
                    size="sm"
                    variant="outline"
                    onClick={() => handleAnswer(val)}
                    className={cn(
                      "h-9 text-xs hover:text-primary-foreground transition-colors",
                      val <= 6 && "hover:bg-destructive",
                      val >= 7 && val <= 8 && "hover:bg-yellow-500",
                      val >= 9 && "hover:bg-primary"
                    )}
                  >
                    {val}
                  </Button>
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

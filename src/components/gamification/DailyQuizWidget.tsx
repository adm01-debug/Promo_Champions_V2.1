import React from "react";
import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Brain, CheckCircle2, XCircle, Zap, Trophy } from "lucide-react";

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  xpReward: number;
}

const QUIZ_BANK: QuizQuestion[] = [
  {
    id: "q1", question: "Qual a melhor estratégia para lidar com a objeção 'Está muito caro'?",
    options: ["Dar desconto imediatamente", "Mostrar o valor e ROI do produto", "Ignorar e continuar a apresentação", "Oferecer um produto mais barato"],
    correctIndex: 1, explanation: "Focar no valor e ROI ajuda o cliente a entender que o investimento se paga.", xpReward: 25,
  },
  {
    id: "q2", question: "Em vendas B2B, qual é o tempo médio ideal para follow-up após uma proposta?",
    options: ["No mesmo dia", "2-3 dias úteis", "1 semana", "2 semanas"],
    correctIndex: 1, explanation: "2-3 dias úteis dá tempo para análise sem perder o momentum.", xpReward: 20,
  },
  {
    id: "q3", question: "Qual métrica é mais importante para medir a saúde do pipeline?",
    options: ["Número de deals", "Velocidade do pipeline", "Valor total", "Taxa de conversão"],
    correctIndex: 1, explanation: "Pipeline Velocity combina volume, valor, taxa de conversão e tempo de ciclo.", xpReward: 30,
  },
  {
    id: "q4", question: "Qual a regra de ouro do SPIN Selling?",
    options: ["Sempre fechar rápido", "Fazer perguntas antes de apresentar", "Oferecer descontos progressivos", "Enviar proposta por e-mail"],
    correctIndex: 1, explanation: "SPIN Selling foca em entender a Situação, Problema, Implicação e Necessidade.", xpReward: 25,
  },
  {
    id: "q5", question: "Qual a taxa de conversão média considerada boa em vendas B2B?",
    options: ["5-10%", "15-25%", "30-40%", "50%+"],
    correctIndex: 1, explanation: "15-25% é considerada uma boa taxa para vendas B2B consultivas.", xpReward: 20,
  },
];

function _DailyQuizWidget({ className }: { className?: string }) {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [totalXP, setTotalXP] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  const dailyQuestions = useMemo(() => {
    const seed = new Date().toDateString();
    const shuffled = [...QUIZ_BANK].sort((a, b) => {
      const hashA = seed.split("").reduce((acc, c) => acc + c.charCodeAt(0) + a.id.charCodeAt(0), 0);
      const hashB = seed.split("").reduce((acc, c) => acc + c.charCodeAt(0) + b.id.charCodeAt(0), 0);
      return hashA - hashB;
    });
    return shuffled.slice(0, 3);
  }, []);

  const question = dailyQuestions[currentQuestion];

  const handleAnswer = (index: number) => {
    if (isAnswered) return;
    setSelectedAnswer(index);
    setIsAnswered(true);
    if (index === question.correctIndex) {
      setScore((s) => s + 1);
      setTotalXP((xp) => xp + question.xpReward);
    }
  };

  const handleNext = () => {
    if (currentQuestion < dailyQuestions.length - 1) {
      setCurrentQuestion((c) => c + 1);
      setSelectedAnswer(null);
      setIsAnswered(false);
    } else {
      setIsComplete(true);
    }
  };

  if (isComplete) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardContent className="pt-6 text-center space-y-3">
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring" }}>
            <Trophy className="h-10 w-10 text-primary mx-auto" />
          </motion.div>
          <p className="font-bold text-lg text-foreground">{score}/{dailyQuestions.length} corretas!</p>
          <Badge className="gap-1 bg-primary/20 text-primary border-primary/30">
            <Zap className="h-3 w-3" /> +{totalXP} XP ganhos
          </Badge>
          <p className="text-xs text-muted-foreground">Volte amanhã para mais perguntas!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Brain className="h-4 w-4 text-primary" />
            Quiz Diário
          </CardTitle>
          <Badge variant="secondary" className="text-[10px]">
            {currentQuestion + 1}/{dailyQuestions.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={question.id}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            className="space-y-3"
          >
            <p className="text-sm font-medium text-foreground leading-snug">{question.question}</p>

            <div className="space-y-1.5" role="listbox" aria-label="Opções de resposta">
              {question.options.map((option, idx) => {
                const isCorrect = idx === question.correctIndex;
                const isSelected = idx === selectedAnswer;

                return (
                  <motion.button
                    key={idx}
                    whileHover={!isAnswered ? { scale: 1.01 } : {}}
                    whileTap={!isAnswered ? { scale: 0.99 } : {}}
                    onClick={() => handleAnswer(idx)}
                    disabled={isAnswered}
                    className={cn(
                      "w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center gap-2",
                      !isAnswered && "hover:bg-muted cursor-pointer border-border",
                      isAnswered && isCorrect && "bg-success/10 border-success/40 text-success dark:text-success",
                      isAnswered && isSelected && !isCorrect && "bg-destructive/10 border-destructive/40 text-destructive",
                      isAnswered && !isSelected && !isCorrect && "opacity-50 border-border"
                    )}
                  >
                    {isAnswered && isCorrect && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
                    {isAnswered && isSelected && !isCorrect && <XCircle className="h-3.5 w-3.5 shrink-0" />}
                    <span>{option}</span>
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence>
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="space-y-2"
                >
                  <p className="text-[11px] text-muted-foreground bg-muted/50 p-2 rounded-md">
                    💡 {question.explanation}
                  </p>
                  <Button size="sm" onClick={handleNext} className="w-full">
                    {currentQuestion < dailyQuestions.length - 1 ? "Próxima →" : "Ver Resultado"}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

export const DailyQuizWidget = React.memo(_DailyQuizWidget);

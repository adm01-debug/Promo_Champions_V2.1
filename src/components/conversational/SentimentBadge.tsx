import { Badge } from "@/components/ui/badge";
import { SENTIMENT_LABELS, type SentimentLabel } from "./sentimentHelpers";
import { Smile, Frown, Meh, SmilePlus, FrownPlus } from "lucide-react";

interface Props {
  sentiment: SentimentLabel | string | null | undefined;
  score?: number | null;
}

const variantFor = (s: string): "default" | "secondary" | "destructive" | "outline" => {
  if (s === "very_positive" || s === "positive") return "default";
  if (s === "very_negative" || s === "negative") return "destructive";
  return "secondary";
};

const IconFor = ({ sentiment, className }: { sentiment: string; className?: string }) => {
  switch (sentiment) {
    case "very_positive":
      return <SmilePlus className={className} />;
    case "positive":
      return <Smile className={className} />;
    case "very_negative":
      return <FrownPlus className={className} />;
    case "negative":
      return <Frown className={className} />;
    default:
      return <Meh className={className} />;
  }
};

const colorClasses: Record<string, string> = {
  very_positive: "bg-primary/10 text-primary border-primary/20",
  positive: "bg-success/10 text-success border-success/20",
  neutral: "bg-muted text-muted-foreground border-border",
  negative: "bg-warning/10 text-warning border-warning/20",
  very_negative: "bg-destructive/10 text-destructive border-destructive/20",
};

export const SentimentBadge = ({ sentiment, score }: Props) => {
  if (!sentiment) return null;
  const label = SENTIMENT_LABELS[sentiment as SentimentLabel] ?? sentiment;
  const s = sentiment as string;
  
  return (
    <Badge 
      variant="outline" 
      className={`gap-1.5 px-2 py-0.5 font-medium ${colorClasses[s] || "bg-muted"}`}
    >
      <IconFor sentiment={s} className="size-3.5" />
      <span>{label}</span>
      {typeof score === "number" && (
        <span className="opacity-60 text-[10px] font-mono">
          {score > 0 ? "+" : ""}{score.toFixed(2)}
        </span>
      )}
    </Badge>
  );
};

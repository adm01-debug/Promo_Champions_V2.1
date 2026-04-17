import { Badge } from "@/components/ui/badge";
import { SENTIMENT_LABELS, type SentimentLabel } from "./sentimentHelpers";

interface Props {
  sentiment: SentimentLabel | string | null | undefined;
  score?: number | null;
}

const variantFor = (s: string): "default" | "secondary" | "destructive" | "outline" => {
  if (s === "very_positive" || s === "positive") return "default";
  if (s === "very_negative" || s === "negative") return "destructive";
  return "secondary";
};

export const SentimentBadge = ({ sentiment, score }: Props) => {
  if (!sentiment) return null;
  const label = SENTIMENT_LABELS[sentiment as SentimentLabel] ?? sentiment;
  return (
    <Badge variant={variantFor(sentiment)} className="gap-1">
      <span>{label}</span>
      {typeof score === "number" && (
        <span className="opacity-70 text-[10px]">({score.toFixed(2)})</span>
      )}
    </Badge>
  );
};

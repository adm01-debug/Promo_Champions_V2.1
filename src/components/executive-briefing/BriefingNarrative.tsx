import { Card } from "@/components/ui/card";
import { renderMarkdownSafe } from "./briefingHelpers";

interface Props {
  narrative: string;
}

export function BriefingNarrative({ narrative }: Props) {
  return (
    <Card className="p-6">
      <h3 className="text-base font-semibold text-foreground mb-3 font-sora">Análise Estratégica</h3>
      <div
        className="prose prose-sm max-w-none"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: renderMarkdownSafe(narrative) }}
      />
    </Card>
  );
}

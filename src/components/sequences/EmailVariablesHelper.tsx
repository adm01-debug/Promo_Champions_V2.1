import { Badge } from "@/components/ui/badge";
import { EMAIL_VARIABLES } from "./emailComposerHelpers";

interface Props {
  onInsert: (token: string) => void;
}

export function EmailVariablesHelper({ onInsert }: Props) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {EMAIL_VARIABLES.map((v) => (
        <button
          key={v.token}
          type="button"
          onClick={() => onInsert(v.token)}
          className="transition-transform hover:scale-105"
        >
          <Badge variant="outline" className="cursor-pointer text-xs font-mono">
            {v.token}
          </Badge>
        </button>
      ))}
    </div>
  );
}

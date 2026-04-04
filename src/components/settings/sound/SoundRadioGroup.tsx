import { Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface SoundOption {
  id: string;
  label: string;
  description: string;
}

interface SoundRadioGroupProps {
  value: string;
  onValueChange: (value: string) => void;
  options: SoundOption[];
  onPreview: (id: string) => void;
  disabled?: boolean;
  idPrefix?: string;
}

export function SoundRadioGroup({ value, onValueChange, options, onPreview, disabled, idPrefix = "" }: SoundRadioGroupProps) {
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Tipo de Som</Label>
      <RadioGroup value={value} onValueChange={onValueChange} className="space-y-3">
        {options.map((option) => (
          <div
            key={option.id}
            className="flex items-center justify-between p-3 rounded-lg border border-border/40 hover:bg-accent/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <RadioGroupItem value={option.id} id={`${idPrefix}${option.id}`} />
              <Label htmlFor={`${idPrefix}${option.id}`} className="cursor-pointer">
                <span className="font-medium">{option.label}</span>
                <span className="block text-sm text-muted-foreground">{option.description}</span>
              </Label>
            </div>
            {option.id !== 'none' && (
              <Button
                variant="ghost"
                size="icon" aria-label="Reproduzir"
                onClick={(e) => { e.preventDefault(); onPreview(option.id); }}
                className="hover-scale-sm"
                disabled={disabled}
              >
                <Play className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}

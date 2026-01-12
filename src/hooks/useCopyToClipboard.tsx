import { useCallback, useState } from 'react';

interface CopyToClipboardReturn {
  copied: boolean;
  copy: (text: string) => Promise<boolean>;
  reset: () => void;
}

export const useCopyToClipboard = (resetDelay = 2000): CopyToClipboardReturn => {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(async (text: string): Promise<boolean> => {
    if (!navigator?.clipboard) {
      // Fallback for older browsers
      try {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textArea);
        
        if (success) {
          setCopied(true);
          setTimeout(() => setCopied(false), resetDelay);
        }
        
        return success;
      } catch {
        return false;
      }
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), resetDelay);
      return true;
    } catch {
      return false;
    }
  }, [resetDelay]);

  const reset = useCallback(() => {
    setCopied(false);
  }, []);

  return { copied, copy, reset };
};

// Convenience component for copy buttons
import { FC, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Check, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  text: string;
  className?: string;
  size?: 'sm' | 'default' | 'lg' | 'icon';
  variant?: 'default' | 'outline' | 'ghost' | 'secondary';
  children?: ReactNode;
  onCopied?: () => void;
}

export const CopyButton: FC<CopyButtonProps> = ({
  text,
  className,
  size = 'icon',
  variant = 'ghost',
  children,
  onCopied,
}) => {
  const { copied, copy } = useCopyToClipboard();

  const handleCopy = async () => {
    const success = await copy(text);
    if (success && onCopied) {
      onCopied();
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleCopy}
      className={cn("transition-all", className)}
      aria-label={copied ? 'Copiado!' : 'Copiar'}
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-500" />
      ) : (
        children || <Copy className="h-4 w-4" />
      )}
    </Button>
  );
};

import { FC, useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Check, Copy, ChevronDown, ChevronUp } from 'lucide-react';

interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  highlightLines?: number[];
  className?: string;
}

export const CodeBlock: FC<CodeBlockProps> = ({
  code,
  language = 'typescript',
  showLineNumbers = false,
  highlightLines = [],
  className
}) => {
  const [copied, setCopied] = useState(false);
  const lines = code.split('\n');

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn("relative group rounded-lg overflow-hidden", className)}>
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button size="icon" variant="ghost" onClick={handleCopy} className="h-8 w-8">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      {language && (
        <div className="bg-muted px-4 py-1 text-xs text-muted-foreground border-b">
          {language}
        </div>
      )}
      <pre className="bg-muted/50 p-4 overflow-x-auto text-sm">
        <code>
          {lines.map((line, i) => (
            <div
              key={i}
              className={cn(
                "leading-relaxed",
                highlightLines.includes(i + 1) && "bg-primary/10 -mx-4 px-4"
              )}
            >
              {showLineNumbers && (
                <span className="inline-block w-8 text-muted-foreground select-none">
                  {i + 1}
                </span>
              )}
              {line || ' '}
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
};

interface CollapsibleTextProps {
  text: string;
  maxLines?: number;
  className?: string;
}

export const CollapsibleText: FC<CollapsibleTextProps> = ({
  text,
  maxLines = 3,
  className
}) => {
  const [expanded, setExpanded] = useState(false);
  const [needsExpand, setNeedsExpand] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (ref.current) {
      const lineHeight = parseInt(getComputedStyle(ref.current).lineHeight);
      setNeedsExpand(ref.current.scrollHeight > lineHeight * maxLines);
    }
  }, [text, maxLines]);

  return (
    <div className={className}>
      <p
        ref={ref}
        className={cn(!expanded && needsExpand && `line-clamp-${maxLines}`)}
        style={{ WebkitLineClamp: expanded ? 'unset' : maxLines }}
      >
        {text}
      </p>
      {needsExpand && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-primary text-sm font-medium mt-1 flex items-center gap-1"
        >
          {expanded ? (
            <>Ver menos <ChevronUp className="h-4 w-4" /></>
          ) : (
            <>Ver mais <ChevronDown className="h-4 w-4" /></>
          )}
        </button>
      )}
    </div>
  );
};

interface HighlightTextProps {
  text: string;
  highlight: string;
  className?: string;
}

export const HighlightText: FC<HighlightTextProps> = ({
  text,
  highlight,
  className
}) => {
  if (!highlight.trim()) return <span className={className}>{text}</span>;

  const regex = new RegExp(`(${highlight})`, 'gi');
  const parts = text.split(regex);

  return (
    <span className={className}>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-yellow-200 dark:bg-yellow-800 px-0.5 rounded">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </span>
  );
};

interface TruncateTextProps {
  text: string;
  maxLength: number;
  className?: string;
}

export const TruncateText: FC<TruncateTextProps> = ({
  text,
  maxLength,
  className
}) => {
  const truncated = text.length > maxLength 
    ? `${text.slice(0, maxLength)}...` 
    : text;

  return <span className={className} title={text}>{truncated}</span>;
};

interface TypewriterTextProps {
  text: string;
  speed?: number;
  className?: string;
}

export const TypewriterText: FC<TypewriterTextProps> = ({
  text,
  speed = 50,
  className
}) => {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        clearInterval(interval);
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text, speed]);

  return <span className={className}>{displayed}<span className="animate-pulse">|</span></span>;
};

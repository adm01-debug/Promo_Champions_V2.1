import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useState, useEffect } from 'react';

function useDebouncedValue<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function BuscaAvancada({ 
  onSearch, 
  placeholder = "Buscar em todos os campos..."
}: { 
  onSearch: (term: string) => void;
  placeholder?: string;
}) {
  const [termo, setTermo] = useState('');
  const termoDebounced = useDebouncedValue(termo, 300);

  useEffect(() => {
    onSearch(termoDebounced);
  }, [termoDebounced, onSearch]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        placeholder={placeholder}
        value={termo}
        onChange={(e) => setTermo(e.target.value)}
        className="pl-10"
      />
      {termo && (
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
          {termo.length < 2 ? 'Digite 2+ caracteres' : ''}
        </span>
      )}
    </div>
  );
}

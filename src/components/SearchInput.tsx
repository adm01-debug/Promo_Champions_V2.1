import { memo, useState, useEffect } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  onSearch: (term: string) => void;
  placeholder?: string;
  className?: string;
  debounceMs?: number;
}

export const SearchInput = memo(function SearchInput({ onSearch, placeholder = 'Buscar...', className, debounceMs = 300 }: SearchInputProps) {
  const [value, setValue] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => { onSearch(value); }, debounceMs);
    return () => clearTimeout(timer);
  }, [value, onSearch, debounceMs]);

  return (
    <div className={cn('relative', className)}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input type="text" placeholder={placeholder} value={value} onChange={(e) => setValue(e.target.value)} className="pl-10 pr-8" />
      {value && <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6" onClick={() => setValue('')}><X className="h-3 w-3" /></Button>}
    </div>
  );
});
export default SearchInput;

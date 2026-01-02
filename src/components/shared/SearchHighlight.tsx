export function highlightText(text: string, query: string): string {
  if (!query) return text;
  
  const regex = new RegExp(`(${query})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

export function SearchHighlight({ text, query }: { text: string; query: string }) {
  return (
    <span
      dangerouslySetInnerHTML={{
        __html: highlightText(text, query)
      }}
    />
  );
}

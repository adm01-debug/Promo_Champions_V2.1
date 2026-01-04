import { useCallback } from 'react';
export function FileUpload({ onUpload }: { onUpload: (f: File) => void }) {
  const handleDrop = useCallback((e: any) => { e.preventDefault(); onUpload(e.dataTransfer.files[0]); }, []);
  return <div onDrop={handleDrop} onDragOver={e => e.preventDefault()} className="border-2 border-dashed rounded-lg p-8 text-center">
    Drop file here or <input type="file" onChange={e => e.target.files && onUpload(e.target.files[0])} />
  </div>;
}
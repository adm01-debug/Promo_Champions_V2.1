import { useState } from 'react';
export function TagInput({ tags, onChange }: any) {
  const [input, setInput] = useState('');
  const add = () => { if(input) { onChange([...tags, input]); setInput(''); } };
  return <div>
    <div className="flex gap-2 flex-wrap mb-2">{tags.map((t: string) => <span key={t} className="bg-blue-100 px-2 py-1 rounded">{t} <button onClick={() => onChange(tags.filter((tag: string) => tag !== t))}>×</button></span>)}</div>
    <div className="flex gap-2"><input value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && add()} className="border rounded px-3 py-2 flex-1" /><button onClick={add} className="bg-blue-500 text-white px-4 py-2 rounded">Add</button></div>
  </div>;
}
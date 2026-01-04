export function DateRangePicker({ start, end, onChange }: any) {
  return <div className="flex gap-2">
    <input type="date" value={start} onChange={e => onChange({ start: e.target.value, end })} className="border rounded px-3 py-2" />
    <span>até</span>
    <input type="date" value={end} onChange={e => onChange({ start, end: e.target.value })} className="border rounded px-3 py-2" />
  </div>;
}
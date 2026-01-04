export function MultiSelect({ options, value, onChange }: any) {
  return <div className="space-y-2">
    {options.map((opt: any) => <label key={opt.value} className="flex items-center gap-2">
      <input type="checkbox" checked={value.includes(opt.value)} onChange={e => {
        if(e.target.checked) onChange([...value, opt.value]); else onChange(value.filter((v: any) => v !== opt.value));
      }} />{opt.label}
    </label>)}
  </div>;
}
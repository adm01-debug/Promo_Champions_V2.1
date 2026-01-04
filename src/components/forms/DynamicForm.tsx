import { useForm } from 'react-hook-form';
export function DynamicForm({ fields, onSubmit }: any) {
  const { register, handleSubmit } = useForm();
  return <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
    {fields.map((f: any) => <div key={f.name}><label>{f.label}</label><input {...register(f.name)} className="w-full border rounded px-3 py-2" /></div>)}
    <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded">Submit</button>
  </form>;
}
export const formatters = {
  currency: (value: number) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value),
  
  number: (value: number, decimals = 0) => 
    new Intl.NumberFormat('pt-BR', { maximumFractionDigits: decimals }).format(value),
  
  percentage: (value: number) => 
    `${(value * 100).toFixed(1)}%`,
  
  date: (value: string | Date) => 
    new Intl.DateTimeFormat('pt-BR').format(new Date(value)),
  
  datetime: (value: string | Date) => 
    new Intl.DateTimeFormat('pt-BR', { 
      dateStyle: 'short', 
      timeStyle: 'short' 
    }).format(new Date(value)),
  
  phone: (value: string) => 
    value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3'),
  
  cpf: (value: string) => 
    value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4'),
  
  cnpj: (value: string) => 
    value.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5'),
};

import { z } from 'zod';

export const validators = {
  email: z.string().email('Email inválido'),
  
  phone: z.string().regex(/^\d{11}$/, 'Telefone deve ter 11 dígitos'),
  
  cpf: z.string().regex(/^\d{11}$/, 'CPF deve ter 11 dígitos').refine((cpf) => {
    const nums = cpf.split('').map(Number);
    let sum = 0;
    for (let i = 0; i < 9; i++) sum += nums[i] * (10 - i);
    let rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== nums[9]) return false;
    
    sum = 0;
    for (let i = 0; i < 10; i++) sum += nums[i] * (11 - i);
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    return rest === nums[10];
  }, 'CPF inválido'),
  
  cnpj: z.string().regex(/^\d{14}$/, 'CNPJ deve ter 14 dígitos'),
  
  currency: z.coerce.number().positive('Valor deve ser positivo'),
  
  percentage: z.coerce.number().min(0).max(100, 'Percentual entre 0 e 100'),
};

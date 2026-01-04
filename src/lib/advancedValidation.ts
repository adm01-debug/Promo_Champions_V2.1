import { z } from 'zod';

export const schemas = {
  email: z.string().email('Email inválido').toLowerCase(),
  
  phone: z.string().transform(s => s.replace(/\D/g, '')).pipe(
    z.string().length(11, 'Telefone deve ter 11 dígitos')
  ),
  
  cnpj: z.string().transform(s => s.replace(/\D/g, '')).pipe(
    z.string().length(14, 'CNPJ deve ter 14 dígitos')
  ).refine(validateCNPJ, 'CNPJ inválido'),
  
  cpf: z.string().transform(s => s.replace(/\D/g, '')).pipe(
    z.string().length(11, 'CPF deve ter 11 dígitos')
  ).refine(validateCPF, 'CPF inválido'),
  
  zipCode: z.string().transform(s => s.replace(/\D/g, '')).pipe(
    z.string().length(8, 'CEP deve ter 8 dígitos')
  ),
  
  url: z.string().url('URL inválida'),
  
  password: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[a-z]/, 'Senha deve conter pelo menos uma letra minúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número')
    .regex(/[^A-Za-z0-9]/, 'Senha deve conter pelo menos um caractere especial'),
};

function validateCPF(cpf: string): boolean {
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
}

function validateCNPJ(cnpj: string): boolean {
  if (cnpj.length !== 14) return false;
  
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  
  const calc = (weights: number[]) => {
    let sum = 0;
    for (let i = 0; i < weights.length; i++) {
      sum += parseInt(cnpj[i]) * weights[i];
    }
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  
  const digit1 = calc(weights1);
  const digit2 = calc(weights2);
  
  return digit1 === parseInt(cnpj[12]) && digit2 === parseInt(cnpj[13]);
}

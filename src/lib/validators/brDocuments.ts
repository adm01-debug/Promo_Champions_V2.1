// Validação de dígito verificador de CPF e CNPJ (módulo 11), sem dependência externa.

function onlyDigits(value: string): string {
  if (typeof value !== 'string') return '';
  return value.replace(/\D/g, '');
}

function hasAllSameDigits(value: string): boolean {
  return /^(\d)\1+$/.test(value);
}

function calculateCheckDigit(digits: string, weights: number[]): number {
  const sum = digits
    .split('')
    .reduce((acc, digit, index) => acc + Number(digit) * weights[index], 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCPF(value: string): boolean {
  const cpf = onlyDigits(value);
  if (cpf.length !== 11 || hasAllSameDigits(cpf)) return false;

  const firstDigit = calculateCheckDigit(cpf.slice(0, 9), [10, 9, 8, 7, 6, 5, 4, 3, 2]);
  if (firstDigit !== Number(cpf[9])) return false;

  const secondDigit = calculateCheckDigit(
    cpf.slice(0, 10),
    [11, 10, 9, 8, 7, 6, 5, 4, 3, 2]
  );
  return secondDigit === Number(cpf[10]);
}

export function isValidCNPJ(value: string): boolean {
  const cnpj = onlyDigits(value);
  if (cnpj.length !== 14 || hasAllSameDigits(cnpj)) return false;

  const firstDigit = calculateCheckDigit(
    cnpj.slice(0, 12),
    [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  );
  if (firstDigit !== Number(cnpj[12])) return false;

  const secondDigit = calculateCheckDigit(
    cnpj.slice(0, 13),
    [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  );
  return secondDigit === Number(cnpj[13]);
}

export function isValidCpfOrCnpj(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length === 11) return isValidCPF(digits);
  if (digits.length === 14) return isValidCNPJ(digits);
  return false;
}

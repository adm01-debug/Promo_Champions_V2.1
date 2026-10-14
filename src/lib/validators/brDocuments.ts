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

// CNPJ alfanumérico (Receita Federal, emissão a partir de 2026): as 12 primeiras
// posições aceitam dígitos e letras; os 2 dígitos verificadores seguem numéricos.
// Valor de cada caractere = código ASCII − 48 ('0'-'9' → 0-9, 'A'-'Z' → 17-42),
// com os mesmos pesos do módulo 11 usados no CNPJ numérico.
const CNPJ_ALNUM = /^[0-9A-Z]{12}\d{2}$/;
const CNPJ_WEIGHTS_FIRST = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
const CNPJ_WEIGHTS_SECOND = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

function normalizeCnpj(value: string): string {
  if (typeof value !== 'string') return '';
  return value.toUpperCase().replace(/[^0-9A-Z]/g, '');
}

function calculateCnpjCheckDigit(values: number[], weights: number[]): number {
  const sum = values.reduce((acc, v, i) => acc + v * Number(weights[i]), 0);
  const remainder = sum % 11;
  return remainder < 2 ? 0 : 11 - remainder;
}

export function isValidCNPJ(value: string): boolean {
  const cnpj = normalizeCnpj(value);
  if (!CNPJ_ALNUM.test(cnpj) || /^(.)\1+$/.test(cnpj)) return false;

  const values = cnpj.split('').map(c => c.charCodeAt(0) - 48);
  if (calculateCnpjCheckDigit(values.slice(0, 12), CNPJ_WEIGHTS_FIRST) !== values[12])
    return false;
  return calculateCnpjCheckDigit(values.slice(0, 13), CNPJ_WEIGHTS_SECOND) === values[13];
}

export function isValidCpfOrCnpj(value: string): boolean {
  const digits = onlyDigits(value);
  if (digits.length === 11) return isValidCPF(digits);
  if (normalizeCnpj(value).length === 14) return isValidCNPJ(value);
  return false;
}

// Etapa 46 do plano de 50 etapas.
//
// CEP não tem dígito verificador — é só um código postal de 8 dígitos.
// "Válido" aqui significa "formato plausível", não "existe nos Correios";
// confirmar existência real exige uma consulta externa (ViaCEP ou similar),
// fora do escopo de um validador síncrono e sem rede.
export function isValidCEP(value: string): boolean {
  const cep = onlyDigits(value);
  if (cep.length !== 8) return false;
  // Nenhuma faixa de CEP alocada pelos Correios tem os 8 dígitos iguais.
  return !hasAllSameDigits(cep);
}

// DDDs válidos no plano brasileiro (ANATEL): 11–19, 21–24, 27–28, 31–35, 37–38,
// 41–49, 51, 53, 54, 55, 61–69, 71, 73–75, 77, 79, 81–89, 91–99. Não existe
// DDD 20, 23... (a lista abaixo é a oficial, não um range contínuo).
const VALID_DDD = new Set([
  11, 12, 13, 14, 15, 16, 17, 18, 19, 21, 22, 24, 27, 28, 31, 32, 33, 34, 35, 37, 38, 41,
  42, 43, 44, 45, 46, 47, 48, 49, 51, 53, 54, 55, 61, 62, 63, 64, 65, 66, 67, 68, 69, 71,
  73, 74, 75, 77, 79, 81, 82, 83, 84, 85, 86, 87, 88, 89, 91, 92, 93, 94, 95, 96, 97, 98,
  99,
]);

/**
 * Aceita telefone brasileiro em E.164 (+55DDNNNNNNNNN) ou em formato local
 * com DDD (10 dígitos fixo, 11 dígitos celular começando em 9).
 * Não valida se a linha existe — só formato + DDD real.
 */
export function isValidPhoneBR(value: string): boolean {
  if (typeof value !== 'string') return false;
  const digits = onlyDigits(value);

  // E.164: +55 seguido de DD + número (10 ou 11 dígitos) = 12 ou 13 dígitos.
  const trimmed = value.trim();
  const isE164Shape =
    trimmed.startsWith('+55') || (trimmed.startsWith('55') && digits.length >= 12);
  const local = isE164Shape && digits.startsWith('55') ? digits.slice(2) : digits;

  if (local.length !== 10 && local.length !== 11) return false;

  const ddd = Number(local.slice(0, 2));
  if (!VALID_DDD.has(ddd)) return false;

  const subscriber = local.slice(2);
  if (local.length === 11) {
    // Celular: 9 dígitos, o primeiro é sempre 9.
    return subscriber[0] === '9';
  }
  // Fixo: 8 dígitos, primeiro dígito nunca é 0 nem 1 (reservados).
  return subscriber[0] !== '0' && subscriber[0] !== '1';
}
